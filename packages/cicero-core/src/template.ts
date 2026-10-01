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

import { templatemarkutil } from '@accordproject/markdown-template';

import Metadata from './metadata';
import crypto from 'crypto';
import forge from 'node-forge';
import stringify from 'json-stable-stringify';

import TemplateLoader from './templateloader';
import TemplateSaver from './templatesaver';
import LogicManager from './logicmanager';

/**
 * A template for a legal clause or contract. A Template has a template model request/response transaction types,
 * and a template grammar (natural language for the template).
 * @class
 * @public
 * @abstract
 */
export default class Template {

    /**
     * The base request type. A template declares its own request as a subtype.
     */
    static REQUEST_TYPE = 'org.accordproject.runtime@1.0.0.Request';

    /**
     * The base response type. A template declares its own response as a subtype.
     */
    static RESPONSE_TYPE = 'org.accordproject.runtime@1.0.0.Response';

    /**
     * The base emit type. runtime@1.0.0 does not define an obligation of its
     * own: obligations are durable state in their own namespace, so that
     * lifecycle is not coupled to the runtime API.
     */
    static EMIT_TYPE = 'org.accordproject.obligation@1.0.0.Obligation';

    /**
     * The base state type. It is abstract, and a template declares one
     * concrete subtype which the runtime carries in its state envelope
     * rather than subclassing the envelope itself.
     */
    static STATE_TYPE = 'org.accordproject.templatedata@1.0.0.StateData';

    /**
     * The base template data type. It is abstract, and a template's model
     * declares exactly one concrete subtype of it: that subtype is the
     * template model. Extending TemplateData is the declaration, so no
     * `@template` decorator is required to identify it.
     */
    static TEMPLATE_DATA_TYPE = 'org.accordproject.templatedata@1.0.0.TemplateData';

    /**
     * The legacy base request type, from `org.accordproject.runtime@0.2.0`.
     *
     * Templates written before the 1.0 models (for example most of
     * cicero-template-library) still declare their requests as subtypes of
     * this. Its concrete subtypes are reported alongside those of
     * {@link Template.REQUEST_TYPE}, so those templates keep working unchanged.
     */
    static LEGACY_REQUEST_TYPE = 'org.accordproject.runtime@0.2.0.Request';

    /**
     * The legacy base response type, from `org.accordproject.runtime@0.2.0`.
     * Its concrete subtypes are reported alongside those of
     * {@link Template.RESPONSE_TYPE}.
     */
    static LEGACY_RESPONSE_TYPE = 'org.accordproject.runtime@0.2.0.Response';

    /**
     * The legacy base emit type, from `org.accordproject.runtime@0.2.0`. It is
     * abstract. Its concrete subtypes are reported alongside those of
     * {@link Template.EMIT_TYPE}.
     */
    static LEGACY_EMIT_TYPE = 'org.accordproject.runtime@0.2.0.Obligation';

    /**
     * The legacy base state type, from `org.accordproject.runtime@0.2.0`.
     * Its concrete subtypes are reported alongside those of
     * {@link Template.STATE_TYPE}. Unlike `StateData` it is a concrete (empty)
     * asset, so {@link Template#isStateful} excludes it explicitly: a legacy
     * template is only stateful if it declares a subtype of its own.
     */
    static LEGACY_STATE_TYPE = 'org.accordproject.runtime@0.2.0.State';

    metadata: any;
    logicManager: any;
    authorSignature: any;
    template: any;

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
    validate(options: any = {}) {
        if (options.verifySignature) {
            this.verifyTemplateSignature();
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
     * Returns the template model for the template.
     *
     * The template model is resolved in this order:
     *
     * 1. If package.json names it with `accordproject.templateModel`, that
     *    type. It must be a concrete subtype of
     *    {@link Template.TEMPLATE_DATA_TYPE}, or, for legacy templates, a
     *    concrete type with the `@template` decorator. A template that
     *    composes other templates carries copies of their models, each with
     *    its own subtype of `TemplateData`, so it must say which one is its
     *    own.
     * 2. Otherwise, the model's one concrete subtype of
     *    {@link Template.TEMPLATE_DATA_TYPE}: extending `TemplateData` is the
     *    declaration, so no `@template` decorator is required to identify it.
     *    More than one is an error.
     * 3. Otherwise - the model does not import `templatedata@1.0.0` at all,
     *    because it predates this convention or the namespace is simply not
     *    loaded - the legacy `@template` decorator, so those templates keep
     *    loading unchanged.
     *
     * @throws {Error} if no template model is found, multiple template models
     * are found, or the named template model is missing or not a template model
     * @returns {ClassDeclaration} the template model for the template
     */
    getTemplateModel() {
        const namedTemplateModel = this.getMetadata().getTemplateModelName();
        if (namedTemplateModel) {
            return this.getNamedTemplateModel(namedTemplateModel);
        }

        const templateModelNames = this.findConcreteSubclassNames(Template.TEMPLATE_DATA_TYPE);

        if (templateModelNames.length > 1) {
            throw new Error(`Found multiple concrete subtypes of ${Template.TEMPLATE_DATA_TYPE}: ${templateModelNames.join(', ')}. A template model must declare exactly one concrete subtype of TemplateData, or name its template model with "accordproject.templateModel" in package.json.`);
        }

        if (templateModelNames.length === 1) {
            return this.getModelManager().getType(templateModelNames[0]);
        }

        return templatemarkutil.findTemplateConcept(this.getIntrospector(), 'clause');
    }

    /**
     * Returns the template model named by `accordproject.templateModel` in
     * package.json, checking that it is one.
     * @param {string} name the fully-qualified name of the template model
     * @throws {Error} if the type is not found, or is not a concrete subtype of
     * TemplateData or a concrete type with the `@template` decorator
     * @returns {ClassDeclaration} the template model for the template
     * @private
     */
    getNamedTemplateModel(name) {
        let templateModel;
        try {
            templateModel = this.getModelManager().getType(name);
        } catch (err) {
            throw new Error(`The template model "${name}" named by accordproject.templateModel in package.json was not found in the template's model: ${err.message}`);
        }

        const isTemplateData = Template.instanceOf(templateModel, Template.TEMPLATE_DATA_TYPE);
        const isDecorated = !!templateModel.getDecorator('template');
        if (templateModel.isAbstract() || (!isTemplateData && !isDecorated)) {
            throw new Error(`The template model "${name}" named by accordproject.templateModel in package.json must be a concrete subtype of ${Template.TEMPLATE_DATA_TYPE}, or a concrete type with the @template decorator.`);
        }

        return templateModel;
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
        const content: any = {};
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

        const modelFiles = this.getModelManager().getModels();
        modelFiles.forEach((file) => {
            content.models[file.namespace] = this._normalize(file.content);
        });

        const scriptManager = this.getScriptManager();
        const scriptFiles = scriptManager.getScripts();
        scriptFiles.forEach((file) => {
            content.scripts[file.getIdentifier()] = this._normalize(file.contents);
        });

        const hasher = crypto.createHash('sha256');
        hasher.update(stringify(content));
        return hasher.digest('hex');
    }

    /**
     * verifies the signature stored in the template object using the template hash and timestamp
     */
    verifyTemplateSignature() {
        const templateHash = this.getHash();
        if (this.authorSignature === null) { throw new Error('The template is missing author signature!'); }
        const signature = this.authorSignature.templateSignature.signature;
        const timestamp = this.authorSignature.templateSignature.timestamp;
        const signatoryCert = this.authorSignature.templateSignature.signatoryCert;

        const certificateForge = forge.pki.certificateFromPem(signatoryCert);
        const publicKey: any = certificateForge.publicKey;
        const md = forge.md.sha256.create();
        md.update(templateHash + timestamp, 'utf8');
        let result;
        try {
            result = publicKey.verify(md.digest().bytes(), forge.util.hexToBytes(signature));
        } catch (e) {
            throw new Error('Template\'s author signature is invalid!');
        }
        if (!result) {
            throw new Error('Template\'s author signature is invalid!');
        }
    }

    /**
     * signs a string made up of template hash and time stamp using private key derived
     * from the keystore
     * @param {String} p12File - encoded string of p12 keystore file
     * @param {String} passphrase - passphrase for the keystore file
     * @param {Number} timestamp - timestamp of the moment of signature is done
     */
    signTemplate(p12File, passphrase, timestamp) {
        if (typeof(p12File) !== 'string')   { throw new Error('p12File should be of type String!'); }
        if (typeof(passphrase) !== 'string') { throw new Error('passphrase should be of type String!'); }
        if (typeof(timestamp) !== 'number')  { throw new Error('timestamp should be of type Number!'); }

        const templateHash = this.getHash();
        const p12Der  = forge.util.decode64(p12File);
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        const p12     = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);
        const certificateForge = p12.safeContents[0].safeBags[0].cert;
        const privateKeyForge  = p12.safeContents[1].safeBags[0].key;
        const certificatePem   = forge.pki.certificateToPem(certificateForge);

        const md = forge.md.sha256.create();
        md.update(templateHash + timestamp, 'utf8');
        const signature = forge.util.bytesToHex(privateKeyForge.sign(md));

        this.authorSignature = {
            templateSignature: {
                templateHash,
                timestamp,
                signatoryCert: certificatePem,
                signature,
            },
        };
    }

    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {string} [language] - target language for the archive
     * @param {Object} [options] - JSZip options and keystore object containing path and passphrase for the keystore
     * @return {Promise<Buffer>} the zlib buffer
     */
    async toArchive(language, options: any = {}) {
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
     * @remarks Node.js only — reads from the filesystem and is not available in the browser bundle.
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
     * @remarks Node.js only — fetches over the network and is not available in the browser bundle.
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
     * Includes the parameter by default if it is not abstract.
     *
     * A base type whose namespace the template does not load is not an error:
     * it simply contributes nothing. A template that declares no state, or
     * emits nothing, does not import the namespace that base type lives in.
     *
     * @param {String} type The fully-qualified type to search for
     * @param {boolean} excludeBaseType Exclude the base parameter type, even if it is concrete
     * @return {String[]} An array of fully-qualified types
     * @private
     */
    findConcreteSubclassNames(type, excludeBaseType = false) {
        let baseType;
        try {
            baseType = this.getModelManager().getType(type);
        } catch (err) {
            if (err.errorType === 'TypeNotFoundException') {
                return [];
            }
            throw err;
        }
        return baseType
            .getAssignableClassDeclarations()
            .filter(subclass => !subclass.isAbstract())
            .filter(subclass => !excludeBaseType || subclass.getFullyQualifiedName() !== type)
            .map(decl => decl.getFullyQualifiedName());
    }

    /**
     * Returns the concrete sub-classes of each of the given base types, in the
     * order the base types are given, without duplicates. Base types whose
     * namespace is not loaded contribute nothing.
     *
     * This is how the runtime type lookups report the 1.0 models and the
     * legacy `runtime@0.2.0` models side by side.
     *
     * @param {String[]} types The fully-qualified base types to search for
     * @param {boolean} excludeBaseType Exclude each base parameter type, even if it is concrete
     * @return {String[]} An array of fully-qualified types
     * @private
     */
    findConcreteSubclassNamesOfAny(types, excludeBaseType = false) {
        const names = types.flatMap(type => this.findConcreteSubclassNames(type, excludeBaseType));
        return Array.from(new Set(names));
    }

    /**
     * Provides a list of the input types that are accepted by this Template. Types use the fully-qualified form.
     * Includes the concrete subtypes of both {@link Template.REQUEST_TYPE} and
     * the legacy {@link Template.LEGACY_REQUEST_TYPE}, 1.0 types first.
     * @return {String[]} a list of the request types
     */
    getRequestTypes() {
        return this.findConcreteSubclassNamesOfAny([Template.REQUEST_TYPE, Template.LEGACY_REQUEST_TYPE]);
    }

    /**
     * Provides a list of the response types that are returned by this Template. Types use the fully-qualified form.
     * Includes the concrete subtypes of both {@link Template.RESPONSE_TYPE} and
     * the legacy {@link Template.LEGACY_RESPONSE_TYPE}, 1.0 types first.
     * @return {String[]} a list of the response types
     */
    getResponseTypes() {
        return this.findConcreteSubclassNamesOfAny([Template.RESPONSE_TYPE, Template.LEGACY_RESPONSE_TYPE]);
    }

    /**
     * Provides a list of the emit types that are emitted by this Template. Types use the fully-qualified form.
     * Includes the concrete subtypes of both {@link Template.EMIT_TYPE} and
     * the legacy {@link Template.LEGACY_EMIT_TYPE}, 1.0 types first.
     * @return {Array} a list of the emit types
     */
    getEmitTypes() {
        return this.findConcreteSubclassNamesOfAny([Template.EMIT_TYPE, Template.LEGACY_EMIT_TYPE]);
    }

    /**
     * Provides a list of the state types that are expected by this Template. Types use the fully-qualified form.
     * Includes the concrete subtypes of both {@link Template.STATE_TYPE} and
     * the legacy {@link Template.LEGACY_STATE_TYPE}, 1.0 types first. As
     * before 1.0, a legacy template's list includes the concrete base
     * `runtime@0.2.0.State` itself.
     * @return {String[]} a list of the state types
     */
    getStateTypes() {
        return this.findConcreteSubclassNamesOfAny([Template.STATE_TYPE, Template.LEGACY_STATE_TYPE]);
    }

    /**
     * Returns true if the template has logic, i.e. has more than one script file.
     * @return {boolean} true if the template has logic
     */
    hasLogic() {
        return this.getScriptManager().getScripts().length > 0;
    }

    /**
     * Returns true if the template declares one or more state types of its
     * own: a concrete subtype of {@link Template.STATE_TYPE}, or of the
     * legacy {@link Template.LEGACY_STATE_TYPE}. Neither base type counts:
     * `StateData` is abstract, and the legacy `State` is excluded explicitly
     * because it is a concrete asset.
     * @return {boolean} true if the template is stateful
     */
    isStateful() {
        return this.findConcreteSubclassNamesOfAny([Template.STATE_TYPE, Template.LEGACY_STATE_TYPE], true).length > 0;
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
