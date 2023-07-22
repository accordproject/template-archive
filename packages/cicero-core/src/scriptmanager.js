/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Script = require('./script');

/**
 * <p>
 * Manages a set of scripts.
 * </p>
 * @private
 * @class
 * @memberof module:cicero-core
 */
class ScriptManager {

    /**
     * Create the ScriptManager.
     * <p>
     * <strong>Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link BusinessNetworkDefinition}</strong>
     * </p>
     * @param {ModelManager} modelManager - The ModelManager to use for this ScriptManager
     * @param {Object} options  - e.g., { warnings: true }
     */
    constructor(modelManager, options) {
        this.modelManager = modelManager;
        this.scripts = {};
        this.warnings = options && options.warnings || false;
        this.sourceTemplates = [];
    }

    /**
     * Creates a new Script from a string.
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     * @returns {Script} - the instantiated script
     */
    createScript(identifier, language, contents) {
        return new Script(this.modelManager, identifier, language, contents);
    }

    /**
     * Modify an existing Script from a string.
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     */
    modifyScript(identifier, language, contents) {
        this.updateScript(new Script(this.modelManager, identifier, language, contents));
    }

    /**
     * Adds a template file (as a string) to the ScriptManager.
     * @param {string} templateFile - The template file as a string
     * @param {string} fileName - an optional file name to associate with the template file
     */
    addTemplateFile(templateFile,fileName) {
        this.sourceTemplates.push({ 'name' : fileName, 'content': templateFile });
    }

    /**
     * Adds a Script to the ScriptManager
     * @param {Script} script - The script to add to the ScriptManager
     */
    addScript(script) {
        this.scripts[script.getIdentifier()] = script;
    }

    /**
     * Update an existing Script in the ScriptManager
     * @param {Script} script - The script to add to the ScriptManager
     */
    updateScript(script) {
        if (!this.scripts[script.getIdentifier()]) {
            throw new Error('Script file does not exist');
        }
        this.addScript(script);
    }

    /**
     * Remove the Script
     * @param {string} identifier - The identifier of the script to remove
     * delete.
     */
    deleteScript(identifier) {
        if (!this.scripts[identifier]) {
            throw new Error('Script file does not exist');
        }
        delete this.scripts[identifier];
    }

    /**
     * Get the array of Script instances
     * @return {Script[]} The Scripts registered
     * @private
     */
    getScripts() {
        let keys = Object.keys(this.scripts);
        let result = [];

        for(let n=0; n < keys.length;n++) {
            result.push(this.scripts[keys[n]]);
        }

        return result;
    }

    /**
     * Get the array of Script instances for the given language
     * @param {string} target - the target language
     * @return {Script[]} The Scripts registered
     * @private
     */
    getScriptsForTarget(target) {
        let keys = Object.keys(this.scripts);
        let result = [];

        for(let n=0; n < keys.length;n++) {
            if (this.scripts[keys[n]].getLanguage() === target)  {
                result.push(this.scripts[keys[n]]);
            }
        }
        return result;
    }

    /**
     * Remove all registered scripts
     */
    clearScripts() {
        this.scripts = {};
    }

    /**
     * Get the Script associated with an identifier
     * @param {string} identifier - the identifier of the Script
     * @return {Script} the Script
     * @private
     */
    getScript(identifier) {
        return this.scripts[identifier];
    }

    /**
     * Get the identifiers of all registered scripts
     * @return {string[]} The identifiers of all registered scripts
     */
    getScriptIdentifiers() {
        return Object.keys(this.scripts);
    }

    /**
     * Helper method to retrieve all function declarations
     * @returns {Array} a list of function declarations
     */
    allFunctionDeclarations() {
        let allScripts = this.getAllScripts();
        const functionDeclarations = allScripts
            .map((ele) => {
                return ele.getFunctionDeclarations();
            }).reduce((flat, next) => {
                return flat.concat(next);
            },[]);
        return functionDeclarations;
    }

    /**
     * Looks for the presence of a function in the JavaScript logic
     * @param {string} name  - the function name
     */
    hasFunctionDeclaration(name) {
        // get the function declarations of either init or dispatch
        const funDecls = this.allFunctionDeclarations();
        if (!funDecls.some((ele) => { return ele.getName() === name; })) {
            throw new Error(`Function ${name} was not found in logic`);
        }
    }
    /**
     * Checks that the logic has a dispatch function
     */
    hasDispatch() {
        this.hasFunctionDeclaration('__dispatch');
    }

    /**
     * Checks that the logic has an init function
     */
    hasInit() {
        this.hasFunctionDeclaration('__init');
    }

}

module.exports = ScriptManager;
