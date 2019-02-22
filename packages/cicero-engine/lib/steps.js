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

const Template = require('@accordproject/cicero-core').Template;
const Clause = require('@accordproject/cicero-core').Clause;
const Engine = require('./engine');
const Util = require('./util');

const { Before, Given, When, Then } = require('cucumber');

// Defaults
const defaultState = {
    '$class':'org.accordproject.cicero.contract.AccordContractState',
    'stateId':'org.accordproject.cicero.contract.AccordContractState#1'
};
const initRequest = {'$class':'org.accordproject.cicero.runtime.Request'};

/**
 * Initializes the contract
 *
 * @param {object} engine - the Cicero engine
 * @param {object} clause - the clause instance
 * @param {object} request - the request data in JSON
 * @param {string} currentTime - the definition of 'now'
 * @returns {object} Promise to the response
 */
async function init(engine,clause,request,currentTime) {
    return engine.init(clause,request,currentTime);
}

/**
 * Sends a request to the contract
 *
 * @param {object} engine - the Cicero engine
 * @param {object} clause - the clause instance
 * @param {object} request - the request data in JSON
 * @param {object} state - the state data in JSON
 * @param {string} currentTime - the definition of 'now'
 * @returns {object} Promise to the response
 */
async function send(engine,clause,request,state,currentTime) {
    if (state === null) {
        const initAnswer = await init(engine,clause,initRequest,currentTime);
        const initState = initAnswer.state;
        return engine.execute(clause,request,initState,currentTime);
    } else {
        return engine.execute(clause,request,state,currentTime);
    }
}

/**
 * Compare actual result and expected result
 *
 * @param {string} expected the result as specified in the test workload
 * @param {string} actual the result as returned by the engine
 */
function compare(expected,actual) {
    // Some basic deep comparison for arrays, since Chai doesn't do the right thing
    if (Array.isArray(actual)) {
        for (let i = 0; i < expected.length; i++) {
            expect(actual[i]).to.deep.include(expected[i]);
        }
    } else {
        expect(actual).to.deep.include(expected);
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
    this.clause.parse(contractText);
});

Given('the default( sample) contract', async function () {
    if (!this.clause) {
        const templateDir = Path.resolve(Util.resolveRootDir(this.parameters),'.');
        const clause = await loadClause(templateDir);
        this.request = clause.getTemplate().getMetadata().getRequest();
        this.clause = clause;
    }
    this.clause.parse(this.clause.getTemplate().getMetadata().getSample());
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
    return init(this.engine,this.clause,initRequest,this.currentTime)
        .then((actualAnswer) => {
            expect(actualAnswer).to.have.property('state');
            expect(actualAnswer).to.not.have.property('error');
            return compare(state,actualAnswer.state);
        });
});

Then('the initial state( of the contract) should be the default state', function () {
    const state = defaultState;
    return init(this.engine,this.clause,initRequest,this.currentTime)
        .then((actualAnswer) => {
            expect(actualAnswer).to.have.property('state');
            expect(actualAnswer).to.not.have.property('error');
            return compare(state,actualAnswer.state);
        });
});

Then('the contract data should be', async function (contractData) {
    const expectedData = JSON.parse(contractData);
    return compare(expectedData,this.clause.getData());
});

Then('it should respond with', function (expectedResponse) {
    const response = JSON.parse(expectedResponse);
    if (this.answer) {
        expect(this.answer).to.have.property('response');
        expect(this.answer).to.not.have.property('error');
        return compare(response,this.answer.response);
    } else {
        return send(this.engine,this.clause,this.request,this.state,this.currentTime)
            .then((actualAnswer) => {
                this.answer = actualAnswer;
                expect(actualAnswer).to.have.property('response');
                expect(actualAnswer).to.not.have.property('error');
                return compare(response,actualAnswer.response);
            });
    }
});

Then('the new state( of the contract) should be', function (expectedState) {
    const state = JSON.parse(expectedState);
    if (this.answer) {
        expect(this.answer).to.have.property('state');
        expect(this.answer).to.not.have.property('error');
        return compare(state,this.answer.state);
    } else {
        return send(this.engine,this.clause,this.request,this.state,this.currentTime)
            .then((actualAnswer) => {
                this.answer = actualAnswer;
                expect(actualAnswer).to.have.property('state');
                expect(actualAnswer).to.not.have.property('error');
                return compare(state,actualAnswer.state);
            });
    }
});

Then('the following obligations should have( also) been emitted', function (expectedEmit) {
    const emit = JSON.parse(expectedEmit);
    if (this.answer) {
        expect(this.answer).to.have.property('emit');
        expect(this.answer).to.not.have.property('error');
        return compare(emit,this.answer.emit);
    } else {
        return send(this.engine,this.clause,this.request,this.state,this.currentTime)
            .then((actualAnswer) => {
                this.answer = actualAnswer;
                expect(actualAnswer).to.have.property('emit');
                expect(actualAnswer).to.not.have.property('error');
                return compare(emit,actualAnswer.emit);
            });
    }
});

Then('it should reject the request with the error {string}', function (expectedError) {
    return send(this.engine,this.clause,this.request,this.state,this.currentTime)
        .catch((actualError) => {
            expect(actualError.message).to.equal(expectedError);
        });
});

