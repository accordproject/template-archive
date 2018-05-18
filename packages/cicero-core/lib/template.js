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
const Factory = require('composer-common').Factory;
const RelationshipDeclaration = require('composer-common').RelationshipDeclaration;
const Introspector = require('composer-common').Introspector;
const ModelManager = require('composer-common').ModelManager;
const ScriptManager = require('composer-common').ScriptManager;
const Serializer = require('composer-common').Serializer;
const Writer = require('composer-common').Writer;
const logger = require('./logger');
const nearley = require('nearley');
const compile = require('nearley/lib/compile');
const generate = require('nearley/lib/generate');
const nearleyGrammar = require('nearley/lib/nearley-language-bootstrapped');
const templateGrammar = require('./tdl.js');
const GrammarVisitor = require('./grammarvisitor');
const Ergo = require('@accordproject/ergo-compiler/lib/ergo');
const uuid = require('uuid');
const nunjucks = require('nunjucks');

const common = require.resolve('@accordproject/cicero-common/models/common.cto');
const ENCODING = 'utf8';
// Matches 'sample.txt' or 'sample_TAG.txt' where TAG is an IETF language tag (BCP 47)
const IETF_REGEXP = languageTagRegex({ exact: false }).toString().slice(1,-2);
const SAMPLE_FILE_REGEXP = xregexp('sample(_(' + IETF_REGEXP + '))?.txt$');

// This code is derived from BusinessNetworkDefinition in Hyperleger Composer composer-common.

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
     */
    constructor(packageJson, readme, samples) {

        this.modelManager = new ModelManager();
        if(this.modelManager.getModelFile('org.accordproject.common') === undefined){
            const model = fs.readFileSync(fsPath.resolve(common), ENCODING);
            this.modelManager.addModelFile(model, 'common.cto');
        }
        this.scriptManager = new ScriptManager(this.modelManager);
        this.introspector = new Introspector(this.modelManager);
        this.factory = new Factory(this.modelManager);
        this.serializer = new Serializer(this.factory, this.modelManager);
        this.metadata = new Metadata(packageJson, readme, samples);
        this.grammar = null;
        this.grammarAst = null;
        this.templatizedGrammar = null;
        this.logicboth = false;
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

        logger.debug('buildGrammar', templatizedGrammar);
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(templateGrammar));
        parser.feed(templatizedGrammar);
        if (parser.results.length !== 1) {
            throw new Error('Ambigious parse!');
        }

        // parse the template grammar to generate a dynamic grammar
        const ast = parser.results[0];
        logger.debug('Template AST', ast);
        const parts = {
            textRules: [],
            modelRules: []
        };
        this.buildGrammarRules(ast, this.getTemplateModel(), 'rule', parts);

        // generate the grammar for the model
        const parameters = {
            writer: new Writer(),
            rules : []
        };
        const gv = new GrammarVisitor();
        this.getModelManager().accept(gv, parameters);
        parts.modelRules.push(...parameters.rules);

        parts.textRules.push({
            prefix: 'ROOT',
            class: false,
            symbols: ['rule0'],
            properties: false
        });

        // combine the results
        nunjucks.configure(fsPath.resolve(__dirname), {
            tags: {
                blockStart: '<%',
                blockEnd: '%>'
            },
            autoescape: false  // Required to allow nearley syntax strings
        });
        const combined = nunjucks.render('template.ne', parts);
        logger.debug('Generated template grammar' + combined);

        this.setGrammar(combined);
        this.templatizedGrammar = templatizedGrammar;
    }

    /**
     * Build grammar rules from a template
     * @param {object} ast  - the AST from which to build the grammar
     * @param {ClassDeclaration} templateModel  - the type of the parent class for this AST
     * @param {String} prefix - A unique prefix for the grammar rules
     * @param {Object} parts - Result object to acculumate rules
     */
    buildGrammarRules(ast, templateModel, prefix, parts) {
        // now we create each subordinate rule in turn
        const rules = {};
        let textRules = {};

        // create the root rule, for the Template Model
        textRules.prefix = prefix;
        textRules.symbols = [];
        ast.data.forEach((element, index) => {
            // ignore empty chunks (issue #1) and missing optional last chunks
            if (element && (element.type !== 'Chunk' || element.value.length > 0)) {
                logger.debug(`element ${prefix}${index} ${JSON.stringify(element)}`);
                rules[prefix + index] = element;
                textRules.symbols.push(prefix + index);
            }
        }, this);
        textRules.class = templateModel.getFullyQualifiedName();
        const identifier = templateModel.getIdentifierFieldName();
        if (identifier !== null) {
            textRules.identifier = `${identifier} : "${uuid.v4()}"`;
        }
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
            case 'LastChunk':
                parts.modelRules.push({
                    prefix: rule,
                    symbols: [this.cleanChunk(element.value)],
                });
                break;
            case 'BooleanBinding':
                parts.modelRules.push({
                    prefix: rule,
                    symbols: [`${element.string.value}:? {% (d) => {return d[0] !== null;}%} # ${element.fieldName.value}`],
                });
                break;
            case 'Binding':
                {
                    const propertyName = element.fieldName.value;
                    const property = templateModel.getProperty(propertyName);
                    if (!property) {
                        throw new Error(`Template references a property '${propertyName}' that is not declared in the template model '${templateModel.getFullyQualifiedName()}'. Details: ${JSON.stringify(element)}`);
                    }
                    let type = property.getType();
                    // relationships need to be transformed into strings
                    if (property instanceof RelationshipDeclaration) {
                        type = 'String';
                    }
                    let action = '{% id %}';
                    const decorator = property.getDecorator('AccordType');
                    if (decorator) {
                        if (decorator.getArguments().length > 0) {
                            type = decorator.getArguments()[0];
                        }
                        if (decorator.getArguments().length > 1) {
                            action = decorator.getArguments()[1];
                        }
                    }
                    let suffix = ':';
                    // TODO (DCS) need a serialization for arrays
                    if (property.isArray()) {
                        throw new Error('Arrays are not yet supported!');
                        // suffix += '+';
                    }
                    if (property.isOptional()) {
                        suffix += '?';
                    }
                    if (suffix === ':') {
                        suffix = '';
                    }
                    parts.modelRules.push({
                        prefix: rule,
                        symbols: [`${type}${suffix} ${action} # ${propertyName}`],
                    });
                }
                break;
            case 'ClauseBinding':
                {
                    const propertyName = element.fieldName.value;
                    const clauseTemplate = element.template;
                    const property = templateModel.getProperty(propertyName);
                    if (!property) {
                        throw new Error(`Template references a property '${propertyName}' that is not declared in the template model '${templateModel.getFullyQualifiedName()}'. Details: ${JSON.stringify(element)}`);
                    }
                    const clauseTemplateModel = this.getIntrospector().getClassDeclaration(property.getFullyQualifiedTypeName());
                    this.buildGrammarRules(clauseTemplate, clauseTemplateModel, propertyName, parts);
                    parts.modelRules.push({
                        prefix: rule,
                        symbols: [`${element.fieldName.value} {% id %}\n`],
                    });
                }
                break;
            default:
                throw new Error(`Unrecognized type ${element.type}`);
            }
        }
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
            if(element !== null && ['Binding','BooleanBinding','ClauseBinding'].includes(element.type)) {
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
            logger.error(err);
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
        logger.entry(method, Buffer.length);
        return JSZip.loadAsync(Buffer).then(function (zip) {
            let promise = Promise.resolve();
            let ctoModelFiles = [];
            let ctoModelFileNames = [];
            let jsScriptFiles = [];
            let sampleTextFiles = {};
            let template;
            let readmeContents = null;
            let packageJsonContents = null;
            let grammar = null;
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

            logger.debug(method, 'Loading grammar.ne');
            let grammarNe = zip.file('grammar/grammar.ne');
            if (grammarNe !== null) {
                promise = promise.then(() => {
                    return grammarNe.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded grammar.ne');
                    grammar = contents;
                });
            } else {
                logger.debug(method, 'Loading template.tem');
                let template_txt = zip.file('grammar/template.tem');

                if (template_txt === null) {
                    throw new Error('Failed to find grammar or template.');
                }

                promise = promise.then(() => {
                    return template_txt.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded template.tem');
                    templatizedGrammar = contents;
                });
            }

            logger.debug(method, 'Looking for model files');
            let ctoFiles = zip.file(/models\/.*\.cto$/); //Matches any file which is in the 'models' folder and has a .cto extension
            ctoFiles.forEach(function (file) {
                logger.debug(method, 'Found model file, loading it', file.name);
                ctoModelFileNames.push(file.name);
                promise = promise.then(() => {
                    return file.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded model file');
                    ctoModelFiles.push(contents);
                });
            });

            logger.debug(method, 'Looking for JavaScript files');
            let jsFiles = zip.file(/lib\/.*\.js$/); //Matches any file which is in the 'lib' folder and has a .js extension
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
                    jsScriptFiles.push(tempObj);

                });
            });

            logger.debug(method, 'Looking for Ergo files');
            let ergoFiles = zip.file(/lib\/.*\.ergo$/); //Matches any file which is in the 'lib' folder and has a .ergo extension

            if(jsFiles.length>0 && ergoFiles.length>0) {
                throw new Error('Templates cannot mix Ergo and JS logic');
            }

            ergoFiles.forEach(function (file) {
                logger.debug(method, 'Found Ergo file, loading it', file.name);
                promise = promise.then(() => {
                    return file.async('string');
                }).then((contents) => {
                    logger.debug(method, 'Loaded Ergo file');
                    // XXX TBD: Pass CTOs to Ergo compiler
                    const ctos = [];
                    const compiledJS = Ergo.compileToJavaScriptAndLink(contents,ctos,'javascript_cicero');
                    let tempObj = {
                        'name': file.name,
                        'contents': compiledJS
                    };
                    jsScriptFiles.push(tempObj);
                });
            });

            return promise.then(async () => {
                logger.debug(method, 'Loaded package.json');
                template = new Template(packageJsonContents, readmeContents, sampleTextFiles);

                logger.debug(method, 'Adding model files to model manager');
                template.modelManager.addModelFiles(ctoModelFiles, ctoModelFileNames, true); // Adds all cto files to model manager
                await template.modelManager.updateExternalModels();
                template.modelManager.validateModelFiles();

                logger.debug(method, 'Added model files to model manager');
                logger.debug(method, 'Adding JavaScript files to script manager');
                jsScriptFiles.forEach(function (obj) {
                    let jsObject = template.scriptManager.createScript(obj.name, '.js', obj.contents);
                    template.scriptManager.addScript(jsObject); // Adds all js files to script manager
                });
                logger.debug(method, 'Added JavaScript files to script manager');

                // check the template model
                template.getTemplateModel();

                logger.debug(method, 'Setting grammar');
                if (grammar) {
                    template.setGrammar(grammar);
                } else {
                    template.buildGrammar(templatizedGrammar);
                }

                logger.exit(method, template.toString());
                return template; // Returns template
            });
        });
    }

    /**
     * Store a Template as an archive.
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

        // Save the sample files
        const sampleFiles = this.getMetadata().getSamples();
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
            // ignore Accord Project system models
            if (file.getNamespace() === 'org.accordproject.common') {
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

        // grab the package.json
        const packageJsonPath = fsPath.resolve(path, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('Failed to find package.json');
        }

        let packageJsonContents = fs.readFileSync(packageJsonPath, ENCODING);
        logger.debug(method, 'Loaded package.json', packageJsonContents);

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

        // parse the package.json
        let jsonObject = JSON.parse(packageJsonContents);

        // create the template
        const template = new Template(jsonObject, readmeContents, sampleTextFiles);
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
            let foundErgo, foundJs = false;
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
                    if (filePath.ext.toLowerCase() === '.ergo') {
                        logger.debug(method, 'Compiling Ergo to JavaScript ', path);
                        contents = Ergo.compileToJavaScriptAndLink(contents,[],'javascript_cicero');
                        logger.debug('Compiled Ergo to Javascript:\n'+contents+'\n');
                        path = path.substr(0, path.lastIndexOf('.')) + '.js';
                        filePath.ext = '.js';
                        if(foundJs) {
                            throw new Error('Templates cannot mix Ergo and JS logic');
                        }
                        foundErgo = true;
                    } else if (filePath.ext.toLowerCase() === '.js') {
                        if(foundErgo) {
                            throw new Error('Templates cannot mix Ergo and JS logic');
                        }
                        foundJs = true;
                    }
                    const jsScript = template.getScriptManager().createScript(path, filePath.ext.toLowerCase(), contents);
                    scriptFiles.push(jsScript);
                    logger.debug(method, 'Found script file ', path);
                }
            });

            if (modelFiles.length === 0) {
                throw new Error('Failed to find a model file.');
            }

            for (let script of scriptFiles) {
                template.getScriptManager().addScript(script);
            }

            logger.debug(method, 'Added script files', scriptFiles.length);

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
                logger.debug(method, 'Loaded template.tem', template_txt);
            } else {
                logger.debug(method, 'Loaded grammar.ne', grammarNe);
                template.setGrammar(grammarNe);
            }

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
        this.metadata = new Metadata(this.metadata.getPackageJson(), this.metadata.getREADME(), samples);
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
        this.metadata = new Metadata(this.metadata.getPackageJson(), this.metadata.getREADME(), samples);
    }

    /**
     * Set the readme file within the Metadata
     * @param {String} readme the readme in markdown for the business network
     * @private
     */
    setReadme(readme) {
        this.metadata = new Metadata(this.metadata.getPackageJson(), readme, this.metadata.getSamples());
    }

    /**
     * Set the packageJson within the Metadata
     * @param {object} packageJson the JS object for package.json
     * @private
     */
    setPackageJson(packageJson) {
        this.metadata = new Metadata(packageJson, this.metadata.getREADME(), this.metadata.getSamples());
    }

    /**
     * Provides a list of the input types that are accepted by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the request types
     */
    getRequestTypes() {
        // get the function declarations of all functions
        // that have the @clause annotation
        const functionDeclarations = this.getScriptManager().getScripts().map((ele) => {
            return ele.getFunctionDeclarations();
        })
            .reduce((flat, next) => {
                return flat.concat(next);
            })
            .filter((ele) => {
                return ele.getDecorators().indexOf('AccordClauseLogic') >= 0;
            }).map((ele) => {
                return ele;
            });

        if (functionDeclarations.length === 0) {
            throw new Error('Did not find any function declarations with the @AccordClauseLogic annotation');
        }

        let types = [];

        functionDeclarations.forEach((ele, n) => {
            types.push(ele.getParameterTypes()[1]);
        });

        logger.debug(types);
        return types;
    }

    /**
     * Provides a list of the return types that of this Template. Types use the fully-qualified form.
     * @return {Array} a list of the response types
     */
    getResponseTypes() {
        const functionDeclarations = this.getScriptManager().getScripts().map((ele) => {
            return ele.getFunctionDeclarations();
        })
            .reduce((flat, next) => {
                return flat.concat(next);
            })
            .filter((ele) => {
                return ele.getDecorators().indexOf('AccordClauseLogic') >= 0;
            }).map((ele) => {
                return ele;
            });

        if (functionDeclarations.length === 0) {
            throw new Error('Did not find any function declarations with the @AccordClauseLogic annotation');
        }

        let types = [];
        functionDeclarations.forEach((ele, n) => {
            types.push(ele.getParameterTypes()[2]);
        });
        logger.debug(types);
        return types;
    }

}

module.exports = Template;