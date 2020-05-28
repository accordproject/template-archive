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
const ParseException = require('@accordproject/concerto-core').ParseException;
const crypto = require('crypto');
const ErrorUtil = require('./errorutil');
const Util = require('@accordproject/ergo-compiler').Util;
const moment = require('moment-mini');
// Make sure Moment serialization preserves utcOffset. See https://momentjs.com/docs/#/displaying/as-json/
moment.fn.toJSON = Util.momentToJson;

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const HtmlTransformer = require('@accordproject/markdown-html').HtmlTransformer;

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
        this.ergoEngine = new ErgoEngine();
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
     * @param {string} [currentTime] - the definition of 'now' (optional)
     * @param {string} [fileName] - the fileName for the text (optional)
     */
    parse(input, currentTime, fileName) {
        // Setup
        const metadata = this.getTemplate().getMetadata();
        const parserManager = this.getTemplate().getParserManager();
        const modelManager =  this.getTemplate().getModelManager();

        const templateKind = metadata.getTemplateType() !== 0 ? 'clause' : 'contract';

        // Transform text to commonmark
        const commonMarkTransformer = new CommonMarkTransformer({tagInfo: true});
        const inputCommonMark = commonMarkTransformer.fromMarkdown(input, 'json');

        // Parse
        const templateMarkTransformer = new TemplateMarkTransformer();
        const data = templateMarkTransformer.dataFromCommonMark({ fileName:fileName, content:inputCommonMark }, parserManager, templateKind, {});
        this.setData(data);
    }

    /**
     * Recursive function that converts all instances of Formated objects (ParsedDateTime or ParsedMonetaryAmount)
     * to a Moment.
     * @param {*} obj the input object
     * @param {number} utcOffset - the default utcOffset
     * @returns {*} the converted object
     */
    static convertFormattedParsed(obj, utcOffset) {
        if(obj.$class === 'ParsedDateTime') {

            let instance = null;

            if(obj.timezone) {
                instance = moment(obj).utcOffset(obj.timezone, true);
            }
            else {
                instance = moment(obj)
                    .utcOffset(utcOffset, true);
            }

            if(!instance) {
                throw new Error(`Failed to handle datetime ${JSON.stringify(obj, null, 4)}`);
            }
            const result = instance.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            if(result === 'Invalid date') {
                throw new Error(`Failed to handle datetime ${JSON.stringify(obj, null, 4)}`);
            }
            return result;
        } else if(obj.$class === 'ParsedAmount') {
            const result = obj.doubleValue;
            return result;
        } else if(obj.$class === 'ParsedMonetaryAmount') {
            if (obj.currencyCode && obj.currencySymbol && obj.currencyCode !== obj.currencySymbol) {
                throw new Error(`Currency symbol ${obj.currencySymbol} and currency code ${obj.currencyCode} are incompatible`);
            }
            const result = {
                $class : 'org.accordproject.money.MonetaryAmount',
                doubleValue : obj.doubleValue,
                currencyCode : obj.currencySymbol ? obj.currencySymbol : obj.currencyCode,
            };
            return result;
        } else if( typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(
                ([key, value]) => {obj[key] = TemplateInstance.convertFormattedParsed(value, utcOffset);}
            );
        }

        return obj;
    }

    /**
     * Generates the natural language text for a contract or clause clause; combining the text from the template
     * and the instance data.
     * @param {*} [options] text generation options. options.wrapVariables encloses variables
     * and editable sections in '<variable ...' and '/>'
     * @param {string} currentTime - the definition of 'now' (optional)
     * @returns {string} the natural language text for the contract or clause; created by combining the structure of
     * the template with the JSON data for the clause.
     */
    async draft(options, currentTime) {
        if(!this.concertoData) {
            throw new Error('Data has not been set. Call setData or parse before calling this method.');
        }

        const markdownOptions = {
            '$class': 'org.accordproject.markdown.MarkdownOptions',
            'wrapVariables': options && (options.wrapVariables || options.unquoteVariables || options.format === 'html') ? true : false,
            'template': true
        };
        const logicManager = this.getLogicManager();
        const clauseId = this.getIdentifier();
        const contract = this.getData();

        return logicManager.compileLogic(false).then(async () => {
            const result = await this.getEngine().draft(logicManager,clauseId,contract,{},currentTime,markdownOptions);
            // Roundtrip the response through the Commonmark parser
            return this.formatText(result.response, options);
        });
    }

    /**
     * Round-trip markdown
     * @param {string} text - the markdown text
     * @return {string} the result of parsing and printing back the text
     */
    roundtripMarkdown(text) {
        // Roundtrip the grammar through the Commonmark parser
        const commonMarkTransformer = new CommonMarkTransformer({ noIndex: true });
        const concertoAst = commonMarkTransformer.fromMarkdown(text);
        return commonMarkTransformer.toMarkdown(concertoAst);
    }

    /**
     * Format text
     * @param {string} text - the markdown text
     * @param {object} options - parameters to the formatting
     * @param {string} format - to the text generation
     * @return {string} the result of parsing and printing back the text
     */
    formatText(text,options) {
        const format = options ? options.format : null;
        if (!format) {
            let result = this.roundtripMarkdown(text);
            if (options && options.unquoteVariables) {
                const ciceroMarkTransformer = new CiceroMarkTransformer();
                result = ciceroMarkTransformer.toMarkdown(ciceroMarkTransformer.fromMarkdown(text,'json',{quoteVariables:false}));
            }
            return result;
        } else if (format === 'html'){
            const ciceroMarkTransformer = new CiceroMarkTransformer();
            const htmlTransformer = new HtmlTransformer();
            return htmlTransformer.toHtml(ciceroMarkTransformer.fromMarkdown(text,'json',{quoteVariables:!options.unquoteVariables}));
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
}

module.exports = TemplateInstance;