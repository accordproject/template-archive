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
const script_1 = __importDefault(require("./script"));
const scriptmanager_1 = __importDefault(require("./scriptmanager"));
/**
 * Manages a set of scripts.
 * @class
 * @memberof module:cicero-core
 */
class JavascriptScriptManager extends scriptmanager_1.default {
    /**
     * Create the JavascriptScriptManager.
     * @param {any} [options]  - arbitrary options associated with the script manager
     */
    constructor(options, ...args) {
        super(options);
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
        // TODO DCS - get the functions in the js source...
        return new script_1.default(identifier, language, [], contents);
    }
}
exports.default = JavascriptScriptManager;
//# sourceMappingURL=javascriptscriptmanager.js.map