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
const TemplateLoader = require('../lib/templateloader');
const Clause = require('../lib/clause');

const chai = require('chai');
const fs = require('fs');
const path = require('path');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const options = { skipUpdateExternalModels: true };

describe('Clause', () => {

    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty', 'text/sample.md'), 'utf8');
    const testLatePenaltyPeriodInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty-period', 'text/sample.md'), 'utf8');
    const testLatePenaltyCrInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty-cr', 'text/sample.md'), 'utf8');
    const testCongaInput = fs.readFileSync(path.resolve(__dirname, 'data/conga', 'text/sample.md'), 'utf8');
    const testCongaErr = fs.readFileSync(path.resolve(__dirname, 'data/conga', 'text/sampleErr.md'), 'utf8');
    const testAllTypesInput = fs.readFileSync(path.resolve(__dirname, 'data/alltypes', 'text/sample.md'), 'utf8');
    const testAllBlocksInput = fs.readFileSync(path.resolve(__dirname, 'data/allblocks', 'text/sample.md'), 'utf8');
    const testTextOnlyInput = fs.readFileSync(path.resolve(__dirname, 'data/text-only', 'text/sample.md'), 'utf8');

    describe('#constructor', () => {

        it('should create a clause for a latedeliveryandpenalty template', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.should.not.be.null;
            clause.getLogicManager().should.not.be.null;
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
                err.message.should.equal('Template references a property \'articipant\' that is not declared in the template model \'org.accordproject.conga.TemplateModel\' File text/grammar.tem.md line 1 column 3');
            }
        });

        it('should fail to create a clause for a template with a wrongly typed boolean binding', async function() {
            try {
                await Template.fromDirectory('./test/data/bad-boolean-binding', options);
            } catch (err) {
                err.message.should.equal('An if block can only be used with a boolean property. Property participant has type Participant File text/grammar.tem.md line 1 column 7');
            }
        });

        it('should fail to create a clause for a template with a wrongly typed formatted binding', async function() {
            try {
                await Template.fromDirectory('./test/data/bad-formatted-binding', options);
            } catch (err) {
                err.message.should.equal('Formatted types are currently only supported for DateTime properties. File text/grammar.tem.md line 1 column 3');
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

    describe('#parse', () => {

        it('should be able to set the data from latedeliveryandpenalty natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyInput);
            const data = {
                $class: 'io.clause.latedeliveryandpenalty.TemplateModel',
                capPercentage: 2,
                forceMajeure: true,
                fractionalPart : 'days',
                penaltyDuration: {
                    $class: 'org.accordproject.time.Duration',
                    amount: 9,
                    unit: 'days'
                },
                penaltyPercentage: 7,
                termination: {
                    $class: 'org.accordproject.time.Duration',
                    amount: 2,
                    unit: 'weeks',
                }
            };
            // remove the generated clause id
            delete clause.getData().clauseId;
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1-0ee76aefdd19d6863f2f1642182f506b1ac8e5c4be2a005c00dd13bbf36fe63c');
        });

        it('should be able to set the data from latedeliveryandpenalty natural language text (with CR)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-cr', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyCrInput);
            const data = {
                $class: 'io.clause.latedeliveryandpenalty.TemplateModel',
                capPercentage: 2,
                forceMajeure: true,
                fractionalPart : 'days',
                penaltyDuration: {
                    $class: 'org.accordproject.time.Duration',
                    amount: 9,
                    unit: 'days'
                },
                penaltyPercentage: 7,
                termination: {
                    $class: 'org.accordproject.time.Duration',
                    amount: 2,
                    unit: 'weeks',
                }
            };
            // remove the generated clause id
            delete clause.getData().clauseId;
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1-0ee76aefdd19d6863f2f1642182f506b1ac8e5c4be2a005c00dd13bbf36fe63c');
        });

        it('should be able to set the data from latedeliveryandpenalty natural language text (with a Period)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-period', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyPeriodInput);
            const data = {
                $class: 'org.accordproject.simplelatedeliveryandpenalty.SimpleLateDeliveryAndPenaltyContract',
                buyer: {
                    $class: 'org.accordproject.cicero.contract.AccordParty',
                    partyId: 'Betty Buyer'
                },
                seller: {
                    $class: 'org.accordproject.cicero.contract.AccordParty',
                    partyId: 'Steve Seller'
                },
                penaltyPeriod: {
                    $class: 'org.accordproject.time.Period',
                    amount: 6,
                    unit: 'months'
                },
                penaltyPercentage: 10.5,
                capPercentage: 55,
                maximumDelay: {
                    $class: 'org.accordproject.time.Period',
                    amount: 9,
                    unit: 'months',
                }
            };
            // remove the generated contract id
            delete clause.getData().contractId;
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('simplelatedeliveryandpenalty@0.2.1-708587fe51e93166853ebe13a883209a635c4b4d03bb9d15b27c819c394cb995');
        });

        it('should be able to set the data from conga natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            clause.parse(testCongaInput);
            const data = {
                $class: 'org.accordproject.conga.TemplateModel',
                participant: 'Dan Selman',
                amount: 100.0,
                swag: 'penguins',
                maybeThing: 'thing'
            };
            delete clause.getData().clauseId;
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('conga@0.0.1-6873b1a14258a44df9c96f16b9bdd9d97ecc93040f5ebc8967c7c04c104c2ccb');
        });

        it('should throw an error for empty text', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            (()=> clause.parse('')).should.throw('Parsing clause text returned a null AST. This may mean the text is valid, but not complete.');
        });

        it('should throw an error for non-matching text', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            (()=> clause.parse(testCongaErr)).should.throw('invalid syntax at line 1 col 16:\n\n  "Dan Selman" agees to spend 100 conga coins on "penguins". "thing"\n                 ^\nUnexpected "e"\n');
        });

        it('should be able to set the data for a text-only clause', async function() {
            const template = await Template.fromDirectory('./test/data/text-only', options);
            const clause = new Clause(template);
            clause.parse(testTextOnlyInput);
            const data = {
                $class: 'io.clause.latedeliveryandpenalty.TemplateModel',
                capPercentage: 2,
                forceMajeure: true,
                fractionalPart : 'days',
                penaltyDuration: {
                    $class: 'org.accordproject.time.Duration',
                    amount: 9,
                    unit: 'days'
                },
                penaltyPercentage: 7,
                termination: {
                    $class: 'org.accordproject.time.Duration',
                    amount: 2,
                    unit: 'weeks',
                }
            };
            delete clause.getData().clauseId;
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('text-only@0.0.1-0ee76aefdd19d6863f2f1642182f506b1ac8e5c4be2a005c00dd13bbf36fe63c');
        });

        it('should create a template from a directory no logic', () => {
            return Template.fromDirectory('./test/data/no-logic', options).should.be.fulfilled;
        });

    });

    describe('#parse-block', () => {

        it('should be able to parse an if-else block (true)', async function() {
            const template = await Template.fromDirectory('./test/data/block-ifelse', options);
            const clause = new Clause(template);
            clause.parse('I\'m active');
            const data = {
                '$class': 'org.accordproject.volumediscountlist.VolumeDiscountContract',
                'isActive': true
            };
            // remove the generated clause id
            delete clause.getData().contractId;
            clause.getData().should.eql(data);
        });

        it('should be able to parse an if-else block (false)', async function() {
            const template = await Template.fromDirectory('./test/data/block-ifelse', options);
            const clause = new Clause(template);
            clause.parse('I\'m inactive');
            const data = {
                '$class': 'org.accordproject.volumediscountlist.VolumeDiscountContract',
                'isActive': false
            };
            // remove the generated clause id
            delete clause.getData().contractId;
            clause.getData().should.eql(data);
        });

        it('should not be able to parse an if-else block if the text is neither options', async function() {
            const template = await Template.fromDirectory('./test/data/block-ifelse', options);
            const clause = new Clause(template);
            (()=> clause.parse('I\'m not active')).should.throw(`invalid syntax at line 1 col 5:

  I'm not active
      ^
Unexpected "n"`);
        });

        it('should not be able to parse an if-else block on the wrong type (not Boolean)', async function() {
            try {
                await Template.fromDirectory('./test/data/block-ifelse-error', options);
            } catch (err) {
                err.message.should.eql('An if block can only be used with a boolean property. Property isActive has type Double File text/grammar.tem.md line 1 column 7');
            }
        });

        it('should be able to parse an olist-else block', async function() {
            const template = await Template.fromDirectory('./test/data/block-olist', options);
            const clause = new Clause(template);
            clause.parse(`This is a list
1. 0.0$ million <= Volume < 1.0$ million : 3.1%
1. 1.0$ million <= Volume < 10.0$ million : 3.1%
1. 10.0$ million <= Volume < 50.0$ million : 2.9%
This is more text
`);
            const data = {
                '$class': 'org.accordproject.volumediscountlist.VolumeDiscountContract',
                'rates': [
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'volumeUpTo': 1,
                        'volumeAbove': 0,
                        'rate': 3.1
                    },
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'volumeUpTo': 10,
                        'volumeAbove': 1,
                        'rate': 3.1
                    },
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'volumeUpTo': 50,
                        'volumeAbove': 10,
                        'rate': 2.9
                    }
                ]
            };
            // remove the generated clause id
            delete clause.getData().contractId;
            clause.getData().should.eql(data);
        });

        it('should be able to parse an ulist block', async function() {
            const template = await Template.fromDirectory('./test/data/block-ulist', options);
            const clause = new Clause(template);
            clause.parse(`This is a list
- 0.0$ million <= Volume < 1.0$ million : 3.1%
- 1.0$ million <= Volume < 10.0$ million : 3.1%
- 10.0$ million <= Volume < 50.0$ million : 2.9%
This is more text
`);
            const data = {
                '$class': 'org.accordproject.volumediscountlist.VolumeDiscountContract',
                'rates': [
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'volumeUpTo': 1,
                        'volumeAbove': 0,
                        'rate': 3.1
                    },
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'volumeUpTo': 10,
                        'volumeAbove': 1,
                        'rate': 3.1
                    },
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'volumeUpTo': 50,
                        'volumeAbove': 10,
                        'rate': 2.9
                    }
                ]
            };
            // remove the generated clause id
            delete clause.getData().contractId;
            clause.getData().should.eql(data);
        });

        it('should be able to parse a join block', async function() {
            const template = await Template.fromDirectory('./test/data/block-join', options);
            const clause = new Clause(template);
            clause.parse('This is a list: 3.1%, 3.3%, 2.9% (And more Text)');
            const data = {
                '$class': 'org.accordproject.volumediscountlist.VolumeDiscountContract',
                'rates': [
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'rate': 3.1
                    },
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'rate': 3.3
                    },
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'rate': 2.9
                    }
                ]
            };
            // remove the generated clause id
            delete clause.getData().contractId;
            clause.getData().should.eql(data);
        });

        it('should be able to parse an ergo expressions', async function() {
            const template = await Template.fromDirectory('./test/data/block-ergo', options);
            const clause = new Clause(template);
            clause.parse('This is a list: 3.1%, 3.3%, 2.9% (Average: {{Some text}})');
            const data = {
                '$class': 'org.accordproject.volumediscountlist.VolumeDiscountContract',
                'rates': [
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'rate': 3.1
                    },
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'rate': 3.3
                    },
                    {
                        '$class': 'org.accordproject.volumediscountlist.RateRange',
                        'rate': 2.9
                    }
                ]
            };
            // remove the generated clause id
            delete clause.getData().contractId;
            clause.getData().should.eql(data);
        });

    });

    describe('#draft', () => {

        it('should be able to roundtrip latedelivery natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyInput);
            const nl = await clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testLatePenaltyInput));
        });

        it('should be able to generate natural language text with wrapped variables', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyInput);
            const nl = await clause.draft({ wrapVariables: true });
            nl.should.equal(`Late Delivery and Penalty
----

In case of delayed delivery<variable id="forceMajeure" value="%20except%20for%20Force%20Majeure%20cases%2C"/> the Seller shall pay to the Buyer for every <variable id="penaltyDuration" value="9%20days"/> of delay penalty amounting to <variable id="penaltyPercentage" value="7.0"/>% of the total value of the Equipment whose delivery has been delayed.

1. Any fractional part of a <variable id="fractionalPart" value="days"/> is to be considered a full <variable id="fractionalPart" value="days"/>.
1. The total amount of penalty shall not however, exceed <variable id="capPercentage" value="2.0"/>% of the total value of the Equipment involved in late delivery.
1. If the delay is more than <variable id="termination" value="2%20weeks"/>, the Buyer is entitled to terminate this Contract.`);
        });

        it('should be able to generate natural language text with wrapped variables and formatted dates', async function() {
            const template = await Template.fromDirectory('./test/data/formatted-dates-DD_MM_YYYY', options);
            const clause = new Clause(template);
            clause.parse('dateTimeProperty: 01/12/2018');
            const nl = await clause.draft({ wrapVariables: true });
            nl.should.equal('dateTimeProperty: <variable id="dateTimeProperty" value="01%2F12%2F2018" format="DD%2FMM%2FYYYY"/>');
        });

        it('should be able to roundtrip latedelivery natural language text (with a Period)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-period', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyPeriodInput);
            const nl = await clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testLatePenaltyPeriodInput));
        });

        it('should be able to roundtrip conga natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            clause.parse(testCongaInput);
            const nl = await clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testCongaInput));
        });

        it('should be able to roundtrip alltypes natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/alltypes', options);
            const clause = new Clause(template);
            clause.parse(testAllTypesInput);
            const nl = await clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testAllTypesInput));
        });

        it('should be able to roundtrip allblocks natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/allblocks', options);
            const clause = new Clause(template);
            clause.parse(testAllBlocksInput);
            const nl = await clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testAllBlocksInput));
        });
    });
});