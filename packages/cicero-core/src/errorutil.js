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
 * Extract the file location from the parse error
 * @param {object} error the parse error
 * @return {object} - the file location information
 */
function locationOfError(error) {
    if (!error) { return null; }
    const message = error.message;

    const re = /invalid syntax at line (\d+) col (\d+)([^]*)/mi;
    const found = message.match(re);
    if (!found) { return message; }

    let column = parseInt(found[2], 10);
    let line = parseInt(found[1], 10);

    let token = error.token && error.token.value ? error.token.value : ' ';
    const endColumn = column + token.length;

    return {
        start: {
            line,
            column,
        },
        end: {
            line,
            endColumn,//XXX
        },
    };
}

module.exports = { locationOfError };
