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

const CordaPlugin = require('./cordaplugin.js');
const JavaVisitor = require('@accordproject/concerto-tools').CodeGen.JavaVisitor;

/**
 * Convert the contents of a ModelManager to Java code for Corda.
 * Set a fileWriter property (instance of FileWriter) on the parameters
 * object to control where the generated code is written to disk.
 *
 * @private
 * @class
 * @memberof module:concerto-tools
 */
class CordaVisitor extends JavaVisitor {
    /**
     * Create the JavaVisitor.
     */
    constructor() {
        super();
        this.plugin = new CordaPlugin();
    }

}

module.exports = CordaVisitor;
