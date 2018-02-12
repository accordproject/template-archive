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

const chai = require('chai');
const path = require('path');
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/commands');

describe('cicero-cli', () => {
    const template = path.resolve(__dirname, 'data/latedeliveryandpenalty/');
    const sample = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'sample.txt');
    const data = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data.json');

    describe('#parse', () => {
        it('should parse a clause using a template', () => {
            return Commands.parse(template, sample).should.eventually.eql({
                '$class':'org.accordproject.latedeliveryandpenalty.TemplateModel',
                'forceMajeure':true,
                'penaltyDuration':{
                    '$class':'org.accordproject.latedeliveryandpenalty.Duration',
                    'amount':9,
                    'unit':'DAY'
                },
                'penaltyPercentage':7,
                'capPercentage':2,
                'termination':{
                    '$class':'org.accordproject.latedeliveryandpenalty.Duration',
                    'amount':2,
                    'unit':'WEEK'
                },
                'fractionalPart':'DAY'
            });
        });
    });

    describe('#execute', () => {
        it('should execute a clause using a template', async () => {
            const response = await Commands.execute(template, sample, data);
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(4);
            response.response.buyerMayTerminate.should.be.equal(false);
        });
    });

});