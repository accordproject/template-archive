export = TemplateLibrary;
/**
 * <p>
 * Loads templates from the Accord Project Template Library
 * stored at: https://templates.accordproject.org. The template index
 * and the templates themselves are cached in a global in-memory cache with a TTL
 * of 600 seconds. Call the clearCache method to clear the cache.
 * </p>
 * @private
 * @class
 */
declare class TemplateLibrary {
    /**
     * Returns a template index that only contains the latest version
     * of each template
     *
     * @param {object} templateIndex - the template index
     * @returns {object} a new template index that only contains the latest version of each template
     */
    static filterTemplateIndexLatestVersion(templateIndex: object): object;
    /**
     * Returns a template index that only contains the latest version
     * of each template
     *
     * @param {object} templateIndex - the template index
     * @param {string} ciceroVersion - the cicero version in semver format
     * @returns {object} a new template index that only contains the templates that are semver compatible
     * with the cicero version specified
     */
    static filterTemplateIndexCiceroVersion(templateIndex: object, ciceroVersion: string): object;
    /**
     * Returns true if the template library can handle the URI.
     * @param {string} templateUri - the template URI
     * @return {boolean} true if the template library can process these URIs
     */
    static acceptsURI(templateUri: string): boolean;
    /**
     * Parse a template URI into constituent parts
     * @param {string} templateUri - the URI of the template. E.g.
     * ap://helloworld@0.0.3#1cafebabe
     * @return {object} result of parsing
      * @throws {Error} if the URI is invalid
     */
    static parseURI(templateUri: string): object;
    /**
     * Create the Template Library
     * @param {string} url - the url to connect to. Defaults to
     * https://templates.accordproject.org
     * @param {string} [httpAuthHeader] - A HTTP Authorization header, if required
     */
    constructor(url?: string, httpAuthHeader?: string);
    url: string;
    httpAuthHeader: string;
    /**
     * Clears the caches
     */
    clearCache(): Promise<void>;
    /**
     * Gets the metadata for all the templates in the template library
     * @param {object} [options] - the (optional) options
     * @param {object} [options.latestVersion] - only return the latest version of each template
     * @param {object} [options.ciceroVersion] - semver filter on the cicero engine version. E.g. pass 0.4.6 to
     * only return templates that are compatible with Cicero version 0.4.6
     * @return {Promise} promise to a template index
     */
    getTemplateIndex(options?: {
        latestVersion?: object;
        ciceroVersion?: object;
    }): Promise<any>;
    /**
     * Gets a template instance from a URI
     * @param {string} templateUri - the URI of the template. E.g.
     * ap://helloworld@0.0.3#cafebabe
     * @return {Promise} promise to a Template instance
     * @throws {Error} if the templateUri is invalid
     */
    getTemplate(templateUri: string): Promise<any>;
    /**
     * Returns the cache key used to cache the template index.
     * @param {object} [options] - the (optional) options
     * @returns {string} the cache key or null if the index should not be cached
     */
    getTemplateIndexCacheKey(options?: object): string;
    /**
     * Returns the cache key used to cache access to a template.
     * @param {string} templateUri the URI for the template
     * @returns {string} the cache key or null if the template should not be cached
     */
    getTemplateCacheKey(templateUri: string): string;
}
