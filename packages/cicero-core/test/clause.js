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

const Template = require('../lib/template');
const Clause = require('../lib/clause');

const chai = require('chai');
const fs = require('fs');
const path = require('path');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));
const sinon = require('sinon');

describe('Clause', () => {

    let sandbox;
    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty', 'sample.txt'), 'utf8');
    const testCongaInput = fs.readFileSync(path.resolve(__dirname, 'data/conga', 'sample.txt'), 'utf8');

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#constructor', () => {

        it('should create a clause for a latedeliveryandpenalty template', () => {
            return Template.fromDirectory('./test/data/latedeliveryandpenalty')
                .then((template) => {
                    const clause = new Clause(template);
                    clause.should.not.be.null;
                });
        });

        it('should create a clause for a conga template', () => {
            return Template.fromDirectory('./test/data/conga')
                .then((template) => {
                    const clause = new Clause(template);
                    clause.should.not.be.null;
                });
        });
    });

    describe('#setData', () => {

        it('should be able to set data', () => {
            return Template.fromDirectory('./test/data/latedeliveryandpenalty')
                .then((template) => {
                    const clause = new Clause(template);

                    // check that we can set/get a valid template model
                    const data = {
                        $class: 'io.clause.latedeliveryandpenalty.TemplateModel',
                        forceMajeure: false,
                        penaltyDuration : {
                            $class : 'org.accord.base.Duration',
                            amount : 1,
                            unit : 'DAY'
                        },
                        penaltyPercentage : 10,
                        capPercentage : 50,
                        termination : {
                            $class : 'org.accord.base.Duration',
                            amount : 10,
                            unit : 'DAY'
                        },
                        fractionalPart : 'DAY'
                    };
                    clause.setData(data);
                    clause.getData().should.eql(data);
                });
        });
    });

    describe('#parse', () => {

        it('should be able to set the data from latedeliveryandpenalty natural language text', () => {
            return Template.fromDirectory('./test/data/latedeliveryandpenalty')
                .then((template) => {
                    const clause = new Clause(template);
                    clause.parse(testLatePenaltyInput);
                    const data = {
                        $class: 'io.clause.latedeliveryandpenalty.TemplateModel',
                        capPercentage: 2,
                        forceMajeure: true,
                        fractionalPart : 'DAY',
                        penaltyDuration: {
                            $class: 'org.accord.base.Duration',
                            amount: 9,
                            unit: 'DAY'
                        },
                        penaltyPercentage: 7,
                        termination: {
                            $class: 'org.accord.base.Duration',
                            amount: 2,
                            unit: 'WEEK',
                        }
                    };
                    clause.getData().should.eql(data);

                    clause.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1-f29b89b0cdced37fca2508346a9fdb425a8523a1ab913d3af77d9ee8fbd56e8e');
                });
        });

        it('should be able to set the data from conga natural language text', () => {
            return Template.fromDirectory('./test/data/conga')
                .then((template) => {
                    const clause = new Clause(template);
                    clause.parse(testCongaInput);
                    const data = {
                        $class: 'org.accordproject.conga.TemplateModel',
                        participant: 'Dan Selman',
                        amount: 100.0,
                        swag: 'penguins'
                    };
                    clause.getData().should.eql(data);
                    clause.getIdentifier().should.equal('conga@0.0.1-e204ba22ff8e8fddb341da6d67041bfa74b84937c8fe01b1e9bd73b5375a9168');
                });
        });
    });
});