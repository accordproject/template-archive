import Script from './script';
import ScriptManager from './scriptmanager';
/**
 * Manages a set of scripts.
 * @class
 * @memberof module:cicero-core
 */
export default class JavascriptScriptManager extends ScriptManager {
    /**
     * Create the JavascriptScriptManager.
     * @param {any} [options]  - arbitrary options associated with the script manager
     */
    constructor(options?: any, ...args: any[]);
    /**
     * Creates a new Script
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     * @returns {Script} - the instantiated script
     */
    createScript(identifier: any, language: any, contents: any): Script;
}
