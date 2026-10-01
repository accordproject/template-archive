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
    static REQUEST_TYPE: string;
    /**
     * The base response type. A template declares its own response as a subtype.
     */
    static RESPONSE_TYPE: string;
    /**
     * The base emit type. runtime@1.0.0 does not define an obligation of its
     * own: obligations are durable state in their own namespace, so that
     * lifecycle is not coupled to the runtime API.
     */
    static EMIT_TYPE: string;
    /**
     * The base state type. It is abstract, and a template declares one
     * concrete subtype which the runtime carries in its state envelope
     * rather than subclassing the envelope itself.
     */
    static STATE_TYPE: string;
    /**
     * The base template data type. It is abstract, and a template's model
     * declares exactly one concrete subtype of it: that subtype is the
     * template model. Extending TemplateData is the declaration, so no
     * `@template` decorator is required to identify it.
     */
    static TEMPLATE_DATA_TYPE: string;
    /**
     * The legacy base request type, from `org.accordproject.runtime@0.2.0`.
     *
     * Templates written before the 1.0 models (for example most of
     * cicero-template-library) still declare their requests as subtypes of
     * this. Its concrete subtypes are reported alongside those of
     * {@link Template.REQUEST_TYPE}, so those templates keep working unchanged.
     */
    static LEGACY_REQUEST_TYPE: string;
    /**
     * The legacy base response type, from `org.accordproject.runtime@0.2.0`.
     * Its concrete subtypes are reported alongside those of
     * {@link Template.RESPONSE_TYPE}.
     */
    static LEGACY_RESPONSE_TYPE: string;
    /**
     * The legacy base emit type, from `org.accordproject.runtime@0.2.0`. It is
     * abstract. Its concrete subtypes are reported alongside those of
     * {@link Template.EMIT_TYPE}.
     */
    static LEGACY_EMIT_TYPE: string;
    /**
     * The legacy base state type, from `org.accordproject.runtime@0.2.0`.
     * Its concrete subtypes are reported alongside those of
     * {@link Template.STATE_TYPE}. Unlike `StateData` it is a concrete (empty)
     * asset, so {@link Template#isStateful} excludes it explicitly: a legacy
     * template is only stateful if it declares a subtype of its own.
     */
    static LEGACY_STATE_TYPE: string;
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
    constructor(packageJson: any, readme: any, samples: any, request: any, logo: any, options: any, authorSignature: any);
    /**
     * Sets the grammar for the template
     * @param {string} grammar the grammar for the template
     */
    setTemplate(grammar: any): void;
    /**
     * Get the grammar for the template
     * @returns {string} grammar the grammar for the template
     */
    getTemplate(): any;
    /**
     * Verifies that the template is well formed.
     * Throws an exception with the details of any validation errors.
     * @param {Object} options  - e.g., { offline: true }
     */
    validate(options?: any): void;
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
    getTemplateModel(): any;
    /**
     * Returns the template model named by `accordproject.templateModel` in
     * package.json, checking that it is one.
     * @param {string} name the fully-qualified name of the template model
     * @throws {Error} if the type is not found, or is not a concrete subtype of
     * TemplateData or a concrete type with the `@template` decorator
     * @returns {ClassDeclaration} the template model for the template
     * @private
     */
    getNamedTemplateModel(name: any): any;
    /**
     * Returns the identifier for this template
     * @return {String} the identifier of this template
     */
    getIdentifier(): any;
    /**
     * Returns the metadata for this template
     * @return {Metadata} the metadata for this template
     */
    getMetadata(): any;
    /**
     * Returns the name for this template
     * @return {String} the name of this template
     */
    getName(): any;
    /**
     * Returns the display name for this template.
     * @return {string} the display name of the template
     */
    getDisplayName(): any;
    /**
     * Returns the version for this template
     * @return {String} the version of this template. Use semver module
     * to parse.
     */
    getVersion(): any;
    /**
     * Returns the description for this template
     * @return {String} the description of this template
     */
    getDescription(): any;
    /**
     * Normalizes line endings to \n to ensure consistent hashing across OS
     * @param {string} str the string to normalize
     * @return {string} the normalized string
     * @private
     */
    _normalize(str: any): any;
    /**
     * Gets a content based SHA-256 hash for this template. Hash
     * is based on the metadata for the template plus the contents of
     * all the models and all the script files.
     * @return {string} the SHA-256 hash in hex format
     */
    getHash(): string;
    /**
     * verifies the signature stored in the template object using the template hash and timestamp
     */
    verifyTemplateSignature(): void;
    /**
     * signs a string made up of template hash and time stamp using private key derived
     * from the keystore
     * @param {String} p12File - encoded string of p12 keystore file
     * @param {String} passphrase - passphrase for the keystore file
     * @param {Number} timestamp - timestamp of the moment of signature is done
     */
    signTemplate(p12File: any, passphrase: any, timestamp: any): void;
    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {string} [language] - target language for the archive
     * @param {Object} [options] - JSZip options and keystore object containing path and passphrase for the keystore
     * @return {Promise<Buffer>} the zlib buffer
     */
    toArchive(language: any, options?: any): Promise<Buffer<ArrayBufferLike>>;
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
    static fromDirectory(path: any, options?: any): Promise<any>;
    /**
     * Create a template from an archive.
     * @param {Buffer} buffer  - the buffer to a Cicero Template Archive (cta) file
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise<Template>} a Promise to the template
     */
    static fromArchive(buffer: any, options?: any): Promise<any>;
    /**
     * Create a template from an URL.
     * @param {String} url  - the URL to a Cicero Template Archive (cta) file
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise} a Promise to the template
     * @remarks Node.js only — fetches over the network and is not available in the browser bundle.
     */
    static fromUrl(url: any, options?: any): Promise<any>;
    /**
     * Visitor design pattern
     * @param {Object} visitor - the visitor
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    accept(visitor: any, parameters: any): any;
    /**
     * Provides access to the template logic for this template.
     * The template logic encapsulate the code necessary to
     * execute the clause or contract.
     * @return {LogicManager} the LogicManager for this template
     */
    getLogicManager(): any;
    /**
     * Provides access to the Introspector for this template. The Introspector
     * is used to reflect on the types defined within this template.
     * @return {Introspector} the Introspector for this template
     */
    getIntrospector(): any;
    /**
     * Provides access to the Factory for this template. The Factory
     * is used to create the types defined in this template.
     * @return {Factory} the Factory for this template
     */
    getFactory(): any;
    /**
     * Provides access to the Serializer for this template. The Serializer
     * is used to serialize instances of the types defined within this template.
     * @return {Serializer} the Serializer for this template
     */
    getSerializer(): any;
    /**
     * Provides access to the ScriptManager for this template. The ScriptManager
     * manage access to the scripts that have been defined within this template.
     * @return {ScriptManager} the ScriptManager for this template
     */
    getScriptManager(): any;
    /**
     * Provides access to the ModelManager for this template. The ModelManager
     * manage access to the models that have been defined within this template.
     * @return {ModelManager} the ModelManager for this template
     */
    getModelManager(): any;
    /**
     * Set the samples within the Metadata
     * @param {object} samples the samples for the tempalte
     * @private
     */
    setSamples(samples: any): void;
    /**
     * Set a locale-specified sample within the Metadata
     * @param {object} sample the samples for the template
     * @param {string} locale the IETF Language Tag (BCP 47) for the language
     * @private
     */
    setSample(sample: any, locale: any): void;
    /**
     * Set the request within the Metadata
     * @param {object} request the samples for the template
     * @private
     */
    setRequest(request: any): void;
    /**
     * Set the readme file within the Metadata
     * @param {String} readme the readme in markdown for the template
     * @private
     */
    setReadme(readme: any): void;
    /**
     * Set the packageJson within the Metadata
     * @param {object} packageJson the JS object for package.json
     * @private
     */
    setPackageJson(packageJson: any): void;
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
    findConcreteSubclassNames(type: any, excludeBaseType?: boolean): any;
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
    findConcreteSubclassNamesOfAny(types: any, excludeBaseType?: boolean): unknown[];
    /**
     * Provides a list of the input types that are accepted by this Template. Types use the fully-qualified form.
     * Includes the concrete subtypes of both {@link Template.REQUEST_TYPE} and
     * the legacy {@link Template.LEGACY_REQUEST_TYPE}, 1.0 types first.
     * @return {String[]} a list of the request types
     */
    getRequestTypes(): unknown[];
    /**
     * Provides a list of the response types that are returned by this Template. Types use the fully-qualified form.
     * Includes the concrete subtypes of both {@link Template.RESPONSE_TYPE} and
     * the legacy {@link Template.LEGACY_RESPONSE_TYPE}, 1.0 types first.
     * @return {String[]} a list of the response types
     */
    getResponseTypes(): unknown[];
    /**
     * Provides a list of the emit types that are emitted by this Template. Types use the fully-qualified form.
     * Includes the concrete subtypes of both {@link Template.EMIT_TYPE} and
     * the legacy {@link Template.LEGACY_EMIT_TYPE}, 1.0 types first.
     * @return {Array} a list of the emit types
     */
    getEmitTypes(): unknown[];
    /**
     * Provides a list of the state types that are expected by this Template. Types use the fully-qualified form.
     * Includes the concrete subtypes of both {@link Template.STATE_TYPE} and
     * the legacy {@link Template.LEGACY_STATE_TYPE}, 1.0 types first. As
     * before 1.0, a legacy template's list includes the concrete base
     * `runtime@0.2.0.State` itself.
     * @return {String[]} a list of the state types
     */
    getStateTypes(): unknown[];
    /**
     * Returns true if the template has logic, i.e. has more than one script file.
     * @return {boolean} true if the template has logic
     */
    hasLogic(): boolean;
    /**
     * Returns true if the template declares one or more state types of its
     * own: a concrete subtype of {@link Template.STATE_TYPE}, or of the
     * legacy {@link Template.LEGACY_STATE_TYPE}. Neither base type counts:
     * `StateData` is abstract, and the legacy `State` is excluded explicitly
     * because it is a concrete asset.
     * @return {boolean} true if the template is stateful
     */
    isStateful(): boolean;
    /**
     * Check to see if a ClassDeclaration is an instance of the specified fully qualified
     * type name.
     * @internal
     * @param {ClassDeclaration} classDeclaration The class to test
     * @param {String} fqt The fully qualified type name.
     * @returns {boolean} True if classDeclaration an instance of the specified fully
     * qualified type name, false otherwise.
     */
    static instanceOf(classDeclaration: any, fqt: any): boolean;
}
