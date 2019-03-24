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

const ErgoEngine = require('@accordproject/ergo-engine').Engine;

/**
 * <p>
 * Engine class. Stateless execution of clauses against a request object, returning a response to the caller.
 * </p>
 * @class
 * @public
 * @memberof module:cicero-engine
 */
class Engine {

    /**
     * Create the Engine.
     */
    constructor() {
        this.ergoEngine = new ErgoEngine();
    }

    /**
     * Execute a clause, passing in the request object
     * @param {Clause} clause  - the clause to execute
     * @param {object} request  - the request, a JS object that can be deserialized
     * using the Composer serializer.
     * @param {object} state  - the contract state, a JS object that can be deserialized
     * using the Composer serializer.
     * @param {string} currentTime - the definition of 'now'
     * @return {Promise} a promise that resolves to a result for the clause
     * @private
     */
    async execute(clause, request, state, currentTime) {
        const templateLogic = clause.getTemplateLogic();
        const clauseId = clause.getIdentifier();
        const contract = clause.getData();

        return this.ergoEngine.execute(templateLogic,clauseId,contract,request,state,currentTime);
    }

    /**
     * Initialize a clause
     * @param {Clause} clause  - the clause to execute
     * @param {string} currentTime - the definition of 'now'
     * @return {Promise} a promise that resolves to a result for the clause initialization
     * @private
     */
    async init(clause, currentTime) {
        const templateLogic = clause.getTemplateLogic();
        const clauseId = clause.getIdentifier();
        const contract = clause.getData();

        return this.ergoEngine.init(templateLogic,clauseId,contract,currentTime);
    }

    /**
     * Provides access to the Ergo engine.
     * @return {ErgoEngine} the underlying Ergo Engine
     */
    getErgoEngine() {
        return this.ergoEngine;
    }

}

module.exports = Engine;
