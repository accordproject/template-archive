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
 * A function that has a name and arguments.
 * @class
 * @memberof module:cicero-core
 */
class Function {

    /**
     * Create the Function.
     * <p>
     * @param {string} name - The name of the function
     * @param {Argument[]} args - The function arguments
     */
    constructor(name, args) {
        this.name = name;
        this.arguments = args;
    }

    /**
     * Returns the name of the function
     * @return {string} the name of the function
     */
    getName() {
        return this.name;
    }

    /**
     * Returns the arguments for a function
     * @return {Argument[]} the arguments for the function
     */
    getArguments() {
        return this.arguments;
    }
}

module.exports = Function;
