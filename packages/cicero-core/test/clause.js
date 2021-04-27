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
const TemplateInstance = require('../lib/templateinstance');
const TemplateLoader = require('../lib/templateloader');
const Clause = require('../lib/clause');

const chai = require('chai');
const fs = require('fs');
const path = require('path');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const options = { offline: true };

const copyrightData = {
    '$class': 'org.accordproject.copyrightlicense.CopyrightLicenseContract',
    'contractId': 'e32a2ca7-78c9-4462-935f-487aad6e9c9b',
    'effectiveDate': '2018-01-01T00:00:00.000-04:00',
    'licensee': 'resource:org.accordproject.party.Party#Me',
    'licenseeState': 'NY',
    'licenseeEntityType': 'Company',
    'licenseeAddress': '1 Broadway',
    'licensor': 'resource:org.accordproject.party.Party#Myself',
    'licensorState': 'NY',
    'licensorEntityType': 'Company',
    'licensorAddress': '2 Broadway',
    'territory': 'United States',
    'purposeDescription': 'stuff',
    'workDescription': 'other stuff',
    'paymentClause': {
        '$class': 'org.accordproject.copyrightlicense.PaymentClause',
        'clauseId': '25298022-2129-412c-ac60-b217ff766cb4',
        'amountText': 'one hundred US Dollars',
        'amount': {
            '$class': 'org.accordproject.money.MonetaryAmount',
            'doubleValue': 100,
            'currencyCode': 'USD'
        },
        'paymentProcedure': 'bank transfer'
    }
};
const copyrightSample = fs.readFileSync(path.resolve(__dirname, 'data/copyright-license', 'text/sample.md'), 'utf8');
const copyrightSlate = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/copyright-license', 'slate.json'), 'utf8'));
const copyrightCiceroMarkParsed = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/copyright-license', 'ciceromark_parsed.json'), 'utf8'));

describe('Clause', () => {

    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty', 'text/sample.md'), 'utf8');
    const testLatePenaltyInputNoForce = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty', 'text/sample-noforce.md'), 'utf8');
    const testLatePenaltyInputUpdated = fs.readFileSync(path.resolve(__dirname, 'data/latedeliveryandpenalty', 'text/sample-updated.md'), 'utf8');
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
            // remove the generated id
            delete clause.getData().clauseId;
            delete clause.getData().$identifier;
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
            // remove the generated id
            delete clause.getData().clauseId;
            delete clause.getData().$identifier;
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1-0ee76aefdd19d6863f2f1642182f506b1ac8e5c4be2a005c00dd13bbf36fe63c');
        });

        it('should be able to set the data from latedeliveryandpenalty natural language text (with a Period)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-period', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyPeriodInput);
            const data = {
                $class: 'org.accordproject.simplelatedeliveryandpenalty.SimpleLateDeliveryAndPenaltyContract',
                buyer: 'resource:org.accordproject.party.Party#Betty%20Buyer',
                seller: 'resource:org.accordproject.party.Party#Steve%20Seller',
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
            // remove the generated id
            delete clause.getData().contractId;
            delete clause.getData().$identifier;
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('simplelatedeliveryandpenalty@0.2.1-8ece530b6a2794b87d1c7d499cf88fb08c5f8ace4e0e3795b2a330e65b581535');
        });

        it('should be able to set the data from conga natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            clause.parse(testCongaInput);
            const data = {
                $class: 'org.accordproject.conga.TemplateModel',
                participant: 'resource:concerto.Participant#Dan%20Selman',
                amount: 100.0,
                swag: 'penguins',
                maybeThing: 'thing'
            };
            delete clause.getData().clauseId;
            delete clause.getData().$identifier;
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('conga@0.0.1-d4f14c801f25a425fb33058cb650632fbdd3703433946ef6e51933239786a273');
        });

        it('should throw an error for empty text', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            (()=> clause.parse('')).should.throw('Parse error at line 1 column 1');
        });

        it('should throw an error for non-matching text', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            (()=> clause.parse(testCongaErr)).should.throw('Parse error at line 1 column 13');
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
            delete clause.getData().$identifier;
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
            // remove the generated id
            delete clause.getData().contractId;
            delete clause.getData().$identifier;
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
            // remove the generated id
            delete clause.getData().contractId;
            delete clause.getData().$identifier;
            clause.getData().should.eql(data);
        });

        it('should not be able to parse an if-else block if the text is neither options', async function() {
            const template = await Template.fromDirectory('./test/data/block-ifelse', options);
            const clause = new Clause(template);
            (()=> clause.parse('I\'m not active')).should.throw(`Parse error at line 1 column 1
I'm not active
^^^^^^^^^^^^
Expected: 'I'm active' or 'I'm inactive'`);
        });

        it('should not be able to parse an if-else block on the wrong type (not Boolean)', async function() {
            try {
                await Template.fromDirectory('./test/data/block-ifelse-error', options);
            } catch (err) {
                err.message.should.eql('Conditional template not on a boolean property: isActive File text/grammar.tem.md line -1 column -1');
            }
        });

        it('should be able to parse an olist block', async function() {
            const template = await Template.fromDirectory('./test/data/block-olist', options);
            const clause = new Clause(template);
            clause.parse(`This is a list
1. 0.0$ million <= Volume < 1.0$ million : 3.1%
2. 1.0$ million <= Volume < 10.0$ million : 3.1%
3. 10.0$ million <= Volume < 50.0$ million : 2.9%

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
            // remove the generated id
            delete clause.getData().contractId;
            delete clause.getData().$identifier;
            clause.getData().should.eql(data);
        });

        it('should be able to draft an olist block', async function() {
            const template = await Template.fromDirectory('./test/data/block-olist', options);
            const clause = new Clause(template);
            const text = `This is a list
1. 0.0$ million <= Volume < 1.0$ million : 3.1%
2. 1.0$ million <= Volume < 10.0$ million : 3.1%
3. 10.0$ million <= Volume < 50.0$ million : 2.9%

This is more text`;
            const data = {
                '$class': 'org.accordproject.volumediscountlist.VolumeDiscountContract',
                'contractId': 'c0884078-882d-42e0-87d6-4cc824b4f194',
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
            clause.setData(data);
            const newText = clause.draft();
            newText.should.eql(text);
        });

        it('should be able to draft a copyright license', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const clause = new Clause(template);
            const data = copyrightData;
            clause.setData(data);
            const newText = clause.draft();
            newText.should.eql(copyrightSample);
        });

        it('should be able to draft a copyright license (unquote variables)', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const clause = new Clause(template);
            const text = `Copyright License Agreement

This COPYRIGHT LICENSE AGREEMENT (the "Agreement"), dated as of 01/01/2018 (the "Effective Date"), is made by and between Me ("Licensee"), a NY Company with offices located at 1 Broadway, and Myself ("Licensor"), a NY Company with offices located at 2 Broadway.

WHEREAS, Licensor solely and exclusively owns or controls the Work (as defined below) and wishes to grant to Licensee a license to the Work, and Licensee wishes to obtain a license to the Work for the uses and purposes described herein, each subject to the terms and conditions set forth herein.

NOW, THEREFORE, in consideration of the mutual covenants, terms, and conditions set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

License.

Grant of Rights. Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee and its affiliates during the Term (as defined below) an exclusive, transferable right and license in the United States (the "Territory"), to reproduce, publicly perform, display, transmit, and distribute the Work, including translate, alter, modify, and create derivative works of the Work, through all media now known or hereinafter developed for purposes of stuff. The "Work" is defined as other stuff.

Permissions. Licensor has obtained from all persons and entities who are, or whose trademark or other property is, identified, depicted, or otherwise referred to in the Work, such written and signed licenses, permissions, waivers, and consents (collectively, "Permissions" and each, individually, a "Permission"), including those relating to publicity, privacy, and any intellectual property rights, as are or reasonably may be expected to be necessary for Licensee to exercise its rights in the Work as permitted under this Agreement, without incurring any payment or other obligation to, or otherwise violating any right of, any such person or entity.

Copyright Notices. Licensee shall ensure that its use of the Work is marked with the appropriate copyright notices specified by Licensor in a reasonably prominent position in the order and manner provided by Licensor. Licensee shall abide by the copyright laws and what are considered to be sound practices for copyright notice provisions in the Territory. Licensee shall not use any copyright notices that conflict with, confuse, or negate the notices Licensor provides and requires hereunder.

{{#clause paymentClause}}
Payment. As consideration in full for the rights granted herein, Licensee shall pay Licensor a one-time fee in the amount of one hundred US Dollars (100.0 USD) upon execution of this Agreement, payable as follows: bank transfer.
{{/clause}}

General.

Interpretation. For purposes of this Agreement, (a) the words "include," "includes," and "including" are deemed to be followed by the words "without limitation"; (b) the word "or" is not exclusive; and (c) the words "herein," "hereof," "hereby," "hereto," and "hereunder" refer to this Agreement as a whole. This Agreement is intended to be construed without regard to any presumption or rule requiring construction or interpretation against the party drafting an instrument or causing any instrument to be drafted.

Entire Agreement. This Agreement, including and together with any related attachments, constitutes the sole and entire agreement of the parties with respect to the subject matter contained herein, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, with respect to such subject matter.

Severability. If any term or provision of this Agreement is invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability will not affect the enforceability of any other term or provision of this Agreement, or invalidate or render unenforceable such term or provision in any other jurisdiction. [Upon a determination that any term or provision is invalid, illegal, or unenforceable, [the parties shall negotiate in good faith to/the court may] modify this Agreement to effect the original intent of the parties as closely as possible in order that the transactions contemplated hereby be consummated as originally contemplated to the greatest extent possible.]

Assignment. Licensee may freely assign or otherwise transfer all or any of its rights, or delegate or otherwise transfer all or any of its obligations or performance, under this Agreement without Licensor's consent. This Agreement is binding upon and inures to the benefit of the parties hereto and their respective permitted successors and assigns.`;
            const data = {
                '$class': 'org.accordproject.copyrightlicense.CopyrightLicenseContract',
                'contractId': 'e32a2ca7-78c9-4462-935f-487aad6e9c9b',
                'effectiveDate': '2018-01-01T00:00:00.000-04:00',
                'licensee': 'resource:org.accordproject.party.Party#Me',
                'licenseeState': 'NY',
                'licenseeEntityType': 'Company',
                'licenseeAddress': '1 Broadway',
                'licensor': 'resource:org.accordproject.party.Party#Myself',
                'licensorState': 'NY',
                'licensorEntityType': 'Company',
                'licensorAddress': '2 Broadway',
                'territory': 'United States',
                'purposeDescription': 'stuff',
                'workDescription': 'other stuff',
                'paymentClause': {
                    '$class': 'org.accordproject.copyrightlicense.PaymentClause',
                    'clauseId': '25298022-2129-412c-ac60-b217ff766cb4',
                    'amountText': 'one hundred US Dollars',
                    'amount': {
                        '$class': 'org.accordproject.money.MonetaryAmount',
                        'doubleValue': 100,
                        'currencyCode': 'USD'
                    },
                    'paymentProcedure': 'bank transfer'
                }
            };
            clause.setData(data);
            const newText = clause.draft({unquoteVariables:true});
            newText.should.eql(text);
        });

        it('should be able to draft a copyright license (html)', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const clause = new Clause(template);
            const text = `<html>
<body>
<div class="document">
<p>Copyright License Agreement</p>
<p>This COPYRIGHT LICENSE AGREEMENT (the "Agreement"), dated as of 01/01/2018 (the "Effective Date"), is made by and between Me ("Licensee"), a NY Company with offices located at 1 Broadway, and Myself ("Licensor"), a NY Company with offices located at 2 Broadway.</p>
<p>WHEREAS, Licensor solely and exclusively owns or controls the Work (as defined below) and wishes to grant to Licensee a license to the Work, and Licensee wishes to obtain a license to the Work for the uses and purposes described herein, each subject to the terms and conditions set forth herein.</p>
<p>NOW, THEREFORE, in consideration of the mutual covenants, terms, and conditions set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:</p>
<p>License.</p>
<p>Grant of Rights. Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee and its affiliates during the Term (as defined below) an exclusive, transferable right and license in the United States (the "Territory"), to reproduce, publicly perform, display, transmit, and distribute the Work, including translate, alter, modify, and create derivative works of the Work, through all media now known or hereinafter developed for purposes of stuff. The "Work" is defined as other stuff.</p>
<p>Permissions. Licensor has obtained from all persons and entities who are, or whose trademark or other property is, identified, depicted, or otherwise referred to in the Work, such written and signed licenses, permissions, waivers, and consents (collectively, "Permissions" and each, individually, a "Permission"), including those relating to publicity, privacy, and any intellectual property rights, as are or reasonably may be expected to be necessary for Licensee to exercise its rights in the Work as permitted under this Agreement, without incurring any payment or other obligation to, or otherwise violating any right of, any such person or entity.</p>
<p>Copyright Notices. Licensee shall ensure that its use of the Work is marked with the appropriate copyright notices specified by Licensor in a reasonably prominent position in the order and manner provided by Licensor. Licensee shall abide by the copyright laws and what are considered to be sound practices for copyright notice provisions in the Territory. Licensee shall not use any copyright notices that conflict with, confuse, or negate the notices Licensor provides and requires hereunder.</p>
<div class="clause" name="paymentClause" elementType="org.accordproject.copyrightlicense.PaymentClause">
<p>Payment. As consideration in full for the rights granted herein, Licensee shall pay Licensor a one-time fee in the amount of one hundred US Dollars (100.0 USD) upon execution of this Agreement, payable as follows: bank transfer.</p>
</div>
<p>General.</p>
<p>Interpretation. For purposes of this Agreement, (a) the words "include," "includes," and "including" are deemed to be followed by the words "without limitation"; (b) the word "or" is not exclusive; and (c) the words "herein," "hereof," "hereby," "hereto," and "hereunder" refer to this Agreement as a whole. This Agreement is intended to be construed without regard to any presumption or rule requiring construction or interpretation against the party drafting an instrument or causing any instrument to be drafted.</p>
<p>Entire Agreement. This Agreement, including and together with any related attachments, constitutes the sole and entire agreement of the parties with respect to the subject matter contained herein, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, with respect to such subject matter.</p>
<p>Severability. If any term or provision of this Agreement is invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability will not affect the enforceability of any other term or provision of this Agreement, or invalidate or render unenforceable such term or provision in any other jurisdiction. [Upon a determination that any term or provision is invalid, illegal, or unenforceable, [the parties shall negotiate in good faith to/the court may] modify this Agreement to effect the original intent of the parties as closely as possible in order that the transactions contemplated hereby be consummated as originally contemplated to the greatest extent possible.]</p>
<p>Assignment. Licensee may freely assign or otherwise transfer all or any of its rights, or delegate or otherwise transfer all or any of its obligations or performance, under this Agreement without Licensor's consent. This Agreement is binding upon and inures to the benefit of the parties hereto and their respective permitted successors and assigns.</p>
</div>
</body>
</html>`;
            const data = copyrightData;
            clause.setData(data);
            const newText = clause.draft({unquoteVariables:true, format:'html'});
            newText.should.eql(text);
        });

        it('should be able to draft a copyright license (markdown_cicero)', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const clause = new Clause(template);
            const data = copyrightData;
            clause.setData(data);
            const newText = clause.draft({format:'markdown_cicero'});
            newText.should.deep.equal(copyrightSample);
        });

        it('should be able to draft a copyright license (slate)', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const clause = new Clause(template);
            const data = copyrightData;
            clause.setData(data);
            const newText = clause.draft({format:'slate'});
            newText.should.deep.equal(copyrightSlate);
        });

        it('should be able to draft a copyright license (ciceromark_parsed)', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const clause = new Clause(template);
            const data = copyrightData;
            clause.setData(data);
            const newText = clause.draft({format:'ciceromark_parsed'});
            newText.should.deep.equal(copyrightCiceroMarkParsed);
        });

        it('should throw when drafting to an unknown format', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const clause = new Clause(template);
            const data = {
                '$class': 'org.accordproject.copyrightlicense.CopyrightLicenseContract',
                'contractId': 'e32a2ca7-78c9-4462-935f-487aad6e9c9b',
                'effectiveDate': '2018-01-01T00:00:00.000-04:00',
                'licensee': 'resource:org.accordproject.party.Party#Me',
                'licenseeState': 'NY',
                'licenseeEntityType': 'Company',
                'licenseeAddress': '1 Broadway',
                'licensor': 'resource:org.accordproject.party.Party#Myself',
                'licensorState': 'NY',
                'licensorEntityType': 'Company',
                'licensorAddress': '2 Broadway',
                'territory': 'United States',
                'purposeDescription': 'stuff',
                'workDescription': 'other stuff',
                'paymentClause': {
                    '$class': 'org.accordproject.copyrightlicense.PaymentClause',
                    'clauseId': '25298022-2129-412c-ac60-b217ff766cb4',
                    'amountText': 'one hundred US Dollars',
                    'amount': {
                        '$class': 'org.accordproject.money.MonetaryAmount',
                        'doubleValue': 100,
                        'currencyCode': 'USD'
                    },
                    'paymentProcedure': 'bank transfer'
                }
            };
            clause.setData(data);
            (() => clause.draft({unquoteVariables:true, format:'foo'})).should.throw('Unsupported format: foo');
        });

        it('should be able to parse an ulist block', async function() {
            const template = await Template.fromDirectory('./test/data/block-ulist', options);
            const clause = new Clause(template);
            const text = `This is a list
- 0.0$ million <= Volume < 1.0$ million : 3.1%
- 1.0$ million <= Volume < 10.0$ million : 3.1%
- 10.0$ million <= Volume < 50.0$ million : 2.9%

This is more text`;
            clause.parse(text);
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
            // remove the generated id
            delete clause.getData().contractId;
            delete clause.getData().$identifier;
            clause.getData().should.eql(data);
        });

        it('should be able to draft an ulist block', async function() {
            const template = await Template.fromDirectory('./test/data/block-ulist', options);
            const clause = new Clause(template);
            const text = `This is a list
-  0.0$ million <= Volume < 1.0$ million : 3.1%
-  1.0$ million <= Volume < 10.0$ million : 3.1%
-  10.0$ million <= Volume < 50.0$ million : 2.9%

This is more text`;
            const data = {
                '$class': 'org.accordproject.volumediscountlist.VolumeDiscountContract',
                'contractId': 'c0884078-882d-42e0-87d6-4cc824b4f194',
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
            clause.setData(data);
            const newText = clause.draft();
            newText.should.eql(text);
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
            // remove the generated id
            delete clause.getData().contractId;
            delete clause.getData().$identifier;
            clause.getData().should.eql(data);
        });

        it('should be able to parse an ergo expressions', async function() {
            const template = await Template.fromDirectory('./test/data/block-ergo', options);
            const clause = new Clause(template);
            clause.parse('This is a list: 3.1%, 3.3%, 2.9% (Average: {{%Some text%}})');
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
            // remove the generated id
            delete clause.getData().contractId;
            delete clause.getData().$identifier;
            clause.getData().should.eql(data);
        });

    });

    describe('#draft-formula', () => {

        it('should be able to draft with interest rates formula', async function() {
            const template = await Template.fromDirectory('./test/data/fixed-interests', options);
            const clause = new Clause(template);
            clause.parse(`## Fixed rate loan

This is a _fixed interest_ loan to the amount of £100,000.00
at the yearly interest rate of 2.5%
with a loan term of 15,
and monthly payments of {{%I'm not sure which amount right now%}}
`);
            const nl = clause.draft();
            // XXX Regression? Should be {{%£667.00%}} without quotes
            nl.should.equal(TemplateLoader.normalizeText(`Fixed rate loan
----

This is a *fixed interest* loan to the amount of £100,000.00
at the yearly interest rate of 2.5%
with a loan term of 15,
and monthly payments of {{%"£667.00"%}}`));
        });
    });

    describe('#draft', () => {

        it('should be able to roundtrip latedelivery natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyInput);
            const nl = clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testLatePenaltyInput));
        });

        it('should be able to generate natural language text (conditional true)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyInput);
            const nl = clause.draft();
            nl.should.equal(`Late Delivery and Penalty
----

In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed.
1. Any fractional part of a days is to be considered a full days.
2. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery.
3. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.`);
        });

        it('should be able to generate natural language text (conditional false)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyInputNoForce);
            const nl = clause.draft();
            nl.should.equal(`Late Delivery and Penalty
----

In case of delayed delivery the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed.
1. Any fractional part of a days is to be considered a full days.
2. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery.
3. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.`);
        });

        it('should be able to generate natural language text (formatted dates)', async function() {
            const template = await Template.fromDirectory('./test/data/formatted-dates-DD_MM_YYYY', options);
            const clause = new Clause(template);
            clause.parse('dateTimeProperty: 01/12/2018');
            const nl = clause.draft();
            nl.should.equal('dateTimeProperty: 01/12/2018');
        });

        it('should be able to roundtrip latedelivery natural language text (with a Period)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-period', options);
            const clause = new Clause(template);
            clause.parse(testLatePenaltyPeriodInput);
            const nl = clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testLatePenaltyPeriodInput));
        });

        it('should be able to roundtrip conga natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            clause.parse(testCongaInput);
            const nl = clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testCongaInput));
        });

        it('should be able to roundtrip alltypes natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/alltypes', options);
            const clause = new Clause(template);
            clause.parse(testAllTypesInput);
            const nl = clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testAllTypesInput));
        });

        it('should be able to roundtrip allblocks natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/allblocks', options);
            const clause = new Clause(template);
            clause.parse(testAllBlocksInput);
            const nl = clause.draft();
            nl.should.equal(TemplateLoader.normalizeText(testAllBlocksInput));
        });

        it('should be able to update the template grammar and draft', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            const newGrammar = `Late Delivery and Penalty
====
In case of delayed delivery{{#if forceMajeure}} except for Force Majeure cases,{{/if}} the Seller shall pay to the Buyer for every {{penaltyDuration}} of delay penalty amounting to {{penaltyPercentage}}% of the total value of the Equipment whose delivery has been delayed. 

- Any fractional part of a {{fractionalPart}} is to be considered a full {{fractionalPart}}. 
- The total amount of penalty shall not however, exceed {{capPercentage}}% of the total value of the Equipment involved in late delivery. 
- If the delay is more than {{termination}}, the Buyer is entitled to terminate this Contract.

Adding all precentages in this clause yields: {{% capPercentage + penaltyPercentage %}}.`;
            // Update the grammar
            TemplateInstance.rebuildParser(
                clause.getTemplate().getParserManager(),
                clause.getTemplate().getLogicManager(),
                clause.getEngine(),
                clause.getIdentifier(),
                newGrammar,
            );
            // Parse again
            clause.parse(testLatePenaltyInputUpdated);
            // Draft again
            const nl = clause.draft();
            nl.should.equal(testLatePenaltyInputUpdated);
        });
    });
});