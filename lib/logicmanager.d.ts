/**
 * LogicManager manages a set of scripts and associated models.
 * @class
 * @public
 * @abstract
 * @memberof module:cicero-core
 */
export default class LogicManager {
    language: any;
    modelManager: any;
    scriptManager: any;
    introspector: any;
    /**
     * Create the LogicManager.
     * @param {string} language  the language for the logic manager, e.g. 'es6' or 'typescript'
     * @param {Object} [options]  - arbitrary options associated with the logic manager
     */
    constructor(language: any, options?: any, ...args: any[]);
    /**
     * Returns the language of the logic manager
     * @return {string} the language of the logic manager
     */
    getLanguage(): any;
    /**
     * Adds a logic file to the underlying script manager
     * @param {string} contents  the contents of the logic file
     * @param {string} identifier  the identifier of the logic file
     */
    addLogicFile(contents: any, identifier: any): void;
    /**
     * Provides access to the Introspector for the model manager
     * @return {Introspector} the Introspector for the model manager
     */
    getIntrospector(): any;
    /**
     * Provides access to the ScriptManager.
     * @return {ScriptManager} the ScriptManager
     */
    getScriptManager(): any;
    /**
     * Provides access to the ModelManager
     * @return {ModelManager} the ModelManager
     */
    getModelManager(): any;
}
