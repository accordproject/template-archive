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

const CompositeArchiveLoader = require('./compositearchiveloader');
const HTTPArchiveLoader = require('./httparchiveloader');
const GitHubArchiveLoader = require('./githubarchiveloader');
const ApArchiveLoader = require('./aparchiveloader');

/**
 * A default CompositeArchiveLoader implementation which supports
 * ap://, github://, http:// and https:// URLs.
 * @class
 * @private
 */
class DefaultArchiveLoader extends CompositeArchiveLoader {

    /**
     * Create the DefaultArchiveLoader.
     * @param {ModelManager} modelManager - the model manager to use
     */
    constructor() {
        super();
        const http = new HTTPArchiveLoader();
        const github = new GitHubArchiveLoader();
        const ap = new ApArchiveLoader();
        this.addArchiveLoader(github);
        this.addArchiveLoader(http);
        this.addArchiveLoader(ap);
    }
}

module.exports = DefaultArchiveLoader;
