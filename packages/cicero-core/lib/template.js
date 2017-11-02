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

const Metadata = require('./metadata');
const fs = require('fs');
const fsPath = require('path');
const JSZip = require('jszip');
const minimatch = require('minimatch');
const Factory = require('composer-common').Factory;
const Introspector = require('composer-common').Introspector;
const ModelManager = require('composer-common').ModelManager;
const ScriptManager = require('composer-common').ScriptManager;
const Serializer = require('composer-common').Serializer;
const Logger = require('composer-common').Logger;
const Writer = require('composer-common').Writer;
const LOG = Logger.getLog('Template');

const nearley = require('nearley');
const compile = require('nearley/lib/compile');
const generate = require('nearley/lib/generate');
const nearleyGrammar = require('nearley/lib/nearley-language-bootstrapped');
const templateGrammar = require('./tdl.js');
const GrammarVisitor = require('./grammarvisitor');

const ENCODING = 'utf8';

// This code is derived from BusinessNetworkDefinition in Hyperleger Composer composer-common.

/**
 * <p>
 * Template for a clause.
 * </p>
 * @class
 * @memberof module:accord-core
 */
class Template {

    /**
     * Create the Template.
     * <p>
     * <strong>Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link Clause.fromArchive}</strong>
     * </p>
     * @param {object} packageJson  - the JS object for package.json
     * @param {String} readme  - the readme in markdown for the clause (optional)
     */
    constructor(packageJson, readme) {

        this.modelManager = new ModelManager();
        this.scriptManager = new ScriptManager(this.modelManager);
        this.introspector = new Introspector(this.modelManager);
        this.factory = new Factory(this.modelManager);
        this.serializer = new Serializer(this.factory, this.modelManager);
        this.metadata = new Metadata(packageJson, readme);
        this.grammar = null;
        this.grammarAst = null;
        this.templatizedGrammar = null;
    }

    /**
     * Returns the template model for the template
     * @throws {Error} if no template model is found, or multiple template models are found
     * @returns {ClassDeclaration} the template model for the template
     */
    getTemplateModel() {
        const templateModels = this.getIntrospector().getClassDeclarations().filter((item) => {
            const templateDecorator = item.getDecorator('AccordTemplateModel');
            return (templateDecorator !== null && this.metadata.getName() === templateDecorator.getArguments()[0]);
        });

        if (templateModels.length > 1) {
            throw new Error(`Found multiple concepts decorated with @AccordTemplateModel("${this.metadata.getName()}").`);
        } else if (templateModels.length === 0) {
            throw new Error(`Failed to find the template model. Decorate a concept with @AccordTemplateModel("${this.metadata.getName()}").`);
        } else {
            return templateModels[0];
        }
    }

    /**
     * Returns the identifier for this clause
     * @return {String} the identifier of this clause
     */
    getIdentifier() {
        return this.getMetadata().getIdentifier();
    }

    /**
     * Returns the metadata for this clause
     * @return {kMetadata} the metadata for this clause
     */
    getMetadata() {
        return this.metadata;
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
     * Set the grammar for the template
     * @param {String} grammar  - the grammar for the template
     */
    setGrammar(grammar) {
        this.grammarAst = Template.compileGrammar(grammar);
        this.grammar = grammar;
    }

    /**
     * Build a grammar from a template
     * @param {String} templatizedGrammar  - the annotated template
     */
    buildGrammar(templatizedGrammar) {

        const templateModel = this.getTemplateModel();
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(templateGrammar));
        parser.feed(templatizedGrammar);
        if (parser.results.length !== 1) {
            throw new Error('Ambigious parse!');
        }

        // parse the template grammar
        const ast = parser.results[0];

        const writer = new Writer();

        writer.writeLine(0, '\n');
        writer.writeLine(0, '# Dynamically Generated');
        writer.writeLine(0, '@builtin "number.ne"');
        writer.writeLine(0, '@builtin "string.ne"');
        writer.writeLine(0, '@builtin "whitespace.ne"');
        writer.writeLine(0, `@{%
    function compact(v) {
        if (Array.isArray(v)) {
            return v.reduce((a, v) => (v === null || v === undefined || (v && v.length === 0) ) ? a : (a.push(v), a), []);
        } else {
            return v;
        }
    }

    function flatten(v) {
        let r;
        if (Array.isArray(v)) {
            r = v.reduce((a,v) => (a.push(...((v && Array.isArray(v)) ? flatten(v) : [v])), a), []);
        } else {
            r = v;
        }
        r = compact(r);
        return r;
        }
%}`);
        writer.writeLine(0, '\n');

        // index all rules
        const rules = {};
        ast.data.forEach((element, index) => {
            rules['C' + index] = element;
        }, this);

        // create the root rule
        writer.write('ROOT -> ');
        for (let rule in rules) {
            let suffix = '';
            const element = rules[rule];
            if (element.type === 'BooleanBinding') {
                suffix = ':?';
            }
            writer.write(`${rule}${suffix} `);
        }

        writer.write('\n');
        writer.writeLine(0, '{%');
        writer.writeLine(0, `([${Object.keys(rules)}]) => {`);
        writer.writeLine(1, 'return {');
        writer.writeLine(3, `$class : "${templateModel.getFullyQualifiedName()}",`);
        templateModel.getProperties().forEach((property,index) => {
            const sep = index < templateModel.getProperties().length-1 ? ',' : '';
            const bindingIndex = this.findFirstBinding(property.getName(), ast.data);
            if(bindingIndex !== -1) { // ignore things like transactionId
                // TODO (DCS) add !==null check for BooleanBinding
                writer.writeLine(3, `${property.getName()} : C${bindingIndex}${sep}`);
            }
        });
        writer.writeLine(1, '};');
        writer.writeLine(0, '}');
        writer.writeLine(0, '%}\n');

        // now we create each subordinate rule in turn
        let dynamicGrammar = '';
        for (let rule in rules) {
            const element = rules[rule];
            dynamicGrammar += '\n';
            dynamicGrammar += `${rule} -> `;

            switch (element.type) {
            case 'Chunk':
            case 'LastChunk':
                dynamicGrammar += this.cleanChunk(element.value);
                break;
            case 'BooleanBinding':
                dynamicGrammar += `${element.string.value} {% (d) => {return d[0] !== null;}%} # ${element.fieldName.value}`;
                break;
            case 'Binding': {
                const propertyName = element.fieldName.value;
                const property = templateModel.getProperty(propertyName);
                if(!property) {
                    throw new Error(`Template references a property '${propertyName}' that is not declared in the template model '${templateModel.getFullyQualifiedName()}'. Details: ${JSON.stringify(element)}`);
                }
                let type = property.getType();
                let action = '{% id %}';

                const decorator = property.getDecorator('AccordType');
                if(decorator) {
                    if( decorator.getArguments().length > 0) {
                        type = decorator.getArguments()[0];
                    }
                    if( decorator.getArguments().length > 1) {
                        action = decorator.getArguments()[1];
                    }
                }

                let suffix = ':';
                // TODO (DCS) need a serialization for arrays
                // if(property.isArray()) {
                //     suffix += '+';
                // }
                if(property.isOptional()) {
                    suffix += '?';
                }
                if(suffix === ':') {
                    suffix = '';
                }
                dynamicGrammar += `${type}${suffix} ${action} # ${propertyName}`;
            }
                break;
            default:
                throw new Error(`Unrecognized type ${element.type}`);
            }
        }

        writer.writeLine(0, dynamicGrammar);
        writer.writeLine(0, '\n');

        // add the grammar for the model
        const parameters = {
            writer: writer
        };
        const gv = new GrammarVisitor();
        this.getModelManager().accept(gv, parameters);

        const combined = parameters.writer.getBuffer();

        console.log('Generated template grammar' + combined);

        this.setGrammar(combined);
        this.templatizedGrammar = templatizedGrammar;
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
        // we replace all \r and \n with \n
        let text = input.replace(/\r?\n|\r/gm,'\\n');

        // replace all " with \", even across newlines
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
            if(element.type === 'Binding' || element.type === 'BooleanBinding') {
                if(element.fieldName.value === propertyName) {
                    return n;
                }
            }
        }
        return -1;
    }

    /**
     * Get the grammar for the template
     * @return {String} - the grammar for the template
     */
    getGrammar() {
        return this.grammar;
    }

    /**
     * Returns the name for this clause
     * @return {String} the name of this clause
     */
    getName() {
        return this.getMetadata().getName();
    }

    /**
     * Returns the version for this clause
     * @return {String} the version of this clause. Use semver module
     * to parse.
     */
    getVersion() {
        return this.getMetadata().getVersion();
    }


    /**
     * Returns the description for this clause
     * @return {String} the description of this clause
     */
    getDescription() {
        return this.getMetadata().getDescription();
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
            console.log(err);
            throw err;
        }
    }


    /**
     * Create a Clause from an archive.
     * @param {Buffer} Buffer  - the Buffer to a zip archive
     * @return {Promise} a Promise to the instantiated business network
     */
    static fromArchive(Buffer) {
        const method = 'fromArchive';
        LOG.entry(method, Buffer.length);
        return JSZip.loadAsync(Buffer).then(function (zip) {
            let promise = Promise.resolve();
            let ctoModelFiles = [];
            let ctoModelFileNames = [];
            let jsScriptFiles = [];
            let template;
            let readmeContents = null;
            let packageJsonContents = null;
            let grammar = null;
            let templatizedGrammar = null;

            LOG.debug(method, 'Loading README.md');
            let readme = zip.file('README.md');
            if (readme) {
                promise = promise.then(() => {
                    return readme.async('string');
                }).then((contents) => {
                    LOG.debug(method, 'Loaded README.md');
                    readmeContents = contents;
                });
            }

            LOG.debug(method, 'Loading package.json');
            let packageJson = zip.file('package.json');
            if (packageJson === null) {
                throw Error('package.json must exist');
            }
            promise = promise.then(() => {
                return packageJson.async('string');
            }).then((contents) => {
                LOG.debug(method, 'Loaded package.json');
                packageJsonContents = JSON.parse(contents);
            });

            LOG.debug(method, 'Loading grammar.ne');
            let grammarNe = zip.file('grammar/grammar.ne');
            if (grammarNe !== null) {
                promise = promise.then(() => {
                    return grammarNe.async('string');
                }).then((contents) => {
                    LOG.debug(method, 'Loaded grammar.ne');
                    grammar = contents;
                });
            } else {
                LOG.debug(method, 'Loading template.tem');
                let template_txt = zip.file('grammar/template.tem');

                if (template_txt === null) {
                    throw new Error('Failed to find grammar or template.');
                }

                promise = promise.then(() => {
                    return template_txt.async('string');
                }).then((contents) => {
                    LOG.debug(method, 'Loaded template.tem');
                    templatizedGrammar = contents;
                });
            }

            LOG.debug(method, 'Looking for model files');
            let ctoFiles = zip.file(/models\/.*\.cto$/); //Matches any file which is in the 'models' folder and has a .cto extension
            ctoFiles.forEach(function (file) {
                LOG.debug(method, 'Found model file, loading it', file.name);
                ctoModelFileNames.push(file.name);
                promise = promise.then(() => {
                    return file.async('string');
                }).then((contents) => {
                    LOG.debug(method, 'Loaded model file');
                    ctoModelFiles.push(contents);
                });
            });

            LOG.debug(method, 'Looking for JavaScript files');
            let jsFiles = zip.file(/lib\/.*\.js$/); //Matches any file which is in the 'lib' folder and has a .js extension
            jsFiles.forEach(function (file) {
                LOG.debug(method, 'Found JavaScript file, loading it', file.name);
                promise = promise.then(() => {
                    return file.async('string');
                }).then((contents) => {
                    LOG.debug(method, 'Loaded JavaScript file');
                    let tempObj = {
                        'name': file.name,
                        'contents': contents
                    };
                    jsScriptFiles.push(tempObj);

                });
            });

            return promise.then(() => {
                LOG.debug(method, 'Loaded package.json');
                template = new Template(packageJsonContents, readmeContents);

                LOG.debug(method, 'Adding model files to model manager');
                template.modelManager.addModelFiles(ctoModelFiles, ctoModelFileNames); // Adds all cto files to model manager
                LOG.debug(method, 'Added model files to model manager');
                LOG.debug(method, 'Adding JavaScript files to script manager');
                jsScriptFiles.forEach(function (obj) {
                    let jsObject = template.scriptManager.createScript(obj.name, 'js', obj.contents);
                    template.scriptManager.addScript(jsObject); // Adds all js files to script manager
                });
                LOG.debug(method, 'Added JavaScript files to script manager');

                // check the template model
                template.getTemplateModel();

                LOG.debug(method, 'Setting grammar');
                if (grammar) {
                    template.setGrammar(grammar);
                } else {
                    template.buildGrammar(templatizedGrammar);
                }

                LOG.exit(method, template.toString());
                return template; // Returns template
            });
        });
    }

    /**
     * Store a Clause as an archive.
     * @param {Object} [options]  - JSZip options
     * @return {Buffer} buffer  - the zlib buffer
     */
    toArchive(options) {

        let zip = new JSZip();

        let packageFileContents = JSON.stringify(this.getMetadata().getPackageJson());
        zip.file('package.json', packageFileContents, options);

        // save the grammar
        zip.file('grammar/', null, Object.assign({}, options, {
            dir: true
        }));
        if (this.grammar) {
            zip.file('grammar/grammar.ne', this.grammar, options);
        } else {
            zip.file('grammar/template.tem', this.templatizedGrammar, options);
        }

        // save the README.md if present
        if (this.getMetadata().getREADME()) {
            zip.file('README.md', this.getMetadata().getREADME(), options);
        }

        let modelManager = this.getModelManager();
        let modelFiles = modelManager.getModelFiles();
        zip.file('models/', null, Object.assign({}, options, {
            dir: true
        }));
        modelFiles.forEach(function (file) {
            let fileName;
            // ignore the system namespace when creating an archive
            if (file.isSystemModelFile()) {
                return;
            }
            if (file.fileName === 'UNKNOWN' || file.fileName === null || !file.fileName) {
                fileName = file.namespace + '.cto';
            } else {
                let fileIdentifier = file.fileName;
                fileName = fsPath.basename(fileIdentifier);
            }
            zip.file('models/' + fileName, file.definitions, options);
        });

        let scriptManager = this.getScriptManager();
        let scriptFiles = scriptManager.getScripts();
        zip.file('lib/', null, Object.assign({}, options, {
            dir: true
        }));
        scriptFiles.forEach(function (file) {
            let fileIdentifier = file.identifier;
            let fileName = fsPath.basename(fileIdentifier);
            zip.file('lib/' + fileName, file.contents, options);
        });

        return zip.generateAsync({
            type: 'nodebuffer'
        }).then(something => {
            return Promise.resolve(something).then(result => {
                return result;
            });

        });

    }

    /**
     * Builds a Template from the contents of a directory.
     * The directory must include a package.json in the root (used to specify
     * the name, version and description of the business network). This method
     * is designed to work with business networks that refer to external models
     * using npm dependencies as well as business networks that statically
     * package their model files.
     * <p>
     * If package.json contains a dependencies property then this method will search for
     * model (CTO) files under the node_modules directory for each dependency that
     * passes the options.dependencyGlob pattern.
     * </p>
     * <p>
     * If the network depends on an npm module its dependencies (transitive closure)
     * will also be scanned for model (CTO) files.
     * </p>
     * <p>
     * The directory may optionally contain a README.md file which is accessible from the
     * BusinessNetworkMetadata.getREADME method.
     * </p>
     * <p>
     * In addition all model files will be added that are not under node_modules
     * and that pass the options.modelFileGlob pattern. By default you should put
     * model files under a directory called 'models'.
     * </p>
     * <p>
     * All script (js) files will be added that are not under node_modules and
     * that pass the options.scriptGlob pattern. By default you should put Javascript
     * files under the 'lib' directory.
     * </p>
     *
     * @param {String} path to a local directory
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @param {Object} [options.dependencyGlob] - specify the glob pattern used to match
     * the npm dependencies to process. Defaults to **
     * @param {boolean} [options.modelFileGlob] - specify the glob pattern used to match
     * the model files to include. Defaults to **\/models/**\/*.cto
     * @param {boolean} [options.scriptGlob] - specify the glob pattern used to match
     * the script files to include. Defaults to **\/lib/**\/*.js
     * @return {Promise} a Promise to the instantiated business network
     */
    static fromDirectory(path, options) {

        if (!options) {
            options = {};
        }

        if (!options.dependencyGlob) {
            options.dependencyGlob = '**';
        }

        if (!options.modelFileGlob) {
            options.modelFileGlob = '**/models/**/*.cto';
        }

        if (!options.scriptGlob) {
            options.scriptGlob = '**/lib/**/*.js';
        }

        const method = 'fromDirectory';
        LOG.entry(method, path);

        // grab the README.md
        let readmeContents = null;
        const readmePath = fsPath.resolve(path, 'README.md');
        if (fs.existsSync(readmePath)) {
            readmeContents = fs.readFileSync(readmePath, ENCODING);
            if (readmeContents) {
                LOG.debug(method, 'Loaded README.md', readmeContents);
            }
        }

        // grab the package.json
        let packageJsonContents = fs.readFileSync(fsPath.resolve(path, 'package.json'), ENCODING);

        if (!packageJsonContents) {
            throw new Error('Failed to find package.json');
        }

        LOG.debug(method, 'Loaded package.json', packageJsonContents);

        // parse the package.json
        let jsonObject = JSON.parse(packageJsonContents);
        let packageName = jsonObject.name;

        // create the template
        const template = new Template(jsonObject, readmeContents);
        const modelFiles = [];
        const modelFileNames = [];

        // define a help function that will filter out files
        // that are inside a node_modules directory under the path
        // we are processing
        const isFileInNodeModuleDir = function (file, basePath) {
            const method = 'isFileInNodeModuleDir';
            let filePath = fsPath.parse(file);
            let subPath = filePath.dir.substring(basePath.length);
            let result = subPath.split(fsPath.sep).some((element) => {
                return element === 'node_modules';
            });

            LOG.debug(method, file, result);
            return result;
        };

        // process each module dependency
        // filtering using a glob on the module dependency name
        if (jsonObject.dependencies) {
            LOG.debug(method, 'All dependencies', Object.keys(jsonObject.dependencies).toString());
            const dependencies = Object.keys(jsonObject.dependencies).filter(minimatch.filter(options.dependencyGlob, {
                dot: true
            }));
            LOG.debug(method, 'Matched dependencies', dependencies);

            for (let dep of dependencies) {
                // find all the *.cto files under the npm install dependency path
                let dependencyPath = fsPath.resolve(path, 'node_modules', dep);
                LOG.debug(method, 'Checking dependency path', dependencyPath);
                if (!fs.existsSync(dependencyPath)) {
                    // need to check to see if this is in a peer directory as well
                    //
                    LOG.debug(method, 'trying different path ' + path.replace(packageName, ''));
                    dependencyPath = fsPath.resolve(path.replace(packageName, ''), dep);
                    if (!fs.existsSync(dependencyPath)) {
                        throw new Error('npm dependency path ' + dependencyPath + ' does not exist. Did you run npm install?');
                    }
                }

                Template.processDirectory(dependencyPath, {
                    accepts: function (file) {
                        return isFileInNodeModuleDir(file, dependencyPath) === false && minimatch(file, options.modelFileGlob, {
                            dot: true
                        });
                    },
                    acceptsDir: function (dir) {
                        return !isFileInNodeModuleDir(dir, dependencyPath);
                    },
                    process: function (path, contents) {
                        modelFiles.push(contents);
                        modelFileNames.push(path);
                        LOG.debug(method, 'Found model file', path);
                    }
                });
            }
        }

        // find CTO files outside the npm install directory
        //
        Template.processDirectory(path, {
            accepts: function (file) {
                return isFileInNodeModuleDir(file, path) === false && minimatch(file, options.modelFileGlob, {
                    dot: true
                });
            },
            acceptsDir: function (dir) {
                return !isFileInNodeModuleDir(dir, path);
            },
            process: function (path, contents) {
                modelFiles.push(contents);
                modelFileNames.push(path);
                LOG.debug(method, 'Found model file', path);
            }
        });

        template.getModelManager().addModelFiles(modelFiles, modelFileNames);
        LOG.debug(method, 'Added model files', modelFiles.length);

        // find script files outside the npm install directory
        const scriptFiles = [];
        Template.processDirectory(path, {
            accepts: function (file) {
                return isFileInNodeModuleDir(file, path) === false && minimatch(file, options.scriptGlob, {
                    dot: true
                });
            },
            acceptsDir: function (dir) {
                return !isFileInNodeModuleDir(dir, path);
            },
            process: function (path, contents) {
                let filePath = fsPath.parse(path);
                const jsScript = template.getScriptManager().createScript(path, filePath.ext.toLowerCase(), contents);
                scriptFiles.push(jsScript);
                LOG.debug(method, 'Found script file ', path);
            }
        });

        if (modelFiles.length === 0) {
            throw new Error('Failed to find a model file.');
        }

        for (let script of scriptFiles) {
            template.getScriptManager().addScript(script);
        }

        LOG.debug(method, 'Added script files', scriptFiles.length);

        // check the template model
        template.getTemplateModel();

        // grab the grammar
        let grammarNe = null;

        try {
            grammarNe = fs.readFileSync(fsPath.resolve(path, 'grammar/grammar.ne'), ENCODING);
        } catch (err) {
            // ignore
        }

        if (!grammarNe) {
            let template_txt = fs.readFileSync(fsPath.resolve(path, 'grammar/template.tem'), ENCODING);
            template.buildGrammar(template_txt);
            LOG.debug(method, 'Loaded template.tem', template_txt);
        } else {
            LOG.debug(method, 'Loaded grammar.ne', grammarNe);
            template.setGrammar(grammarNe);
        }

        LOG.exit(method, path);
        return Promise.resolve(template);
    }

    /**
     * @param {String} path - the path to process
     * @param {Object} fileProcessor - the file processor. It must have
     * accept and process methods.
     * @private
     */
    static processDirectory(path, fileProcessor) {
        const items = Template.walkSync(path, [], fileProcessor);
        items.sort();
        LOG.debug('processDirectory', 'Path ' + path, items);
        items.forEach((item) => {
            Template.processFile(item, fileProcessor);
        });
    }

    /**
     * @param {String} file - the file to process
     * @param {Object} fileProcessor - the file processor. It must have
     * accepts and process methods.
     * @private
     */
    static processFile(file, fileProcessor) {

        if (fileProcessor.accepts(file)) {
            LOG.debug('processFile', 'FileProcessor accepted', file);
            let fileContents = fs.readFileSync(file, ENCODING);
            fileProcessor.process(file, fileContents);
        } else {
            LOG.debug('processFile', 'FileProcessor rejected', file);
        }
    }


    /**
     * @param {String} dir - the dir to walk
     * @param {Object[]} filelist - input files
     * @param {Object} fileProcessor - the file processor. It must have
     * accepts and process methods.
     * @return {Object[]} filelist - output files
     * @private
     */
    static walkSync(dir, filelist, fileProcessor) {
        let files = fs.readdirSync(dir);
        files.forEach(function (file) {
            let nestedPath = fsPath.join(dir, file);
            if (fs.lstatSync(nestedPath).isDirectory()) {
                if (fileProcessor.acceptsDir(nestedPath)) {
                    filelist = Template.walkSync(nestedPath, filelist, fileProcessor);
                }
            } else {
                filelist.push(nestedPath);
            }
        });
        return filelist;
    }


    /**
     * Visitor design pattern
     * @param {Object} visitor - the visitor
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    accept(visitor, parameters) {
        return visitor.visit(this, parameters);
    }

    /**
     * Provides access to the Introspector for this business network. The Introspector
     * is used to reflect on the types defined within this business network.
     * @return {Introspector} the Introspector for this business network
     */
    getIntrospector() {
        return this.introspector;
    }

    /**
     * Provides access to the Factory for this business network. The Factory
     * is used to create the types defined in this business network.
     * @return {Factory} the Factory for this business network
     */
    getFactory() {
        return this.factory;
    }

    /**
     * Provides access to the Serializer for this business network. The Serializer
     * is used to serialize instances of the types defined within this business network.
     * @return {Serializer} the Serializer for this business network
     */
    getSerializer() {
        return this.serializer;
    }

    /**
     * Provides access to the ScriptManager for this business network. The ScriptManager
     * manage access to the scripts that have been defined within this business network.
     * @return {ScriptManager} the ScriptManager for this business network
     * @private
     */
    getScriptManager() {
        return this.scriptManager;
    }

    /**
     * Provides access to the ModelManager for this business network. The ModelManager
     * manage access to the models that have been defined within this business network.
     * @return {ModelManager} the ModelManager for this business network
     * @private
     */
    getModelManager() {
        return this.modelManager;
    }

    /**
     * Set the readme file within the Metadata
     * @param {String} readme the readme in markdown for the business network
     * @private
     */
    setReadme(readme) {
        this.metadata = new Metadata(this.metadata.getPackageJson(), readme);
    }

    /**
     * Set the packageJson within the Metadata
     * @param {object} packageJson the JS object for package.json
     * @private
     */
    setPackageJson(packageJson) {
        this.metadata = new Metadata(packageJson, this.metadata.getREADME());
    }

}

module.exports = Template;