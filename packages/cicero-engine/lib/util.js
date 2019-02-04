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
 * Resolve the root directory
 *
 * @param {string} parameters Cucumber's World parameters
 * @return {string} root directory used to resolve file names
 */
function resolveRootDir(parameters) {
    if (parameters.rootdir) {
        return parameters.rootdir;
    } else {
        return '.';
    }
}

module.exports = { resolveRootDir };
