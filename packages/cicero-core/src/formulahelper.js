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

const ErgoEngine = require('@accordproject/ergo-engine/index.browser.js').EvalEngine;

/**
 * A helper for calculating formulas in template
 * @class
 * @public
 * @abstract
 */
class FormulaHelper {
    /**
     * Create the FormulaHelper
     * @param {object} logicManager  - the logicManager
     */
    constructor(logicManager) {
        this.logicManager = logicManager;
        this.ergoEngine = new ErgoEngine();
        this.cache = {};
    }
}

module.exports = FormulaHelper;