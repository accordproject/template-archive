/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const crypto = require('crypto');
const stringify = require('json-stable-stringify');

const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;

const getMimeType = require('./mimetype');

const IMAGE_SIZE = {
    width: 128,
    height: 128,
};

const templateTypes = {
    CONTRACT: 0,
    CLAUSE: 1
};

/**
 * Check to see if a ClassDeclaration is an instance of the specified fully qualified
 * type name.
 * @internal
 * @param {ClassDeclaration} classDeclaration The class to test
 * @param {String} fqt The fully qualified type name.
 * @returns {boolean} True if classDeclaration an instance of the specified fully
 * qualified type name, false otherwise.
 */
function instanceOf(classDeclaration, fqt) {
    // Check to see if this is an exact instance of the specified type.
    if (classDeclaration.getFullyQualifiedName() === fqt) {
        return true;
    }
    // Now walk the class hierachy looking to see if it's an instance of the specified type.
    let superTypeDeclaration = classDeclaration.getSuperTypeDeclaration();
    while (superTypeDeclaration) {
        if (superTypeDeclaration.getFullyQualifiedName() === fqt) {
            return true;
        }
        superTypeDeclaration = superTypeDeclaration.getSuperTypeDeclaration();
    }
    return false;
}

/**
 * Returns the model for the contract or clause
 * @param {object} logicManager - the logic manager
 * @param {number} kind - the template kind
 * @returns {ClassDeclaration} the template model
 */
function getContractModel(logicManager, kind) {
    let modelType = 'org.accordproject.contract.Contract';

    if(kind !== 0) {
        modelType = 'org.accordproject.contract.Clause';
    }
    const templateModels = logicManager.getIntrospector().getClassDeclarations().filter((item) => {
        return !item.isAbstract() && instanceOf(item, modelType);
    });

    if (templateModels.length > 1) {
        throw new Error(`Found multiple instances of ${modelType} in ${this.metadata.getName()}. The model for the template must contain a single asset that extends ${modelType}.`);
    } else if (templateModels.length === 0) {
        throw new Error(`Failed to find an asset that extends ${modelType} in ${this.metadata.getName()}. The model for the template must contain a single asset that extends ${modelType}.`);
    } else {
        return templateModels[0];
    }
}

/**
 * Constructs a function for formula evaluation based for this instance
 * @param {*} logicManager - the logic manager
 * @param {string} clauseId - this instance identifier
 * @param {*} ergoEngine - the evaluation engine
 * @param {string} name - the name of the formula
 * @return {*} A function from formula code + input data to result
 */
function ciceroFormulaEval(logicManager, clauseId, ergoEngine, name) {
    return (code,data, currentTime, utcOffset) => {
        const result = ergoEngine.calculate(logicManager, clauseId, name, data, currentTime, utcOffset, null);
        // console.log('Formula result: ' + JSON.stringify(result.response));
        return result.response;
    };
}

/**
 * Utility to initialize the parser with a grammar
 * @param {*} parserManager - the parser manager
 * @param {*} logicManager - the logic manager
 * @param {*} ergoEngine - the evaluation engine
 * @param {string} templateName - this template name
 * @param {string} templateKind - this template kind (contract or clause)
 * @param {string} grammar - the grammar
 * @param {boolean} runtime - 'ergo' or 'es6'
 */
function initParser(parserManager, logicManager, ergoEngine, templateName, templateKind, grammar, runtime) {
    const kind = templateKind !== 0 ? 'clause' : 'contract';
    parserManager.setTemplate(grammar);
    parserManager.setTemplateKind(kind);
    parserManager.buildParser();

    const formulas = parserManager.getFormulas();
    formulas.forEach(x => {
        logicManager.addTemplateFile(x.code,x.name);
    });

    // Set formula evaluation in parser manager
    parserManager.setFormulaEval((name) => ciceroFormulaEval(
        logicManager,
        templateName,
        ergoEngine,
        name
    ));

    // Compile formulas
    if (runtime === 'ergo') {
        logicManager.compileLogicSync(true);
    }
}

/**
 * Utility to rebuild a parser when the grammar changes
 * @param {*} parserManager - the parser manager
 * @param {*} logicManager - the logic manager
 * @param {*} ergoEngine - the evaluation engine
 * @param {string} templateName - this template name
 * @param {string} grammar - the new grammar
 */
function rebuildParser(parserManager, logicManager, ergoEngine, templateName, grammar) {
    // Update template in parser manager
    parserManager.setTemplate(grammar);

    // Rebuild parser
    parserManager.buildParser();

    // Process formulas
    const oldFormulas = logicManager.getScriptManager().sourceTemplates;
    const newFormulas = parserManager.getFormulas();

    if (oldFormulas.length > 0 || newFormulas.length > 0) {
        // Reset formulas
        logicManager.getScriptManager().sourceTemplates = [];
        newFormulas.forEach( (x) => {
            logicManager.addTemplateFile(x.code, x.name);
        });

        // Re-set formula evaluation hook
        parserManager.setFormulaEval((name) => ciceroFormulaEval(
            logicManager,
            templateName,
            ergoEngine,
            name
        ));

        // Re-compile formulas
        logicManager.compileLogicSync(true);
    }
}

/**
 * Parses natural language text and if successful returns the contract or clause data
 * @param {*} parserManager - the parser manager
 * @param {*} ciceroMarkTransformer - the parser manager
 * @param {string} input - the text for the clause or contract
 * @param {string} [currentTime] - the definition of 'now', defaults to current time
 * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
 * @param {string} [fileName] - the fileName for the text (optional)
 * @return {object} the contract or clause data
 */
function parseText(parserManager, ciceroMarkTransformer, input, currentTime, utcOffset, fileName) {
    // Setup
    const templateMarkTransformer = new TemplateMarkTransformer();

    // Transform text to ciceromark
    const inputCiceroMark = ciceroMarkTransformer.fromMarkdownCicero(input);

    // Set current time
    parserManager.setCurrentTime(currentTime, utcOffset);

    // Parse
    const data = templateMarkTransformer.dataFromCiceroMark({ fileName:fileName, content:inputCiceroMark }, parserManager, {});
    return data;
}

/**
 * add a new state after execution of an operation
 * @param {object} instance - the contract instance
 * @param {string} partyName - name of the party that executed the operation
 * @param {string} operation - name of the operation that was executed
 * @param {*} output - result of the operation
 * @param {string} lifecycleState - current state in instance's lifecycle
 */
function addHistory(instance, partyName, operation, output, lifecycleState) {
    const previousHash = instance.history.length !== 0 ? instance.history[instance.history.length-1].currentHash : null;
    const timestamp = new Date().toISOString();
    const currentState =  {
        previousHash: previousHash,
        partyName: partyName,
        operation: operation,
        result: output,
        timestamp,
        lifecycleState: lifecycleState
    };
    const content = {};
    content.metadata = instance.metadata;
    content.history = instance.history;
    if(instance.parserManager.getTemplate()) {
        content.grammar = instance.parserManager.getTemplate();
    }
    content.models = {};
    content.scripts = {};

    let modelFiles = instance.getModelManager().getModels();
    modelFiles.forEach(function (file) {
        content.models[file.namespace] = file.content;
    });

    let scriptManager = instance.getScriptManager();
    let scriptFiles = scriptManager.getScripts();
    scriptFiles.forEach(function (file) {
        content.scripts[file.getIdentifier()] = file.contents;
    });

    content.data = instance.getData();

    content.signatures = instance.contractSignatures;

    const hasher = crypto.createHash('sha256');
    hasher.update(stringify(content));
    const currentHash =  hasher.digest('hex');
    const state = {
        currentState: currentState,
        currentHash: currentHash
    };
    instance.history.push(state);
}

/**
 * Checks if dimensions for the image are correct.
 * @param {Buffer} buffer the buffer object
 * @param {string} mimeType the mime type of the object
 */
function checkImageDimensions(buffer, mimeType) {
    let height;
    let width;
    if(mimeType === 'image/png') {
        try {
            height = buffer.readUInt32BE(20);
            width = buffer.readUInt32BE(16);
        } catch (err) {
            throw new Error('not a valid png file');
        }
    } else {
        throw new Error('dimension calculation not supported for this file');
    }

    if (height === IMAGE_SIZE.height && width === IMAGE_SIZE.width) {
        return;
    } else {
        throw new Error(`logo should be ${IMAGE_SIZE.height}x${IMAGE_SIZE.width}`);
    }
}

/**
 * Check the buffer is a png file with the right size
 * @param {Buffer} buffer the buffer object
 */
function checkImage(buffer) {
    const mimeType = getMimeType(buffer).mime;
    checkImageDimensions(buffer, mimeType);
}

/**
 * check to see if it is a valid name. for some reason regex is not working when this executes
 * inside the chaincode runtime, which is why regex hasn't been used.
 *
 * @param {string} name the template name to check
 * @returns {boolean} true if valid, false otherwise
 *
 * @private
 */
function isValidName(name) {
    const validChars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
        '0','1','2','3','4','5','6','7','8','9','-','_'];
    for (let i = 0; i<name.length; i++){
        const strChar = name.charAt(i);
        if ( validChars.indexOf(strChar) === -1 ) {
            return false;
        }
    }
    return true;
}

module.exports = { getContractModel, ciceroFormulaEval, initParser, rebuildParser, parseText, checkImage, isValidName, addHistory, templateTypes };
