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
// const forge = require('node-forge');
const stringify = require('json-stable-stringify');

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
     * @param {Object} authorSignature  - object containing template hash, timestamp, author's certificate, signature
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
    validate(options = {}) {
        if (options.verifySignature) {
            this.verifyTemplateSignature();
        }
        if(options && options.offline) {
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
     * Gets a content based SHA-256 hash for this template. Hash
     * is based on the metadata for the template plus the contents of
     * all the models and all the script files.
     * @return {string} the SHA-256 hash in hex format
     */
    getHash() {
        const content = {};
        content.metadata = this.getMetadata().toJSON();
        if(this.getTemplate()) {
            content.grammar = this.getTemplate();
        }
        content.models = {};
        content.scripts = {};

        let modelFiles = this.getModelManager().getModels();
        modelFiles.forEach(function (file) {
            content.models[file.namespace] = file.content;
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
     * verifies the signature stored in the template object using the template hash and timestamp
     */
    verifyTemplateSignature() {
        /*
        const templateHash = this.getHash();
        if (this.authorSignature === null) {throw new Error('The template is missing author signature!');}
        const signature = this.authorSignature.templateSignature.signature;
        const timestamp = this.authorSignature.templateSignature.timestamp;
        const signatoryCert = this.authorSignature.templateSignature.signatoryCert;
        //X509 cert converted from PEM to forge type
        const certificateForge = forge.pki.certificateFromPem(signatoryCert);
        //public key in forge type
        const publicKeyForge = certificateForge.publicKey;
        //convert public key from forge to pem
        const publicKeyPem = forge.pki.publicKeyToPem(publicKeyForge);
        //convert public key in pem to public key type in node.
        const publicKey = crypto.createPublicKey(publicKeyPem);
        //signature verification process
        const verify = crypto.createVerify('SHA256');
        verify.write(templateHash + timestamp);
        verify.end();
        const result = verify.verify(publicKey, signature, 'hex');
        if (!result) {
            throw new Error('Template\'s author signature is invalid!');
        }
        */
    }

    /**
     * signs a string made up of template hash and time stamp using private key derived
     * from the keystore
     * @param {String} p12File - encoded string of p12 keystore file
     * @param {String} passphrase - passphrase for the keystore file
     * @param {Number} timestamp - timestamp of the moment of signature is done
     */
    signTemplate(p12File, passphrase, timestamp) {
        /*
        if (typeof(p12File) !== 'string') {throw new Error('p12File should be of type String!');}
        if (typeof(passphrase) !== 'string') {throw new Error('passphrase should be of type String!');}
        if (typeof(timestamp) !== 'number') {throw new Error('timestamp should be of type Number!');}

        const templateHash = this.getHash();
        // decode p12 from base64
        const p12Der = forge.util.decode64(p12File);
        // get p12 as ASN.1 object
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        // decrypt p12 using the passphrase 'password'
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);
        //X509 cert forge type
        const certificateForge = p12.safeContents[0].safeBags[0].cert;
        //Private Key forge type
        const privateKeyForge = p12.safeContents[1].safeBags[0].key;
        //convert cert and private key from forge to PEM
        const certificatePem = forge.pki.certificateToPem(certificateForge);
        const privateKeyPem = forge.pki.privateKeyToPem(privateKeyForge);
        //convert private key in pem to private key type in node
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        const sign = crypto.createSign('SHA256');
        sign.write(templateHash + timestamp);
        sign.end();
        const signature = sign.sign(privateKey, 'hex');
        const signatureObject = {
            templateHash,
            timestamp,
            signatoryCert: certificatePem,
            signature
        };
        this.authorSignature = signatureObject;
        */
    }

    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {string} [language] - target language for the archive
     * @param {Object} [options] - JSZip options and keystore object containing path and passphrase for the keystore
     * @return {Promise<Buffer>} the zlib buffer
     */
    async toArchive(language, options = {}) {
        if (options.keystore) {
            const timestamp = Date.now();
            this.signTemplate(options.keystore.p12File, options.keystore.passphrase, timestamp);
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
        this.metadata = new Metadata(this.metadata.getPackageJson(), readme, this.metadata.getSamples(), this.metadata.getRequest());
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
