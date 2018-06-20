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
const Engine = require('@accordproject/cicero-engine').Engine;

const fs = require('fs');
const path = require('path');
const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));
const moment = require('moment');

describe('Logic', () => {

    const rootDir = path.resolve(__dirname, '..');
    const clauseText = fs.readFileSync(path.resolve(rootDir, 'sample.txt'), 'utf8');

    let template;
    let clause;
    let engine;    

    beforeEach( async function() {
        template = await Template.fromDirectory(rootDir);
        clause = new Clause(template);
        clause.parse(clauseText);
        engine = new Engine();    
    });
    
    describe('#Installment', async function() {

        it('pay one installment', async function() {
            const request = {};
            request.$class = 'org.accordproject.installmentsale.Installment';
            request.amount = 2500.00;
            const state = {};
            state.$class = 'org.accordproject.installmentsale.InstallmentSaleState';
            state.stateId = 'org.accordproject.installmentsale.InstallmentSaleState#1';
            state.status = 'WaitingForFirstDayOfNextMonth';
            state.balance_remaining = 10000.00;
            state.total_paid = 0.00;
            state.next_payment_month = 3;
            const result = await engine.execute(clause, request, state);
            result.should.not.be.null;
            result.response.balance.should.equal(7612.499999999999);
        });
    });
    
    describe('#Installment', async function() {

        it('pay in four installments', async function() {
            const request1 = {};
            request1.$class = 'org.accordproject.installmentsale.Installment';
            request1.amount = 2500.00;
            const request2 = {};
            request2.$class = 'org.accordproject.installmentsale.ClosingPayment';
            request2.amount = 3229.525312499998;
            const state = {};
            state.$class = 'org.accordproject.installmentsale.InstallmentSaleState';
            state.stateId = 'org.accordproject.installmentsale.InstallmentSaleState#1';
            state.status = 'WaitingForFirstDayOfNextMonth';
            state.balance_remaining = 10000.00;
            state.total_paid = 0.00;
            state.next_payment_month = 3;
            const result1 = await engine.execute(clause, request1, state);
            const result2 = await engine.execute(clause, request1, result1.state);
            const result3 = await engine.execute(clause, request1, result2.state);
            const result4 = await engine.execute(clause, request2, result3.state);
            result4.should.not.be.null;
            result4.response.balance.should.equal(0.00);
        });
    });
});