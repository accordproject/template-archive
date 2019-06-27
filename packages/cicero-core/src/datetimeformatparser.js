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

const crypto = require('crypto');

/**
 * Parses a date/time format string
 * @class
 * @public
 */
class DateTimeFormatParser {
    /**
     * Given a format field (like HH or D) this method returns
     * a logical name for the field. Note the logical names
     * have been picked to align with the moment constructor that takes an object.
     * @param {string} field - the input format field
     * @returns {string} the field designator
     */
    static parseDateTimeFormatField(field) {
        switch(field) {
        case 'D':
        case 'DD':
            return 'days';
        case 'M':
        case 'MM':
        case 'MMM':
        case 'MMMM':
            return 'months';
        case 'YYYY':
            return 'years';
        case 'H':
        case 'HH':
            return 'hours';
        case 'mm':
            return 'minutes';
        case 'ss':
            return 'seconds';
        case 'SSS':
            return 'milliseconds';
        case 'Z':
            return 'timezone';
        default:
            return null;
        }
    }

    /**
     * Converts a format string to a Nearley action
     * @param {string} formatString - the input format string
     * @returns {{tokens: String, action: String, name: String }} the tokens and action and name to use for the Nearley rule
     */
    static buildDateTimeFormatRule(formatString) {
        // strip quotes
        let input = formatString.substr(1,formatString.length -2);
        const lastCharacter = input.charAt(input.length-1);
        let hasTimeZone = DateTimeFormatParser.parseDateTimeFormatField(lastCharacter) === 'timezone';

        if(hasTimeZone) {
            // strip Z
            input = input.substr(0,input.length-1);
        }

        const fields = input.split(/(DD|D|MMMM|MMM|MM|M|YYYY|HH|H|mm|ss|SSS)+/);
        // remove the first and last (empty) items
        fields.shift();
        fields.pop();
        let tokens = '';
        let parsedDateTime = '{"$class" : "ParsedDateTime",';
        let fieldNames = [];

        fields.forEach((field, index) => {
            const fieldName = DateTimeFormatParser.parseDateTimeFormatField(field);

            if(fieldName) {
                if(fieldNames.indexOf(fieldName) >= 0) {
                    throw new Error(`Duplicate ${fieldName} field in date time format string: ${formatString}`);
                }
                else {
                    parsedDateTime += `   "${fieldName}": d[${index}]`;
                    if(index < fields.length-1 ) {
                        parsedDateTime += ',';
                    }
                    tokens += field + ' ';
                    fieldNames.push(fieldName);
                }
            }
            else {
                tokens += ` "${field}" `;
            }
        });

        if(hasTimeZone) {
            tokens += 'Z';
            parsedDateTime += `,   "timezone": d[${fields.length}]`;
        }

        parsedDateTime += '}';

        const action = `{% (d) => {return ${parsedDateTime};}%}`;
        const name = 'DateTime_' + crypto.createHash('md5').update(formatString).digest('hex');

        return { tokens, name, action};
    }
}

module.exports = DateTimeFormatParser;