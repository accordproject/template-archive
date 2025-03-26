export = GitHubArchiveLoader;
/**
 * Loads Archives from an external source, such as a URL.
 * @class
 * @private
 */
declare class GitHubArchiveLoader extends HTTPArchiveLoader {
    /**
     * Load an archive from a URL and return it
     * @param {string} url - the url to get
     * @param {object} options - additional options
     * @return {Promise} a promise to the archive
     */
    load(url: string, options: object): Promise<any>;
}
import HTTPArchiveLoader = require("./httparchiveloader");
