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
const { CodeGen } = require('@accordproject/concerto-codegen');

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
                const VisitorClass = CodeGen.formats[target];
                if(!VisitorClass) {
                    throw new Error ('Unrecognized code generator: ' + target);
                }
                const visitor = new VisitorClass();
                console.log('generating code...');
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

    /**
     * Set default params before we validate a template.
     *
     * Unlike validateCommonArgs, this does NOT throw on missing/malformed
     * package.json — reporting those conditions is the purpose of the validate
     * command itself.
     *
     * @param {object} argv the inbound argument values object
     * @returns {object} a modified argument object
     */
    static validateValidateArgs(argv) {
        if (argv._.length === 2) {
            argv.template = argv._[1];
        }
        if (!argv.template) {
            Logger.info('Using current directory as template folder');
            argv.template = '.';
        }
        argv.template = path.resolve(argv.template);
        return argv;
    }

    /**
     * Validate a template directory in isolation, with layered per-check output.
     *
     * Runs a sequence of structural and coherence checks and returns a result
     * object describing what passed and what failed. Unlike `archive`, `compile`,
     * or `parse`, this command produces no output artifacts and requires no
     * sample file. It is intended as a fast CI-friendly lint step.
     *
     * Checks, in order:
     *   1. template path exists and is a directory
     *   2. package.json exists, parses as JSON, and contains an accordproject section
     *   3. text/grammar.tem.md exists
     *   4. model/ exists and contains at least one .cto file
     *   5. overall template coherence via Template.fromDirectory
     *      (parses grammar, validates model, checks variable/model agreement)
     *
     * The first four checks are per-file and short-circuit on the first failure
     * so the error surface pinpoints the broken layer. The last check wraps
     * cicero-core's own loader and surfaces its error message verbatim when it
     * throws.
     *
     * @param {string} templatePath - path to the template directory
     * @param {object} [options] - optional configuration
     * @param {boolean} [options.warnings] - surface non-fatal warnings
     * @returns {Promise<object>} a result object with `results` (per-check
     *   entries), `warnings` (string array), and `valid` (boolean)
     */
    static async validate(templatePath, options = {}) {
        const results = [];
        const warnings = [];

        // Check 1: path exists and is a directory
        if (!fs.existsSync(templatePath)) {
            results.push({ layer: 'path', ok: false, message: `template path not found: ${templatePath}` });
            return { results, warnings, valid: false };
        }
        if (!fs.lstatSync(templatePath).isDirectory()) {
            results.push({
                layer: 'path',
                ok: false,
                message: `${templatePath} is not a directory. Use 'cicero verify' for .cta archives.`,
            });
            return { results, warnings, valid: false };
        }

        // Check 2: package.json exists, parses, has accordproject section
        const pkgPath = path.resolve(templatePath, 'package.json');
        if (!fs.existsSync(pkgPath)) {
            results.push({ layer: 'package.json', ok: false, message: 'file not found' });
            return { results, warnings, valid: false };
        }
        let pkg;
        try {
            pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        } catch (err) {
            results.push({ layer: 'package.json', ok: false, message: `not valid JSON: ${err.message}` });
            return { results, warnings, valid: false };
        }
        if (!pkg.accordproject) {
            results.push({
                layer: 'package.json',
                ok: false,
                message: 'missing "accordproject" section (required for Cicero templates)',
            });
            return { results, warnings, valid: false };
        }
        results.push({ layer: 'package.json', ok: true, message: 'valid' });

        // Check 3: grammar.tem.md exists
        const grammarPath = path.resolve(templatePath, 'text', 'grammar.tem.md');
        if (!fs.existsSync(grammarPath)) {
            results.push({ layer: 'text/grammar.tem.md', ok: false, message: 'file not found' });
            return { results, warnings, valid: false };
        }
        results.push({ layer: 'text/grammar.tem.md', ok: true, message: 'found' });

        // Check 4: model/ exists and contains .cto files
        const modelDir = path.resolve(templatePath, 'model');
        if (!fs.existsSync(modelDir) || !fs.lstatSync(modelDir).isDirectory()) {
            results.push({ layer: 'model/', ok: false, message: 'model directory not found' });
            return { results, warnings, valid: false };
        }
        const ctoFiles = fs.readdirSync(modelDir).filter((f) => f.endsWith('.cto'));
        if (ctoFiles.length === 0) {
            results.push({ layer: 'model/', ok: false, message: 'no .cto files found' });
            return { results, warnings, valid: false };
        }
        results.push({ layer: 'model/', ok: true, message: `found ${ctoFiles.length} .cto file(s)` });

        // Check 5: full coherence via Template.fromDirectory
        try {
            await Commands.loadTemplate(templatePath, options);
            results.push({
                layer: 'Template coherence',
                ok: true,
                message: 'grammar parsed, model validated, template variables match the model',
            });
        } catch (err) {
            const msg = err.message || String(err);
            let layer = 'Template coherence';
            const lower = msg.toLowerCase();
            if (lower.includes('grammar')) {
                layer = 'text/grammar.tem.md';
            } else if (lower.includes('.cto') || lower.includes('namespace') || lower.includes('type ')) {
                layer = 'model/';
            }
            results.push({ layer, ok: false, message: msg });
        }

        // Warnings: Ergo logic files are ignored at runtime
        if (options.warnings) {
            const logicDir = path.resolve(templatePath, 'logic');
            if (fs.existsSync(logicDir) && fs.lstatSync(logicDir).isDirectory()) {
                const logicFiles = fs.readdirSync(logicDir);
                if (logicFiles.length > 0) {
                    warnings.push(
                        `logic/ directory contains ${logicFiles.length} file(s); Ergo is no longer executed by cicero-core and these are ignored at runtime`
                    );
                }
            }
        }

        const valid = results.every((r) => r.ok);
        return { results, warnings, valid };
    }
}

module.exports = Commands;
