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

const MonetaryAmountFormatParser = require('../lib/monetaryamountformatparser');
const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('MonetaryAmountFormatParser', () => {

    describe('#parseMonetaryAmountFormatField', () => {

        it('should identity symbol', async function() {
            MonetaryAmountFormatParser.parseMonetaryAmountFormatField('K').should.eql('currencySymbol');
        });
        it('should identity code', async function() {
            MonetaryAmountFormatParser.parseMonetaryAmountFormatField('CCC').should.eql('currencyCode');
        });

        it('should identity value', async function() {
            MonetaryAmountFormatParser.parseMonetaryAmountFormatField(MonetaryAmountFormatParser.amountFormatField('0.0,0')).should.eql('doubleValue');
            MonetaryAmountFormatParser.parseMonetaryAmountFormatField(MonetaryAmountFormatParser.amountFormatField('0.0,00')).should.eql('doubleValue');
            MonetaryAmountFormatParser.parseMonetaryAmountFormatField(MonetaryAmountFormatParser.amountFormatField('0.0,00')).should.eql('doubleValue');
            MonetaryAmountFormatParser.parseMonetaryAmountFormatField(MonetaryAmountFormatParser.amountFormatField('0 0.00')).should.eql('doubleValue');
        });
    });

    describe('#buildFormatRules', () => {
        it('should parse K0,0.0', async function() {
            const result = (new MonetaryAmountFormatParser()).buildFormatRules('"K0,0.0"');
            result[result.length-1].tokens.should.eql('K A_7ff19ce28af89bde1258b9fc28bcfbf9 ');
            result[result.length-1].action.should.eql('{% (d) => {return {"$class" : "ParsedMonetaryAmount",   "currencySymbol": d[0],   "doubleValue": d[1]};}%}');
        });

        it('should fail to parse K0,0.0K', async function() {
            (()=> (new MonetaryAmountFormatParser()).buildFormatRules('"K0,0.0K"')).should.throw('Duplicate currencySymbol');
        });
    });
});