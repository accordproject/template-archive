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

import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

import { Logger } from '@accordproject/concerto-util';
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';
import { TemplateMarkTransformer } from '@accordproject/markdown-template';
import JSZip from 'jszip';

import Template from './template';
import TemplateLoader from './templateloader';
import TemplateSaver from './templatesaver';

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
export default class TemplateInstance {

    template: any;
    data: any;
    concertoData: any;
    ciceroMarkTransformer: any;
    templateMarkTransformer: any;

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
            hash = '-' + bytesToHex(sha256(utf8ToBytes(textToHash)));
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

    /**
     * Persists this instance to an archive: the Cicero Template Archive (cta)
     * of its template, plus the data of the instance in instance.json.
     * The archive can still be loaded as a template with {@link Template.fromArchive}.
     * @param {string} [language] - target language for the archive
     * @param {Object} [options] - JSZip options and keystore object containing path and passphrase for the keystore
     * @return {Promise<Buffer>} the zlib buffer
     */
    async toArchive(language?, options: any = {}) {
        if (!this.data) {
            throw new Error('Cannot archive a template instance without data. Call setData first.');
        }
        const template = this.getTemplate();
        if (options.keystore) {
            const timestamp = Date.now();
            template.signTemplate(options.keystore.p12File, options.keystore.passphrase, timestamp);
        }
        return TemplateSaver.toArchive(template, language, options, this.getData());
    }

    /**
     * Create an instance from an archive written by {@link TemplateInstance#toArchive}.
     * Call it on the subclass to construct, e.g. Clause.fromArchive(buffer).
     * @param {Buffer} buffer  - the buffer to the archive
     * @param {Object} [options] - an optional set of options to configure the template.
     * @return {Promise<TemplateInstance>} a Promise to the instance, with its data set
     */
    static async fromArchive(buffer, options = null) {
        const template = await Template.fromArchive(buffer, options);
        const zip = await JSZip.loadAsync(buffer);
        const data = await TemplateLoader.loadZipFileContents(zip, 'instance.json', true);
        if (!data) {
            throw new Error('Failed to find instance.json in archive file. Use Template.fromArchive to load a template archive.');
        }
        const instance = new (this as any)(template);
        instance.setData(data);
        return instance;
    }
}
