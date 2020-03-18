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
 * Parses a format string
 * @class
 * @public
 */
class FormatParser {
    /**
     * Given current grammar parts, add necessary grammars parts for the format.
     * @param {object[]} grammars - the current grammar parts
     * @param {string} field - grammar field
     */
    addGrammars(grammars) {
    }

    /**
     * Given a format, returns grammar rules to parse that format
     * @param {string} format - the format
     * @param {object[]} - grammar rules for the format
     */
    static buildFormatRules(format) {
        throw new Error('FormatParser: should call buildRules for a specific format');
    }
}

module.exports = FormatParser;
