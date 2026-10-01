/**
 * A script that has an identifier, language and contents.
 * @class
 * @memberof module:cicero-core
 */
export default class Script {
    identifier: any;
    language: any;
    contents: any;
    functions: any;
    /**
     * Create the Script.
     * <p>
     * @param {string} identifier - The identifier of the script
     * @param {string} language - The language type of the script
     * @param {Function[]} functions - The functions in the script
     * @param {string} contents - The contents of the script
     */
    constructor(identifier: any, language: any, functions: any, contents: any);
    /**
     * Returns the identifier of the script
     * @return {string} the identifier of the script
     */
    getIdentifier(): any;
    /**
     * Returns the language of the script
     * @return {string} the language of the script
     */
    getLanguage(): any;
    /**
     * Returns the contents of the script
     * @return {string} the content of the script
     */
    getContents(): any;
    /**
     * Returns the function declarations for a script, if any
     * @returns {Function[]} the function declarations
     */
    getFunctions(): any;
}
