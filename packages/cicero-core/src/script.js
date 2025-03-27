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

/**
 * A script that has an identifier, language and contents.
 * @class
 * @memberof module:cicero-core
 */
class Script {

    /**
     * Create the Script.
     * <p>
     * @param {string} identifier - The identifier of the script
     * @param {string} language - The language type of the script
     * @param {Function[]} functions - The functions in the script
     * @param {string} contents - The contents of the script
     */
    constructor(identifier, language, functions, contents) {
        this.identifier = identifier;
        this.language = language;
        this.contents = contents;
        this.functions = functions;

        if(!contents) {
            throw new Error('Empty script contents');
        }
    }

    /**
     * Returns the identifier of the script
     * @return {string} the identifier of the script
     */
    getIdentifier() {
        return this.identifier;
    }

    /**
     * Returns the language of the script
     * @return {string} the language of the script
     */
    getLanguage() {
        return this.language;
    }

    /**
     * Returns the contents of the script
     * @return {string} the content of the script
     */
    getContents() {
        return this.contents;
    }

    /**
     * Returns the function declarations for a script, if any
     * @returns {Function[]} the function declarations
     */
    getFunctions() {
        return this.functions;
    }
}

module.exports = Script;
