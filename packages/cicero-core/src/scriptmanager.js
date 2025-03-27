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
 * Manages a set of scripts.
 * @class
 * @memberof module:cicero-core
 */
class ScriptManager {

    /**
     * Create the ScriptManager.
     * @param {any} [options]  - arbitrary options associated with the script manager
     */
    constructor(options) {
        this.scripts = {};
    }

    /**
     * Creates a new Script
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     * @returns {Script} - the instantiated script
     */
    createScript(identifier, language, contents) {
        return new Script(identifier, language, [], contents);
    }

    /**
     * Modify an existing Script from a string.
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     */
    modifyScript(identifier, language, contents) {
        this.updateScript(this.createScript(identifier, language, contents));
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
     * @param {string} language - the target language
     * @return {Script[]} The Scripts registered
     * @private
     */
    getScriptsForTarget(language) {
        let keys = Object.keys(this.scripts);
        let result = [];

        for(let n=0; n < keys.length;n++) {
            if (this.scripts[keys[n]].getLanguage() === language)  {
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
    getFunctions() {
        let allScripts = this.getAllScripts();
        const functionDeclarations = allScripts
            .map((ele) => {
                return ele.getFunctions();
            }).reduce((flat, next) => {
                return flat.concat(next);
            },[]);
        return functionDeclarations;
    }

    /**
     * Looks for the presence of a function
     * @param {string} name  - the function name
     * @returns {boolean} true if the function is found, false otherwise
     */
    hasFunction(name) {
        return this.getFunctions().some((ele) => { return ele.getName() === name; });
    }

    /**
     * Gets a function by name
     * @param {string} name  - the function name
     * @returns {Function} the function
     * @throws {Error} if the function is not found
     */
    getFunction(name) {
        const funDecls = this.getFunctions();
        const found = funDecls.find((ele) => { return ele.getName() === name; });
        if (!found) {
            throw new Error(`Function ${name} was not found`);
        }
        return found;
    }
}

module.exports = ScriptManager;
