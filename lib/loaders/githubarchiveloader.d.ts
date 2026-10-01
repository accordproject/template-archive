import HTTPArchiveLoader from './httparchiveloader';
/**
 * Loads Archives from an external source, such as a URL.
 * @class
 * @private
 */
export default class GitHubArchiveLoader extends HTTPArchiveLoader {
    /**
     * Returns true if this Loader can process the URL
     * @param {string} url - the URL
     * @return {boolean} true if this Loader accepts the URL
     * @abstract
     */
    accepts(url: any): any;
    /**
     * Load an archive from a URL and return it
     * @param {string} url - the url to get
     * @param {object} options - additional options
     * @return {Promise} a promise to the archive
     */
    load(url: any, options: any): Promise<any>;
}
