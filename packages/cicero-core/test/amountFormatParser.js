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

const AmountFormatParser = require('../lib/amountformatparser');
const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('AmountFormatParser', () => {

    describe('#parseAmountFormatField', () => {
        it('should identity value', async function() {
            AmountFormatParser.parseAmountFormatField(AmountFormatParser.amountFormatField('0.0,0')).should.eql('doubleValue');
            AmountFormatParser.parseAmountFormatField(AmountFormatParser.amountFormatField('0.0,00')).should.eql('doubleValue');
            AmountFormatParser.parseAmountFormatField(AmountFormatParser.amountFormatField('0.0,00')).should.eql('doubleValue');
            AmountFormatParser.parseAmountFormatField(AmountFormatParser.amountFormatField('0 0.00')).should.eql('doubleValue');
        });
    });

    describe('#buildFormatRules', () => {
        it('should parse K0,0.0', async function() {
            const result = (new AmountFormatParser()).buildFormatRules('"K0,0.0"');
            result[result.length-1].tokens.should.eql(' "K" A_7ff19ce28af89bde1258b9fc28bcfbf9 ');
            result[result.length-1].action.should.eql('{% (d) => {return {"$class" : "ParsedAmount",   "doubleValue": d[1]};}%}');
        });

        it('should fail to parse 0,0.0 0 0,0', async function() {
            (()=> (new AmountFormatParser()).buildFormatRules('"0,0.0 0 0,0"')).should.throw('Duplicate doubleValue');
        });
    });
});
