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

const ModelManager = require('composer-concerto').ModelManager;

const systemModel = `namespace org.accordproject.base
abstract asset Asset {  }
abstract participant Participant {   }
abstract transaction Transaction identified by transactionId {
  o String transactionId
  o DateTime timestamp
}
abstract event Event identified by eventId {
  o String eventId
  o DateTime timestamp
}`;

/**
 * Cicero Model Manager. Bootstraps the ModelManager with system files.
 * @class
 * @public
 * @abstract
 * @memberof module:cicero-core
 */
class CiceroModelManager extends ModelManager {

    /**
     */
    constructor() {
        super();
        this.addModelFile(systemModel, 'org.accordproject.base.cto', false, true);
    }
}

module.exports = CiceroModelManager;