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

const logger = require('@accordproject/cicero-core').logger;
const Template = require('@accordproject/cicero-core').Template;
const Clause = require('@accordproject/cicero-core').Clause;
const Engine = require('@accordproject/cicero-engine').Engine;
const CodeGen = require('composer-concerto-tools').CodeGen;
const FileWriter = CodeGen.FileWriter;
const fs = require('fs');
const path = require('path');
const GoLangVisitor = CodeGen.GoLangVisitor;
const JavaVisitor = CodeGen.JavaVisitor;
const CordaVisitor = CodeGen.CordaVisitor;
const JSONSchemaVisitor = CodeGen.JSONSchemaVisitor;
const PlantUMLVisitor = CodeGen.PlantUMLVisitor;
const TypescriptVisitor = CodeGen.TypescriptVisitor;
const uuidv4 = require('uuid/v4');

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
     * @param {string} outPath to the contract file
     * @returns {object} Promise to the result of parsing
     */
    static parse(templatePath, samplePath, outPath) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');

        return Template.fromDirectory(templatePath)
            .then((template) => {
                clause = new Clause(template);
                clause.parse(sampleText);
                if (outPath) {
                    logger.info('Creating file: ' + outPath);
                    fs.writeFileSync(outPath, JSON.stringify(clause.getData()));
                }
                return clause.getData();
            })
            .catch((err) => {
                logger.error(err.message);
            });
    }

    /**
     * Set default params before we parse a sample text using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateParseArgs(argv) {
        // the user typed 'cicero parse dir'
        if(argv._.length === 2){
            argv.template = argv._[1];
        }

        if(!argv.template){
            logger.info('Using current directory as template folder');
            argv.template = '.';
        }

        argv.template = path.resolve(argv.template);

        const packageJsonExists = fs.existsSync(path.resolve(argv.template,'package.json'));
        let isCiceroTemplate = false;
        if(packageJsonExists){
            let packageJsonContents = JSON.parse(fs.readFileSync(path.resolve(argv.template,'package.json')),'utf8');
            isCiceroTemplate = packageJsonContents.cicero;
        }

        if(!argv.sample){
            logger.info('Loading a default sample.txt file.');
            argv.sample = path.resolve(argv.template,'sample.txt');
        }

        if(argv.verbose) {
            logger.info(`parse sample ${argv.sample} using a template ${argv.template}`);
        }

        let sampleExists = fs.existsSync(argv.sample);
        if(!packageJsonExists || !isCiceroTemplate){
            throw new Error(`${argv.template} is not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.`);
        } else if (!sampleExists){
            throw new Error('A sample text file is required. Try the --sample flag or create a sample.txt in the root folder of your template.');
        } else {
            return argv;
        }
    }

    /**
     * Execute a sample text using a template
     *
     * @param {string} templatePath to the template directory
     * @param {string} samplePath to the sample file
     * @param {string[]} requestsPath to the array of request files
     * @param {string} statePath to the state file
     * @returns {object} Promise to the result of execution
     */
    static execute(templatePath, samplePath, requestsPath, statePath) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');
        let requestsJson = [];
        let stateJson;

        for (let i = 0; i < requestsPath.length; i++) {
            requestsJson.push(JSON.parse(fs.readFileSync(requestsPath[i], 'utf8')));
        }
        if(!fs.existsSync(statePath)) {
            logger.warn('A state file was not provided, generating default state object. Try the --state flag or create a state.json in the root folder of your template.');
            stateJson = {
                '$class': 'org.accordproject.cicero.contract.AccordContractState',
                stateId: uuidv4()

            };
        } else {
            stateJson = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        }

        return Template.fromDirectory(templatePath)
            .then((template) => {
                clause = new Clause(template);
                clause.parse(sampleText);
                const engine = new Engine();
                // First execution to get the initial response
                const firstRequest = requestsJson[0];
                const initResponse = engine.execute(clause, firstRequest, stateJson);
                // Get all the other requests and chain execution through Promise.reduce()
                const otherRequests = requestsJson.slice(1, requestsJson.length);
                return otherRequests.reduce((promise,requestJson) => {
                    return promise.then((result) => {
                        return engine.execute(clause, requestJson, result.state);
                    });
                }, initResponse);
            })
            .catch((err) => {
                logger.error(err.message);
            });
    }

    /**
     * Set default params before we execute a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateExecuteArgs(argv) {
        // the user typed 'cicero execute dir'
        if(argv._.length === 2){
            argv.template = argv._[1];
        }

        if(!argv.template){
            logger.info('Using current directory as template folder');
            argv.template = '.';
        }

        argv.template = path.resolve(argv.template);

        const packageJsonExists = fs.existsSync(path.resolve(argv.template,'package.json'));
        let isCiceroTemplate = false;
        if(packageJsonExists){
            let packageJsonContents = JSON.parse(fs.readFileSync(path.resolve(argv.template,'package.json')),'utf8');
            isCiceroTemplate = packageJsonContents.cicero;
        }

        if(!argv.sample){
            logger.info('Loading a default sample.txt file.');
            argv.sample = path.resolve(argv.template,'sample.txt');
        }

        if(!argv.request){
            logger.info('Loading a single default request.json file.');
            argv.request = [path.resolve(argv.template,'request.json')];
        }

        if(!argv.state){
            logger.info('Loading a default state.json file.');
            argv.state = path.resolve(argv.template,'state.json');
        }

        if(argv.verbose) {
            logger.info(`execute sample ${argv.sample} using a template ${argv.template} with request ${argv.request} with state ${argv.state}`);
        }

        let sampleExists = fs.existsSync(argv.sample);
        // All requests should exist
        let requestExists = true;
        for (let i = 0; i < argv.request.length; i++) {
            if (fs.existsSync(argv.request[i]) && requestExists) {
                requestExists = true;
            } else {
                requestExists = false;
            }
        }
        if(!packageJsonExists || !isCiceroTemplate){
            throw new Error(`${argv.template} is not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.`);
        } else if (!sampleExists){
            throw new Error('A sample text file is required. Try the --sample flag or create a sample.txt in the root folder of your template.');
        } else if(!requestExists){
            throw new Error('A request file is required. Try the --request flag or create a request.json in the root folder of your template.');
        } else {
            return argv;
        }
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
                case 'Corda':
                    visitor = new CordaVisitor();
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

    /**
     * Set default params before we create an archive using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateArchiveArgs(argv) {
        // the user typed 'cicero archive dir'
        if(argv._.length === 2){
            argv.template = argv._[1];
        }

        if(!argv.template){
            logger.info('Using current directory as template folder');
            argv.template = '.';
        }

        argv.template = path.resolve(argv.template);

        const packageJsonExists = fs.existsSync(path.resolve(argv.template,'package.json'));
        let isCiceroTemplate = false;
        if(packageJsonExists){
            let packageJsonContents = JSON.parse(fs.readFileSync(path.resolve(argv.template,'package.json')),'utf8');
            isCiceroTemplate = packageJsonContents.cicero;
        }

        if(!argv.language){
            logger.info('Using ergo as default language archive.');
            argv.language = 'ergo';
        }

        if(argv.verbose) {
            logger.info(`creating ${argv.language} archive for template ${argv.template}`);
        }

        if(!packageJsonExists || !isCiceroTemplate){
            throw new Error(`${argv.template} is not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.`);
        } else {
            return argv;
        }
    }

    /**
     * Create an archive using a template
     *
     * @param {string} language - target language for the archive (should be either 'ergo' or 'javascript')
     * @param {string} templatePath to the template directory
     * @param {string} archiveFile to the archive file
     * @returns {object} Promise to the code creating an archive
     */
    static archive(language, templatePath, archiveFile) {
        return Template.fromDirectory(templatePath)
            .then((template) => {
                let target = language;
                // If target is 'text', set the textArchive flag
                if (target === 'text') {
                    template.setTextOnlyArchive();
                    target = 'ergo';
                }
                return template.toArchive(target);
            })
            .then((archive) => {
                logger.info('Creating archive: ' + archiveFile);
                fs.writeFileSync(archiveFile, archive);
                return Promise.resolve(true);
            });
    }
}

module.exports = Commands;