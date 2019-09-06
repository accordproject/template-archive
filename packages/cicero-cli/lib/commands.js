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

const Logger = require('@accordproject/ergo-compiler').Logger;
const Template = require('@accordproject/cicero-core').Template;
const Clause = require('@accordproject/cicero-core').Clause;
const Engine = require('@accordproject/cicero-engine').Engine;
const CodeGen = require('@accordproject/cicero-tools').CodeGen;
const FileWriter = CodeGen.FileWriter;
const fs = require('fs');
const path = require('path');
const GoLangVisitor = CodeGen.GoLangVisitor;
const JavaVisitor = CodeGen.JavaVisitor;
const CordaVisitor = CodeGen.CordaVisitor;
const JSONSchemaVisitor = CodeGen.JSONSchemaVisitor;
const PlantUMLVisitor = CodeGen.PlantUMLVisitor;
const TypescriptVisitor = CodeGen.TypescriptVisitor;

/**
 * Utility class that implements the commands exposed by the Cicero CLI.
 * @class
 * @memberof module:cicero-cli
 */
class Commands {
    /**
     * Whether the template path is to a file (template archive)
     * @param {string} templatePath to the template path directory or file
     * @return {boolean} true if the path is to a file, false otherwise
     */
    static isTemplateArchive(templatePath) {
        return fs.lstatSync(templatePath).isFile();
    }

    /**
     * Return a promise to a template from either a directory or an archive file
     * @param {string} templatePath to the template path directory or file
     * @param {Object} [options] - an optional set of options
     * @return {Promise<Template>} a Promise to the instantiated template
     */
    static loadTemplate(templatePath, options) {
        if (Commands.isTemplateArchive(templatePath)) {
            const buffer = fs.readFileSync(templatePath);
            return Template.fromArchive(buffer, options);
        } else {
            return Template.fromDirectory(templatePath, options);
        }
    }

    /**
     * Common default params before we create an archive using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateCommonArgs(argv) {
        // the user typed 'cicero [command] [template]'
        if(argv._.length === 2){
            argv.template = argv._[1];
        }

        if(!argv.template){
            Logger.info('Using current directory as template folder');
            argv.template = '.';
        }

        argv.template = path.resolve(argv.template);

        if (!Commands.isTemplateArchive(argv.template)) {
            const packageJsonExists = fs.existsSync(path.resolve(argv.template,'package.json'));
            let isAPTemplate = false;
            if(packageJsonExists){
                let packageJsonContents = JSON.parse(fs.readFileSync(path.resolve(argv.template,'package.json')),'utf8');
                isAPTemplate = packageJsonContents.accordproject;
            }

            if(!packageJsonExists || !isAPTemplate){
                throw new Error(`${argv.template} is not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.`);
            }
        }

        return argv;
    }

    /**
     * Set a default for a file argument
     *
     * @param {object} argv the inbound argument values object
     * @param {string} argName the argument name
     * @param {string} argDefaultName the argument default name
     * @param {Function} argDefaultFun how to compute the argument default
     * @param {object} argDefaultValue an optional default value if all else fails
     * @returns {object} a modified argument object
     */
    static setDefaultFileArg(argv, argName, argDefaultName, argDefaultFun) {
        if(!argv[argName]){
            Logger.info(`Loading a default ${argDefaultName} file.`);
            argv[argName] = argDefaultFun(argv, argDefaultName);
        }

        let argExists = true;
        if (Array.isArray(argv[argName])) {
            // All files should exist
            for (let i = 0; i < argv[argName].length; i++) {
                if (fs.existsSync(argv[argName][i]) && argExists) {
                    argExists = true;
                } else {
                    argExists = false;
                }
            }
        } else {
            // This file should exist
            argExists = fs.existsSync(argv[argName]);
        }

        if (!argExists){
            throw new Error(`A ${argDefaultName} file is required. Try the --${argName} flag or create a ${argDefaultName} in the root folder of your template.`);
        } else {
            return argv;
        }
    }

    /**
     * Parse a sample text using a template
     *
     * @param {string} templatePath to the template path directory or file
     * @param {string} samplePath to the sample file
     * @param {string} outPath to the contract file
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static parse(templatePath, samplePath, outPath, currentTime, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');

        return Commands.loadTemplate(templatePath, options)
            .then((template) => {
                clause = new Clause(template);
                clause.parse(sampleText, currentTime, samplePath);
                if (outPath) {
                    Logger.info('Creating file: ' + outPath);
                    fs.writeFileSync(outPath, JSON.stringify(clause.getData(),null,2));
                }
                return clause.getData();
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Generate a sample text from JSON data using a template
     *
     * @param {string} templatePath to the template path directory or file
     * @param {string} dataPath to the data file
     * @param {string} outPath to the contract file
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static generateText(templatePath, dataPath, outPath, options) {
        let clause;
        const dataJson = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        return Commands.loadTemplate(templatePath, options)
            .then((template) => {
                clause = new Clause(template);
                clause.setData(dataJson);
                if (outPath) {
                    Logger.info('Creating file: ' + outPath);
                    fs.writeFileSync(outPath, clause.generateText(options));
                }
                return clause.generateText(options);
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Set default params before we parse a sample text using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateParseArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'sample', 'sample.md', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));

        if(argv.verbose) {
            Logger.info(`parse sample ${argv.sample} using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Set default params before we generatet a sample text using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateGenerateTextArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'data', 'data.json', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));

        if(argv.verbose) {
            Logger.info(`generate text from data ${argv.data} using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Initializes a sample text using a template
     *
     * @param {string} templatePath to the template path directory or file
     * @param {string} samplePath to the sample file
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of execution
     */
    static init(templatePath, samplePath, currentTime, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');

        const engine = new Engine();
        return Commands.loadTemplate(templatePath, options)
            .then((template) => {
                // Initialize clause
                clause = new Clause(template);
                clause.parse(sampleText, currentTime);

                return engine.init(clause, currentTime);
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }


    /**
     * Execute a sample text using a template
     *
     * @param {string} templatePath to the template path directory or file
     * @param {string} samplePath to the sample file
     * @param {string[]} requestsPath to the array of request files
     * @param {string} statePath to the state file
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of execution
     */
    static execute(templatePath, samplePath, requestsPath, statePath, currentTime, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');
        let requestsJson = [];

        for (let i = 0; i < requestsPath.length; i++) {
            requestsJson.push(JSON.parse(fs.readFileSync(requestsPath[i], 'utf8')));
        }

        const engine = new Engine();
        return Commands.loadTemplate(templatePath, options)
            .then(async (template) => {
                // Initialize clause
                clause = new Clause(template);
                clause.parse(sampleText, currentTime);

                let stateJson;
                if(!fs.existsSync(statePath)) {
                    Logger.warn('A state file was not provided, initializing state. Try the --state flag or create a state.json in the root folder of your template.');
                    const initResult = await engine.init(clause, currentTime);
                    stateJson = initResult.state;
                } else {
                    stateJson = JSON.parse(fs.readFileSync(statePath, 'utf8'));
                }

                // First execution to get the initial response
                const firstRequest = requestsJson[0];
                const initResponse = engine.execute(clause, firstRequest, stateJson, currentTime);
                // Get all the other requests and chain execution through Promise.reduce()
                const otherRequests = requestsJson.slice(1, requestsJson.length);
                return otherRequests.reduce((promise,requestJson) => {
                    return promise.then((result) => {
                        return engine.execute(clause, requestJson, result.state);
                    });
                }, initResponse);
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Set default params before we execute a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateExecuteArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'sample', 'sample.md', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));
        argv = Commands.setDefaultFileArg(argv, 'request', 'request.json', ((argv, argDefaultName) => { return [path.resolve(argv.template,argDefaultName)]; }));
        //argv = Commands.setDefaultFileArg(argv, 'state', 'state.json', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));

        if(argv.verbose) {
            Logger.info(`execute sample ${argv.sample} using a template ${argv.template} with request ${argv.request} with state ${argv.state}`);
        }

        return argv;
    }

    /**
     * Set default params before we initialize a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateInitArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'sample', 'sample.md', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));

        if(argv.verbose) {
            Logger.info(`initialize sample ${argv.sample} using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Converts the model for a template into code
     *
     * @param {string} format the format to generate
     * @param {string} templatePath to the template path directory or file
     * @param {string} outputDirectory the output directory
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of code generation
     */
    static generate(format, templatePath, outputDirectory, options) {

        return Commands.loadTemplate(templatePath, options)
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
                Logger.error(err);
            });
    }

    /**
     * Set default params before we create an archive using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateArchiveArgs(argv) {
        argv = Commands.validateCommonArgs(argv);

        if(!argv.target){
            Logger.info('Using ergo as the default target for the archive.');
            argv.target = 'ergo';
        }

        return argv;
    }

    /**
     * Create an archive using a template
     *
     * @param {string} target - target language for the archive (should be either 'ergo' or 'cicero')
     * @param {string} templatePath to the template path directory or file
     * @param {string} archiveFile to the archive file
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the code creating an archive
     */
    static archive(target, templatePath, archiveFile, options) {
        return Commands.loadTemplate(templatePath, options)
            .then(async (template) => {
                const archive = await template.toArchive(target);
                let file;
                if (archiveFile) {
                    file = archiveFile;
                }
                else {
                    const templateName = template.getMetadata().getName();
                    const templateVersion = template.getMetadata().getVersion();
                    file = `${templateName}@${templateVersion}.cta`;
                }
                Logger.info('Creating archive: ' + file);
                fs.writeFileSync(file, archive);
                return true;
            });
    }
}

module.exports = Commands;