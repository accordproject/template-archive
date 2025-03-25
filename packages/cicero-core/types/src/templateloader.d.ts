export = TemplateLoader;
/**
 * A utility class to create templates from data sources.
 * @class
 * @private
 * @abstract
 */
declare class TemplateLoader {
    /**
     * Create a template from an archive.
     * @param {*} Template - the type to construct
     * @param {Buffer} buffer  - the buffer to a Cicero Template Archive (cta) file
     * @param {object} options - additional options
     * @return {Promise<Template>} a Promise to the template
     */
    static fromArchive(Template: any, buffer: Buffer, options: object): Promise<any>;
    /**
     * Create a template from an URL.
     * @param {*} Template - the type to construct
     * @param {String} url  - the URL to a Cicero Template Archive (cta) file
     * @param {object} options - additional options
     * @return {Promise} a Promise to the template
     */
    static fromUrl(Template: any, url: string, options: object): Promise<any>;
    /**
     * Builds a Template from the contents of a directory.
     * The directory must include a package.json in the root (used to specify
     * the name, version and description of the template).
     *
     * @param {*} Template - the type to construct
     * @param {String} path to a local directory
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise<Template>} a Promise to the instantiated template
     */
    static fromDirectory(Template: any, path: string, options?: any): Promise<any>;
    /**
     * Prepare the text for parsing (normalizes new lines, etc)
     * @param {string} input - the text for the clause
     * @return {string} - the normalized text for the clause
     */
    static normalizeText(input: string): string;
    /**
     * Loads a required file from the zip, displaying an error if missing
     * @internal
     * @param {*} zip the JSZip instance
     * @param {string} path the file path within the zip
     * @param {boolean} json if true the file is converted to a JS Object using JSON.parse
     * @param {boolean} required whether the file is required
     * @return {Promise<string>} a promise to the contents of the zip file or null if it does not exist and
     * required is false
     */
    static loadZipFileContents(zip: any, path: string, json?: boolean, required?: boolean): Promise<string>;
    /**
     * Loads the contents of all files in the zip that match a regex
     * @internal
     * @param {*} zip the JSZip instance
     * @param {RegExp} regex the regex to use to match files
     * @return {Promise<object[]>} a promise to an array of objects with the name and contents of the zip files
     */
    static loadZipFilesContents(zip: any, regex: RegExp): Promise<object[]>;
    /**
     * Loads a required buffer of a file from the zip, displaying an error if missing
     * @internal
     * @param {*} zip the JSZip instance
     * @param {string} path the file path within the zip
     * @param {boolean} required whether the file is required
     * @return {Promise<Buffer>} a promise to the Buffer of the zip file or null if it does not exist and
     * required is false
     */
    static loadZipFileBuffer(zip: any, path: string, required?: boolean): Promise<Buffer>;
    /**
     * Loads a required file from a directory, displaying an error if missing
     * @internal
     * @param {*} path the root path
     * @param {string} fileName the relative file name
     * @param {boolean} json if true the file is converted to a JS Object using JSON.parse
     * @param {boolean} required whether the file is required
     * @return {Promise<string>} a promise to the contents of the file or null if it does not exist and
     * required is false
     */
    static loadFileContents(path: any, fileName: string, json?: boolean, required?: boolean): Promise<string>;
    /**
     * Loads a file as buffer from a directory, displaying an error if missing
     * @internal
     * @param {*} path the root path
     * @param {string} fileName the relative file name
     * @param {boolean} required whether the file is required
     * @return {Promise<Buffer>} a promise to the buffer of the file or null if
     * it does not exist and required is false
     */
    static loadFileBuffer(path: any, fileName: string, required?: boolean): Promise<Buffer>;
    /**
     * Loads the contents of all files under a path that match a regex
     * Note that any directories called node_modules are ignored.
     * @internal
     * @param {*} path the file path
     * @param {RegExp} regex the regex to match files
     * @return {Promise<object[]>} a promise to an array of objects with the name and contents of the files
     */
    static loadFilesContents(path: any, regex: RegExp): Promise<object[]>;
    /**
     * Normalizes new lines
     * @param {string} input - the text
     * @return {string} - the normalized text
     */
    static normalizeNLs(input: string): string;
}
