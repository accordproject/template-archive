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
const Template = require('@accordproject/cicero-core').Template;
const Clause = require('@accordproject/cicero-core').Clause;
const Engine = require('@accordproject/cicero-engine').Engine;
const CodeGen = require('@accordproject/cicero-tools').CodeGen;
const FileWriter = CodeGen.FileWriter;
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
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
     * @param {string} templatePath - path to the template directory or archive
     * @return {boolean} true if the path is to a file, false otherwise
     */
    static isTemplateArchive(templatePath) {
        return fs.lstatSync(templatePath).isFile();
    }

    /**
     * Return a promise to a template from either a directory or an archive file
     * @param {string} templatePath - path to the template directory or archive
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
     * @param {object} argv - the inbound argument values object
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
     * @param {object} argv - the inbound argument values object
     * @param {string} argName - the argument name
     * @param {string} argDefaultName - the argument default name
     * @param {Function} argDefaultFun - how to compute the argument default
     * @param {object} argDefaultValue - an optional default value if all else fails
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
            throw new Error(`A ${argDefaultName} file is required. Try the --${argName} flag or create a ${argDefaultName} in your template.`);
        } else {
            return argv;
        }
    }

    /**
     * Set default params before we parse a sample text using a template
     *
     * @param {object} argv - the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateParseArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'sample', 'text/sample.md', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));

        if(argv.verbose) {
            Logger.info(`parse sample ${argv.sample} using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Parse a sample text using a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} samplePath - path to the contract text
     * @param {string} outputPath - to an output file
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static parse(templatePath, samplePath, outputPath, currentTime, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');

        return Commands.loadTemplate(templatePath, options)
            .then((template) => {
                clause = new Clause(template);
                clause.parse(sampleText, currentTime, samplePath);
                if (outputPath) {
                    Logger.info('Creating file: ' + outputPath);
                    fs.writeFileSync(outputPath, JSON.stringify(clause.getData(),null,2));
                }
                return clause.getData();
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Set default params before we draft a sample text using a template
     *
     * @param {object} argv - the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateDraftArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'data', 'data.json', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));

        if(argv.verbose) {
            Logger.info(`draft text from data ${argv.data} using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Draft a contract text from JSON data
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} dataPath - path to the JSON data
     * @param {string} outputPath - to the contract file
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static draft(templatePath, dataPath, outputPath, currentTime, options) {
        let clause;
        const dataJson = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        return Commands.loadTemplate(templatePath, options)
            .then(async function (template) {
                clause = new Clause(template);
                clause.setData(dataJson);
                const drafted = clause.draft(options, currentTime);
                if (outputPath) {
                    Logger.info('Creating file: ' + outputPath);
                    let text;
                    if (options &&
                        options.format &&
                        (options.format === 'slate' || options.format === 'ciceromark_parsed')) {
                        text = JSON.stringify(drafted);
                    } else {
                        text = drafted;
                    }
                    fs.writeFileSync(outputPath, text);
                }
                return drafted;
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Set default params before we parse a sample text using a template
     *
     * @param {object} argv - the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateNormalizeArgs(argv) {
        argv = Commands.validateParseArgs(argv);
        if (argv.overwrite) {
            if (argv.output) {
                throw new Error('Cannot use both --overwrite and --output');
            } else {
                argv.output = argv.sample;
            }
        }
        return argv;
    }

    /**
     * Parse and re-create a sample contract
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} samplePath - to the sample file
     * @param {boolean} overwrite - true if overwriting the sample
     * @param {string} outputPath - to the contract file
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static normalize(templatePath, samplePath, overwrite, outputPath, currentTime, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');

        return Commands.loadTemplate(templatePath, options)
            .then(async function (template) {
                clause = new Clause(template);
                clause.parse(sampleText, currentTime, samplePath);
                if (outputPath) {
                    Logger.info('Creating file: ' + outputPath);
                    fs.writeFileSync(outputPath, JSON.stringify(clause.getData(),null,2));
                }
                const text = clause.draft(options, currentTime);
                if (outputPath) {
                    Logger.info('Creating file: ' + outputPath);
                    fs.writeFileSync(outputPath, text);
                }
                return text;
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Set default params before we trigger a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateTriggerArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'sample', 'text/sample.md', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));
        argv = Commands.setDefaultFileArg(argv, 'request', 'request.json', ((argv, argDefaultName) => { return [path.resolve(argv.template,argDefaultName)]; }));

        if(argv.verbose) {
            Logger.info(`trigger sample ${argv.sample} using a template ${argv.template} with request ${argv.request} with state ${argv.state}`);
        }

        return argv;
    }

    /**
     * Trigger a sample text using a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} samplePath - to the sample file
     * @param {string[]} requestsPath - to the array of request files
     * @param {string} statePath - to the state file
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of execution
     */
    static trigger(templatePath, samplePath, requestsPath, statePath, currentTime, options) {
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
                const initResponse = engine.trigger(clause, firstRequest, stateJson, currentTime);
                // Get all the other requests and chain execution through Promise.reduce()
                const otherRequests = requestsJson.slice(1, requestsJson.length);
                return otherRequests.reduce((promise,requestJson) => {
                    return promise.then((result) => {
                        return engine.trigger(clause, requestJson, result.state);
                    });
                }, initResponse);
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Set default params before we invoke a clause
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateInvokeArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'sample', 'text/sample.md', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));
        argv = Commands.setDefaultFileArg(argv, 'params', 'params.json', ((argv, argDefaultName) => { return [path.resolve(argv.template,argDefaultName)]; }));

        if(argv.verbose) {
            Logger.info(`initialize sample ${argv.sample} using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Invoke a sample text using a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} samplePath - to the sample file
     * @param {string} clauseName the name of the clause to invoke
     * @param {object} paramsPath the parameters for the clause
     * @param {string} statePath - to the state file
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of execution
     */
    static invoke(templatePath, samplePath, clauseName, paramsPath, statePath, currentTime, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');
        const paramsJson = JSON.parse(fs.readFileSync(paramsPath, 'utf8'));

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

                return engine.invoke(clause, clauseName, paramsJson, stateJson, currentTime);
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Set default params before we initialize a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateInitializeArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        argv = Commands.setDefaultFileArg(argv, 'sample', 'text/sample.md', ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));

        if(argv.verbose) {
            Logger.info(`initialize sample ${argv.sample} using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Initializes a sample text using a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} samplePath - to the sample file
     * @param {object} paramsPath - the parameters for the initialization
     * @param {string} currentTime - the definition of 'now'
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of execution
     */
    static initialize(templatePath, samplePath, paramsPath, currentTime, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');
        const paramsJson = paramsPath ? JSON.parse(fs.readFileSync(paramsPath, 'utf8')) : {};

        const engine = new Engine();
        return Commands.loadTemplate(templatePath, options)
            .then((template) => {
                // Initialize clause
                clause = new Clause(template);
                clause.parse(sampleText, currentTime);

                return engine.init(clause, currentTime, paramsJson);
            })
            .catch((err) => {
                Logger.error(err.message);
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
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} target - target language for the archive (should be either 'ergo' or 'cicero')
     * @param {string} outputPath - to the archive file
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the code creating an archive
     */
    static archive(templatePath, target, outputPath, options) {
        return Commands.loadTemplate(templatePath, options)
            .then(async (template) => {
                const archive = await template.toArchive(target);
                let file;
                if (outputPath) {
                    file = outputPath;
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

    /**
     * Set default params before we compile a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateCompileArgs(argv) {
        argv = Commands.validateCommonArgs(argv);

        if(argv.verbose) {
            Logger.info(`compile using a template ${argv.template}`);
        }

        return argv;
    }

    /**
     * Compile the template to a given target
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} target - the target format
     * @param {string} outputPath - the output directory
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of code generation
     */
    static compile(templatePath, target, outputPath, options) {

        return Commands.loadTemplate(templatePath, options)
            .then((template) => {

                let visitor = null;

                switch(target) {
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
                    throw new Error ('Unrecognized code generator: ' + target);
                }

                let parameters = {};
                parameters.fileWriter = new FileWriter(outputPath);
                template.getModelManager().accept(visitor, parameters);
            })
            .catch((err) => {
                Logger.error(err);
            });
    }

    /**
     * Set default params before we download external dependencies
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateGetArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        if (!argv.output) {
            if (Commands.isTemplateArchive(argv.template)) {
                argv.output = './model';
            } else {
                argv.output = path.resolve(argv.template,'model');
            }
        }
        return argv;
    }

    /**
     * Fetches all external for a set of models dependencies and
     * saves all the models to a target directory
     *
     * @param {string} templatePath the system model
     * @param {string} output the output directory
     * @return {string} message
     */
    static async get(templatePath, output) {
        return Commands.loadTemplate(templatePath, {})
            .then((template) => {
                const modelManager = template.getModelManager();
                mkdirp.sync(output);
                modelManager.writeModelsToFileSystem(output);
                return `Loaded external models in '${output}'.`;
            });
    }
}

module.exports = Commands;