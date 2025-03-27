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

const {Introspector, ModelManager} = require('@accordproject/concerto-core');
const JavascriptScriptManager = require('./javascriptscriptmanager');
const TypescriptScriptManager = require('./typescriptscriptmanager');
const LANGUAGES = require('./languages');

/**
 * LogicManager manages a set of scripts and associated models.
 * @class
 * @public
 * @abstract
 * @memberof module:cicero-core
 */
class LogicManager {

    /**
     * Create the LogicManager.
     * @param {string} language  the language for the logic manager, e.g. 'es6' or 'typescript'
     * @param {Object} [options]  - arbitrary options associated with the logic manager
     */
    constructor(language, options) {
        if(LANGUAGES.includes(language) === false) {
            throw new Error(`Unknown language ${language}`);
        }
        this.language = language;
        this.modelManager = new ModelManager(options);
        this.scriptManager = language === 'es6'
            ? new JavascriptScriptManager(this.language, this.modelManager, options)
            : new TypescriptScriptManager(this.language, this.modelManager, options);
        this.introspector = new Introspector(this.modelManager);
    }

    /**
     * Returns the language of the logic manager
     * @return {string} the language of the logic manager
     */
    getLanguage() {
        return this.language;
    }

    /**
     * Adds a logic file to the underlying script manager
     * @param {string} contents  the contents of the logic file
     * @param {string} identifier  the identifier of the logic file
     */
    addLogicFile(contents, identifier) {
        const script = this.scriptManager.createScript(identifier, this.language, contents);
        this.scriptManager.addScript(script);
    }

    /**
     * Provides access to the Introspector for the model manager
     * @return {Introspector} the Introspector for the model manager
     */
    getIntrospector() {
        return this.introspector;
    }

    /**
     * Provides access to the ScriptManager.
     * @return {ScriptManager} the ScriptManager
     */
    getScriptManager() {
        return this.scriptManager;
    }

    /**
     * Provides access to the ModelManager
     * @return {ModelManager} the ModelManager
     */
    getModelManager() {
        return this.modelManager;
    }
}

module.exports = LogicManager;
