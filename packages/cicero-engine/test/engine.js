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
chai.use(require('chai-as-promised'));

const fs = require('fs');
const path = require('path');

const options = { skipUpdateExternalModels: true };

describe('EngineLatePenalty', () => {

    let engine;
    let clause;
    let clause2;
    let template;
    let template2;
    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty', 'text/sample.md'), 'utf8');
    const testLatePenaltyPeriodInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty-period', 'text/sample.md'), 'utf8');

    before(async () => {
        template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
        template2 = await Template.fromDirectory('./test/data/latedeliveryandpenalty-period', options);
    });

    beforeEach(async function () {
        engine = new Engine();
        clause = new Clause(template);
        clause.parse(testLatePenaltyInput);
        clause2 = new Clause(template2);
        clause2.parse(testLatePenaltyPeriodInput);
    });

    afterEach(() => {});

    describe('#triggerergo', function () {

        it('should trigger a late delivery and penalty smart clause', async function () {
            const request = {};
            request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            request.forceMajeure = false;
            request.agreedDelivery = '2017-10-07T16:38:01Z';
            request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause, request, state, '2017-11-12T17:38:01Z');
            result.should.not.be.null;
            result.response.penalty.should.equal(110);
            result.response.buyerMayTerminate.should.equal(true);
        });

        it('should trigger a late delivery and penalty smart clause in the ET timezone', async function () {
            const request = {};
            request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            request.forceMajeure = false;
            request.agreedDelivery = '2017-11-10T16:38:01-05:00';
            request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause, request, state, '2017-11-12T17:38:01-05:00');
            result.should.not.be.null;
            result.response.penalty.should.equal(21);
            result.response.buyerMayTerminate.should.equal(false);
        });

        it('should fail to trigger if the current time is not in the right format', async function () {
            const request = {};
            request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            request.forceMajeure = false;
            request.agreedDelivery = '2017-11-10T16:38:01-05:00';
            request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            return engine.trigger(clause, request, state, 'foobar').should.be.rejectedWith('Cannot set current time to \'foobar\' with UTC offset \'undefined\'');
        });

        it('should trigger a late delivery and penalty smart clause with a time period', async function () {
            const request = {};
            request.$class = 'org.accordproject.simplelatedeliveryandpenalty.SimpleLateDeliveryAndPenaltyRequest';
            request.agreedDelivery = '2017-10-07T16:38:01Z';
            request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause2, request, state, '2019-11-12T17:38:01Z');
            result.should.not.be.null;
            result.response.penalty.should.equal(87.5);
            result.response.buyerMayTerminate.should.equal(true);
        });
    });

    describe('#invokeergo', function () {

        it('should invoke a late delivery and penalty smart clause', async function () {
            const params = { 'request' : {} };
            params.request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            params.request.forceMajeure = false;
            params.request.agreedDelivery = '2017-10-07T16:38:01Z';
            params.request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.invoke(clause, 'latedeliveryandpenalty', params, state, '2017-11-12T17:38:01Z');
            result.should.not.be.null;
            result.response.penalty.should.equal(110);
            result.response.buyerMayTerminate.should.equal(true);
        });

        it('should invoke a late delivery and penalty smart clause in the ET timezone', async function () {
            const params = { 'request' : {} };
            params.request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            params.request.forceMajeure = false;
            params.request.agreedDelivery = '2017-11-10T16:38:01-05:00';
            params.request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.invoke(clause, 'latedeliveryandpenalty', params, state, '2017-11-12T17:38:01-05:00');
            result.should.not.be.null;
            result.response.penalty.should.equal(21);
            result.response.buyerMayTerminate.should.equal(false);
        });

        it('should fail to invoke if the current time is not in the right format', async function () {
            const params = { 'request' : {} };
            params.request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            params.request.forceMajeure = false;
            params.request.agreedDelivery = '2017-11-10T16:38:01-05:00';
            params.request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            return engine.invoke(clause, 'latedeliveryandpenalty', params, state, 'foobar').should.be.rejectedWith('Cannot set current time to \'foobar\' with UTC offset \'undefined\'');
        });

        it('should invoke a late delivery and penalty smart clause with a time period', async function () {
            const params = { 'request' : {} };
            params.request.$class = 'org.accordproject.simplelatedeliveryandpenalty.SimpleLateDeliveryAndPenaltyRequest';
            params.request.agreedDelivery = '2017-10-07T16:38:01Z';
            params.request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.invoke(clause2, 'latedeliveryandpenalty', params, state, '2019-11-12T17:38:01Z');
            result.should.not.be.null;
            result.response.penalty.should.equal(87.5);
            result.response.buyerMayTerminate.should.equal(true);
        });
    });
});

describe('EngineLatePenalty (JavaScript)', () => {

    let engine;
    let clause;
    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty_js', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty_js', options);
        clause = new Clause(template);
        clause.parse(testLatePenaltyInput);
    });

    afterEach(() => {});

    describe('#triggerjavascript', function () {

        it('should trigger a late delivery and penalty smart clause (JavaScript)', async function () {
            const request = {};
            request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            request.forceMajeure = false;
            request.agreedDelivery = '2017-10-07T16:38:01Z';
            request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause, request, state, '2017-11-12T17:38:01Z');
            result.should.not.be.null;
            result.response.penalty.should.equal(110);
            result.response.buyerMayTerminate.should.equal(true);
        });

        it('should trigger a late delivery and penalty smart clause in the ET timezone (JavaScript)', async function () {
            const request = {};
            request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            request.forceMajeure = false;
            request.agreedDelivery = '2017-11-10T16:38:01-05:00';
            request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause, request, state, '2017-11-12T17:38:01-05:00');
            result.should.not.be.null;
            result.response.penalty.should.equal(21);
            result.response.buyerMayTerminate.should.equal(false);
        });

        it('should fail to trigger if the current time is not in the right format (JavaScript)', async function () {
            const request = {};
            request.$class = 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            request.forceMajeure = false;
            request.agreedDelivery = '2017-11-10T16:38:01-05:00';
            request.goodsValue = 200.00;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            return engine.trigger(clause, request, state, 'foobar').should.be.rejectedWith('Cannot set current time to \'foobar\' with UTC offset \'undefined\'');
        });
    });
});

describe('EngineHelloWorld', () => {

    let engine;
    let clause;
    const helloWorldInput = fs.readFileSync(path.resolve(__dirname, 'data/helloworld', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/helloworld', options);
        clause = new Clause(template);
        clause.parse(helloWorldInput);
    });

    afterEach(() => {});

    describe('#trigger', function () {

        it('should trigger a smart clause', async function () {
            const request = {
                '$class': 'org.accordproject.helloworld.MyRequest',
                'input': 'Accord Project'
            };
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause, request, state);
            result.should.not.be.null;
            result.response.output.should.equal('Hello Fred Blogs (Accord Project)');
        });

        it('should trigger a smart clause with state initialization', async function () {
            const result = await engine.init(clause);
            result.state.should.not.be.null;
            const state = result.state;
            state.$class.should.equal('org.accordproject.runtime.State');
            const request1 = {
                '$class': 'org.accordproject.helloworld.MyRequest',
                'input': 'Accord Project'
            };
            const result1 = await engine.trigger(clause, request1, state);
            result1.should.not.be.null;
            result1.response.output.should.equal('Hello Fred Blogs (Accord Project)');
        });
    });
    describe('#trigger2', function () {

        it('should trigger a smart clause', async function () {
            try {
                const request = {
                    '$class': 'org.accordproject.helloworld.MyRequest',
                    'input': 'Accord Project'
                };
                const state = {};
                state.$class = 'org.accordproject.runtime.State';
                const result = await engine.trigger(clause, request, state);
                return result;
            } catch (err) {
                err.should.be.Error;
            }
        });
    });
});

describe('EngineHelloWorldState', () => {

    let engine;
    let clause;
    const helloWorldInput = fs.readFileSync(path.resolve(__dirname, 'data/helloworldstate', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/helloworldstate', options);
        clause = new Clause(template);
        clause.parse(helloWorldInput);
    });

    afterEach(() => {});

    describe('#initialize', function () {

        it('should initialize a state with counter set to 2', async function () {
            const params = { startsAt : 2 };
            const result = await engine.init(clause, null, null, params);
            result.should.not.be.null;
            result.state.counter.should.equal(2);
        });

    });
});

describe('EngineHelloModule', () => {

    let engine;
    let clause;
    const helloWorldInput = fs.readFileSync(path.resolve(__dirname, 'data/hellomodule', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/hellomodule', options);
        clause = new Clause(template);
        clause.parse(helloWorldInput);
    });

    afterEach(() => {});

    describe('#trigger', function () {

        it('should trigger a smart clause', async function () {
            const request = {
                '$class': 'org.accordproject.hellomodule.MyRequest',
                'input': 'Accord Project'
            };
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause, request, state);
            result.should.not.be.null;
            result.response.output.should.equal('Hello Fred Blogs (Accord Project) [motd: PI/2.0 radians is 90.0 degrees]');
        });
    });
});

describe('EngineHelloEmit', () => {

    let engine;
    let clause;
    const helloEmitInput = fs.readFileSync(path.resolve(__dirname, 'data/helloemit', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/helloemit', options);
        clause = new Clause(template);
        clause.parse(helloEmitInput);
    });

    afterEach(() => {});

    describe('#triggerandemit', function () {

        it('should trigger a smart clause which emits', async function () {
            const request = {
                '$class': 'org.accordproject.helloemit.MyRequest',
                'input': 'Accord Project'
            };
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause, request, state);
            result.should.not.be.null;
            result.response.output.should.equal('Hello Fred Blogs (Accord Project)');
            result.emit[0].$class.should.equal('org.accordproject.helloemit.Greeting');
            result.emit[0].message.should.equal('Voila!');
        });
    });
});

describe('EngineHelloEmitInit', () => {

    let engine;
    let clause;
    const helloEmitInitInput = fs.readFileSync(path.resolve(__dirname, 'data/helloemitinit', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/helloemitinit', options);
        clause = new Clause(template);
        clause.parse(helloEmitInitInput);
    });

    afterEach(() => {});

    describe('#triggerandemitinit', function () {

        it('should trigger a smart clause which emits during initialization', async function () {
            const result = await engine.init(clause);
            result.should.not.be.null;
            result.response.should.not.be.null;
            result.emit[0].$class.should.equal('org.accordproject.helloemit.Greeting');
            result.emit[0].message.should.equal('Voila!');
        });
    });
});

describe('EngineSaft', () => {

    let engine;
    let clause;
    const saftInput = fs.readFileSync(path.resolve(__dirname, 'data/saft', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/saft', options);
        clause = new Clause(template);
        clause.parse(saftInput);
    });

    afterEach(() => {});

    describe('#trigger', function () {

        it('should trigger a smart clause', async function () {
            const request = {};
            const NS = 'org.accordproject.saft';
            request.$class = `${NS}.Launch`;
            request.exchangeRate = 100;
            const state = {};
            state.$class = 'org.accordproject.runtime.State';
            const result = await engine.trigger(clause, request, state);
            result.should.not.be.null;
            result.response.tokenAmount.doubleValue.should.equal(100);
            result.response.tokenAddress.should.equal('Daniel Charles Selman');
        });
    });
});

describe('BogusClauses', () => {
    let engine;
    let clause;
    const testNoLogic = fs.readFileSync(path.resolve(__dirname, 'data/no-logic', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/no-logic', options);
        clause = new Clause(template);
        clause.parse(testNoLogic);
    });

    afterEach(() => {});

    it('should throw error when no __dispatch in JavaScript logic', async () => {
        const scriptManager = clause.getTemplate().getScriptManager();
        return (() => scriptManager.hasDispatch()).should.throw('Function __dispatch was not found in logic');
    });
    it('should throw error when no __init in JavaScript logic', async () => {
        const scriptManager = clause.getTemplate().getScriptManager();
        return (() => scriptManager.hasInit()).should.throw('Function __init was not found in logic');
    });
    it('should throw an error when JavaScript logic is missing', async function() {
        // Turn all JavaScript logic into something else
        const scriptManager = clause.getTemplate().getScriptManager();
        scriptManager.getAllScripts().forEach(function (element) {
            if (element.getLanguage() === '.js') {
                element.language = '.ergo';
            }
        }, this);
        scriptManager.compiledScript = null;
        (() => engine.getErgoEngine().cacheJsScript(scriptManager)).should.throw('Did not find any compiled JavaScript logic');
    });
    it('should throw an error when all logic is missing', async function() {
        // Remove all scripts
        const scriptManager = clause.getTemplate().getScriptManager();
        scriptManager.clearScripts();
        (() => engine.getErgoEngine().cacheJsScript(scriptManager)).should.throw('Did not find any compiled JavaScript logic');
    });
});

describe('EngineInstallmentSaleErgo', () => {

    let engine;
    let clause;
    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/installment-sale-ergo', 'text/sample.md'), 'utf8');

    beforeEach(async function () {
        engine = new Engine();
        const template = await Template.fromDirectory('./test/data/installment-sale-ergo', options);
        clause = new Clause(template);
        clause.parse(testLatePenaltyInput);
    });

    afterEach(() => {});

    describe('#trigger', function () {

        it('should trigger a smart clause', async function () {
            const request = {};
            request.$class = 'org.accordproject.installmentsale.Installment';
            request.amount = 2500.00;
            const state = {};
            state.$class = 'org.accordproject.installmentsale.InstallmentSaleState';
            state.status = 'WaitingForFirstDayOfNextMonth';
            state.balance_remaining = 10000.00;
            state.total_paid = 0.00;
            state.next_payment_month = 3.0;
            const result = await engine.trigger(clause, request, state);
            result.should.not.be.null;
            result.response.balance.should.equal(7612.499999999999);
            result.state.balance_remaining.should.equal(7612.499999999999);
            result.state.total_paid.should.equal(2500.00);
        });

        it('should initialize a smart clause', async function () {
            const result = await engine.init(clause);
            result.should.not.be.null;
            result.response.should.not.be.null;
            result.state.balance_remaining.should.equal(10000.00);
            result.state.total_paid.should.equal(0.0);
        });

        it('should initialize a smart clause and trigger one installment', async function () {
            const result = await engine.init(clause);
            result.should.not.be.null;
            result.response.should.not.be.null;
            result.state.balance_remaining.should.equal(10000.00);
            result.state.total_paid.should.equal(0.0);
            const request1 = {};
            request1.$class = 'org.accordproject.installmentsale.Installment';
            request1.amount = 2500.00;
            const result1 = await engine.trigger(clause, request1, result.state);
            result1.should.not.be.null;
            result1.response.balance.should.equal(7612.499999999999);
            result1.state.balance_remaining.should.equal(7612.499999999999);
            result1.state.total_paid.should.equal(2500.00);
        });
    });
});
