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

const Template = require('@accordproject/cicero-core').Template;
const Clause = require('@accordproject/cicero-core').Clause;
const Engine = require('../lib/engine');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));

const fs = require('fs');
const path = require('path');

describe('EngineLatePenalty', () => {

    let engine;
    let clause;
    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty', 'sample.txt'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
        clause = new Clause(template);
        clause.parse(testLatePenaltyInput);
    });

    afterEach(() => {});

    describe('#execute', function () {

        it('should execute a smart clause', async function () {
            const request = {
                '$class': 'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest',
                'forceMajeure': false,
                'agreedDelivery': '2017-10-07T16:38:01.412Z',
                'goodsValue': 200,
                'transactionId': '402c8f50-9e61-433e-a7c1-afe61c06ef00',
                'timestamp': '2017-11-12T17:38:01.412Z'
            };
            const result = await engine.execute(clause, request, true);
            result.should.not.be.null;
            result.response.penalty.should.equal(110.00000000000001);
        });
    });
    describe('#executejura', function () {

        it('should execute a smart clause', async function () {
            const request = {
                '$class': 'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest',
                'forceMajeure': false,
                'agreedDelivery': '2017-10-07T16:38:01.412Z',
                'goodsValue': 200.00,
                'transactionId': '402c8f50-9e61-433e-a7c1-afe61c06ef00',
                'timestamp': '2017-11-12T17:38:01.412Z'
            };
            const result = await engine.execute(clause, request, false);
            result.should.not.be.null;
            result.response.penalty.should.equal(110);
        });
    });
});
describe('EngineVolumeDiscount', () => {

    let engine;
    let clause;
    const volumeDiscountInput = fs.readFileSync(path.resolve(__dirname, 'data/volumediscount', 'sample.txt'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/volumediscount');
        clause = new Clause(template);
        clause.parse(volumeDiscountInput);
    });

    afterEach(() => {});

    describe('#execute', function () {

        it('should execute a smart clause', async function () {
            const request = {
                '$class': 'org.accordproject.volumediscount.VolumeDiscountRequest',
                'netAnnualChargeVolume': 0.4
            };
            const result = await engine.execute(clause, request, true);
            result.should.not.be.null;
            result.response.discountRate.should.equal(3);
        });
    });
});
describe('EngineHelloWorld', () => {

    let engine;
    let clause;
    const helloWorldInput = fs.readFileSync(path.resolve(__dirname, 'data/helloworld', 'sample.txt'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/helloworld');
        clause = new Clause(template);
        clause.parse(helloWorldInput);
    });

    afterEach(() => {});

    describe('#execute', function () {

        it('should execute a smart clause', async function () {
            const request = {
                '$class': 'org.accordproject.helloworld.Request',
                'input': 'Accord Project'
            };
            const result = await engine.execute(clause, request, false);
            result.should.not.be.null;
            result.response.output.should.equal('Hello Fred Blogs (Accord Project)');
        });
    });
    describe('#execute2', function () {

        it('should execute a smart clause', async function () {
            try {
                const request = {
                    '$class': 'org.accordproject.helloworld.Request',
                    'input': 'Accord Project'
                };
                const result = await engine.execute(clause, request, true);
                return result;
            } catch (err) {
                err.should.be.Error;
            }
        });
    });
});
