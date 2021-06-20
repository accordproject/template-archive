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

const Util = require('./util');

/**
 * Defines a metadata object, including the name, version, author, etc.
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
     */
    constructor(packageJson) {
        // name of the runtime that this template targets (if the template contains compiled code)
        this.runtime = null;

        // the version of Cicero that this template is compatible with
        this.ciceroVersion = null;

        if(!packageJson || typeof(packageJson) !== 'object') {
            throw new Error('package.json is required and must be an object');
        }

        this.packageJson = packageJson;

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

        if(!semver.validRange(packageJson.accordproject.cicero)){
            throw new Error('The cicero version must be a valid semantic version (semver) range.');
        }

        if(!semver.valid(packageJson.version)){
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

        if (!this.packageJson.name || !Util.isValidName(this.packageJson.name)) {
            throw new Error ('template name can only contain lowercase alphanumerics, _ or -');
        }

        if(this.packageJson.keywords && !Array.isArray(this.packageJson.keywords)) {
            throw new Error('keywords property in package.json must be an array.');
        }

        if(!this.packageJson.keywords) {
            this.packageJson.keywords = [];
        }

        if(this.packageJson.displayName && this.packageJson.displayName.length > 214){
            throw new Error('The template displayName property is limited to a maximum of 214 characters.');
        }

        // The template type
        this.type = Util.templateTypes.CONTRACT; // Defaults to contract
        if (this.packageJson.accordproject && this.packageJson.accordproject.template) {
            if(this.packageJson.accordproject.template !== 'contract' &&
            this.packageJson.accordproject.template !== 'clause'){
                throw new Error('A cicero template must be either a "contract" or a "clause".');
            }

            if(this.packageJson.accordproject.template === 'clause'){
                this.type = Util.templateTypes.CLAUSE;
            }
        } else {
            Logger.warn('No cicero template type specified. Assuming that this is a contract template');
        }
    }

    /**
     * Returns either a 0 (for a contract template), or 1 (for a clause template)
     * @returns {number} the template type
     */
    getTemplateType(){
        return this.type;
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
}

module.exports = Metadata;
