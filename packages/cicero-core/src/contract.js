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

const TemplateInstance = require('./templateinstance.js');

/**
 * A Contract is executable business logic, linked to a natural language (legally enforceable) template.
 * A Clause must be constructed with a template and then prior to execution the data for the clause must be set.
 * Set the data for the clause (an instance of the template model) by either calling the setData method or by
 * calling the parse method and passing in natural language text that conforms to the template grammar.
 * @public
 * @class
 */
class Contract extends TemplateInstance {

}

module.exports = Contract;