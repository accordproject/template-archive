export = Template;
/**
 * A template for a legal clause or contract. A Template has a template model request/response transaction types,
 * and a template grammar (natural language for the template).
 * @class
 * @public
 * @abstract
 */
declare class Template {
    /**
     * Builds a Template from the contents of a directory.
     * The directory must include a package.json in the root (used to specify
     * the name, version and description of the template).
     *
     * @param {String} path to a local directory
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise<Template>} a Promise to the instantiated template
     */
    static fromDirectory(path: string, options?: any): Promise<Template>;
    /**
     * Create a template from an archive.
     * @param {Buffer} buffer  - the buffer to a Cicero Template Archive (cta) file
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise<Template>} a Promise to the template
     */
    static fromArchive(buffer: Buffer, options?: any): Promise<Template>;
    /**
     * Create a template from an URL.
     * @param {String} url  - the URL to a Cicero Template Archive (cta) file
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise} a Promise to the template
     */
    static fromUrl(url: string, options?: any): Promise<any>;
    /**
     * Check to see if a ClassDeclaration is an instance of the specified fully qualified
     * type name.
     * @internal
     * @param {ClassDeclaration} classDeclaration The class to test
     * @param {String} fqt The fully qualified type name.
     * @returns {boolean} True if classDeclaration an instance of the specified fully
     * qualified type name, false otherwise.
     */
    static instanceOf(classDeclaration: ClassDeclaration, fqt: string): boolean;
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
    constructor(packageJson: object, readme: string, samples: object, request: object, logo: Buffer, options: any, authorSignature: any);
    metadata: Metadata;
    logicManager: LogicManager;
    authorSignature: any;
    template: string;
    /**
     * Sets the grammar for the template
     * @param {string} grammar the grammar for the template
     */
    setTemplate(grammar: string): void;
    /**
     * Get the grammar for the template
     * @returns {string} grammar the grammar for the template
     */
    getTemplate(): string;
    /**
     * Verifies that the template is well formed.
     * Throws an exception with the details of any validation errors.
     * @param {Object} options  - e.g., { offline: true }
     */
    validate(options?: any): void;
    /**
     * Returns the template model for the template
     * @throws {Error} if no template model is found, or multiple template models are found
     * @returns {ClassDeclaration} the template model for the template
     */
    getTemplateModel(): ClassDeclaration;
    /**
     * Returns the identifier for this template
     * @return {String} the identifier of this template
     */
    getIdentifier(): string;
    /**
     * Returns the metadata for this template
     * @return {Metadata} the metadata for this template
     */
    getMetadata(): Metadata;
    /**
     * Returns the name for this template
     * @return {String} the name of this template
     */
    getName(): string;
    /**
     * Returns the display name for this template.
     * @return {string} the display name of the template
     */
    getDisplayName(): string;
    /**
     * Returns the version for this template
     * @return {String} the version of this template. Use semver module
     * to parse.
     */
    getVersion(): string;
    /**
     * Returns the description for this template
     * @return {String} the description of this template
     */
    getDescription(): string;
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
    signTemplate(p12File: string, passphrase: string, timestamp: number): void;
    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {string} [language] - target language for the archive
     * @param {Object} [options] - JSZip options and keystore object containing path and passphrase for the keystore
     * @return {Promise<Buffer>} the zlib buffer
     */
    toArchive(language?: string, options?: any): Promise<Buffer>;
    /**
     * Visitor design pattern
     * @param {Object} visitor - the visitor
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    private accept;
    /**
     * Provides access to the template logic for this template.
     * The template logic encapsulate the code necessary to
     * execute the clause or contract.
     * @return {LogicManager} the LogicManager for this template
     */
    getLogicManager(): LogicManager;
    /**
     * Provides access to the Introspector for this template. The Introspector
     * is used to reflect on the types defined within this template.
     * @return {Introspector} the Introspector for this template
     */
    getIntrospector(): Introspector;
    /**
     * Provides access to the Factory for this template. The Factory
     * is used to create the types defined in this template.
     * @return {Factory} the Factory for this template
     */
    getFactory(): Factory;
    /**
     * Provides access to the Serializer for this template. The Serializer
     * is used to serialize instances of the types defined within this template.
     * @return {Serializer} the Serializer for this template
     */
    getSerializer(): Serializer;
    /**
     * Provides access to the ScriptManager for this template. The ScriptManager
     * manage access to the scripts that have been defined within this template.
     * @return {ScriptManager} the ScriptManager for this template
     * @private
     */
    private getScriptManager;
    /**
     * Provides access to the ModelManager for this template. The ModelManager
     * manage access to the models that have been defined within this template.
     * @return {ModelManager} the ModelManager for this template
     * @private
     */
    private getModelManager;
    /**
     * Set the samples within the Metadata
     * @param {object} samples the samples for the tempalte
     * @private
     */
    private setSamples;
    /**
     * Set a locale-specified sample within the Metadata
     * @param {object} sample the samples for the template
     * @param {string} locale the IETF Language Tag (BCP 47) for the language
     * @private
     */
    private setSample;
    /**
     * Set the request within the Metadata
     * @param {object} request the samples for the template
     * @private
     */
    private setRequest;
    /**
     * Set the readme file within the Metadata
     * @param {String} readme the readme in markdown for the template
     * @private
     */
    private setReadme;
    /**
     * Set the packageJson within the Metadata
     * @param {object} packageJson the JS object for package.json
     * @private
     */
    private setPackageJson;
    /**
     * Returns a list of a fully-qualified types that are concrete sub-classes of the parameter.
     * Includes the parameter if it is not abstract.
     * @param {String} type The fully-qualified type to search for
     * @return {String[]} An array of fully-qualified types
     * @private
     */
    private findConcreteSubclassNames;
    /**
     * Provides a list of the input types that are accepted by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the request types
     */
    getRequestTypes(): any[];
    /**
     * Provides a list of the response types that are returned by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the response types
     */
    getResponseTypes(): any[];
    /**
     * Provides a list of the emit types that are emitted by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the emit types
     */
    getEmitTypes(): any[];
    /**
     * Provides a list of the state types that are expected by this Template. Types use the fully-qualified form.
     * @return {Array} a list of the state types
     */
    getStateTypes(): any[];
    /**
     * Returns true if the template has logic, i.e. has more than one script file.
     * @return {boolean} true if the template has logic
     */
    hasLogic(): boolean;
}
import Metadata = require("./metadata");
import LogicManager = require("./logicmanager");
