import Script from './script';
/**
 * Manages a set of scripts.
 * @class
 * @memberof module:cicero-core
 */
export default class ScriptManager {
    scripts: any;
    /**
     * Create the ScriptManager.
     * @param {any} [options]  - arbitrary options associated with the script manager
     */
    constructor(options: any);
    /**
     * Creates a new Script
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     * @returns {Script} - the instantiated script
     */
    createScript(identifier: any, language: any, contents: any): Script;
    /**
     * Modify an existing Script from a string.
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     */
    modifyScript(identifier: any, language: any, contents: any): void;
    /**
     * Adds a Script to the ScriptManager
     * @param {Script} script - The script to add to the ScriptManager
     */
    addScript(script: any): void;
    /**
     * Update an existing Script in the ScriptManager
     * @param {Script} script - The script to add to the ScriptManager
     */
    updateScript(script: any): void;
    /**
     * Remove the Script
     * @param {string} identifier - The identifier of the script to remove
     * delete.
     */
    deleteScript(identifier: any): void;
    /**
     * Get the array of Script instances
     * @return {Script[]} The Scripts registered
     */
    getScripts(): any[];
    /**
     * Get the array of Script instances for the given language
     * @param {string} language - the target language
     * @return {Script[]} The Scripts registered
     */
    getScriptsForTarget(language: any): any[];
    /**
     * Remove all registered scripts
     */
    clearScripts(): void;
    /**
     * Get the Script associated with an identifier
     * @param {string} identifier - the identifier of the Script
     * @return {Script} the Script
     */
    getScript(identifier: any): any;
    /**
     * Get the identifiers of all registered scripts
     * @return {string[]} The identifiers of all registered scripts
     */
    getScriptIdentifiers(): string[];
    /**
     * Helper method to retrieve all function declarations
     * @returns {Array} a list of function declarations
     */
    getFunctions(): any;
    /**
     * Looks for the presence of a function
     * @param {string} name  - the function name
     * @returns {boolean} true if the function is found, false otherwise
     */
    hasFunction(name: any): any;
    /**
     * Gets a function by name
     * @param {string} name  - the function name
     * @returns {Function} the function
     * @throws {Error} if the function is not found
     */
    getFunction(name: any): any;
}
