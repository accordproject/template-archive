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

const logger = require('./logger');

// This code is derived from BusinessNetworkMetadata in Hyperleger Composer composer-common.

/**
 * <p>
 * Defines the metadata for a Template. This includes:
 * <ul>
 *   <li>package.json</li>
 *   <li>README.md (optional)</li>
 * </ul>
 * </p>
 * @class
 * @memberof module:cicero-core
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
     */
    constructor(packageJson, readme) {
        const method = 'constructor';
        logger.entry(method, readme);

        if(!packageJson || typeof(packageJson) !== 'object') {
            throw new Error('package.json is required and must be an object');
        }

        if (!packageJson.name || !this._validName(packageJson.name)) {
            throw new Error ('template name can only contain lowercase alphanumerics, _ or -');
        }

        this.packageJson = packageJson;

        if(readme && typeof(readme) !== 'string') {
            throw new Error('README must be a string');
        }


        this.readme = readme;
        logger.exit(method);
    }

    /**
     * check to see if it is a valid name. for some reason regex is not working when this executes
     * inside the chaincode runtime, which is why regex hasn't been used.
     *
     * @param {string} name the template name to check
     * @returns {boolean} true if valid, false otherwise
     *
     * @memberOf BusinessNetworkMetadata
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
