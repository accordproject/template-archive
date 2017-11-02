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

const Template = require('@clausehq/accord-core').Template;
const Clause = require('@clausehq/accord-core').Clause;
const Engine = require('../lib/engine');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
const sinon = require('sinon');

const fs = require('fs');
const path = require('path');

describe('Engine', () => {

    let sandbox;
    let engine;
    let clause;
    let template;
    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/', 'sample.txt'), 'utf8');

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        engine = new Engine();

        return Template.fromDirectory('./test/data/latedeliveryandpenalty')
            .then((t) => {
                template = t;
                clause = new Clause(template);
                clause.parse(testLatePenaltyInput);
            });
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#execute', () => {

        it('should execute a smart clause', () => {
            const request = {'$class':'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest','forceMajeure':false,'agreedDelivery':'2017-10-07T16:38:01.412Z','goodsValue':200,'transactionId':'402c8f50-9e61-433e-a7c1-afe61c06ef00','timestamp':'2017-11-12T17:38:01.412Z'};
            return engine.execute(clause, request)
                .then((result) => {
                    result.should.not.be.null;
                    result.response.penalty.should.equal(110.00000000000001);
                });
        });
    });
});
