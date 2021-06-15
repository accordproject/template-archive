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

module.exports = { getContractModel, ciceroFormulaEval, initParser, rebuildParser };
