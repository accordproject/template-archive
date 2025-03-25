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

const crypto = require('crypto');

const Logger = require('@accordproject/concerto-util').Logger;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const TemplateMarkTransformer = require('@accordproject/markdown-template').TemplateMarkTransformer;

/**
 * A TemplateInstance is an instance of a Clause or Contract template. It is executable business logic, linked to
 * a natural language (legally enforceable) template.
 * A TemplateInstance must be constructed with a template and then prior to execution the data for the clause must be set.
 * Set the data for the TemplateInstance by either calling the setData method or by
 * calling the parse method and passing in natural language text that conforms to the template grammar.
 * @public
 * @abstract
 * @class
 */
class TemplateInstance {

    /**
     * Create the Clause and link it to a Template.
     * @param {Template} template  - the template for the clause
     */
    constructor(template) {
        if (this.constructor === TemplateInstance) {
            throw new TypeError('Abstract class "TemplateInstance" cannot be instantiated directly.');
        }
        this.template = template;
        this.data = null;
        this.concertoData = null;
        this.ciceroMarkTransformer = new CiceroMarkTransformer();
        this.templateMarkTransformer = new TemplateMarkTransformer();
    }

    /**
     * Set the data for the clause
     * @param {object} data  - the data for the clause, must be an instance of the
     * template model for the clause's template. This should be a plain JS object
     * and will be deserialized and validated into the Concerto object before assignment.
     */
    setData(data) {
        // verify that data is an instance of the template model
        const templateModel = this.getTemplate().getTemplateModel();

        if (data.$class !== templateModel.getFullyQualifiedName()) {
            throw new Error(`Invalid data, must be a valid instance of the template model ${templateModel.getFullyQualifiedName()} but got: ${JSON.stringify(data)} `);
        }

        // downloadExternalDependencies the data using the template model
        Logger.debug('Setting clause data: ' + JSON.stringify(data));
        const resource = this.getTemplate().getSerializer().fromJSON(data);
        resource.validate();

        // save the data
        this.data = data;

        // save the concerto data
        this.concertoData = resource;
    }

    /**
     * Get the data for the clause. This is a plain JS object. To retrieve the Concerto
     * object call getConcertoData().
     * @return {object} - the data for the clause, or null if it has not been set
     */
    getData() {
        return this.data;
    }

    /**
     * Get the data for the clause. This is a Concerto object. To retrieve the
     * plain JS object suitable for serialization call toJSON() and retrieve the `data` property.
     * @return {object} - the data for the clause, or null if it has not been set
     */
    getDataAsConcertoObject() {
        return this.concertoData;
    }

    /**
     * Returns the identifier for this clause. The identifier is the identifier of
     * the template plus '-' plus a hash of the data for the clause (if set).
     * @return {String} the identifier of this clause
     */
    getIdentifier() {
        let hash = '';

        if (this.data) {
            const textToHash = JSON.stringify(this.getData());
            const hasher = crypto.createHash('sha256');
            hasher.update(textToHash);
            hash = '-' + hasher.digest('hex');
        }
        return this.getTemplate().getIdentifier() + hash;
    }

    /**
     * Returns the template for this clause
     * @return {Template} the template for this clause
     */
    getTemplate() {
        return this.template;
    }

    /**
     * Returns a JSON representation of the clause
     * @return {object} the JS object for serialization
     */
    toJSON() {
        return {
            template: this.getTemplate().getIdentifier(),
            data: this.getData()
        };
    }
}

module.exports = TemplateInstance;