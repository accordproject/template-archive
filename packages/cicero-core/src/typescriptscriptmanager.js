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
const ScriptManager = require('./scriptmanager');

/**
 * Manages a set of scripts.
 * @class
 * @memberof module:cicero-core
 */
class TypescriptScriptManager extends ScriptManager {

    /**
     * Create the TypescriptScriptManager.
     * @param {any} [options]  - arbitrary options associated with the script manager
     */
    constructor(options) {
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
        // TODO DCS - get the functions in the typescript source...
        return new Script(identifier, language, [], contents);
    }
}

module.exports = TypescriptScriptManager;
