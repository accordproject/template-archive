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

const { templatemarkutil } = require('@accordproject/markdown-template');

const Metadata = require('./metadata');
const crypto = require('crypto');
const stringify = require('json-stable-stringify');

// vc-signer is ESM-only. cicero-core is CommonJS, so we use dynamic import().
// Cached after the first load so we only pay the import cost once.
let _vcSignerPromise = null;
function getVcSigner() {
    if (!_vcSignerPromise) {
        _vcSignerPromise = import('vc-signer');
    }
    return _vcSignerPromise;
}

const TemplateLoader = require('./templateloader');
const TemplateSaver = require('./templatesaver');
const LogicManager = require('./logicmanager');

/**
 * A template for a legal clause or contract. A Template has a template model request/response transaction types,
 * and a template grammar (natural language for the template).
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
     * @param {Buffer} logo - the bytes data of logo
     * @param {Object} options  - e.g., { warnings: true }
     * @param {Object} authorSignature  - the signed W3C Verifiable Credential (TemplateAuthorshipCredential)
     */
    constructor(packageJson, readme, samples, request, logo, options, authorSignature) {
        this.metadata = new Metadata(packageJson, readme, samples, request, logo);
        this.logicManager = new LogicManager(this.metadata.getRuntime() ?? 'typescript', null, options);
        this.authorSignature = authorSignature ? authorSignature : null;
        this.template = null;
    }

    /**
     * Sets the grammar for the template
     * @param {string} grammar the grammar for the template
     */
    setTemplate(grammar) {
        this.template = grammar;
    }

    /**
     * Get the grammar for the template
     * @returns {string} grammar the grammar for the template
     */
    getTemplate() {
        return this.template;
    }

    /**
     * Verifies that the template is well formed.
     * Throws an exception with the details of any validation errors.
     * @param {Object} options  - e.g., { offline: true }
     */
    async validate(options = {}) {
        if (options.verifySignature) {
            await this.verifyTemplateSignature();
        }
        if (options && options.offline) {
            this.getModelManager().validateModelFiles();
        }
        else {
            this.getModelManager().updateExternalModels();
        }
        this.getTemplateModel();
    }

    /**
     * Returns the template model for the template
     * @throws {Error} if no template model is found, or multiple template models are found
     * @returns {ClassDeclaration} the template model for the template
     */
    getTemplateModel() {
        return templatemarkutil.findTemplateConcept(this.getIntrospector(), 'clause');
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
     * Normalizes line endings to \n to ensure consistent hashing across OS
     * @param {string} str the string to normalize
     * @return {string} the normalized string
     * @private
     */
    _normalize(str) {
        if (str && typeof str === 'string') {
            return str.replace(/\r/g, '');
        }
        return str;
    }

    /**
     * Gets a content based SHA-256 hash for this template. Hash
     * is based on the metadata for the template plus the contents of
     * all the models and all the script files.
     * @return {string} the SHA-256 hash in hex format
     */
    getHash() {
        const content = {};
        content.metadata = this.getMetadata().toJSON();

        // Normalize README
        if (content.metadata.README) {
            content.metadata.README = this._normalize(content.metadata.README);
        }

        // Normalize Samples
        if (content.metadata.samples) {
            Object.keys(content.metadata.samples).forEach(key => {
                if (typeof content.metadata.samples[key] === 'string') {
                    content.metadata.samples[key] = this._normalize(content.metadata.samples[key]);
                }
            });
        }

        if (this.getTemplate()) {
            content.grammar = this._normalize(this.getTemplate());
        }
        content.models = {};
        content.scripts = {};

        let modelFiles = this.getModelManager().getModels();
        modelFiles.forEach((file) => {
            content.models[file.namespace] = this._normalize(file.content);
        });

        let scriptManager = this.getScriptManager();
        let scriptFiles = scriptManager.getScripts();
        scriptFiles.forEach((file) => {
            content.scripts[file.getIdentifier()] = this._normalize(file.contents);
        });

        const hasher = crypto.createHash('sha256');
        hasher.update(stringify(content));
        return hasher.digest('hex');
    }

    /**
     * Verify the W3C Verifiable Credential stored on the template against the
     * current template content. Throws if the credential is missing, the
     * signature is invalid, or the credentialSubject.templateHash does not
     * match the recomputed hash of the template.
     */
    async verifyTemplateSignature() {
        if (this.authorSignature === null) {
            throw new Error('The template is missing author signature!');
        }
        const { verifyCredential } = await getVcSigner();
        try {
            await verifyCredential(this.authorSignature, {
                expectedSubject: { templateHash: this.getHash() },
            });
        } catch (e) {
            throw new Error(`Template's author signature is invalid! ${e.message}`);
        }
    }

    /**
     * Sign the template with a W3C Verifiable Credential. The resulting VC is
     * stored on `authorSignature` and embedded in the archive as
     * `signature.json`.
     *
     * @param {Object} signer - signing options forwarded to vc-signer
     * @param {Object} [signer.privateKeyPem] - { pem, passphrase }
     * @param {Object} [signer.privateKeyJwe] - { jwe, passphrase }
     * @param {String} [signer.issuerDid] - 'did:key' (default) or 'did:web:...'
     * @param {String} [signer.verificationMethodId] - required for did:web
     */
    async signTemplate(signer) {
        if (!signer || typeof signer !== 'object') {
            throw new Error('signTemplate: signer options are required');
        }
        const { loadSigningKey, signCredential } = await getVcSigner();
        const keyInfo = await loadSigningKey({
            privateKeyPem: signer.privateKeyPem,
            privateKeyJwe: signer.privateKeyJwe,
        });
        const name = this.getMetadata().getName();
        const version = this.getMetadata().getVersion();
        this.authorSignature = await signCredential({
            type: ['VerifiableCredential', 'TemplateAuthorshipCredential'],
            subject: {
                id: `ap-template:${name}@${version}`,
                templateHash: this.getHash(),
                templateName: name,
                templateVersion: version,
            },
            signer: {
                keyInfo,
                issuerDid: signer.issuerDid,
                verificationMethodId: signer.verificationMethodId,
            },
        });
    }

    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {string} [language] - target language for the archive
     * @param {Object} [options] - JSZip options and optional signer block
     * @param {Object} [options.signer] - vc-signer options; see signTemplate()
     * @return {Promise<Buffer>} the zlib buffer
     */
    async toArchive(language, options = {}) {
        if (options.signer) {
            // Apply the language-targeted metadata before computing the hash so
            // it matches what ends up in the archive's package.json (the saver
            // also calls createTargetMetadata, which is idempotent).
            if (language) {
                this.metadata = this.metadata.createTargetMetadata(language);
            }
            await this.signTemplate(options.signer);
        }
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
    static async fromDirectory(path, options = null) {
        return TemplateLoader.fromDirectory(Template, path, options);
    }

    /**
     * Create a template from an archive.
     * @param {Buffer} buffer  - the buffer to a Cicero Template Archive (cta) file
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise<Template>} a Promise to the template
     */
    static async fromArchive(buffer, options = null) {
        return TemplateLoader.fromArchive(Template, buffer, options);
    }

    /**
     * Create a template from an URL.
     * @param {String} url  - the URL to a Cicero Template Archive (cta) file
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise} a Promise to the template
     */
    static async fromUrl(url, options = null) {
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
        return this.getModelManager().getFactory();
    }

    /**
     * Provides access to the Serializer for this template. The Serializer
     * is used to serialize instances of the types defined within this template.
     * @return {Serializer} the Serializer for this template
     */
    getSerializer() {
        return this.getModelManager().getSerializer();
    }

    /**
     * Provides access to the ScriptManager for this template. The ScriptManager
     * manage access to the scripts that have been defined within this template.
     * @return {ScriptManager} the ScriptManager for this template
     */
    getScriptManager() {
        return this.logicManager.getScriptManager();
    }

    /**
     * Provides access to the ModelManager for this template. The ModelManager
     * manage access to the models that have been defined within this template.
     * @return {ModelManager} the ModelManager for this template
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
        this.metadata = new Metadata(this.metadata.getPackageJson(), this.metadata.getREADME(), samples, this.metadata.getRequest(), this.metadata.getLogo());
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
        this.metadata = new Metadata(this.metadata.getPackageJson(), this.metadata.getREADME(), samples, this.metadata.getRequest(), this.metadata.getLogo());
    }

    /**
     * Set the request within the Metadata
     * @param {object} request the samples for the template
     * @private
     */
    setRequest(request) {
        this.metadata = new Metadata(this.metadata.getPackageJson(), this.metadata.getREADME(), this.metadata.getSamples(), request, this.metadata.getLogo());
    }

    /**
     * Set the readme file within the Metadata
     * @param {String} readme the readme in markdown for the template
     * @private
     */
    setReadme(readme) {
        this.metadata = new Metadata(this.metadata.getPackageJson(), readme, this.metadata.getSamples(), this.metadata.getRequest(), this.metadata.getLogo());
    }

    /**
     * Set the packageJson within the Metadata
     * @param {object} packageJson the JS object for package.json
     * @private
     */
    setPackageJson(packageJson) {
        this.metadata = new Metadata(packageJson, this.metadata.getREADME(), this.metadata.getSamples(), this.metadata.getRequest(), this.metadata.getLogo());
    }

    /**
     * Returns a list of a fully-qualified types that are concrete sub-classes of the parameter.
     * Includes the parameter if it is not abstract.
     * @param {String} type The fully-qualified type to search for
     * @return {String[]} An array of fully-qualified types
     * @private
     */
    findConcreteSubclassNames(type) {
        return this.getModelManager()
            .getType(type)
            .getAssignableClassDeclarations()
            .filter(subclass => !subclass.isAbstract())
            .map(decl => decl.getFullyQualifiedName());
    }

    /**
     * Provides a list of the input types that are accepted by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the request types
     */
    getRequestTypes() {
        return this.findConcreteSubclassNames('org.accordproject.runtime@0.2.0.Request');
    }

    /**
     * Provides a list of the response types that are returned by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the response types
     */
    getResponseTypes() {
        return this.findConcreteSubclassNames('org.accordproject.runtime@0.2.0.Response');
    }

    /**
     * Provides a list of the emit types that are emitted by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the emit types
     */
    getEmitTypes() {
        return this.findConcreteSubclassNames('org.accordproject.runtime@0.2.0.Obligation');
    }

    /**
     * Provides a list of the state types that are expected by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the state types
     */
    getStateTypes() {
        return this.findConcreteSubclassNames('org.accordproject.runtime@0.2.0.State');
    }

    /**
     * Returns true if the template has logic, i.e. has more than one script file.
     * @return {boolean} true if the template has logic
     */
    hasLogic() {
        return this.getScriptManager().getScripts().length > 0;
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