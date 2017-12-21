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

const logger = require('cicero-core').logger;
const Template = require('cicero-core').Template;
const Clause = require('cicero-core').Clause;
const Engine = require('cicero-engine').Engine;
const CodeGen = require('composer-common').CodeGen;
const FileWriter = CodeGen.FileWriter;
const fs = require('fs');
const GoLangVisitor = CodeGen.GoLangVisitor;
const JavaVisitor = CodeGen.JavaVisitor;
const JSONSchemaVisitor = CodeGen.JSONSchemaVisitor;
const PlantUMLVisitor = CodeGen.PlantUMLVisitor;
const TypescriptVisitor = CodeGen.TypescriptVisitor;

/**
 * Utility class that implements the commands exposed by the Cicero CLI.
 * @class
 * @memberof module:composer-cli
 */
class Commands {

    /**
     * Parse a sample text using a template
     *
     * @param {string} templatePath to the template directory
     * @param {string} samplePath to the sample file
     * @returns {object} Promise to the result of parsing
     */
    static parse(templatePath, samplePath) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');

        return Template.fromDirectory(templatePath)
            .then((template) => {
                clause = new Clause(template);
                clause.parse(sampleText);
                return clause.getData();
            })
            .catch((err) => {
                logger.error(err);
            });
    }

    /**
     * Execute a sample text using a template
     *
     * @param {string} templatePath to the template directory
     * @param {string} samplePath to the sample file
     * @param {string} dataPath to the data file
     * @returns {object} Promise to the result of parsing
     */
    static execute(templatePath, samplePath, dataPath) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');
        const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        return Template.fromDirectory(templatePath)
            .then((template) => {
                clause = new Clause(template);
                clause.parse(sampleText);
                const engine = new Engine();
                return engine.execute(clause, jsonData);
            })
            .catch((err) => {
                logger.error(err);
            });
    }

    /**
     * Converts the model for a template into code
     *
     * @param {string} format the format to generate
     * @param {string} templatePath to the template directory
     * @param {string} outputDirectory the output directory
     * @returns {object} Promise to the result of code generation
     */
    static generate(format, templatePath, outputDirectory) {

        return Template.fromDirectory(templatePath)
            .then((template) => {

                let visitor = null;

                switch(format) {
                case 'Go':
                    visitor = new GoLangVisitor();
                    break;
                case 'PlantUML':
                    visitor = new PlantUMLVisitor();
                    break;
                case 'Typescript':
                    visitor = new TypescriptVisitor();
                    break;
                case 'Java':
                    visitor = new JavaVisitor();
                    break;
                case 'JSONSchema':
                    visitor = new JSONSchemaVisitor();
                    break;
                default:
                    throw new Error ('Unrecognized code generator: ' + format );
                }

                let parameters = {};
                parameters.fileWriter = new FileWriter(outputDirectory);
                template.getModelManager().accept(visitor, parameters);
            })
            .catch((err) => {
                logger.error(err);
            });
    }
}

module.exports = Commands;