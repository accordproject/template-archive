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
 * An argument has a name and type.
 * @class
 * @memberof module:cicero-core
 */
class Argument {

    /**
     * Create the Function.
     * <p>
     * @param {string} name - The name of the function
     * @param {ArgumentType} type - The argument type
     */
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }

    /**
     * Returns the name of the argument
     * @return {string} the name of the argument
     */
    getName() {
        return this.name;
    }

    /**
     * Returns the type of the argument
     * @return {Argument} the type of the argument
     */
    getType() {
        return this.type;
    }
}

module.exports = Argument;
