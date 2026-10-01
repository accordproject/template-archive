/**
 * Manages a set of archive loaders, delegating to the first archive
 * loader that accepts a URL.
 */
export default class CompositeArchiveLoader {
    archiveLoaders: any;
    /**
     * Create the CompositeArchiveLoader. Used to delegate to a set of ArchiveLoaders.
     */
    constructor();
    /**
     * Adds a ArchiveLoader implemenetation to the ArchiveLoader
     * @param {ArchiveLoader} archiveLoader - The archive to add to the CompositeArchiveLoader
     */
    addArchiveLoader(archiveLoader: any): void;
    /**
     * Get the array of ArchiveLoader instances
     * @return {ArchiveLoaders[]} The ArchiveLoader registered
     * @private
     */
    getArchiveLoaders(): any;
    /**
     * Remove all registered ArchiveLoaders
     */
    clearArchiveLoaders(): void;
    /**
     * Returns true if this ArchiveLoader can process the URL
     * @param {string} url - the URL
     * @return {boolean} true if this ArchiveLoader accepts the URL
     * @abstract
     */
    accepts(url: any): boolean;
    /**
     * Load a Archive from a URL and return it
     * @param {string} url - the url to get
     * @param {object} options - additional options
     * @return {Promise} a promise to the Archive
     */
    load(url: any, options: any): any;
}
