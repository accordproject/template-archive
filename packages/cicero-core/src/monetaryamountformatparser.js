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
const AmountFormatParser = require('./amountformatparser');

/**
 * Parses a monetary/amount format string
 * @class
 * @public
 */
class MonetaryAmountFormatParser extends AmountFormatParser {
    /**
     * Given current grammar parts, add necessary grammars parts for the format.
     * @param {object[]} grammars - the current grammar parts
     * @param {string} field - grammar field
     */
    addGrammars(grammars) {
        super.addGrammars(grammars);
        if(!grammars.monetaryAmount) {
            grammars.monetaryAmount = require('./grammars/monetaryamount');
        }
    }

    /**
     * Converts a format string to a Nearley action
     * @param {string} formatString - the input format string
     * @returns {{tokens: String, action: String, name: String }} the tokens and action and name to use for the Nearley rule
     */
    buildFormatRules(formatString) {
        // strip quotes
        let input = formatString.substr(1,formatString.length -2);
        let rules = [];

        let fields = input.split(/(CCC|K|0.0.00?0?)/);
        // remove the empty items
        fields = fields.filter(x => x !== '');
        let tokens1 = '';
        let parsedMonetaryAmount = '{"$class" : "ParsedMonetaryAmount",';
        let fieldNames = [];

        fields.forEach((field, index) => {
            let sep1;
            let sep2;
            let name0;

            if (/0.0.00?0?/.test(field)) {
                sep1 = field.charAt(1);
                sep2 = field.charAt(3);
                name0 = MonetaryAmountFormatParser.amountFormatField(field);
                field = name0;
            }
            const fieldName = MonetaryAmountFormatParser.parseMonetaryAmountFormatField(field);

            if(fieldName) {
                if(fieldNames.indexOf(fieldName) >= 0) {
                    throw new Error(`Duplicate ${fieldName} field in monetary amount format string: ${formatString}`);
                }
                else {
                    parsedMonetaryAmount += `   "${fieldName}": d[${index}]`;
                    if(index < fields.length-1 ) {
                        parsedMonetaryAmount += ',';
                    }
                    tokens1 += field + ' ';
                    fieldNames.push(fieldName);
                }
            }
            else {
                tokens1 += ` "${field}" `;
            }

            // Add rule for 0.0.00
            if (name0) {
                const tokens0 = `APREFIX ("${sep1}" ATRIPLE):* "${sep2}" AFRACTION`;
                const action0 = '{% (d) => {return parseFloat(\'\' + d[0] + d[1].map(x => x[1]).join(\'\') + \'.\' + d[3]);}%}';
                return rules.push({ tokens: tokens0, name: name0, action: action0});
            }
        });

        parsedMonetaryAmount += '}';

        const name1 = 'MonetaryAmount_' + crypto.createHash('md5').update(formatString).digest('hex');
        const action1 = `{% (d) => {return ${parsedMonetaryAmount};}%}`;

        rules.push({ tokens: tokens1, name: name1, action: action1});
        return rules;
    }

    /**
     * Given a format field (like CCC or 0,0.0) this method returns
     * a logical name for the field. Note the logical names
     * have been picked to align with the moment constructor that takes an object.
     * @param {string} field - the input format field
     * @returns {string} the field designator
     */
    static parseMonetaryAmountFormatField(field) {
        if (field.substring(0,2) === 'A_') {
            return 'doubleValue';
        } else {
            switch(field) {
            case 'CCC':
                return 'currencyCode';
            case 'K':
                return 'currencySymbol';
            default:
                return null;
            }
        }
    }
}

module.exports = MonetaryAmountFormatParser;