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
const glob = require('glob');
const xregexp = require('xregexp');
const languageTagRegex = require('ietf-language-tag-regex');
const Factory = require('composer-concerto').Factory;
const Introspector = require('composer-concerto').Introspector;
const CiceroModelManager = require('./ciceromodelmanager');
const ScriptManager = require('./scriptmanager');
const DefaultArchiveLoader = require('./loaders/defaultarchiveloader');
const Serializer = require('composer-concerto').Serializer;
const logger = require('./logger');
const ParserManager = require('./parsermanager');
const crypto = require('crypto');
const stringify = require('json-stable-stringify');

const ENCODING = 'utf8';
// Matches 'sample.txt' or 'sample_TAG.txt' where TAG is an IETF language tag (BCP 47)
const IETF_REGEXP = languageTagRegex({ exact: false }).toString().slice(1,-2);
const SAMPLE_FILE_REGEXP = xregexp('sample(_(' + IETF_REGEXP + '))?.txt$');


/**
 * A template for a legal clause or contract. A Template has a template model, request/response transaction types,
 * a template grammar (natural language for the template) as well as the business logic to execute the
 * template.
 * @class
 * @public
 * @abstract
 * @memberof module:cicero-core
 */
class Template {

    /**
     * Create the Template.
     * Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link Template.fromArchive}.
     * @param {object} packageJson  - the JS object for package.json
     * @param {String} readme  - the readme in markdown for the template (optional)
     * @param {object} samples - the sample text for the template in different locales
     * @param {object} request - the JS object for the sample request
     */
    constructor(packageJson, readme, samples, request) {
        this.modelManager = new CiceroModelManager();
        this.scriptManager = new ScriptManager(this.modelManager);
        this.introspector = new Introspector(this.modelManager);
        this.factory = new Factory(this.modelManager);
        this.serializer = new Serializer(this.factory, this.modelManager);
        this.metadata = new Metadata(packageJson, readme, samples, request);
        this.archiveOmitsLogic = false;
        this.parserManager = new ParserManager(this);
    }

    /**
     * Check to see if a ClassDeclaration is an instance of the specified fully qualified
     * type name.
     * @param {ClassDeclaration} classDeclaration The class to test
     * @param {String} fqt The fully qualified type name.
     * @returns {boolean} True if classDeclaration an instance of the specified fully
     * qualified type name, false otherwise.
     */
    static instanceOf(classDeclaration, fqt) {
        // Check to see if this is an exact instance of the specified type.
        if (classDeclaration.getFullyQualifiedName() === fqt) {
            return true;
        }
        // Now walk the class hierachy looking to see if it's an instance of the specified type.
        let superTypeDeclaration = classDeclaration.getSuperTypeDeclaration();
        while (superTypeDeclaration) {
            if (superTypeDeclaration.getFullyQualifiedName() === fqt) {
                return true;
            }
            superTypeDeclaration = superTypeDeclaration.getSuperTypeDeclaration();
        }
        return false;
    }

    /**
     * Returns the template model for the template
     * @throws {Error} if no template model is found, or multiple template models are found
     * @returns {ClassDeclaration} the template model for the template
     */
    getTemplateModel() {

        let modelType = 'org.accordproject.cicero.contract.AccordContract';

        if(this.getMetadata().getPackageJson().cicero.template !== 'contract') {
            modelType = 'org.accordproject.cicero.contract.AccordClause';
        }

        const templateModels = this.getIntrospector().getClassDeclarations().filter((item) => {
            return !item.isAbstract() && Template.instanceOf(item,modelType);
        });

        if (templateModels.length > 1) {
            throw new Error(`Found multiple instances of ${modelType} in ${this.metadata.getName()}. The model for the template must contain a single asset that extends ${modelType}.`);
        } else if (templateModels.length === 0) {
            throw new Error(`Failed to find an asset that extends ${modelType} in ${this.metadata.getName()}. The model for the template must contain a single asset that extends ${modelType}.`);
        } else {
            return templateModels[0];
        }
    }

    /**
     * Returns the identifier for this template
     * @return {String} the identifier of this template
     */
    getIdentifier() {
        return this.getMetadata().getIdentifier();
    }

    /**
     * Returns the metadata for this template
     * @return {Metadata} the metadata for this template
     */
    getMetadata() {
        return this.metadata;
    }

    /**
     * Gets a parser object for this template
     * @return {object} the parser for this template
     */
    getParser() {
        return this.parserManager.getParser();
    }

    /**
     * Gets the AST for the template
     * @return {object} the AST for the template
     */
    getTemplateAst() {
        return this.parserManager.getTemplateAst();
    }

    /**
     * Set the grammar for the template
     * @param {String} grammar  - the grammar for the template
     */
    setGrammar(grammar) {
        this.parserManager.setGrammar(grammar);
    }

    /**
     * Build a grammar from a template
     * @param {String} templatizedGrammar  - the annotated template
     */
    buildGrammar(templatizedGrammar) {
        this.parserManager.buildGrammar(templatizedGrammar);
    }

    /**
     * Get the (compiled) grammar for the template
     * @return {String} - the grammar for the template
     */
    getGrammar() {
        return this.parserManager.getGrammar();
    }

    /**
     * Returns the templatized grammar
     * @return {String} the contents of the templatized grammar
     */
    getTemplatizedGrammar() {
        return this.parserManager.getTemplatizedGrammar();
    }

    /**
     * Returns the name for this template
     * @return {String} the name of this template
     */
    getName() {
        return this.getMetadata().getName();
    }

    /**
     * Returns the version for this template
     * @return {String} the version of this template. Use semver module
     * to parse.
     */
    getVersion() {
        return this.getMetadata().getVersion();
    }


    /**
     * Returns the description for this template
     * @return {String} the description of this template
     */
    getDescription() {
        return this.getMetadata().getDescription();
    }


    /**
     * Create a template from an archive.
     * @param {Buffer} Buffer  - the Buffer to a zip or cta archive
     * @return {Promise} a Promise to the instantiated business network
     */
    static fromArchive(Buffer) {
        const method = 'fromArchive';
        logger.entry(method, Buffer.length);
        return JSZip.loadAsync(Buffer).then(function (zip) {
            let promise = Promise.resolve();
            let ctoModelFiles = [];
            let ctoModelFileNames = [];
            let scriptFiles = [];
            let sampleTextFiles = {};
            let requestContents = null;
            let template;
            let language;
            let readmeContents = null;
            let packageJsonContents = null;
            let templatizedGrammar = null;

            logger.debug(method, 'Loading README.md');
            let readme = zip.file('README.md');
            if (readme) {
                promise = promise.then(() => {
                    return readme.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded README.md');
                    readmeContents = contents;
                });
            }

            logger.debug(method, 'Looking for sample files');
            let sampleFiles = zip.file(SAMPLE_FILE_REGEXP);
            sampleFiles.forEach(function (file) {
                logger.debug(method, 'Found sample file, loading it', file);
                promise = promise.then(() => {
                    return file.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded sample file');
                    let matches = file.name.match(SAMPLE_FILE_REGEXP);
                    let locale = 'default';
                    // Locale match found
                    if(matches !== null && matches[2]){
                        locale = matches[2];
                    }
                    logger.debug(method, 'Using sample file locale, ' + locale);
                    sampleTextFiles[locale] = contents;
                });
            });

            logger.debug(method, 'Loading request.json');
            let requestJson = zip.file('request.json');
            if (requestJson) {
                promise = promise.then(() => {
                    return requestJson.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded request.json');
                    requestContents = contents ? JSON.parse(contents) : null;
                });
            }

            logger.debug(method, 'Loading package.json');
            let packageJson = zip.file('package.json');
            if (packageJson === null) {
                throw Error('Failed to find package.json');
            }
            promise = promise.then(() => {
                return packageJson.async('string');
            }).then((contents) => {
                logger.debug(method, 'Loaded package.json');
                packageJsonContents = JSON.parse(contents);
            });

            logger.debug(method, 'Loading template.tem');
            let template_txt = zip.file('grammar/template.tem');

            if (template_txt === null) {
                throw new Error('Failed to find template.tem file.');
            }

            promise = promise.then(() => {
                return template_txt.async('string');
            }).then((contents) => {
                logger.debug(method, 'Loaded template.tem');
                templatizedGrammar = contents;
            });

            logger.debug(method, 'Looking for model files');
            let ctoFiles = zip.file(/models\/.*\.cto$/); //Matches any file which is in the 'models' folder and has a .cto extension
            ctoFiles.forEach(function (file) {
                logger.debug(method, 'Found model file, loading it', file.name);
                ctoModelFileNames.push(file.name);
                promise = promise.then(() => {
                    return file.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loading model file'+contents);
                    ctoModelFiles.push(contents);
                });
            });

            promise = promise.then(() => {
                logger.debug(method, 'Loaded package.json');
                // Initialize the template
                template = new Template(packageJsonContents, readmeContents, sampleTextFiles, requestContents);
                // Lookup the archive's language
                language = template.getMetadata().getLanguage();
            });

            logger.debug(method, 'Looking for JavaScript files');
            let jsFiles = zip.file(/lib\/.*\.js$/); //Matches any file which is in the 'lib' folder and has a .js extension

            logger.debug(method, 'Looking for Ergo files');
            let ergoFiles = zip.file(/lib\/.*\.ergo$/); //Matches any file which is in the 'lib' folder and has a .ergo extension

            promise = promise.then(() => {
                if(language === 0 && jsFiles.length>0) {
                    throw new Error('Ergo template but contains JavaScript logic');
                } else if(language === 1 && ergoFiles.length>0) {
                    throw new Error('JavaScript template but contains Ergo logic');
                }
            });

            jsFiles.forEach(function (file) {
                logger.debug(method, 'Found JavaScript file, loading it', file.name);
                promise = promise.then(() => {
                    return file.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded JavaScript file');
                    let tempObj = {
                        'name': file.name,
                        'contents': contents
                    };
                    scriptFiles.push(tempObj);
                });
            });

            ergoFiles.forEach(function (file) {
                logger.debug(method, 'Found Ergo file, loading it', file.name);
                promise = promise.then(() => {
                    return file.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded Ergo file');
                    let tempObj = {
                        'name': file.name,
                        'contents': contents
                    };
                    scriptFiles.push(tempObj);
                });
            });

            return promise.then(async () => {
                logger.debug(method, 'Adding model files to model manager');
                template.modelManager.addModelFiles(ctoModelFiles, ctoModelFileNames, true); // Adds all cto files to model manager
                template.modelManager.validateModelFiles();

                logger.debug(method, 'Added model files to model manager');
                logger.debug(method, 'Adding Logic files to script manager');
                scriptFiles.forEach(function (obj) {
                    const objExt = '.' +  obj.name.split('.').pop();
                    let scriptObject = template.scriptManager.createScript(obj.name, objExt, obj.contents);
                    template.scriptManager.addScript(scriptObject); // Adds all js files to script manager
                });
                // Compile Ergo
                template.getScriptManager().compileLogic();

                logger.debug(method, 'Added JavaScript files to script manager');

                // check the template model
                template.getTemplateModel();

                logger.debug(method, 'Setting grammar');
                template.buildGrammar(templatizedGrammar);

                logger.exit(method, template.toString());
                return template; // Returns template
            });
        });
    }

    /**
     * Create a template from an URL.
     * @param {String} url  - the URL to a zip or cta archive
     * @param {object} options - additional options
     * @return {Promise} a Promise to the instantiated business network
     */
    static fromUrl(url, options) {
        const loader = new DefaultArchiveLoader();
        return loader.load(url, options).then(function (buffer) {
            return Template.fromArchive(buffer);
        });
    }

    /**
     * Gets a content based SHA-256 hash for this template
     * @return {string} the SHA-256 hash in hex format
     */
    getHash() {
        const content = {};
        content.metadata = this.getMetadata();
        if(this.parserManager.getTemplatizedGrammar()) {
            content.templatizedGrammar = this.parserManager.getTemplatizedGrammar();
        }
        else {
            // do not include the generated grammar because
            // the contents is not deterministic
            content.grammar = this.parserManager.getGrammar();
        }
        content.models = {};
        content.scripts = {};

        let modelFiles = this.getModelManager().getModels();
        modelFiles.forEach(function (file) {
            content.models[file.name] = file.content;
        });

        let scriptManager = this.getScriptManager();
        let scriptFiles = scriptManager.getScripts();
        scriptFiles.forEach(function (file) {
            content.scripts[file.getName()] = file.contents;
        });

        const hasher = crypto.createHash('sha256');
        hasher.update(stringify(content));
        return hasher.digest('hex');
    }

    /**
     * Store a Template as an archive.
     * @param {string} [language]  - target language for the archive (should be either 'ergo' or 'javascript')
     * @param {Object} [options]  - JSZip options
     * @return {Buffer} buffer  - the zlib buffer
     */
    toArchive(language, options) {
        if(!language || typeof(language) !== 'string') {
            throw new Error('language is required and must be a string');
        }

        const metadata = this.getMetadata().createTargetMetadata(language);

        let zip = new JSZip();

        let packageFileContents = JSON.stringify(metadata.getPackageJson());
        zip.file('package.json', packageFileContents, options);

        // save the grammar
        zip.file('grammar/', null, Object.assign({}, options, {
            dir: true
        }));

        if (this.parserManager.getTemplatizedGrammar()) {
            zip.file('grammar/template.tem', this.parserManager.getTemplatizedGrammar(), options);
        }

        // save the README.md if present
        if (metadata.getREADME()) {
            zip.file('README.md', metadata.getREADME(), options);
        }

        // Save the sample files
        const sampleFiles = metadata.getSamples();
        if(sampleFiles){
            Object.keys(sampleFiles).forEach(function (locale) {
                let fileName;
                if(locale === 'default'){
                    fileName = 'sample.txt';
                } else {
                    fileName = `sample_${locale}.txt`;
                }
                zip.file(fileName, sampleFiles[locale], options);
            });
        }

        // save the request.json if present & not text-only
        if (metadata.getRequest() && !this.archiveOmitsLogic) {
            let requestFileContents = JSON.stringify(metadata.getRequest());
            zip.file('request.json', requestFileContents, options);
        }

        let modelFiles = this.getModelManager().getModels();
        zip.file('models/', null, Object.assign({}, options, {
            dir: true
        }));
        modelFiles.forEach(function (file) {
            zip.file('models/' + file.name, file.content, options);
        });

        zip.file('lib/', null, Object.assign({}, options, {
            dir: true
        }));
        if (!this.archiveOmitsLogic) {
            let scriptManager = this.getScriptManager();
            let scriptFiles = scriptManager.getAllScripts();
            scriptFiles.forEach(function (file) {
                let fileIdentifier = file.getIdentifier();
                let fileName = fsPath.basename(fileIdentifier);
                if (language === 'ergo') {
                    if (file.getLanguage() === '.ergo') {
                        zip.file('lib/' + fileName, file.contents, options);
                    }
                } else {
                    fileName = fileName.split('.').slice(0, -1).join('.') + '.js';
                    if (file.getLanguage() === '.js') {
                        zip.file('lib/' + fileName, file.contents, options);
                    }
                }
            });
        }
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
     * the script files to include. Defaults to **\/lib/**\/*.+(js|ergo)
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
            options.scriptGlob = '**/lib/**/*.+(js|ergo)';
        }

        const method = 'fromDirectory';
        logger.entry(method, path);

        // grab the README.md
        let readmeContents = null;
        const readmePath = fsPath.resolve(path, 'README.md');
        if (fs.existsSync(readmePath)) {
            readmeContents = fs.readFileSync(readmePath, ENCODING);
            if (readmeContents) {
                logger.debug(method, 'Loaded README.md', readmeContents);
            }
        }

        // grab the request.json
        let requestContents = null;
        const requestJsonPath = fsPath.resolve(path, 'request.json');
        if (fs.existsSync(requestJsonPath)) {
            requestContents = fs.readFileSync(requestJsonPath, ENCODING);
            if (requestContents) {
                logger.debug(method, 'Loaded request.json', requestContents);
            }
        }

        // parse the request.json
        let requestJsonObject = requestContents ? JSON.parse(requestContents) : null;

        // grab the package.json
        const packageJsonPath = fsPath.resolve(path, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('Failed to find package.json');
        }

        let packageJsonContents = fs.readFileSync(packageJsonPath, ENCODING);
        logger.debug(method, 'Loaded package.json', packageJsonContents);

        // parse the package.json
        let packageJsonObject = JSON.parse(packageJsonContents);

        // grab the sample files
        logger.debug(method, 'Looking for sample files');
        let sampleTextFiles = {};
        let sampleFiles = glob.sync('@(sample.txt|sample_*.txt)', { cwd: fsPath.resolve(path) });
        if (sampleFiles.length === 0){
            throw new Error('Failed to find any sample files. e.g. sample.txt, sample_fr.txt');
        }
        sampleFiles.forEach(function (file) {
            const matches = file.match(SAMPLE_FILE_REGEXP);
            if(file !== 'sample.txt' && matches === null){
                throw new Error('Invalid locale used in sample file, ' + file + '. Locales should be IETF language tags, e.g. sample_fr.txt');
            }

            logger.debug(method, 'Found sample file, loading it: ' + file);
            const sampleFilePath = fsPath.resolve(path, file);
            const sampleFileContents = fs.readFileSync(sampleFilePath, ENCODING);
            logger.debug(method, 'Loaded ' + file, sampleFileContents);

            let locale = 'default';
            // Match found
            if(matches !== null && matches[2]){
                locale = matches[2];
            }
            logger.debug(method, 'Using sample file locale', locale);
            sampleTextFiles[locale] = sampleFileContents;
        });

        // create the template
        const template = new Template(packageJsonObject, readmeContents, sampleTextFiles, requestJsonObject);
        const modelFiles = [];
        const modelFileNames = [];

        // define a help function that will filter out files
        // that are inside a node_modules directory under the path
        // we are processing
        const isFileInNodeModuleDir = function (file, basePath) {
            const method = 'isFileInNodeModuleDir';
            let filePath = fsPath.parse(file);
            basePath = fsPath.resolve(basePath);
            let subPath = fsPath.resolve(filePath.dir).substring(basePath.length);
            let result = subPath.split(fsPath.sep).some((element) => {
                return element === 'node_modules';
            });

            logger.debug(method, file, result);
            return result;
        };

        // find CTO files outside the npm install directory
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
                logger.debug(method, 'Found model file', path);
            }
        });

        template.getModelManager().addModelFiles(modelFiles, modelFileNames, true);
        return template.getModelManager().updateExternalModels().then(() => {
            logger.debug(method, 'Added model files', modelFiles.length);

            // find script files outside the npm install directory
            const scriptFiles = [];
            let isErgoTemplate = template.getMetadata().getLanguage() === 0 ? true : false;
            Template.processDirectory(path, {
                accepts: function (file) {
                    return isFileInNodeModuleDir(file, path) === false && minimatch(file, options.scriptGlob, {
                        dot: true
                    });
                },
                acceptsDir: function (dir) {
                    return !isFileInNodeModuleDir(dir, path);
                },
                process: function (filePath, contents) {
                    let pathObj = fsPath.parse(filePath);
                    // Make paths for the script manager relative to the root folder of the template
                    const resolvedPath = fsPath.resolve(path);
                    const resolvedFilePath = fsPath.resolve(filePath);
                    const truncatedPath = resolvedFilePath.replace(resolvedPath+'/', '');
                    if (pathObj.ext.toLowerCase() === '.ergo') {
                        if(!isErgoTemplate) {
                            throw new Error('JavaScript template but contains Ergo logic');
                        }
                    } else if (pathObj.ext.toLowerCase() === '.js') {
                        if(isErgoTemplate) {
                            throw new Error('Ergo template but contains JavaScript logic');
                        }
                    }
                    const scriptObject = template.getScriptManager().createScript(truncatedPath, pathObj.ext.toLowerCase(), contents);
                    scriptFiles.push(scriptObject);
                    logger.debug(method, 'Found script file ', path);
                }
            });

            if (modelFiles.length === 0) {
                throw new Error('Failed to find a model file.');
            }

            for (let script of scriptFiles) {
                template.getScriptManager().addScript(script);
            }

            // Compile Ergo
            template.getScriptManager().compileLogic();

            logger.debug(method, 'Added script files', scriptFiles.length);

            // check the template model
            template.getTemplateModel();

            let template_txt = fs.readFileSync(fsPath.resolve(path, 'grammar/template.tem'), ENCODING);
            if(!template_txt) {
                throw new Error('Failed to find template.tem file.');
            }

            template.buildGrammar(template_txt);
            logger.debug(method, 'Loaded template.tem', template_txt);

            logger.exit(method, path);
            return Promise.resolve(template);
        });
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
        logger.debug('processDirectory', 'Path ' + path, items);
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
            logger.debug('processFile', 'FileProcessor accepted', file);
            let fileContents = fs.readFileSync(file, ENCODING);
            fileProcessor.process(file, fileContents);
        } else {
            logger.debug('processFile', 'FileProcessor rejected', file);
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
     * Set the samples within the Metadata
     * @param {object} samples the samples for the tempalte
     * @private
     */
    setSamples(samples) {
        this.metadata = new Metadata(this.metadata.getPackageJson(), this.metadata.getREADME(), samples, this.metadata.getRequest());
    }

    /**
     * Set a locale-specified sample within the Metadata
     * @param {object} sample the samples for the template
     * @param {string} locale the IETF Language Tag (BCP 47) for the language
     * @private
     */
    setSample(sample, locale) {
        const samples = this.metadata.getSamples();
        samples[locale] = sample;
        this.metadata = new Metadata(this.metadata.getPackageJson(), this.metadata.getREADME(), samples, this.metadata.getRequest());
    }

    /**
     * Set the request within the Metadata
     * @param {object} request the samples for the template
     * @private
     */
    setRequest(request) {
        this.metadata = new Metadata(this.metadata.getPackageJson(), this.metadata.getREADME(), this.metadata.getSamples(), request);
    }

    /**
     * Set the readme file within the Metadata
     * @param {String} readme the readme in markdown for the business network
     * @private
     */
    setReadme(readme) {
        this.metadata = new Metadata(this.metadata.getPackageJson(), readme, this.metadata.getSamples(), this.metadata.getRequest());
    }

    /**
     * Set the packageJson within the Metadata
     * @param {object} packageJson the JS object for package.json
     * @private
     */
    setPackageJson(packageJson) {
        this.metadata = new Metadata(packageJson, this.metadata.getREADME(), this.metadata.getSamples(), this.metadata.getRequest());
    }

    /**
     * Provides a list of the input types that are accepted by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the request types
     */
    getRequestTypes() {
        return this.extractFuncDeclParameter(1);
    }

    /**
     * Provides a list of the response types that are returned by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the response types
     */
    getResponseTypes() {
        return this.extractFuncDeclParameter(2);
    }

    /**
     * Provides a list of the emit types that are emitted by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the emit types
     */
    getEmitTypes() {
        return this.extractFuncDeclParameter(3);
    }

    /**
     * Provides a list of the state types that are expected by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the state types
     */
    getStateTypes() {
        return this.extractFuncDeclParameter(4);
    }

    /**
     * Helper method to retrieve types from a function declarations
     * @param {number} index the parameter index for the function declaration
     *  1 - Request Types
     *  2 - Return Types
     *  3 - Emit Types
     *  4 - State Types
     * @returns {Array} a list of types
     * @private
     */
    extractFuncDeclParameter(index) {
        const functionDeclarations = this.getScriptManager().allFunctionDeclarations();
        let types = [];
        functionDeclarations.forEach((ele, n) => {
            const type = ele.getParameterTypes()[index];
            if (type) {
                types.push(type);
            }
        });
        logger.debug(types);
        return types;
    }

    /**
     * Returns true if the template is text-only, i.e., it does not contain any logic
     * @return {boolean} is the template text only?
     */
    hasNoLogic() {
        return this.getScriptManager().getAllScripts().length === 0;
    }

    /**
     * Set archiveOmitsLogic
     */
    setArchiveOmitsLogic() {
        this.archiveOmitsLogic = true;
    }

    /**
     * Unset archiveOmitsLogic
     */
    unsetArchiveOmitsLogic() {
        this.archiveOmitsLogic = false;
    }

}

module.exports = Template;