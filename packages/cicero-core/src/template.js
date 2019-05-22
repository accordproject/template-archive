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
const Logger = require('@accordproject/ergo-compiler').Logger;
const ParserManager = require('./parsermanager');
const crypto = require('crypto');
const stringify = require('json-stable-stringify');
const LogicManager = require('@accordproject/ergo-compiler').LogicManager;
const TemplateLoader = require('./templateloader');
const TemplateSaver = require('./templatesaver');

/**
 * A template for a legal clause or contract. A Template has a template model, request/response transaction types,
 * a template grammar (natural language for the template) as well as Ergo code for the business logic of the
 * template.
 * @class
 * @public
 * @abstract
 */
class Template {

    /**
     * Create the Template.
     * Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link Template.fromArchive} or {@link Template.fromDirectory}.
     * @param {object} packageJson  - the JS object for package.json
     * @param {String} readme  - the readme in markdown for the template (optional)
     * @param {object} samples - the sample text for the template in different locales
     * @param {object} request - the JS object for the sample request
     * @param {Object} options  - e.g., { warnings: true }
     */
    constructor(packageJson, readme, samples, request, options) {
        this.metadata = new Metadata(packageJson, readme, samples, request);
        this.logicManager = new LogicManager('cicero', null, options);
        this.parserManager = new ParserManager(this);
    }

    /**
     * Verifies that the template is well formed.
     * Throws an exception with the details of any validation errors.
     */
    validate() {
        this.getModelManager().validateModelFiles();
        this.getTemplateModel();
        this.getLogicManager().compileLogicSync(true);
    }

    /**
     * Returns the template model for the template
     * @throws {Error} if no template model is found, or multiple template models are found
     * @returns {ClassDeclaration} the template model for the template
     */
    getTemplateModel() {

        let modelType = 'org.accordproject.cicero.contract.AccordContract';

        if(this.getMetadata().getTemplateType() !== 0) {
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
     * Returns the name for this template
     * @return {String} the name of this template
     */
    getName() {
        return this.getMetadata().getName();
    }

    /**
     * Returns the display name for this template.
     * @return {string} the display name of the template
     */
    getDisplayName() {
        return this.getMetadata().getDisplayName();
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
     * Gets a content based SHA-256 hash for this template. Hash
     * is based on the metadata for the template plus the contents of
     * all the models and all the script files.
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
            content.scripts[file.getIdentifier()] = file.contents;
        });

        const hasher = crypto.createHash('sha256');
        hasher.update(stringify(content));
        return hasher.digest('hex');
    }

    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {string} [language] - target language for the archive (should be 'ergo')
     * @param {Object} [options] - JSZip options
     * @return {Promise<Buffer>} the zlib buffer
     */
    async toArchive(language, options) {
        return TemplateSaver.toArchive(this, language, options);
    }

    /**
     * Builds a Template from the contents of a directory.
     * The directory must include a package.json in the root (used to specify
     * the name, version and description of the template).
     *
     * @param {String} path to a local directory
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise<Template>} a Promise to the instantiated template
     */
    static async fromDirectory(path, options=null) {
        return TemplateLoader.fromDirectory(Template, path, options);
    }

    /**
     * Create a template from an archive.
     * @param {Buffer} buffer  - the buffer to a Cicero Template Archive (cta) file
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise<Template>} a Promise to the template
     */
    static async fromArchive(buffer, options=null) {
        return TemplateLoader.fromArchive(Template, buffer, options);
    }

    /**
     * Create a template from an URL.
     * @param {String} url  - the URL to a Cicero Template Archive (cta) file
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise} a Promise to the template
     */
    static async fromUrl(url, options=null) {
        return TemplateLoader.fromUrl(Template, url, options);
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
     * Provides access to the parser manager for this template.
     * The parser manager can convert template data to and from
     * natural language text.
     * @return {ParserManager} the ParserManager for this template
     */
    getParserManager() {
        return this.parserManager;
    }
    /**
     * Provides access to the template logic for this template.
     * The template logic encapsulate the code necessary to
     * execute the clause or contract.
     * @return {LogicManager} the LogicManager for this template
     */
    getLogicManager() {
        return this.logicManager;
    }

    /**
     * Provides access to the Introspector for this template. The Introspector
     * is used to reflect on the types defined within this template.
     * @return {Introspector} the Introspector for this template
     */
    getIntrospector() {
        return this.logicManager.getIntrospector();
    }

    /**
     * Provides access to the Factory for this template. The Factory
     * is used to create the types defined in this template.
     * @return {Factory} the Factory for this template
     */
    getFactory() {
        return this.logicManager.getFactory();
    }

    /**
     * Provides access to the Serializer for this template. The Serializer
     * is used to serialize instances of the types defined within this template.
     * @return {Serializer} the Serializer for this template
     */
    getSerializer() {
        return this.logicManager.getSerializer();
    }

    /**
     * Provides access to the ScriptManager for this template. The ScriptManager
     * manage access to the scripts that have been defined within this template.
     * @return {ScriptManager} the ScriptManager for this template
     * @private
     */
    getScriptManager() {
        return this.logicManager.getScriptManager();
    }

    /**
     * Provides access to the ModelManager for this template. The ModelManager
     * manage access to the models that have been defined within this template.
     * @return {ModelManager} the ModelManager for this template
     * @private
     */
    getModelManager() {
        return this.logicManager.getModelManager();
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
     * @param {String} readme the readme in markdown for the template
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
        Logger.debug(types);
        return types;
    }

    /**
     * Returns true if the template has logic, i.e. has more than one script file.
     * @return {boolean} true if the template has logic
     */
    hasLogic() {
        return this.getScriptManager().getAllScripts().length > 0;
    }

    /**
     * Check to see if a ClassDeclaration is an instance of the specified fully qualified
     * type name.
     * @internal
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
}

module.exports = Template;