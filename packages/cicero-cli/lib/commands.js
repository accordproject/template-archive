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
const ClauseInstance = require('@accordproject/cicero-core').ClauseInstance;
const ContractInstance = require('@accordproject/cicero-core').ContractInstance;
const Util = require('@accordproject/cicero-core/src/util');
const Engine = require('@accordproject/cicero-engine').Engine;
const Export = require('@accordproject/cicero-transform').Export;
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
const defaultSample = 'text/sample.md';
const defaultData = 'data.json';
const defaultParams = 'params.json';
const defaultState = 'state.json';

/**
 * Utility class that implements the commands exposed by the Cicero CLI.
 * @class
 * @memberof module:cicero-cli
 */
class Commands {
    /**
     * Whether the path is to a file (archive) or a directory
     * @param {string} path - file system path
     * @return {boolean} true if the path is to a file, false otherwise
     */
    static isArchive(path) {
        return fs.lstatSync(path).isFile();
    }

    /**
     * Return a promise to a template from either a directory or an archive file
     * @param {string} templatePath - path to the template directory or archive
     * @param {Object} [options] - an optional set of options
     * @return {Promise<Template>} a Promise to the instantiated template
     */
    static async loadTemplate(templatePath, options) {
        if (Commands.isArchive(templatePath)) {
            const buffer = fs.readFileSync(templatePath);
            return Template.fromArchive(buffer, options);
        } else {
            return Template.fromDirectory(templatePath, options);
        }
    }

    /**
     * Return a promise to an instance from either a directory or an archive file
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} slcPath - path to the smart legal contract archive
     * @param {string} [samplePath] - path to a sample text
     * @param {string} [dataPath] - path to a sample data
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {Object} [options] - an optional set of options
     * @return {Promise<Instance>} a Promise to the instantiated template
     */
    static async loadInstance(templatePath, slcPath, samplePath, dataPath, currentTime, utcOffset, options) {
        if (slcPath) {
            const buffer = fs.readFileSync(slcPath);
            return ContractInstance.fromArchive(buffer, options);
        }
        let template;
        if (Commands.isArchive(templatePath)) {
            const buffer = fs.readFileSync(templatePath);
            template = await Template.fromArchive(buffer, options);
        } else {
            template = await Template.fromDirectory(templatePath, options);
        }

        // Initialize clause
        const clause = ClauseInstance.fromTemplate(template);

        // Wether to use a sample or data
        if (samplePath) {
            clause.parse(fs.readFileSync(samplePath, 'utf8'), currentTime, utcOffset);
        } else {
            clause.setData(JSON.parse(fs.readFileSync(dataPath, 'utf8')));
        }

        return clause;
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

        if(!argv.template && !argv.contract){
            Logger.info('Using current directory as template folder');
            argv.template = '.';
        }

        if (argv.template) {
            argv.template = path.resolve(argv.template);
        }
        if (argv.contract) {
            argv.contract = path.resolve(argv.contract);
        }
        if (argv.template && !Commands.isArchive(argv.template)) {
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
     * Check data params used by initialize, invoke and trigger commands.
     * Data must be provided to these commands either via a "sample.md" file or via a "data.json" file.
     * Function checks if params exist, if not then attempts to locate default "./text/sample.md" or "./data.json" files.
     * If neither found then throws exception.
     *
     * @param {object} argv - the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateDataArgs(argv) {
        if (argv.sample) {
            if (!fs.existsSync(argv.sample)) {
                throw new Error(`A sample file was specified as "${argv.sample}" but does not exist at this location.`);
            }
        } else if (argv.data) {
            if (!fs.existsSync(argv.data)) {
                throw new Error(`A data file was specified as "${argv.data}" but does not exist at this location.`);
            }
        } else {
            if (fs.existsSync(defaultSample)) {
                argv.sample = defaultSample;
                Logger.warn('A data file was not provided. Loading data from default "/text/sample.md" file.');
            } else {
                throw new Error('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
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
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static parse(templatePath, samplePath, outputPath, currentTime, utcOffset, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');

        return Commands.loadTemplate(templatePath, options)
            .then((template) => {
                clause = ClauseInstance.fromTemplate(template);
                clause.parse(sampleText, currentTime, utcOffset, samplePath);
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
        argv = Commands.setDefaultFileArg(argv, 'data', defaultData, ((argv, argDefaultName) => { return path.resolve(argv.template,argDefaultName); }));

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
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static draft(templatePath, dataPath, outputPath, currentTime, utcOffset, options) {
        let clause;
        const dataJson = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        return Commands.loadTemplate(templatePath, options)
            .then(async function (template) {
                clause = ClauseInstance.fromTemplate(template);
                clause.setData(dataJson);
                const drafted = clause.draft(options, currentTime, utcOffset);
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
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static normalize(templatePath, samplePath, overwrite, outputPath, currentTime, utcOffset, options) {
        let clause;
        const sampleText = fs.readFileSync(samplePath, 'utf8');

        return Commands.loadTemplate(templatePath, options)
            .then(async function (template) {
                clause = ClauseInstance.fromTemplate(template);
                clause.parse(sampleText, currentTime, utcOffset, samplePath);
                if (outputPath) {
                    Logger.info('Creating file: ' + outputPath);
                    fs.writeFileSync(outputPath, JSON.stringify(clause.getData(),null,2));
                }
                const text = clause.draft(options, currentTime, utcOffset);
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
        if (argv.template) {
            argv = Commands.validateDataArgs(argv);
        }
        if (!argv.party && argv.contract) {
            throw new Error('No party name name provided. Try the --party flag to provide a party to be triggred.');
        }
        argv = Commands.setDefaultFileArg(argv, 'request', 'request.json', ((argv, argDefaultName) => { return [path.resolve(argv.template,argDefaultName)]; }));

        if (argv.verbose) {
            if (argv.sample) {
                Logger.info(
                    `trigger: \n - Sample: ${argv.sample} \n - Template: ${argv.template} \n - Request: ${argv.request} \n - State: ${argv.state}`
                );
            } else {
                Logger.info(
                    `trigger: \n - Data: ${argv.data} \n - Template: ${argv.template} \n - Request: ${argv.request} \n - State: ${argv.state}`
                );
            }
        }

        return argv;
    }

    /**
     * Trigger a sample text or data json using a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} slcPath - path to the smart legal contract archive
     * @param {string} samplePath - to the sample file
     * @param {string} dataPath - to the data file
     * @param {string[]} requestsPath - to the array of request files
     * @param {string} statePath - to the state file
     * @param {string} party - name of the party triggering the contract
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of execution
     */
    static trigger(templatePath, slcPath, samplePath, dataPath, requestsPath, statePath, party, currentTime, utcOffset, options) {
        let requestsJson = [];

        for (let i = 0; i < requestsPath.length; i++) {
            requestsJson.push(JSON.parse(fs.readFileSync(requestsPath[i], 'utf8')));
        }

        const engine = new Engine();
        return Commands.loadInstance(templatePath, slcPath, samplePath, dataPath, currentTime, utcOffset, party, options)
            .then(async (instance) => {
                let stateJson;
                if(!fs.existsSync(statePath)) {
                    Logger.warn('A state file was not provided, initializing state. Try the --state flag or create a state.json in the root folder of your template.');
                    const initResult = await engine.init(instance, currentTime, utcOffset);
                    stateJson = initResult.state;
                } else {
                    stateJson = JSON.parse(fs.readFileSync(statePath, 'utf8'));
                }

                // First execution to get the initial response
                const firstRequest = requestsJson[0];
                const initResponse = engine.trigger(instance, firstRequest, stateJson, currentTime, utcOffset);
                // Get all the other requests and chain execution through Promise.reduce()
                const otherRequests = requestsJson.slice(1, requestsJson.length);
                const triggerResult = otherRequests.reduce((promise,requestJson) => {
                    return promise.then((result) => {
                        return engine.trigger(instance, requestJson, result.state, currentTime, utcOffset);
                    });
                }, initResponse);

                if (slcPath) {
                    //Add state
                    Util.addHistory(
                        instance,
                        party,
                        'trigger',
                        triggerResult,
                        'Execution'
                    );
                    const archive = await instance.toArchive('ergo');
                    let file;
                    const instanceName = instance.getIdentifier();
                    file = `${instanceName}.slc`;
                    Logger.info('Creating archive: ' + file);
                    fs.writeFileSync(file, archive);
                }
                return triggerResult;
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
        if (argv.template) {
            argv = Commands.validateDataArgs(argv);
        }

        if (!argv.clauseName) {
            throw new Error('No clause name provided. Try the --clauseName flag to provide a clause to be invoked.');
        }
        if (!argv.party && argv.contract) {
            throw new Error('No party name name provided. Try the --party flag to provide a party to be invoked.');
        }
        if (argv.params) {
            if (!fs.existsSync(argv.params)) {
                throw new Error(`A params file was specified as "${argv.params}" but does not exist at this location.`);
            }
        } else {
            argv.params = defaultParams;
            Logger.warn(`A params file was not provided. Loading params from default "${defaultParams}" file.`);
        }

        if (argv.state) {
            if (!fs.existsSync(argv.state)) {
                throw new Error(`A state file was specified as "${argv.state}" but does not exist at this location.`);
            }
        } else {
            argv.state = defaultState;
            Logger.warn(`A state file was not provided. Loading state from default "${defaultState}" file.`);
        }

        if(argv.verbose) {
            if (argv.sample) {
                Logger.info(
                    `invoke: \n - Sample: ${argv.sample} \n - Template: ${argv.template} \n Clause: ${argv.clauseName} \n Params: ${argv.paramsPath}`
                );
            } else {
                Logger.info(
                    `invoke: \n - Data: ${argv.data} \n - Template: ${argv.template} \n Clause: ${argv.clauseName} \n Params: ${argv.paramsPath}`
                );
            }
        }

        return argv;
    }

    /**
     * Invoke a sample text using a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} slcPath - path to the smart legal contract archive
     * @param {string} samplePath - to the sample file
     * @param {string} dataPath - to the data file
     * @param {string} clauseName the name of the clause to invoke
     * @param {object} paramsPath the parameters for the clause
     * @param {string} statePath - to the state file
     * @param {string} party - name of the party invoking the contract
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of execution
     */
    static invoke(templatePath, slcPath, samplePath, dataPath, clauseName, paramsPath, statePath, party, currentTime, utcOffset, options) {
        const paramsJson = JSON.parse(fs.readFileSync(paramsPath, 'utf8'));

        const engine = new Engine();
        return Commands.loadInstance(templatePath, slcPath, samplePath, dataPath, currentTime, utcOffset, options)
            .then(async (instance) => {
                let stateJson;
                if(!fs.existsSync(statePath)) {
                    Logger.warn('A state file was not provided, initializing state. Try the --state flag or create a state.json in the root folder of your template.');
                    const initResult = await engine.init(instance, currentTime, utcOffset);
                    stateJson = initResult.state;
                } else {
                    stateJson = JSON.parse(fs.readFileSync(statePath, 'utf8'));
                }

                const result =  await engine.invoke(instance, clauseName, paramsJson, stateJson, currentTime, utcOffset);

                if (slcPath) {
                    //Add state
                    Util.addHistory(
                        instance,
                        party,
                        'invoke',
                        'Invoked Successfully',
                        'Execution'
                    );
                    const archive = await instance.toArchive('ergo');
                    let file;
                    const instanceName = instance.getIdentifier();
                    file = `${instanceName}.slc`;
                    Logger.info('Creating archive: ' + file);
                    fs.writeFileSync(file, archive);
                }
                return result;
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
        if (argv.template) {
            argv = Commands.validateDataArgs(argv);
        }
        if (!argv.party && argv.contract) {
            throw new Error('No party name name provided. Try the --party flag to provide a party to be initialized.');
        }

        if(argv.verbose) {
            if (argv.sample) {
                Logger.info(
                    `initialize: \n - Sample: ${argv.sample} \n - Template: ${argv.template} \n - Request: ${argv.request} \n - State: ${argv.state}`
                );
            } else {
                Logger.info(
                    `initialize: \n - Data: ${argv.data} \n - Template: ${argv.template} \n - Request: ${argv.request} \n - State: ${argv.state}`
                );
            }
        }

        return argv;
    }

    /**
     * Initializes a sample text using a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} slcPath - path to the smart legal contract archive
     * @param {string} samplePath - to the sample file
     * @param {string} dataPath - to the data file
     * @param {object} paramsPath - the parameters for the initialization
     * @param {string} party - name of the party initializing the contract
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of execution
     */
    static initialize(templatePath, slcPath, samplePath, dataPath, paramsPath, party, currentTime, utcOffset, options) {
        const paramsJson = paramsPath ? JSON.parse(fs.readFileSync(paramsPath, 'utf8')) : {};

        const engine = new Engine();
        return Commands.loadInstance(templatePath, slcPath, samplePath, dataPath, currentTime, utcOffset, options)
            .then(async (instance) => {
                const result = await engine.init(instance, currentTime, utcOffset, paramsJson);

                if (slcPath) {
                    //Add state
                    Util.addHistory(
                        instance,
                        party,
                        'initialize',
                        'Initialized Successfully',
                        'Execution'
                    );
                    const archive = await instance.toArchive('ergo');
                    let file;
                    const instanceName = instance.getIdentifier();
                    file = `${instanceName}.slc`;
                    Logger.info('Creating archive: ' + file);
                    fs.writeFileSync(file, archive);
                }
                return result;
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
     * @param {string} target - target language for the archive (should be either 'ergo' or 'es6')
     * @param {string} outputPath - to the archive file
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the code creating an archive
     */
    static archive(templatePath, target, outputPath, options) {
        return Commands.loadTemplate(templatePath, options)
            .then(async (template) => {
                let keystore = null;
                if (options.keystore) {
                    const p12File = fs.readFileSync(options.keystore.path, { encoding: 'base64' });
                    const inputKeystore = {
                        p12File: p12File,
                        passphrase: options.keystore.passphrase
                    };
                    keystore = inputKeystore;
                }
                const archive = await template.toArchive(target, {keystore}, options);
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
     * Set default params before we create an archive using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateSignArgs(argv) {
        argv = Commands.validateCommonArgs(argv);

        if(!argv.keystore){
            throw new Error('Please enter the keystore\'s path. Try the --keystore flag to enter keystore\'s path.');
        }
        if(!argv.passphrase){
            throw new Error('Please enter the passphrase of the keystore. Try the --passphrase flag to enter passphrase.');
        }
        if(!argv.signatory){
            throw new Error('Please enter the signatory\'s name. Try the --signatory flag to enter signatory\'s name.');
        }
        if(argv.verbose) {
            Logger.info(`Verifying signatures of contract ${argv.contract}`);
        }

        return argv;
    }

    /**
     * Sign a contract instance
     *
     * @param {string} slcPath - path to the slc archive
     * @param {string} keystore - path to the keystore
     * @param {string} passphrase - passphrase of the keystore
     * @param {string} signatory - name of the signatory/party signing the contract
     * @param {string} outputPath - to the archive file
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the code creating an archive
     */
    static async sign(slcPath, keystore, passphrase, signatory, outputPath, options) {
        return Commands.loadInstance(null, slcPath, options)
            .then(async (instance) => {
                const p12File = fs.readFileSync(keystore, { encoding: 'base64' });
                const archive = await instance.signContract(p12File, passphrase, signatory);
                let file;
                if (outputPath) {
                    file = outputPath;
                }
                else {
                    const instanceName = instance.getIdentifier();
                    file = `${instanceName}.slc`;
                }
                Logger.info('Creating archive: ' + file);
                fs.writeFileSync(file, archive);
                return true;
            });
    }

    /**
     * Set default params before we verify signatures of template author/developer
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateVerifyArgs(argv) {
        argv = Commands.validateCommonArgs(argv);
        return argv;
    }

    /**
     * Verify signatures on templates or contract instances
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} contractPath - path to the template directory or archive
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the code creating an archive
     */
    static async verify(templatePath, contractPath, options) {
        if (templatePath) {
            return Commands.loadTemplate(templatePath, options)
                .then(async(template) => {
                    const result = await template.verifyTemplateSignature();
                    return result;
                });
        } else {
            return Commands.loadInstance(null, contractPath, options)
                .then((instance) => {
                    instance.verifySignatures();
                    Logger.info('All signatures verified successfully');
                });
        }
    }

    /**
     * Set default params before we create an instance archive
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateInstantiateArgs(argv) {
        argv = Commands.validateCommonArgs(argv);

        if(!argv.instantiator){
            throw new Error('Please enter the instantiator\'s name. Try the --instantiator flag to enter instantiator\'s name.');
        }

        if(!argv.target){
            Logger.info('Using ergo as the default target for the archive.');
            argv.target = 'ergo';
        }

        return argv;
    }

    /**
     * Create an instance archive from a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} dataPath - path to the JSON data
     * @param {string} target - target language for the archive (should be either 'ergo' or 'es6')
     * @param {string} outputPath - to the archive file
     * @param {string} instantiator - name of the person/party which instantiates the contract instance
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the code creating an archive
     */
    static instantiate(templatePath, dataPath, target, outputPath, instantiator, options) {
        const dataJson = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        return Commands.loadTemplate(templatePath, options)
            .then(async (template) => {
                const instance = ContractInstance.fromTemplateWithData(template, dataJson, instantiator);

                const archive = await instance.toArchive(target);
                let file;
                if (outputPath) {
                    file = outputPath;
                }
                else {
                    const instanceName = instance.getIdentifier();
                    file = `${instanceName}.slc`;
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
            if (Commands.isArchive(argv.template)) {
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

    /**
     * Set default params before we export a contract
     *
     * @param {object} argv - the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateExportArgs(argv) {
        argv = Commands.validateCommonArgs(argv);

        if(argv.verbose) {
            Logger.info(`export contract to format ${argv.format}`);
        }
        if (!argv.party) {
            throw new Error('No party name name provided. Try the --party flag to provide a party to be exported.');
        }

        return argv;
    }

    /**
     * Export a contract to a given format
     *
     * @param {string} slcPath - path to the smart legal contract archive
     * @param {string} party - name of the party exporting the contract
     * @param {string} outputPath - to the contract file
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {Object} [options] - an optional set of options
     * @returns {object} Promise to the result of parsing
     */
    static async export(slcPath, party, outputPath, currentTime, utcOffset, options) {
        return Commands.loadInstance(null, slcPath, null, currentTime, utcOffset, options)
            .then(async function (instance) {
                const format = options.format;
                const result = await Export.toFormat(instance, format, utcOffset, options);
                const destinationFormat = Export.formatDescriptor(format);
                if (destinationFormat.fileFormat !== 'binary') {
                    Logger.info('\n'+result);
                } else {
                    Logger.info(`\n<binary ${format} data>`);
                }
                if (outputPath) {
                    Commands.printFormatToFile(result, format, outputPath);
                }
                //Add state
                Util.addHistory(
                    instance,
                    party,
                    'export',
                    'Exported Successfully',
                    'Execution'
                );
                const archive = await instance.toArchive('ergo');
                let file;
                const instanceName = instance.getIdentifier();
                file = `${instanceName}.slc`;
                Logger.info('Creating archive: ' + file);
                fs.writeFileSync(file, archive);
                return result;
            })
            .catch((err) => {
                Logger.error(err.message);
            });
    }

    /**
     * Prints a format to string
     * @param {*} input the input
     * @param {string} format the format
     * @returns {string} the string representation
     */
    static printFormatToString(input, format) {
        const fileFormat = Export.formatDescriptor(format).fileFormat;
        if (fileFormat === 'json') {
            return JSON.stringify(input);
        } else {
            return input;
        }
    }

    /**
     * Prints a format to file
     * @param {*} input the input
     * @param {string} format the format
     * @param {string} filePath the file name
     */
    static printFormatToFile(input, format, filePath) {
        Logger.info('Creating file: ' + filePath);
        fs.writeFileSync(filePath, Commands.printFormatToString(input,format));
    }

}

module.exports = Commands;