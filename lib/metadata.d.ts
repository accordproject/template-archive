/**
 * Defines the metadata for a Template, including the name, version, README markdown.
 * @class
 * @public
 */
export default class Metadata {
    runtime: any;
    ciceroVersion: any;
    templateModelName: string | undefined;
    logo: any;
    packageJson: any;
    readme: any;
    samples: any;
    request: any;
    sampleData: any;
    type: any;
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
    constructor(packageJson: any, readme: any, samples: any, request: any, logo: any);
    /**
     * check to see if it is a valid name. for some reason regex is not working when this executes
     * inside the chaincode runtime, which is why regex hasn't been used.
     *
     * @param {string} name the template name to check
     * @returns {boolean} true if valid, false otherwise
     *
     * @private
     */
    _validName(name: any): boolean;
    /**
     * Returns either a 0 (for a contract template), or 1 (for a clause template)
     * @returns {number} the template type
     */
    getTemplateType(): any;
    /**
     * Returns the logo at the root of the template
     * @returns {Buffer} the bytes data of logo
     */
    getLogo(): any;
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
    getRuntime(): any;
    /**
     * Returns the fully-qualified name of the template model, as named by
     * `accordproject.templateModel` in package.json. A template only needs to
     * name it when its model declares more than one concrete subtype of
     * `org.accordproject.templatedata@1.0.0.TemplateData`, for example
     * because it carries copies of the models of the templates it composes.
     * @returns {string|undefined} the fully-qualified name of the template
     * model, or undefined if package.json does not name one
     */
    getTemplateModelName(): string;
    /**
     * Returns the version of Cicero that this template is compatible with.
     * i.e. which version of the runtime was this template built for?
     * The version string conforms to the semver definition
     * @returns {string} the semantic version
     */
    getCiceroVersion(): any;
    /**
     * Only returns true if the current cicero version satisfies the target version of this template
     * @param {string} version the cicero version to check against
     * @returns {string} the semantic version
     */
    satisfiesCiceroVersion(version: any): boolean;
    /**
     * Returns the samples for this template.
     * @return {object} the sample files for the template
     */
    getSamples(): any;
    /**
     * Returns the sample request for this template.
     * @return {object} the sample request for the template
     */
    getRequest(): any;
    /**
     * Returns the sample data for this template.
     * @return {object} the sample data (from sample.json) or null
     */
    getSampleData(): any;
    /**
     * Sets the sample data for this template.
     * @param {object} sampleData - the JS object from sample.json
     */
    setSampleData(sampleData: any): void;
    /**
     * Returns the sample for this template in the given locale. This may be null.
     * If no locale is specified returns the default sample if it has been specified.
     *
     * @param {string} locale the IETF language code for the language.
     * @return {string} the sample file for the template in the given locale or null
     */
    getSample(locale?: any): any;
    /**
     * Returns the README.md for this template. This may be null if the template does not have a README.md
     * @return {String} the README.md file for the template or null
     */
    getREADME(): any;
    /**
     * Returns the package.json for this template.
     * @return {object} the Javascript object for package.json
     */
    getPackageJson(): any;
    /**
     * Returns the name for this template.
     * @return {string} the name of the template
     */
    getName(): any;
    /**
     * Returns the display name for this template.
     * @return {string} the display name of the template
     */
    getDisplayName(): any;
    /**
     * Returns the keywords for this template.
     * @return {Array} the keywords of the template
     */
    getKeywords(): any;
    /**
     * Returns the description for this template.
     * @return {string} the description of the template
     */
    getDescription(): any;
    /**
     * Returns the version for this template.
     * @return {string} the description of the template
     */
    getVersion(): any;
    /**
     * Returns the identifier for this template, formed from name@version.
     * @return {string} the identifier of the template
     */
    getIdentifier(): string;
    /**
     * Check the buffer is a png file with the right size
     * @param {Buffer} buffer the buffer object
     */
    static checkImage(buffer: any): void;
    /**
     * Checks if dimensions for the image are correct.
     * @param {Buffer} buffer the buffer object
     * @param {string} mimeType the mime type of the object
     */
    static checkImageDimensions(buffer: any, mimeType: any): void;
    /**
     * Return new Metadata for a target runtime
     * @param {string} runtimeName - the target runtime name
     * @return {object} the new Metadata
     */
    createTargetMetadata(runtimeName: any): Metadata;
    /**
     * Return the whole metadata content, for hashing
     * @return {object} the content of the metadata object
     */
    toJSON(): {
        packageJson: any;
        readme: any;
        samples: any;
        request: any;
        sampleData: any;
        logo: any;
    };
}
