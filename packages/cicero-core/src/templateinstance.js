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

const Logger = require('@accordproject/concerto-core').Logger;
const crypto = require('crypto');

const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const SlateTransformer = require('@accordproject/markdown-slate').SlateTransformer;
const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;
const HtmlTransformer = require('@accordproject/markdown-html').HtmlTransformer;

// For formulas evaluation
const ErgoEngine = require('@accordproject/ergo-engine/index.browser.js').EvalEngine;

/**
 * A TemplateInstance is an instance of a Clause or Contract template. It is executable business logic, linked to
 * a natural language (legally enforceable) template.
 * A TemplateInstance must be constructed with a template and then prior to execution the data for the clause must be set.
 * Set the data for the TemplateInstance by either calling the setData method or by
 * calling the parse method and passing in natural language text that conforms to the template grammar.
 * @public
 * @abstract
 * @class
 */
class TemplateInstance {

    /**
     * Create the Clause and link it to a Template.
     * @param {Template} template  - the template for the clause
     */
    constructor(template) {
        if (this.constructor === TemplateInstance) {
            throw new TypeError('Abstract class "TemplateInstance" cannot be instantiated directly.');
        }
        this.template = template;
        this.data = null;
        this.concertoData = null;
        this.ciceroMarkTransformer = new CiceroMarkTransformer();
        this.templateMarkTransformer = new TemplateMarkTransformer();
        this.parserManager = this.template.getParserManager();
        this.ergoEngine = new ErgoEngine();

        // Set formula evaluation in parser manager
        this.parserManager.setFormulaEval((name) => TemplateInstance.ciceroFormulaEval(
            this.getLogicManager(),
            this.getIdentifier(),
            this.getEngine(),
            name
        ));
    }

    /**
     * Set the data for the clause
     * @param {object} data  - the data for the clause, must be an instance of the
     * template model for the clause's template. This should be a plain JS object
     * and will be deserialized and validated into the Concerto object before assignment.
     */
    setData(data) {
        // verify that data is an instance of the template model
        const templateModel = this.getTemplate().getTemplateModel();

        if (data.$class !== templateModel.getFullyQualifiedName()) {
            throw new Error(`Invalid data, must be a valid instance of the template model ${templateModel.getFullyQualifiedName()} but got: ${JSON.stringify(data)} `);
        }

        // downloadExternalDependencies the data using the template model
        Logger.debug('Setting clause data: ' + JSON.stringify(data));
        const resource = this.getTemplate().getSerializer().fromJSON(data);
        resource.validate();

        // save the data
        this.data = data;

        // save the concerto data
        this.concertoData = resource;
    }

    /**
     * Get the data for the clause. This is a plain JS object. To retrieve the Concerto
     * object call getConcertoData().
     * @return {object} - the data for the clause, or null if it has not been set
     */
    getData() {
        return this.data;
    }

    /**
     * Get the current Ergo engine
     * @return {object} - the data for the clause, or null if it has not been set
     */
    getEngine() {
        return this.ergoEngine;
    }

    /**
     * Get the data for the clause. This is a Concerto object. To retrieve the
     * plain JS object suitable for serialization call toJSON() and retrieve the `data` property.
     * @return {object} - the data for the clause, or null if it has not been set
     */
    getDataAsConcertoObject() {
        return this.concertoData;
    }

    /**
     * Set the data for the clause by parsing natural language text.
     * @param {string} input - the text for the clause
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {string} [fileName] - the fileName for the text (optional)
     */
    parse(input, currentTime, utcOffset, fileName) {
        // Setup
        const templateMarkTransformer = new TemplateMarkTransformer();

        // Transform text to ciceromark
        const inputCiceroMark = this.ciceroMarkTransformer.fromMarkdownCicero(input);

        // Set current time
        this.parserManager.setCurrentTime(currentTime, utcOffset);

        // Parse
        const data = templateMarkTransformer.dataFromCiceroMark({ fileName:fileName, content:inputCiceroMark }, this.parserManager, {});
        this.setData(data);
    }

    /**
     * Generates the natural language text for a contract or clause clause; combining the text from the template
     * and the instance data.
     * @param {*} [options] text generation options.
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @returns {string} the natural language text for the contract or clause; created by combining the structure of
     * the template with the JSON data for the clause.
     */
    draft(options, currentTime, utcOffset) {
        if(!this.concertoData) {
            throw new Error('Data has not been set. Call setData or parse before calling this method.');
        }

        // Setup
        const metadata = this.getTemplate().getMetadata();
        const templateKind = metadata.getTemplateType() !== 0 ? 'clause' : 'contract';

        // Get the data
        const data = this.getData();

        // Set current time
        this.parserManager.setCurrentTime(currentTime, utcOffset);

        // Draft
        const ciceroMark = this.templateMarkTransformer.draftCiceroMark(data, this.parserManager, templateKind, {});
        return this.formatCiceroMark(ciceroMark,options);
    }

    /**
     * Format CiceroMark
     * @param {object} ciceroMarkParsed - the parsed CiceroMark DOM
     * @param {object} options - parameters to the formatting
     * @param {string} format - to the text generation
     * @return {string} the result of parsing and printing back the text
     */
    formatCiceroMark(ciceroMarkParsed,options) {
        const format = options && options.format ? options.format : 'markdown_cicero';
        if (format === 'markdown_cicero') {
            if (options && options.unquoteVariables) {
                ciceroMarkParsed = this.ciceroMarkTransformer.unquote(ciceroMarkParsed);
            }
            const ciceroMark = this.ciceroMarkTransformer.toCiceroMarkUnwrapped(ciceroMarkParsed);
            return this.ciceroMarkTransformer.toMarkdownCicero(ciceroMark);
        } else if (format === 'ciceromark_parsed'){
            return ciceroMarkParsed;
        } else if (format === 'html'){
            if (options && options.unquoteVariables) {
                ciceroMarkParsed = this.ciceroMarkTransformer.unquote(ciceroMarkParsed);
            }
            const htmlTransformer = new HtmlTransformer();
            return htmlTransformer.toHtml(ciceroMarkParsed);
        } else if (format === 'slate'){
            if (options && options.unquoteVariables) {
                ciceroMarkParsed = this.ciceroMarkTransformer.unquote(ciceroMarkParsed);
            }
            const slateTransformer = new SlateTransformer();
            return slateTransformer.fromCiceroMark(ciceroMarkParsed);
        } else {
            throw new Error('Unsupported format: ' + format);
        }
    }

    /**
     * Returns the identifier for this clause. The identifier is the identifier of
     * the template plus '-' plus a hash of the data for the clause (if set).
     * @return {String} the identifier of this clause
     */
    getIdentifier() {
        let hash = '';

        if (this.data) {
            const textToHash = JSON.stringify(this.getData());
            const hasher = crypto.createHash('sha256');
            hasher.update(textToHash);
            hash = '-' + hasher.digest('hex');
        }
        return this.getTemplate().getIdentifier() + hash;
    }

    /**
     * Returns the template for this clause
     * @return {Template} the template for this clause
     */
    getTemplate() {
        return this.template;
    }

    /**
     * Returns the template logic for this clause
     * @return {LogicManager} the template for this clause
     */
    getLogicManager() {
        return this.template.getLogicManager();
    }

    /**
     * Returns a JSON representation of the clause
     * @return {object} the JS object for serialization
     */
    toJSON() {
        return {
            template: this.getTemplate().getIdentifier(),
            data: this.getData()
        };
    }

    /**
     * Constructs a function for formula evaluation based for this template instance
     * @param {*} logicManager - the logic manager
     * @param {string} clauseId - this instance identifier
     * @param {*} ergoEngine - the evaluation engine
     * @param {string} name - the name of the formula
     * @return {*} A function from formula code + input data to result
     */
    static ciceroFormulaEval(logicManager, clauseId, ergoEngine, name) {
        return (code,data, currentTime, utcOffset) => {
            const result = ergoEngine.calculate(logicManager, clauseId, name, data, currentTime, utcOffset, null);
            // console.log('Formula result: ' + JSON.stringify(result.response));
            return result.response;
        };
    }

    /**
     * Utility to rebuild a parser when the grammar changes
     * @param {*} parserManager - the parser manager
     * @param {*} logicManager - the logic manager
     * @param {*} ergoEngine - the evaluation engine
     * @param {string} templateName - this template name
     * @param {string} grammar - the new grammar
     */
    static rebuildParser(parserManager, logicManager, ergoEngine, templateName, grammar) {
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
            parserManager.setFormulaEval((name) => TemplateInstance.ciceroFormulaEval(
                logicManager,
                templateName,
                ergoEngine,
                name
            ));

            // Re-compile formulas
            logicManager.compileLogicSync(true);
        }
    }
}

module.exports = TemplateInstance;