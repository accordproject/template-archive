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

const HTTPArchiveLoader = require('./httparchiveloader');

/**
 * Loads Archives from an Accord Project URL.
 * @class
 * @private
 */
class ApArchiveLoader extends HTTPArchiveLoader {
    /**
     * Returns true if this Loader can process the URL
     * @param {string} url - the URL
     * @return {boolean} true if this Loader accepts the URL
     * @abstract
     */
    accepts(url) {
        return url.startsWith('ap://');
    }

    /**
     * Load an archive from a URL and return it
     * @param {string} url - the url to get
     * @param {object} options - additional options
     * @return {Promise} a promise to the archive
     */
    load(url, options) {
        const atIndex = url.indexOf('@');
        const hashIndex = url.indexOf('#');

        if (atIndex < 0 || hashIndex < 0) {
            throw new Error(`Invalid template specifier. Must contain @ and #: ${url}`);
        }

        const templateName = url.substring(5, atIndex);
        const templateVersion = url.substring(atIndex + 1, hashIndex);

        const rewrittenUrl = `https://templates.accordproject.org/archives/${templateName}@${templateVersion}.cta`;
        const result = super.load(rewrittenUrl, options);
        return result;
    }
}

module.exports = ApArchiveLoader;
