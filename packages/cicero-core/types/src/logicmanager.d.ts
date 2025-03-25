export = LogicManager;
/**
 * Packages the logic for a legal clause or contract template and a given target platform. This includes the model, Ergo logic and compiled version of that logic when required.
 * @class
 * @public
 * @abstract
 * @memberof module:cicero-core
 */
declare class LogicManager {
    /**
     * Create the LogicManager.
     * @param {Object} options  - e.g., { warnings: true }
     */
    constructor(options: any);
    contractName: any;
    modelManager: ModelManager;
    scriptManager: ScriptManager;
    introspector: Introspector;
    /**
     * Provides access to the Introspector for this TemplateLogic. The Introspector
     * is used to reflect on the types defined within this TemplateLogic.
     * @return {Introspector} the Introspector for this TemplateLogic
     */
    getIntrospector(): Introspector;
    /**
     * Provides access to the ScriptManager for this TemplateLogic. The ScriptManager
     * manage access to the scripts that have been defined within this TemplateLogic.
     * @return {ScriptManager} the ScriptManager for this TemplateLogic
     */
    getScriptManager(): ScriptManager;
    /**
     * Provides access to the ModelManager for this TemplateLogic. The ModelManager
     * manage access to the models that have been defined within this TemplateLogic.
     * @return {ModelManager} the ModelManager for this TemplateLogic
     */
    getModelManager(): ModelManager;
    /**
     * Adds a logic file (as a string) to the TemplateLogic.
     * @param {string} logicFile - The logic file as a string
     * @param {string} fileName - an optional file name to associate with the logic file
     */
    addLogicFile(logicFile: string, fileName: string): void;
    /**
     * Adds a template file (as a string) to the TemplateLogic.
     * @param {string} templateFile - The template file as a string
     * @param {string} fileName - an optional file name to associate with the template file
     */
    addTemplateFile(templateFile: string, fileName: string): void;
    /**
     * Update of a given logic file
     * @param {string} content - the logic content
     * @param {string} name - the logic name
     */
    updateLogic(content: string, name: string): void;
}
import { ModelManager } from "@accordproject/concerto-core";
import ScriptManager = require("./scriptmanager");
import { Introspector } from "@accordproject/concerto-core";
