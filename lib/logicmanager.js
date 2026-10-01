"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const concerto_core_1 = require("@accordproject/concerto-core");
const javascriptscriptmanager_1 = __importDefault(require("./javascriptscriptmanager"));
const typescriptscriptmanager_1 = __importDefault(require("./typescriptscriptmanager"));
const languages_1 = __importDefault(require("./languages"));
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
    constructor(language, options, ...args) {
        if (languages_1.default.includes(language) === false) {
            throw new Error(`Unknown language ${language}`);
        }
        this.language = language;
        this.modelManager = new concerto_core_1.ModelManager(options);
        this.scriptManager = language === 'es6'
            ? new javascriptscriptmanager_1.default(this.language, this.modelManager, options)
            : new typescriptscriptmanager_1.default(this.language, this.modelManager, options);
        this.introspector = new concerto_core_1.Introspector(this.modelManager);
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
exports.default = LogicManager;
//# sourceMappingURL=logicmanager.js.map