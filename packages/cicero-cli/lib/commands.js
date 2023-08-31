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

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const Logger = require('@accordproject/concerto-util').Logger;
const FileWriter = require('@accordproject/concerto-util').FileWriter;
const Template = require('@accordproject/cicero-core').Template;
const CodeGen = require('@accordproject/cicero-tools').CodeGen;

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
     * Set default params before we create an archive using a template
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modfied argument object
     */
    static validateArchiveArgs(argv) {
        return Commands.validateCommonArgs(argv);
    }

    /**
     * Create an archive using a template
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {string} target - target language for the archive
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
     * Verify the template developer/author's signatures
     *
     * @param {string} templatePath - path to the template directory or archive
     * @param {Object} [options] - an optional set of options
     * @returns {object} returns true if signature is valid else false
     */
    static verify(templatePath, options) {
        return Commands.loadTemplate(templatePath, options)
            .then((template) => {
                return template.verifyTemplateSignature();
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