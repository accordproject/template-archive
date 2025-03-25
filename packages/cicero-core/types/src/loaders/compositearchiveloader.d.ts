export = CompositeArchiveLoader;
/**
 * Manages a set of archive loaders, delegating to the first archive
 * loader that accepts a URL.
 */
declare class CompositeArchiveLoader {
    archiveLoaders: any[];
    /**
     * Adds a ArchiveLoader implemenetation to the ArchiveLoader
     * @param {ArchiveLoader} archiveLoader - The archive to add to the CompositeArchiveLoader
     */
    addArchiveLoader(archiveLoader: ArchiveLoader): void;
    /**
     * Get the array of ArchiveLoader instances
     * @return {ArchiveLoaders[]} The ArchiveLoader registered
     * @private
     */
    private getArchiveLoaders;
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
    accepts(url: string): boolean;
    /**
     * Load a Archive from a URL and return it
     * @param {string} url - the url to get
     * @param {object} options - additional options
     * @return {Promise} a promise to the Archive
     */
    load(url: string, options: object): Promise<any>;
}
