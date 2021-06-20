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

const Util = require('./util');
const Metadata = require('./metadata');

/**
 * Defines the metadata for a Template, including the name, version, README markdown.
 * @class
 * @public
 */
class TemplateMetadata extends Metadata {
    /**
     * Create the Metadata.
     * <p>
     * <strong>Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link Template}</strong>
     * </p>
     * @param {object} packageJson  - the JS object for package.json (required)
     * @param {String} readme  - the README.md for the template (may be null)
     * @param {object} samples - the sample markdown for the template in different locales,
     * represented as an object whose keys are the locales and whose values are the sample markdown.
     * For example:
     *  {
     *      default: 'default sample markdown',
     *      en: 'sample text in english',
     *      fr: 'exemple de texte français'
     *  }
     * Locale keys (with the exception of default) conform to the IETF Language Tag specification (BCP 47).
     * THe `default` key represents sample template text in a non-specified language, stored in a file called `sample.md`.
     * @param {object} request - the JS object for the sample request
     * @param {Buffer} logo - the bytes data for the image
     */
    constructor(packageJson, readme, samples, request, logo) {
        super(packageJson);

        // the readme
        if(readme && typeof(readme) !== 'string') {
            throw new Error('README must be a string');
        }
        this.readme = readme;

        // the samples
        if(!samples || typeof(samples) !== 'object') {
            throw new Error('sample.md is required');
        }
        this.samples = samples;

        // the request
        if(request && typeof(request) !== 'object') {
            throw new Error('request.json must be an object');
        }
        this.request = request;

        // the logo
        if(logo && logo instanceof Buffer) {
            Util.checkImage(logo);
        } else if(logo && !(logo instanceof Buffer)) {
            throw new Error ('logo must be a Buffer');
        }
        this.logo = logo;
    }

    /**
     * Returns the README.md for this template. This may be null if the template does not have a README.md
     * @return {String} the README.md file for the template or null
     */
    getREADME() {
        return this.readme;
    }

    /**
     * Returns the samples for this template.
     * @return {object} the sample files for the template
     */
    getSamples() {
        return this.samples;
    }

    /**
     * Returns the sample for this template in the given locale. This may be null.
     * If no locale is specified returns the default sample if it has been specified.
     *
     * @param {string} locale the IETF language code for the language.
     * @return {string} the sample file for the template in the given locale or null
     */
    getSample(locale=null) {
        if(!locale && 'default' in this.samples){
            return this.samples.default;
        } else if (locale && locale in this.samples){
            return this.samples[locale];
        } else {
            return null;
        }
    }

    /**
     * Returns the sample request for this template.
     * @return {object} the sample request for the template
     */
    getRequest() {
        return this.request;
    }

    /**
     * Returns the logo at the root of the template
     * @returns {Buffer} the bytes data of logo
     */
    getLogo(){
        return this.logo;
    }

    /**
     * Return new TemplateMetadata for a target runtime
     * @param {string} runtime - the target runtime
     * @return {object} the new Metadata
     */
    createTargetMetadata(runtime) {
        const packageJson = JSON.parse(JSON.stringify(this.packageJson));
        packageJson.accordproject.runtime = runtime;
        return new TemplateMetadata(packageJson, this.readme, this.samples, this.request, this.logo);
    }

    /**
     * Return the whole metadata content, for hashing
     * @return {object} the content of the metadata object
     */
    toJSON() {
        return {
            'packageJson' : this.getPackageJson(),
            'readme' : this.getREADME(),
            'samples' : this.getSamples(),
            'request' : this.getRequest(),
            'logo' : this.getLogo() ? this.getLogo().toString('base64') : null,
        };
    }
}

module.exports = TemplateMetadata;
