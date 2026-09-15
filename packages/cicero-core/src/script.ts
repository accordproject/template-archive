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

import CiceroFunction from './function';

/**
 * <p>
 * An executable script.
 * </p>
 * @class
 * @memberof module:cicero-core
 */
export default class Script {
    private identifier: string;
    private language: string;
    private contents: string;
    private functions: CiceroFunction[];
    private types: string[];

    /**
     * Create the Script.
     * <p>
     * <strong>Note: only to be called by framework code.</strong>
     * </p>
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language of the script
     * @param {CiceroFunction[]} functions - the list of functions in the script
     * @param {string} contents - the contents of the script
     * @param {string[]} [types] - optional list of referenced types in the script
     */
    constructor(identifier: string, language: string, functions: CiceroFunction[], contents: string, types?: string[]) {
        this.identifier = identifier;
        this.language = language;
        this.functions = functions;
        this.contents = contents;
        this.types = types || [];
    }

    /**
     * Visitor design pattern
     * @param {Object} visitor - the visitor
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     */
    accept(visitor, parameters) {
        return visitor.visit(this, parameters);
    }

    /**
     * Returns the identifier of this script
     * @return {string} the identifier of this script
     */
    getIdentifier(): string {
        return this.identifier;
    }

    /**
     * Returns the functions in this script
     * @return {CiceroFunction[]} the functions in this script
     */
    getFunctions(): CiceroFunction[] {
        return this.functions;
    }

    /**
     * Returns the language of this script
     * @return {string} the language of this script
     */
    getLanguage(): string {
        return this.language;
    }

    /**
     * Returns the contents of this script
     * @return {string} the contents of this script
     */
    getContents(): string {
        return this.contents;
    }

    /**
     * Get the list of referenced types in the script
     * @return {string[]} the list of type names
     */
    getTypes(): string[] {
        return this.types;
    }

    /**
     * Check if the script references a given type
     * @param {string} typeName - the type name to check
     * @return {boolean} true if referenced
     */
    hasType(typeName: string): boolean {
        return this.types.includes(typeName);
    }
}