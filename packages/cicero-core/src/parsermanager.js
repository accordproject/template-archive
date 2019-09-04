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

const fsPath = require('path');
const TemplateException = require('./templateexception');
const RelationshipDeclaration = require('@accordproject/ergo-compiler').ComposerConcerto.RelationshipDeclaration;
const Writer = require('@accordproject/ergo-compiler').ComposerConcerto.Writer;
const Logger = require('@accordproject/ergo-compiler').Logger;
const nearley = require('nearley');
const compile = require('nearley/lib/compile');
const generate = require('nearley/lib/generate');
const nearleyGrammar = require('nearley/lib/nearley-language-bootstrapped');
const templateGrammar = require('./tdl.js');
const GrammarVisitor = require('./grammarvisitor');
const uuid = require('uuid');
const nunjucks = require('nunjucks');
const DateTimeFormatParser = require('./datetimeformatparser');
const CommonmarkParser = require('@accordproject/markdown-transform').CommonmarkParser;
const CommonmarkToString = require('@accordproject/markdown-transform').CommonmarkToString;

// This required because only compiled nunjucks templates are supported browser-side
// https://mozilla.github.io/nunjucks/api.html#browser-usage
// We can't always import it in Cicero because precompiling is not supported server-side!
// https://github.com/mozilla/nunjucks/issues/1065
if(process.browser){
    require('./compiled_template');
}

/**
 * Generates and manages a Nearley parser for a template.
 * @class
 */
class ParserManager {

    /**
     * Create the ParserManager.
     * @param {object} template - the template instance
     */
    constructor(template) {
        this.template = template;
        this.grammar = null;
        this.grammarAst = null;
        this.templatizedGrammar = null;
        this.templateAst = null;
    }

    /**
     * Gets a parser object for this template
     * @return {object} the parser for this template
     */
    getParser() {
        if (!this.grammarAst) {
            throw new Error('Must call setGrammar or buildGrammar before calling getParser');
        }

        return new nearley.Parser(nearley.Grammar.fromCompiled(this.grammarAst));
    }

    /**
     * Gets the AST for the template
     * @return {object} the AST for the template
     */
    getTemplateAst() {
        if (!this.grammarAst) {
            throw new Error('Must call setGrammar or buildGrammar before calling getTemplateAst');
        }

        return this.templateAst;
    }

    /**
     * Set the grammar for the template
     * @param {String} grammar  - the grammar for the template
     */
    setGrammar(grammar) {
        this.grammarAst = ParserManager.compileGrammar(grammar);
        this.grammar = grammar;
    }

    /**
     * Build a grammar from a template
     * @param {String} templatizedGrammar  - the annotated template
     * @param {boolean} [markdown] - if true the templatizedGrammar is pre-processed
     * using the markdown parser
     */
    buildGrammar(templatizedGrammar, markdown) {

        if(markdown) {
            const commonmarkParser = new CommonmarkParser();
            const concertoAst = commonmarkParser.parse(templatizedGrammar);
            templatizedGrammar = CommonmarkToString(concertoAst);
            // console.log(templatizedGrammar);
        }

        Logger.debug('buildGrammar', templatizedGrammar);
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(templateGrammar));
        parser.feed(templatizedGrammar);
        if (parser.results.length !== 1) {
            throw new Error('Ambiguous parse!');
        }

        // parse the template grammar to generate a dynamic grammar
        const ast = parser.results[0];
        this.templateAst = ast;
        const parts = {
            textRules: [],
            modelRules: [],
            grammars : {}
        };
        parts.grammars.base = require('./grammars/base');
        this.buildGrammarRules(ast, this.template.getTemplateModel(), 'rule', parts);

        // generate the grammar for the model
        const parameters = {
            writer: new Writer(),
            rules : []
        };
        const gv = new GrammarVisitor();
        this.template.getModelManager().accept(gv, parameters);
        parts.modelRules.push(...parameters.rules);

        // combine the results
        nunjucks.configure(fsPath.resolve(__dirname), {
            tags: {
                blockStart: '<%',
                blockEnd: '%>'
            },
            autoescape: false  // Required to allow nearley syntax strings
        });
        const combined = nunjucks.render('template.ne', parts);
        Logger.debug('Generated template grammar' + combined);

        // console.log(combined);
        this.setGrammar(combined);
        this.templatizedGrammar = templatizedGrammar;
    }

    /**
     * Build grammar rules from a template
     * @param {object} ast  - the AST from which to build the grammar
     * @param {ClassDeclaration} templateModel  - the type of the parent class for this AST
     * @param {String} prefix - A unique prefix for the grammar rules
     * @param {Object} parts - Result object to acculumate rules and required sub-grammars
     */
    buildGrammarRules(ast, templateModel, prefix, parts) {

        // these are the rules for variables
        const rules = {};

        // these are the rules for static text
        let textRules = {};

        // generate all the rules for the static text
        textRules.prefix = prefix;
        textRules.symbols = [];
        ast.data.forEach((element, index) => {
            // ignore empty chunks (issue #1) and missing optional last chunks
            if (element && (element.type !== 'Chunk' || element.value.length > 0)) {
                Logger.debug(`element ${prefix}${index} ${JSON.stringify(element)}`);
                rules[prefix + index] = element;
                textRules.symbols.push(prefix + index);
            }
        }, this);

        // the result of parsing is an instance of the template model
        textRules.class = templateModel.getFullyQualifiedName();
        const identifier = templateModel.getIdentifierFieldName();
        if (identifier !== null) {
            textRules.identifier = `${identifier} : "${uuid.v4()}"`;
        }

        // we then bind each variable in the template model
        // to the first occurence of the variable in the template grammar
        textRules.properties = [];
        templateModel.getProperties().forEach((property, index) => {
            const sep = index < templateModel.getProperties().length - 1 ? ',' : '';
            const bindingIndex = this.findFirstBinding(property.getName(), ast.data);
            if (bindingIndex !== -1) { // ignore things like transactionId
                // TODO (DCS) add !==null check for BooleanBinding
                textRules.properties.push(`${property.getName()} : ${prefix}${bindingIndex}${sep}`);
            }
        });
        parts.textRules.push(textRules);

        // Now create the child rules for each symbol in the root rule
        for (let rule in rules) {
            const element = rules[rule];
            switch (element.type) {
            case 'Chunk':
            case 'ExprChunk':
            case 'LastChunk':
                parts.modelRules.push({
                    prefix: rule,
                    symbols: [this.cleanChunk(element.value)],
                });
                break;
            case 'BooleanBinding': {
                const property = ParserManager.getProperty(templateModel, element);
                if(property.getType() !== 'Boolean') {
                    ParserManager._throwTemplateExceptionForElement(`A boolean binding can only be used with a boolean property. Property ${element.fieldName.value} has type ${property.getType()}`, element);
                }
                parts.modelRules.push({
                    prefix: rule,
                    symbols: [`"${element.string.value}":? {% (d) => {return d[0] !== null;}%} # ${element.fieldName.value}`],
                });
            }
                break;
            case 'FormattedBinding':
            case 'Binding':
            case 'ClauseBinding':
            case 'WithBinding':
            case 'ListBinding':
                this.handleBinding(templateModel, parts, rule, element);
                break;
            case 'Expr':
                parts.modelRules.push({
                    prefix: rule,
                    symbols: ['Any'],
                });
                break;
            default:
                ParserManager._throwTemplateExceptionForElement(`Unrecognized type ${element.type}`, element);
            }
        }
    }

    /**
     * Throws an error if a template variable doesn't exist on the model.
     * @param {*} templateModel - the model for the template
     * @param {*} element - the current element in the AST
     * @returns {*} the property
     */
    static getProperty(templateModel, element) {
        const propertyName = element.fieldName.value;
        const property = templateModel.getProperty(propertyName);
        if (!property) {
            ParserManager._throwTemplateExceptionForElement(`Template references a property '${propertyName}' that is not declared in the template model '${templateModel.getFullyQualifiedName()}'`, element);
        }

        return property;
    }


    /**
     * Throw a template exception for the element
     * @param {string} message - the error message
     * @param {object} element the AST
     * @throws {TemplateException}
     */
    static _throwTemplateExceptionForElement(message, element) {
        const fileName = 'grammar/template.tem';
        let column = element.fieldName.col;
        let line = element.fieldName.line;

        let token = element.value ? element.value : ' ';
        const endColumn = column + token.length;

        const fileLocation = {
            start: {
                line,
                column,
            },
            end: {
                line,
                endColumn,//XXX
            },
        };

        throw new TemplateException(message, fileLocation, fileName, null, 'cicero-core');
    }

    /**
     * Utility method to generate a grammar rule for a variable binding
     * @param {ClassDeclaration} templateModel - the current template model
     * @param {*} parts - the parts, where the rule will be added
     * @param {*} inputRule - the rule we are processing in the AST
     * @param {*} element - the current element in the AST
     */
    handleBinding(templateModel, parts, inputRule, element) {
        const propertyName = element.fieldName.value;
        const property = ParserManager.getProperty(templateModel, element);

        let action = null;
        let suffix = ':';
        let type = property.getType();

        // if the type/action have not been set explicity, then we infer them
        if(!action) {
            action = '{% id %}';

            if(property.getType() === 'DateTime' || element.type === 'FormattedBinding' ) {
                if(property.getType() !== 'DateTime') {
                    ParserManager._throwTemplateExceptionForElement('Formatted types are currently only supported for DateTime properties.', element);
                }

                // we only include the datetime grammar if custom formats are used
                if(!parts.grammars.dateTime) {
                    parts.grammars.dateTime = require('./grammars/datetime');
                    parts.grammars.dateTimeEn = require('./grammars/datetime-en');
                }

                // push the formatting rule, iff it has not been already declared
                const format = element.format ? element.format.value : '"MM/DD/YYYY"';
                const formatRule = DateTimeFormatParser.buildDateTimeFormatRule(format);
                type = formatRule.name;
                const ruleExists = parts.modelRules.some(rule => (rule.prefix === formatRule.name));
                if(!ruleExists) {
                    parts.modelRules.push({
                        prefix: formatRule.name,
                        symbols: [`${formatRule.tokens} ${formatRule.action} # ${propertyName} as ${format}`],
                    });
                }
            } else if(element.type === 'ClauseBinding' || element.type === 'WithBinding' || element.type === 'ListBinding') {
                const nestedTemplate = element.template;
                const nestedTemplateModel = this.template.getIntrospector().getClassDeclaration(property.getFullyQualifiedTypeName());
                this.buildGrammarRules(nestedTemplate, nestedTemplateModel, propertyName, parts);
                type = element.fieldName.value;
            } else {
                // relationships need to be transformed into strings
                if (property instanceof RelationshipDeclaration) {
                    type = 'String';
                }
            }
        }

        if (property.isArray()) {
            suffix += '+';
        }
        if (property.isOptional()) {
            suffix += '?';
        }
        if (suffix === ':') {
            suffix = '';
        }

        // console.log(`${inputRule} => ${type}${suffix} ${action} # ${propertyName}`);

        parts.modelRules.push({
            prefix: inputRule,
            //symbols: [`"[{" ${type}${suffix} "}]" ${action} # ${propertyName}`],
            symbols: [`${type}${suffix} ${action} # ${propertyName}`],
        });
    }

    /**
     * Cleans a chunk of text to make it safe to include
     * as a grammar rule. We need to remove linefeeds and
     * escape any '"' characters.
     *
     * @param {string} input - the input text from the template
     * @return {string} cleaned text
     */
    cleanChunk(input) {
        // we replace all \n with \\n
        let text =  input.replace(/\n/gm,'\\n');
        // replace all " with \"
        text = text.replace(/"/gm, '\\"');

        return `"${text}"`;
    }

    /**
     * Finds the first binding for the given property
     *
     * @param {string} propertyName the name of the property
     * @param {object[]} elements the result of parsing the template_txt.
     * @return {int} the index of the element or -1
     */
    findFirstBinding(propertyName, elements) {
        for(let n=0; n < elements.length; n++) {
            const element = elements[n];
            if(element !== null && ['Binding','FormattedBinding', 'BooleanBinding','ListBinding','ClauseBinding','WithBinding'].includes(element.type)) {
                if(element.fieldName.value === propertyName) {
                    return n;
                }
            }
        }
        return -1;
    }

    /**
     * Get the (compiled) grammar for the template
     * @return {String} - the grammar for the template
     */
    getGrammar() {
        return this.grammar;
    }

    /**
     * Returns the templatized grammar
     * @return {String} the contents of the templatized grammar
     */
    getTemplatizedGrammar() {
        return this.templatizedGrammar;
    }

    /**
     * Compiles a Nearley grammar to its AST
     * @param {string} sourceCode  - the source text for the grammar
     * @return {object} the AST for the grammar
     */
    static compileGrammar(sourceCode) {

        try {
            // Parse the grammar source into an AST
            const grammarParser = new nearley.Parser(nearleyGrammar);
            grammarParser.feed(sourceCode);
            const grammarAst = grammarParser.results[0]; // TODO check for errors

            // Compile the AST into a set of rules
            const grammarInfoObject = compile(grammarAst, {});
            // Generate JavaScript code from the rules
            const grammarJs = generate(grammarInfoObject, 'grammar');

            // Pretend this is a CommonJS environment to catch exports from the grammar.
            const module = {
                exports: {}
            };
            eval(grammarJs);
            return module.exports;
        } catch (err) {
            Logger.error(err);
            throw err;
        }
    }
}

module.exports = ParserManager;