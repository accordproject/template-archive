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
 * @memberof module:cicero-core
 */
class DateTimeFormatParser {
    /**
     * Given a format field (like HH or D) this method returns
     * a logical name for the field.
     * @param {string} field - the input format field
     * @returns {string} the field designator
     */
    static parseDateTimeFormatField(field) {
        switch(field) {
        case 'D':
        case 'DD':
            return 'day';
        case 'M':
        case 'MM':
        case 'MMM':
        case 'MMMM':
            return 'month';
        case 'YYYY':
            return 'year';
        case 'H':
        case 'HH':
            return 'hour';
        case 'mm':
            return 'minute';
        case 'ss':
            return 'second';
        case 'SSS':
            return 'millisecond';
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
        const input = formatString.substr(1,formatString.length -2);
        const fields = input.split(/(Z|DD|D|MMMM|MMM|MM|M|YYYY|HH|H|mm|ss|SSS)+/);
        let tokens = '';

        let parsedDateTime = '{"$class" : "ParsedDateTime",';
        let fieldNames = [];
        let end = fields.length-1;
        let hasTimeZone = DateTimeFormatParser.parseDateTimeFormatField(fields[fields.length-2]) === 'timezone';

        if(hasTimeZone)  {
            end = fields.length-3;
        }

        fields.forEach((field, index) => {
            if(index > 0 && index < end) {
                const fieldName = DateTimeFormatParser.parseDateTimeFormatField(field);

                if(fieldName) {
                    if(fieldName === 'timezone') {
                        throw new Error('Timezone must be last format field.');
                    }
                    if(fieldNames.indexOf(fieldName) >= 0) {
                        throw new Error(`Duplicate ${fieldName} field in date time format string: ${formatString}`);
                    }
                    else {
                        parsedDateTime += `   "${fieldName}": d[${index-1}]`;
                        if(index < fields.length-2 ) {
                            parsedDateTime += ',';
                        }
                        tokens += field + ' ';
                        fieldNames.push(fieldName);
                    }
                }
                else {
                    tokens += ` "${field}" `;
                }
            }
        });

        if(hasTimeZone) {
            tokens += 'Z';
            parsedDateTime += `   "timezone": d[${fields.length-2}]`;
        }

        parsedDateTime += '}';

        const action = `{% (d) => {return ${parsedDateTime};}%}`;
        const name = 'DateTime_' + crypto.createHash('md5').update(formatString).digest('hex');

        return { tokens, name, action};
    }
}

module.exports = DateTimeFormatParser;