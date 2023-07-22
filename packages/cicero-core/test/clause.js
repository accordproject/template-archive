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

const Template = require('../src/template');
const Clause = require('../src/clause');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const options = { offline: true };

describe('Clause', () => {

    describe('#constructor', () => {

        it('should create a clause for a latedeliveryandpenalty template', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.should.not.be.null;
        });

        it('should create a clause for a conga template', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            clause.should.not.be.null;
        });

        it('should fail to create a clause for a template with a missing binding', async function() {
            try {
                await Template.fromDirectory('./test/data/bad-binding', options);
            } catch (err) {
                err.message.should.equal('Unknown property: articipant File text/grammar.tem.md line -1 column -1');
            }
        });

        it('should fail to create a clause for a template with a wrongly typed boolean binding', async function() {
            try {
                await Template.fromDirectory('./test/data/bad-boolean-binding', options);
            } catch (err) {
                err.message.should.equal('Conditional template not on a boolean property: participant File text/grammar.tem.md line -1 column -1');
            }
        });

        it('should fail to create a clause for a template with a wrongly typed formatted binding', async function() {
            try {
                await Template.fromDirectory('./test/data/bad-formatted-binding', options);
            } catch (err) {
                err.message.should.equal('Formatted types are not currently supported for Participant properties. File text/grammar.tem.md line 1 column 3');
            }
        });
    });

    describe('#setData', () => {

        it('should be able to set data', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);

            // check that we can set/get a valid template model
            const data = {
                $class: 'io.clause.latedeliveryandpenalty.TemplateModel',
                clauseId: 'c0884078-882d-42e0-87d6-4cc824b4f194',
                forceMajeure: false,
                penaltyDuration : {
                    $class : 'org.accordproject.time.Duration',
                    amount : 1,
                    unit : 'days'
                },
                penaltyPercentage : 10,
                capPercentage : 50,
                termination : {
                    $class : 'org.accordproject.time.Duration',
                    amount : 10,
                    unit : 'days'
                },
                fractionalPart : 'days'
            };
            clause.setData(data);
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1-c57ba573028ae93c59716b21ff1341023f2aa86c1993b1ad13441a7c1d949cc4');

            // check that the concerto data is really a Concerto object
            clause.getDataAsConcertoObject().getFullyQualifiedType().should.be.equal('io.clause.latedeliveryandpenalty.TemplateModel');
        });
        it('should throw error for bad $class', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            const data = {
                $class: 'bad.class.name'
            };
            (()=> clause.setData(data)).should.throw('Invalid data, must be a valid instance of the template model io.clause.latedeliveryandpenalty.TemplateModel but got: {"$class":"bad.class.name"} ');
        });
    });

    describe('#toJSON', () => {

        it('should get a JSON representation of a clause', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            const data = {
                $class: 'io.clause.latedeliveryandpenalty.TemplateModel',
                clauseId: 'c0884078-882d-42e0-87d6-4cc824b4f194',
                forceMajeure: false,
                penaltyDuration : {
                    $class : 'org.accordproject.time.Duration',
                    amount : 1,
                    unit : 'days'
                },
                penaltyPercentage : 10,
                capPercentage : 50,
                termination : {
                    $class : 'org.accordproject.time.Duration',
                    amount : 10,
                    unit : 'days'
                },
                fractionalPart : 'days'
            };
            clause.setData(data);
            clause.toJSON().should.eql({
                'data': data,
                'template': 'latedeliveryandpenalty@0.0.1'
            });
        });
    });
});