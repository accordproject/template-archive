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
const Ergo = require('@accordproject/ergo-compiler/lib/ergo');

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
     */
    constructor(modelManager) {
        this.modelManager = modelManager;
        this.scripts = {};
        this.compiledScript = null;
    }
    /**
     * Visitor design pattern
     * @param {Object} visitor - the visitor
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    accept(visitor,parameters) {
        return visitor.visit(this, parameters);
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
        // Re-compile Ergo
        this.compileLogic();
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
     * Get the array of all Script instances, including compiled ones
     * @return {Script[]} The Scripts registered, including compiled ones
     * @private
     */
    getAllScripts() {
        let result = this.getScripts();
        if (this.compiledScript !== null) {
            result.push(this.compiledScript);
        }
        return result;
    }

    /**
     * Get the array of Script instances for the given language
     * @param {string} language - The scripts' language
     * @return {Script[]} The Scripts registered
     * @private
     */
    getScriptsForLanguage(language) {
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
     * Gets all the Ergo logic
     * @return {Array<{name:string, content:string}>} the name and content of each Ergo file
     */
    getLogic() {
        let logic = [];
        const scripts = this.getScriptsForLanguage('.ergo');
        scripts.forEach(function (script) {
            logic.push({ 'name' : script.getName(), 'content' : script.getContents() });
        });
        return logic;
    }

    /**
     * Remove all registered Composer files
     */
    clearScripts() {
        this.scripts = {};
        this.compiledScript = null;
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
     * Get the Script associated with an identifier
     * @param {string} identifier - the identifier of the Script
     * @return {Script} the Script
     * @private
     */
    getCompiledScript() {
        if (!this.compiledScript) {
            this.compileLogic();
        }
        return this.compiledScript;
    }

    /**
     * Get the identifiers of all registered scripts
     * @return {string[]} The identifiers of all registered scripts
     */
    getScriptIdentifiers() {
        return Object.keys(this.scripts);
    }

    /**
     * Compile the Ergo logic
     * @return {object} The script compiled to JavaScript
     */
    compileLogic() {
        let sourceErgo = this.getLogic();
        if (sourceErgo === undefined || sourceErgo.length === 0) {
            return null;
        }
        const compiledErgo = Ergo.compileToJavaScript(sourceErgo,this.modelManager.getModels(),'cicero',true);
        //console.log('compiling' + this.contents);
        if (compiledErgo.hasOwnProperty('error')) {
            throw new Error(Ergo.ergoVerboseErrorToString(compiledErgo.error));
        }
        this.compiledScript = new Script(this.modelManager, 'main.js', '.js', compiledErgo.success);
        return this.compiledScript;
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
            },[]).filter((ele) => {
                return ele.getDecorators().indexOf('AccordClauseLogic') >= 0 || ele.getDecorators().indexOf('AccordClauseLogicInit') >= 0;
            }).map((ele) => {
                return ele;
            });
        return functionDeclarations;
    }
}

module.exports = ScriptManager;
