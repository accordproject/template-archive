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

concerto version ">= 1.0.0"

<<<<<<< HEAD:packages/cicero-core/test/data/latedeliveryandpenalty@0.17.0-cicero/model/@models.accordproject.org.accordproject.contract.cto
namespace org.accordproject.contract

/**
 * Contract Data
 * -- Describes the structure of contracts and clauses
 */

/* A contract is a asset -- This contains the contract data */
abstract asset Contract identified by contractId {
  o String contractId
}

/* A clause is an asset -- This contains the clause data */
abstract asset Clause identified by clauseId {
  o String clauseId
}
=======
/**
 * Cicero Core - defines the core data types for Cicero.
 * @module cicero-core
 */

module.exports.Export = require('./lib/export');
>>>>>>> de62bc8bff7128607dae7cd7187a72b343bbab4d:packages/cicero-transform/index.js
