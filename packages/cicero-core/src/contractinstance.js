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

const Instance = require('./instance');
const InstanceLoader = require('./instanceloader');
const InstanceSaver = require('./instancesaver');

/**
 * A Contract is executable business logic, linked to a natural language (legally enforceable) template.
 * A Clause must be constructed with a template and then prior to execution the data for the clause must be set.
 * Set the data for the clause (an instance of the template model) by either calling the setData method or by
 * calling the parse method and passing in natural language text that conforms to the template grammar.
 * @public
 * @class
 */
class ContractInstance extends Instance {
    /**
     * Create an instance from a Template.
     * @param {Template} template  - the template for the instance
     * @return {object} - the clause instance
     */
    static fromTemplate(template) {
        return InstanceLoader.fromTemplate(ContractInstance, template);
    }

    /**
     * Create an instance from a Template with data.
     * @param {Template} template  - the template for the instance
     * @param {object} data - the contract data
     * @return {object} - the clause instance
     */
    static fromTemplateWithData(template, data) {
        return InstanceLoader.fromTemplateWithData(ContractInstance, template, data);
    }

    /**
     * Create a smart legal contract archive
     * @param {string} runtime - the target runtime
     * @param {object} options - JSZip options
     * @return {Promise<Buffer>} the zlib buffer
     */
    toArchive(runtime, options) {
        return InstanceSaver.toArchive(this, runtime, options);
    }

    /**
     * Create a smart legal contract instance from an archive.
     * @param {Buffer} buffer  - the buffer to a Smart Legal Contract (slc) file
     * @param {object} options - additional options
     * @return {Promise<ContractInstance>} a Promise to the instance
     */
    static fromArchive(buffer, options) {
        return InstanceLoader.fromArchive(ContractInstance, buffer, options);
    }
}

module.exports = ContractInstance;
