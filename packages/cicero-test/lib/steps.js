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

const Path = require('path');

const Chai = require('chai');
const expect = Chai.expect;

const Util = require('@accordproject/ergo-test/lib/util');
const Template = require('@accordproject/cicero-core').Template;
const Clause = require('@accordproject/cicero-core').Clause;
const Engine = require('@accordproject/cicero-engine').Engine;

const { Before, Given, When, Then, setDefaultTimeout } = require('cucumber');

// Defaults
const defaultState = {
    '$class':'org.accordproject.cicero.contract.AccordContractState',
    'stateId':'org.accordproject.cicero.contract.AccordContractState#1'
};

/**
 * Initializes the contract
 *
 * @param {object} engine - the Cicero engine
 * @param {object} clause - the clause instance
 * @param {string} currentTime - the definition of 'now'
 * @returns {object} Promise to the response
 */
async function init(engine,clause,currentTime) {
    return engine.init(clause,currentTime);
}

/**
 * Send a request to the contract
 *
 * @param {object} engine - the Cicero engine
 * @param {object} clause - the clause instance
 * @param {object} request - the request data in JSON
 * @param {object} state - the state data in JSON
 * @param {string} currentTime - the definition of 'now'
 * @returns {object} Promise to the response
 */
async function trigger(engine,clause,request,state,currentTime) {
    if (state === null) {
        const initAnswer = await init(engine,clause,currentTime);
        const initState = initAnswer.state;
        return engine.trigger(clause,request,initState,currentTime);
    } else {
        return engine.trigger(clause,request,state,currentTime);
    }
}

/**
 * Load a clause from directory
 *
 * @param {string} templateDir the directory for the template
 * @return {object} Promise to the new clause
 */
async function loadClause(templateDir) {
    const template = await Template.fromDirectory(templateDir);
    return new Clause(template);
}

Before(function () {
    setDefaultTimeout(40 * 1000);

    this.engine = new Engine();
    this.currentTime = '1970-01-01T00:00:00Z';
    this.state = null;
    this.clause = null;
    this.request = null;
    this.answer = null;
});

Given('the template in {string}', async function(dir) {
    const templateDir = Path.resolve(Util.resolveRootDir(this.parameters),dir);
    const clause = await loadClause(templateDir);
    this.request = clause.getTemplate().getMetadata().getRequest();
    this.clause = clause;
});

Given('the current time is {string}', function(currentTime) {
    this.currentTime = currentTime;
});

Given('that the contract says', async function (contractText) {
    if (!this.clause) {
        const templateDir = Path.resolve(Util.resolveRootDir(this.parameters),'.');
        const clause = await loadClause(templateDir);
        this.request = clause.getTemplate().getMetadata().getRequest();
        this.clause = clause;
    }
    this.clause.parse(contractText,this.currentTime);
});

Given('that the contract data is', async function (contractData) {
    const dataJson = JSON.parse(contractData);
    if (!this.clause) {
        const templateDir = Path.resolve(Util.resolveRootDir(this.parameters),'.');
        const clause = await loadClause(templateDir);
        this.request = clause.getTemplate().getMetadata().getRequest();
        this.clause = clause;
    }
    this.clause.setData(dataJson);
});

Given('the default( sample) contract', async function () {
    if (!this.clause) {
        const templateDir = Path.resolve(Util.resolveRootDir(this.parameters),'.');
        const clause = await loadClause(templateDir);
        this.request = clause.getTemplate().getMetadata().getRequest();
        this.clause = clause;
    }
    this.clause.parse(this.clause.getTemplate().getMetadata().getSample(),this.currentTime);
});

Given('the state', function (actualState) {
    this.state = JSON.parse(actualState);
});

When('it is in the state', function (actualState) {
    this.state = JSON.parse(actualState);
});

When('it receives the request', function (actualRequest) {
    this.request = JSON.parse(actualRequest);
});

When('it receives the default request', function () {
    this.request = this.clause.getTemplate().getMetadata().getRequest();
});

Then('the initial state( of the contract) should be', function (expectedState) {
    const state = JSON.parse(expectedState);
    return init(this.engine,this.clause,this.currentTime)
        .then((actualAnswer) => {
            this.answer = actualAnswer;
            expect(actualAnswer).to.have.property('state');
            expect(actualAnswer).to.not.have.property('error');
            return Util.compareSuccess({ state },actualAnswer);
        });
});

Then('the initial state( of the contract) should be the default state', function () {
    const state = defaultState;
    return init(this.engine,this.clause,this.currentTime)
        .then((actualAnswer) => {
            this.answer = actualAnswer;
            expect(actualAnswer).to.have.property('state');
            expect(actualAnswer).to.not.have.property('error');
            return Util.compareSuccess({ state },actualAnswer);
        });
});

Then('the contract data should be', async function (contractData) {
    const expectedData = JSON.parse(contractData);
    return Util.compareComponent(expectedData,this.clause.getData());
});

Then('it should respond with', function (expectedResponse) {
    const response = JSON.parse(expectedResponse);
    if (this.answer) {
        expect(this.answer).to.have.property('response');
        expect(this.answer).to.not.have.property('error');
        return Util.compareSuccess({ response },this.answer);
    } else {
        return trigger(this.engine,this.clause,this.request,this.state,this.currentTime)
            .then((actualAnswer) => {
                this.answer = actualAnswer;
                expect(actualAnswer).to.have.property('response');
                expect(actualAnswer).to.not.have.property('error');
                return Util.compareSuccess({ response },actualAnswer);
            });
    }
});

Then('the new state( of the contract) should be', function (expectedState) {
    const state = JSON.parse(expectedState);
    if (this.answer) {
        expect(this.answer).to.have.property('state');
        expect(this.answer).to.not.have.property('error');
        return Util.compareSuccess({ state },this.answer);
    } else {
        return trigger(this.engine,this.clause,this.request,this.state,this.currentTime)
            .then((actualAnswer) => {
                this.answer = actualAnswer;
                expect(actualAnswer).to.have.property('state');
                expect(actualAnswer).to.not.have.property('error');
                return Util.compareSuccess({ state },actualAnswer);
            });
    }
});

Then('the following obligations should have( also) been emitted', function (expectedEmit) {
    const emit = JSON.parse(expectedEmit);
    if (this.answer) {
        expect(this.answer).to.have.property('emit');
        expect(this.answer).to.not.have.property('error');
        return Util.compareSuccess({ emit },this.answer);
    } else {
        return trigger(this.engine,this.clause,this.request,this.state,this.currentTime)
            .then((actualAnswer) => {
                this.answer = actualAnswer;
                expect(actualAnswer).to.have.property('emit');
                expect(actualAnswer).to.not.have.property('error');
                return Util.compareSuccess({ emit },actualAnswer);
            });
    }
});

Then('it should reject the request with the error {string}', function (expectedError) {
    return trigger(this.engine,this.clause,this.request,this.state,this.currentTime)
        .catch((actualError) => {
            expect(actualError.message).to.equal(expectedError);
        });
});

