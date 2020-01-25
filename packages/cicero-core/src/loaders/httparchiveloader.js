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

const axios = require('axios');
const Logger = require('@accordproject/concerto-core').Logger;

/**
 * Loads archives from an HTTP(S) URL using the axios library.
 * @class
 * @private
 */
class HTTPArchiveLoader {
    /**
     * Create the Loader.
     * @private
     */
    constructor() {
    }

    /**
     * Returns true if this Loader can process the URL
     * @param {string} url - the URL
     * @return {boolean} true if this Loader accepts the URL
     * @abstract
     */
    accepts(url) {
        return url.startsWith('http://') || url.startsWith('https://');
    }

    /**
     * Load an archive from a URL and return it
     * @param {string} requestUrl - the url to get
     * @param {object} [options] - additional options
     * @param {string} [options.httpAuthHeader] - The HTTP Authorization header value for URLs that require authentication
     * @return {Promise} a promise to the archive
     */
    load(requestUrl, options) {

        if(!options) {
            options = {};
        }
        Logger.debug('Loading archive at: ' + requestUrl);
        const request = JSON.parse(JSON.stringify(options));
        request.url = requestUrl;
        request.method = 'get';
        request.responseType = 'arraybuffer'; // Necessary for binary archives
        request.timeout = 5000;
        if (options.httpAuthHeader) {
            request.headers = {
                authorization: options.httpAuthHeader,
            };
        }

        return axios(request)
            .then((response) => {
                return response.data;
            }).catch(function (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    Logger.debug('HTTPArchiveLoader.load (Error Response)',error.response.status);
                    Logger.debug('HTTPArchiveLoader.load (Error Response)',error.response.headers);
                    throw new Error('Request to URL ['+ requestUrl +'] returned with error code: ' + error.response.status);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    Logger.debug('HTTPArchiveLoader.load (NoResponse)',error.request);
                    throw new Error('Server did not respond for URL ['+ requestUrl +']');
                } else {
                    // Something happened in setting up the request that triggered an Error
                    Logger.debug('HTTPArchiveLoader.load (Error)',error.message);
                    throw new Error('Error when accessing URL ['+ requestUrl +'] ' + error.message);
                }
            });
    }
}

module.exports = HTTPArchiveLoader;
