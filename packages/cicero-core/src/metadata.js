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

const Logger = require('@accordproject/concerto-core').Logger;
const ErgoCompiler = require('@accordproject/ergo-compiler').Compiler;
const ciceroVersion = require('../package.json').version;
const semver = require('semver');

const getMimeType = require('./mimetype');

const templateTypes = {
    CONTRACT: 0,
    CLAUSE: 1
};


const IMAGE_SIZE = {
    width: 128,
    height: 128,
};

/**
 * Defines the metadata for a Template, including the name, version, README markdown.
 * @class
 * @public
 */
class Metadata {

    /**
     * Create the Metadata.
     * <p>
     * <strong>Note: Only to be called by framework code. Applications should
     * retrieve instances from {@link Template}</strong>
     * </p>
     * @param {object} packageJson  - the JS object for package.json (required)
     * @param {String} readme  - the README.md for the template (may be null)
     * @param {object} samples - the sample markdown for the template in different locales,
     * @param {object} request - the JS object for the sample request
     * @param {Buffer} logo - the bytes data for the image
     * represented as an object whose keys are the locales and whose values are the sample markdown.
     * For example:
     *  {
     *      default: 'default sample markdown',
     *      en: 'sample text in english',
     *      fr: 'exemple de texte français'
     *  }
     * Locale keys (with the exception of default) conform to the IETF Language Tag specification (BCP 47).
     * THe `default` key represents sample template text in a non-specified language, stored in a file called `sample.md`.
     */
    constructor(packageJson, readme, samples, request, logo) {
        // name of the runtime that this template targets (if the template contains compiled code)
        this.runtime = null;

        // the version of Cicero that this template is compatible with
        this.ciceroVersion = null;

        // the logo
        this.logo = null;

        if(!packageJson || typeof(packageJson) !== 'object') {
            throw new Error('package.json is required and must be an object');
        }

        if(!packageJson.accordproject) {
            // Catches the previous format for the package.json with `cicero`
            if (packageJson.cicero && packageJson.cicero.version) {
                const msg = `The template targets Cicero (${packageJson.cicero.version}) but the Cicero version is ${ciceroVersion}.`;
                Logger.error(msg);
                throw new Error(msg);
            }
            throw new Error('Failed to find accordproject metadata in package.json');
        }

        if (!packageJson.accordproject.cicero) {
            throw new Error('Failed to find accordproject cicero version in package.json');
        }

        if(!semver.valid(semver.coerce(packageJson.accordproject.cicero))){
            throw new Error('The cicero version must be a valid semantic version (semver) number.');
        }

        if(!semver.valid(semver.coerce(packageJson.version))){
            throw new Error('The template version must be a valid semantic version (semver) number.');
        }

        this.ciceroVersion = packageJson.accordproject.cicero;

        if (!this.satisfiesCiceroVersion(ciceroVersion)){
            const msg = `The template targets Cicero version ${this.ciceroVersion} but the current Cicero version is ${ciceroVersion}.`;
            Logger.error(msg);
            throw new Error(msg);
        }

        // the runtime property is optional, and is only mandatory for templates that have been compiled
        if (packageJson.accordproject.runtime && packageJson.accordproject.runtime !== 'ergo') {
            ErgoCompiler.isValidTarget(packageJson.accordproject.runtime);
        } else {
            packageJson.accordproject.runtime = 'ergo';
        }
        this.runtime = packageJson.accordproject.runtime;

        if(!samples || typeof(samples) !== 'object') {
            throw new Error('sample.md is required');
        }

        if(request && typeof(request) !== 'object') {
            throw new Error('request.json must be an object');
        }

        if (!packageJson.name || !this._validName(packageJson.name)) {
            throw new Error ('template name can only contain lowercase alphanumerics, _ or -');
        }

        this.packageJson = packageJson;

        if(readme && typeof(readme) !== 'string') {
            throw new Error('README must be a string');
        }

        if(!packageJson.keywords) {
            packageJson.keywords = [];
        }

        if(packageJson.keywords && !Array.isArray(packageJson.keywords)) {
            throw new Error('keywords property in package.json must be an array.');
        }

        if(packageJson.displayName && packageJson.displayName.length > 214){
            throw new Error('The template displayName property is limited to a maximum of 214 characters.');
        }

        if(logo && logo instanceof Buffer) {
            Metadata.checkImage(logo);
        } else if(logo && !(logo instanceof Buffer)) {
            throw new Error ('logo must be a Buffer');
        }

        this.readme = readme;
        this.logo = logo;
        this.samples = samples;
        this.request = request;

        this.type = templateTypes.CONTRACT;
        if (packageJson.accordproject && packageJson.accordproject.template) {
            if(packageJson.accordproject.template !== 'contract' &&
            packageJson.accordproject.template !== 'clause'){
                throw new Error('A cicero template must be either a "contract" or a "clause".');
            }

            if(packageJson.accordproject.template === 'clause'){
                this.type = templateTypes.CLAUSE;
            }
        } else {
            Logger.warn('No cicero template type specified. Assuming that this is a contract template');
        }
    }

    /**
     * check to see if it is a valid name. for some reason regex is not working when this executes
     * inside the chaincode runtime, which is why regex hasn't been used.
     *
     * @param {string} name the template name to check
     * @returns {boolean} true if valid, false otherwise
     *
     * @private
     */
    _validName(name) {
        const validChars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
            '0','1','2','3','4','5','6','7','8','9','-','_'];
        for (let i = 0; i<name.length; i++){
            const strChar = name.charAt(i);
            if ( validChars.indexOf(strChar) === -1 ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns either a 0 (for a contract template), or 1 (for a clause template)
     * @returns {number} the template type
     */
    getTemplateType(){
        return this.type;
    }

    /**
     * Returns the logo at the root of the template
     * @returns {Buffer} the bytes data of logo
     */
    getLogo(){
        return this.logo;
    }

    /**
     * Returns the author for this template.
     * @return {*} the author information
     */
    getAuthor() {
        if (this.packageJson.author) {
            return this.packageJson.author;
        } else {
            return null;
        }
    }

    /**
     * Returns the name of the runtime target for this template, or null if this template
     * has not been compiled for a specific runtime.
     * @returns {string} the name of the runtime
     */
    getRuntime(){
        return this.runtime;
    }

    /**
     * Returns the version of Cicero that this template is compatible with.
     * i.e. which version of the runtime was this template built for?
     * The version string conforms to the semver definition
     * @returns {string} the semantic version
     */
    getCiceroVersion(){
        return this.ciceroVersion;
    }

    /**
     * Only returns true if the current cicero version satisfies the target version of this template
     * @param {string} version the cicero version to check against
     * @returns {string} the semantic version
     */
    satisfiesCiceroVersion(version){
        return semver.satisfies(version, this.getCiceroVersion(), { includePrerelease: true });
    }

    /**
     * Returns the samples for this template.
     * @return {object} the sample files for the template
     */
    getSamples() {
        return this.samples;
    }

    /**
     * Returns the sample request for this template.
     * @return {object} the sample request for the template
     */
    getRequest() {
        return this.request;
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
     * Returns the README.md for this template. This may be null if the template does not have a README.md
     * @return {String} the README.md file for the template or null
     */
    getREADME() {
        return this.readme;
    }

    /**
     * Returns the package.json for this template.
     * @return {object} the Javascript object for package.json
     */
    getPackageJson() {
        return this.packageJson;
    }

    /**
     * Returns the name for this template.
     * @return {string} the name of the template
     */
    getName() {
        return this.packageJson.name;
    }

    /**
     * Returns the display name for this template.
     * @return {string} the display name of the template
     */
    getDisplayName() {
        // Fallback for packages that don't have a displayName property.
        if(!this.packageJson.displayName) {
            // Convert `acceptance-of-delivery` or `acceptance_of_delivery` into `Acceptance Of Delivery`
            return String(this.packageJson.name)
                .split(/_|-/)
                .map(word => word.replace(/^./, str => str.toUpperCase()))
                .join(' ')
                .trim();
        }
        return this.packageJson.displayName;
    }

    /**
     * Returns the keywords for this template.
     * @return {Array} the keywords of the template
     */
    getKeywords() {
        if (this.packageJson.keywords.length < 1 || this.packageJson.keywords === undefined) {
            return [];
        } else {
            return this.packageJson.keywords;
        }
    }

    /**
     * Returns the description for this template.
     * @return {string} the description of the template
     */
    getDescription() {
        return this.packageJson.description;
    }

    /**
     * Returns the version for this template.
     * @return {string} the description of the template
     */
    getVersion() {
        return this.packageJson.version;
    }

    /**
     * Returns the identifier for this template, formed from name@version.
     * @return {string} the identifier of the template
     */
    getIdentifier() {
        return this.packageJson.name + '@' + this.packageJson.version;
    }

    /**
     * Check the buffer is a png file with the right size
     * @param {Buffer} buffer the buffer object
     */
    static checkImage(buffer) {
        const mimeType = getMimeType(buffer).mime;
        Metadata.checkImageDimensions(buffer, mimeType);
    }

    /**
     * Checks if dimensions for the image are correct.
     * @param {Buffer} buffer the buffer object
     * @param {string} mimeType the mime type of the object
     */
    static checkImageDimensions(buffer, mimeType) {
        let height;
        let width;
        if(mimeType === 'image/png') {
            try {
                height = buffer.readUInt32BE(20);
                width = buffer.readUInt32BE(16);
            } catch (err) {
                throw new Error('not a valid png file');
            }
        } else {
            throw new Error('dimension calculation not supported for this file');
        }

        if (height === IMAGE_SIZE.height && width === IMAGE_SIZE.width) {
            return;
        } else {
            throw new Error(`logo should be ${IMAGE_SIZE.height}x${IMAGE_SIZE.width}`);
        }
    }

    /**
     * Return new Metadata for a target runtime
     * @param {string} runtimeName - the target runtime name
     * @return {object} the new Metadata
     */
    createTargetMetadata(runtimeName) {
        const packageJson = JSON.parse(JSON.stringify(this.packageJson));
        packageJson.accordproject.runtime = runtimeName;
        return new Metadata(packageJson, this.readme, this.samples, this.request, this.logo);
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

module.exports = Metadata;
