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

const NodeCache = require('node-cache');
const Template = require('./template');
const logger = require('./logger');
const rp = require('request-promise-native');

const globalTemplateCache = new NodeCache({ stdTTL: 600, useClones: false });
const globalTemplateIndexCache = new NodeCache({ stdTTL: 600, useClones: false });

/**
 * <p>
 * Loads templates from the Accord Project Template Library
 * stored at: https://templates.accordproject.org. The template index
 * and the templates themselves are cached in a global in-memory cache with a TTL
 * of 600 seconds. Call the clearCache method to clear the cache.
 * </p>
 * @private
 * @class
 * @memberof module:cicero-template-library
 */
class TemplateLibrary {
    /**
     * Create the Template Library
     * @param {string} url - the url to connect to. Defaults to
     * https://templates.accordproject.org
     */
    constructor(url) {
        this.url = url || 'https://templates.accordproject.org';
        logger.info('Creating TemplateLibrary');
    }

    /**
     * Clears the caches
     */
    async clearCache() {
        globalTemplateCache.flushAll();
        globalTemplateIndexCache.flushAll();
    }

    /**
     * Gets the metadata for all the templates in the template library
     * @return {Promise} promise to a template index
     */
    async getTemplateIndex() {
        const cacheKey = this.getTemplateIndexCacheKey();
        if (cacheKey) {
            const result = globalTemplateIndexCache.get(cacheKey);
            if (result) {
                logger.info('Returning template index from cache');
                return Promise.resolve(result);
            }
        }

        const options = {
            uri: `${this.url}/template-library.json`,
            headers: {
                'User-Agent': 'clause',
            },
            json: true, // Automatically parses the JSON string in the response
        };

        logger.info('Loading template library from', options.uri);
        return rp(options)
            .then((templateIndex) => {

                if (cacheKey) {
                    globalTemplateIndexCache.set(cacheKey, templateIndex);
                }

                return templateIndex;
            })
            .catch((err) => {
                logger.error('Failed to load template index', err);
                throw err;
            });
    }

    /**
     * Returns true if the template library can handle the URI.
     * @param {string} templateUri - the template URI
     * @return {boolean} true if the template library can process these URIs
     */
    static acceptsURI(templateUri) {
        return templateUri.startsWith('ap://');
    }

    /**
     * Parse a template URI into constituent parts
     * @param {string} templateUri - the URI of the template. E.g.
     * ap://helloworld@0.0.3#1cafebabe
     * @return {object} result of parsing
      * @throws {Error} if the URI is invalid
     */
    static parseURI(templateUri) {
        if (!templateUri.startsWith('ap://')) {
            throw new Error(`Unsupported protocol: ${templateUri}`);
        }

        const atIndex = templateUri.indexOf('@');
        const hashIndex = templateUri.indexOf('#');

        if (atIndex < 0 || hashIndex < 0) {
            throw new Error(`Invalid template specifier. Must contain @ and #: ${templateUri}`);
        }

        return {
            protocol: 'ap',
            templateName: templateUri.substring(5, atIndex),
            templateVersion: templateUri.substring(atIndex + 1, hashIndex),
            templateHash: templateUri.substring(hashIndex + 1),
        };
    }

    /**
     * Gets a template instance from a URI
     * @param {string} templateUri - the URI of the template. E.g.
     * ap://helloworld@0.0.3#cafebabe
     * @return {Promise} promise to a Template instance
     * @throws {Error} if the templateUri is invalid
     */
    async getTemplate(templateUri) {
        const cacheKey = this.getTemplateCacheKey(templateUri);
        if (cacheKey) {
            const result = globalTemplateCache.get(cacheKey);
            if (result) {
                logger.info('Returning template from cache', templateUri);
                return result;
            }
        }

        const templateUriInfo = TemplateLibrary.parseURI(templateUri);
        const templateIndex = await this.getTemplateIndex();
        const templateMetadata = templateIndex[`${templateUriInfo.templateName}@${templateUriInfo.templateVersion}`];
        if(!templateMetadata) {
            throw new Error(`Failed to find template ${templateUri}`);
        }

        // fetch the template
        const template = await Template.fromUrl(templateMetadata.url);

        // check the hash matches
        const templateHash = template.getHash();
        if(templateHash !== templateUriInfo.templateHash) {
            logger.warn(`Requested template ${templateUri} but the hash of the template is ${templateHash}`);
        }

        if (cacheKey) {
            globalTemplateCache.set(cacheKey, template);
        }

        return template;
    }

    /**
     * Returns the cache key used to cache the template index.
     * @returns {string} the cache key or null if the index should not be cached
     */
    getTemplateIndexCacheKey() {
        return `${this.url}/template-library.json`;
    }

    /**
   * Returns the cache key used to cache access to a template.
   * @param {string} templateUri the URI for the template
   * @returns {string} the cache key or null if the template should not be cached
   */
    getTemplateCacheKey(templateUri) {
        return `${this.url}/${templateUri}`;
    }
}

module.exports = TemplateLibrary;
