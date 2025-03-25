export = Metadata;
/**
 * Defines the metadata for a Template, including the name, version, README markdown.
 * @class
 * @public
 */
declare class Metadata {
    /**
     * Check the buffer is a png file with the right size
     * @param {Buffer} buffer the buffer object
     */
    static checkImage(buffer: Buffer): void;
    /**
     * Checks if dimensions for the image are correct.
     * @param {Buffer} buffer the buffer object
     * @param {string} mimeType the mime type of the object
     */
    static checkImageDimensions(buffer: Buffer, mimeType: string): void;
    /**
     * Create the Metadata.
     * <p>
     * <strong>Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link Template}</strong>
     * </p>
     * @param {object} packageJson  - the JS object for package.json (required)
     * @param {String} readme  - the README.md for the template (may be null)
     * @param {object} samples - the sample markdown for the template in different locales,
     * @param {object} request - the JS object for the sample request
     * @param {Buffer} logo - the bytes data for the image
     * represented as an object whose keys are the locales and whose values are the sample markdown.
     * For example:
     *  {
     *      default: 'default sample markdown',
     *      en: 'sample text in english',
     *      fr: 'exemple de texte français'
     *  }
     * Locale keys (with the exception of default) conform to the IETF Language Tag specification (BCP 47).
     * THe `default` key represents sample template text in a non-specified language, stored in a file called `sample.md`.
     */
    constructor(packageJson: object, readme: string, samples: object, request: object, logo: Buffer);
    runtime: any;
    ciceroVersion: any;
    logo: Buffer;
    packageJson: any;
    readme: string;
    samples: any;
    request: any;
    type: number;
    /**
     * check to see if it is a valid name. for some reason regex is not working when this executes
     * inside the chaincode runtime, which is why regex hasn't been used.
     *
     * @param {string} name the template name to check
     * @returns {boolean} true if valid, false otherwise
     *
     * @private
     */
    private _validName;
    /**
     * Returns either a 0 (for a contract template), or 1 (for a clause template)
     * @returns {number} the template type
     */
    getTemplateType(): number;
    /**
     * Returns the logo at the root of the template
     * @returns {Buffer} the bytes data of logo
     */
    getLogo(): Buffer;
    /**
     * Returns the author for this template.
     * @return {*} the author information
     */
    getAuthor(): any;
    /**
     * Returns the name of the runtime target for this template, or null if this template
     * has not been compiled for a specific runtime.
     * @returns {string} the name of the runtime
     */
    getRuntime(): string;
    /**
     * Returns the version of Cicero that this template is compatible with.
     * i.e. which version of the runtime was this template built for?
     * The version string conforms to the semver definition
     * @returns {string} the semantic version
     */
    getCiceroVersion(): string;
    /**
     * Only returns true if the current cicero version satisfies the target version of this template
     * @param {string} version the cicero version to check against
     * @returns {string} the semantic version
     */
    satisfiesCiceroVersion(version: string): string;
    /**
     * Returns the samples for this template.
     * @return {object} the sample files for the template
     */
    getSamples(): object;
    /**
     * Returns the sample request for this template.
     * @return {object} the sample request for the template
     */
    getRequest(): object;
    /**
     * Returns the sample for this template in the given locale. This may be null.
     * If no locale is specified returns the default sample if it has been specified.
     *
     * @param {string} locale the IETF language code for the language.
     * @return {string} the sample file for the template in the given locale or null
     */
    getSample(locale?: string): string;
    /**
     * Returns the README.md for this template. This may be null if the template does not have a README.md
     * @return {String} the README.md file for the template or null
     */
    getREADME(): string;
    /**
     * Returns the package.json for this template.
     * @return {object} the Javascript object for package.json
     */
    getPackageJson(): object;
    /**
     * Returns the name for this template.
     * @return {string} the name of the template
     */
    getName(): string;
    /**
     * Returns the display name for this template.
     * @return {string} the display name of the template
     */
    getDisplayName(): string;
    /**
     * Returns the keywords for this template.
     * @return {Array} the keywords of the template
     */
    getKeywords(): any[];
    /**
     * Returns the description for this template.
     * @return {string} the description of the template
     */
    getDescription(): string;
    /**
     * Returns the version for this template.
     * @return {string} the description of the template
     */
    getVersion(): string;
    /**
     * Returns the identifier for this template, formed from name@version.
     * @return {string} the identifier of the template
     */
    getIdentifier(): string;
    /**
     * Return new Metadata for a target runtime
     * @param {string} runtimeName - the target runtime name
     * @return {object} the new Metadata
     */
    createTargetMetadata(runtimeName: string): object;
    /**
     * Return the whole metadata content, for hashing
     * @return {object} the content of the metadata object
     */
    toJSON(): object;
}
