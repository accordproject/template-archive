export = ScriptManager;
/**
 * <p>
 * Manages a set of scripts.
 * </p>
 * @private
 * @class
 * @memberof module:cicero-core
 */
declare class ScriptManager {
    /**
     * Create the ScriptManager.
     * <p>
     * <strong>Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link BusinessNetworkDefinition}</strong>
     * </p>
     * @param {ModelManager} modelManager - The ModelManager to use for this ScriptManager
     * @param {Object} options  - e.g., { warnings: true }
     */
    constructor(modelManager: ModelManager, options: any);
    modelManager: ModelManager;
    scripts: {};
    warnings: any;
    sourceTemplates: any[];
    /**
     * Creates a new Script from a string.
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     * @returns {Script} - the instantiated script
     */
    createScript(identifier: string, language: string, contents: string): Script;
    /**
     * Modify an existing Script from a string.
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     */
    modifyScript(identifier: string, language: string, contents: string): void;
    /**
     * Adds a template file (as a string) to the ScriptManager.
     * @param {string} templateFile - The template file as a string
     * @param {string} fileName - an optional file name to associate with the template file
     */
    addTemplateFile(templateFile: string, fileName: string): void;
    /**
     * Adds a Script to the ScriptManager
     * @param {Script} script - The script to add to the ScriptManager
     */
    addScript(script: Script): void;
    /**
     * Update an existing Script in the ScriptManager
     * @param {Script} script - The script to add to the ScriptManager
     */
    updateScript(script: Script): void;
    /**
     * Remove the Script
     * @param {string} identifier - The identifier of the script to remove
     * delete.
     */
    deleteScript(identifier: string): void;
    /**
     * Get the array of Script instances
     * @return {Script[]} The Scripts registered
     * @private
     */
    private getScripts;
    /**
     * Get the array of Script instances for the given language
     * @param {string} target - the target language
     * @return {Script[]} The Scripts registered
     * @private
     */
    private getScriptsForTarget;
    /**
     * Remove all registered scripts
     */
    clearScripts(): void;
    /**
     * Get the Script associated with an identifier
     * @param {string} identifier - the identifier of the Script
     * @return {Script} the Script
     * @private
     */
    private getScript;
    /**
     * Get the identifiers of all registered scripts
     * @return {string[]} The identifiers of all registered scripts
     */
    getScriptIdentifiers(): string[];
    /**
     * Helper method to retrieve all function declarations
     * @returns {Array} a list of function declarations
     */
    allFunctionDeclarations(): any[];
    /**
     * Looks for the presence of a function in the JavaScript logic
     * @param {string} name  - the function name
     */
    hasFunctionDeclaration(name: string): void;
    /**
     * Checks that the logic has a dispatch function
     */
    hasDispatch(): void;
    /**
     * Checks that the logic has an init function
     */
    hasInit(): void;
}
import Script = require("./script");
