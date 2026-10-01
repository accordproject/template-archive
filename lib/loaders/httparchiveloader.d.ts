/**
 * Loads archives from an HTTP(S) URL using the axios library.
 * @class
 * @private
 */
export default class HTTPArchiveLoader {
    /**
     * Create the Loader.
     * @private
     */
    constructor();
    /**
     * Returns true if this Loader can process the URL
     * @param {string} url - the URL
     * @return {boolean} true if this Loader accepts the URL
     * @abstract
     */
    accepts(url: any): any;
    /**
     * Load an archive from a URL and return it
     * @param {string} requestUrl - the url to get
     * @param {object} [options] - additional options
     * @param {string} [options.httpAuthHeader] - The HTTP Authorization header value for URLs that require authentication
     * @return {Promise} a promise to the archive
     */
    load(requestUrl: any, options: any): Promise<any>;
}
