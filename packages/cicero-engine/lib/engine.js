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

const ErgoEngine = require('@accordproject/ergo-engine').VMEngine;

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
     * Send a request to a clause for execution
     * @param {Clause} clause  - the clause
     * @param {object} request  - the request, a JS object that can be deserialized
     * using the Composer serializer.
     * @param {object} state  - the contract state, a JS object that can be deserialized
     * using the Composer serializer.
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @return {Promise} a promise that resolves to a result for the clause
     */
    async trigger(clause, request, state, currentTime, utcOffset) {
        const logicManager = clause.getLogicManager();
        const clauseId = clause.getIdentifier();
        const contract = clause.getData();

        return this.ergoEngine.trigger(logicManager,clauseId,contract,request,state,currentTime,utcOffset,null);
    }

    /**
     * Invoke a specific clause for execution
     * @param {Clause} clause  - the clause
     * @param {string} clauseName - the clause name
     * @param {object} params - the clause parameters, a JS object
     * whose fields that can be deserialized using the Composer
     * serializer.
     * @param {object} state  - the contract state, a JS object that can be deserialized
     * using the Composer serializer.
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @return {Promise} a promise that resolves to a result for the clause
     */
    async invoke(clause, clauseName, params, state, currentTime, utcOffset) {
        const logicManager = clause.getLogicManager();
        const clauseId = clause.getIdentifier();
        const contract = clause.getData();

        return this.ergoEngine.invoke(logicManager,clauseId,clauseName,contract,params,state,currentTime,utcOffset,null);
    }

    /**
     * Initialize a clause
     * @param {Clause} clause  - the clause
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @param {object} params - the clause parameters, a JS object
     * whose fields that can be deserialized using the Composer
     * serializer.
     * @return {Promise} a promise that resolves to a result for the clause initialization
     */
    async init(clause, currentTime, utcOffset, params = {}) {
        const logicManager = clause.getLogicManager();
        const clauseId = clause.getIdentifier();
        const contract = clause.getData();

        return this.ergoEngine.init(logicManager, clauseId, contract, params, currentTime, utcOffset, null);
    }

    /**
     * Provides access to the underlying Ergo engine.
     * @return {ErgoEngine} the Ergo Engine for this Engine
     */
    getErgoEngine() {
        return this.ergoEngine;
    }

}

module.exports = Engine;
