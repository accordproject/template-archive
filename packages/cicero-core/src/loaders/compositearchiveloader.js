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

/**
 * Manages a set of archive loaders, delegating to the first archive
 * loader that accepts a URL.
 */
class CompositeArchiveLoader {

    /**
     * Create the CompositeArchiveLoader. Used to delegate to a set of ArchiveLoaders.
     */
    constructor() {
        this.archiveLoaders = [];
    }

    /**
     * Adds a ArchiveLoader implemenetation to the ArchiveLoader
     * @param {ArchiveLoader} archiveLoader - The archive to add to the CompositeArchiveLoader
     */
    addArchiveLoader(archiveLoader) {
        this.archiveLoaders.push(archiveLoader);
    }

    /**
     * Get the array of ArchiveLoader instances
     * @return {ArchiveLoaders[]} The ArchiveLoader registered
     * @private
     */
    getArchiveLoaders() {
        return this.archiveLoaders;
    }

    /**
     * Remove all registered ArchiveLoaders
     */
    clearArchiveLoaders() {
        this.archiveLoaders = [];
    }

    /**
     * Returns true if this ArchiveLoader can process the URL
     * @param {string} url - the URL
     * @return {boolean} true if this ArchiveLoader accepts the URL
     * @abstract
     */
    accepts(url) {
        for (let n = 0; n < this.archiveLoaders.length; n++) {
            const ml = this.archiveLoaders[n];

            if (ml.accepts(url)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Load a Archive from a URL and return it
     * @param {string} url - the url to get
     * @param {object} options - additional options
     * @return {Promise} a promise to the Archive
     */
    load(url, options) {
        for (let n = 0; n < this.archiveLoaders.length; n++) {
            const ml = this.archiveLoaders[n];

            if (ml.accepts(url)) {
                return ml.load(url, options);
            }
        }

        throw new Error('Failed to find a model file loader that can handle: ' + url);
    }
}

module.exports = CompositeArchiveLoader;
