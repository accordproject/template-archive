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
 * The type name for an argument
 * @class
 * @memberof module:cicero-core
 */
class ArgumentType {

    /**
     * Create the argument type.
     * @param {string} name - The name of the type
     */
    constructor(name) {
        this.name = name;
    }

    /**
     * Returns the type name of the argument
     * @return {string} the type name of the argument
     */
    getName() {
        return this.name;
    }
}

module.exports = ArgumentType;
