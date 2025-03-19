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

const fs = require('fs');
const path = require('path');

const Template = require('../src/template');
const Clause = require('../src/clause');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const options = { offline: false };

const copyrightData = {
    '$class': 'org.accordproject.copyrightlicense@1.0.0.CopyrightLicenseContract',
    'contractId': 'e32a2ca7-78c9-4462-935f-487aad6e9c9b',
    'effectiveDate': '2018-01-01T00:00:00.000-04:00',
    'licensee': 'resource:org.accordproject.party@0.2.0.Party#Me',
    'licenseeState': 'NY',
    'licenseeEntityType': 'Company',
    'licenseeAddress': '1 Broadway',
    'licensor': 'resource:org.accordproject.party@0.2.0.Party#Myself',
    'licensorState': 'NY',
    'licensorEntityType': 'Company',
    'licensorAddress': '2 Broadway',
    'territory': 'United States',
    'purposeDescription': 'stuff',
    'workDescription': 'other stuff',
    'paymentClause': {
        '$class': 'org.accordproject.copyrightlicense@1.0.0.PaymentClause',
        'clauseId': '25298022-2129-412c-ac60-b217ff766cb4',
        'amountText': 'one hundred US Dollars',
        'amount': {
            '$class': 'org.accordproject.money@0.3.0.MonetaryAmount',
            'doubleValue': 100,
            'currencyCode': 'USD'
        },
        'paymentProcedure': 'bank transfer'
    }
};
const copyrightSample = fs.readFileSync(path.resolve(__dirname, 'data/copyright-license', 'text/sample.md'), 'utf8');

describe('Clause', () => {

    describe('#constructor', () => {

        it('should create a clause for a latedeliveryandpenalty template', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.should.not.be.null;
        });

        it('should create a clause for a conga template', async function () {
            const template = await Template.fromDirectory('./test/data/conga', options);
            const clause = new Clause(template);
            clause.should.not.be.null;
        });

        it('should fail to create a clause for a template with a missing binding', async function () {
            try {
                await Template.fromDirectory('./test/data/bad-binding', options);
            } catch (err) {
                err.message.should.equal('Unknown property: articipant File text/grammar.tem.md line -1 column -1');
            }
        });

        it('should fail to create a clause for a template with a wrongly typed boolean binding', async function () {
            try {
                await Template.fromDirectory('./test/data/bad-boolean-binding', options);
            } catch (err) {
                err.message.should.equal('Conditional template not on a boolean property: participant File text/grammar.tem.md line -1 column -1');
            }
        });

        it('should fail to create a clause for a template with a wrongly typed formatted binding', async function () {
            try {
                await Template.fromDirectory('./test/data/bad-formatted-binding', options);
            } catch (err) {
                err.message.should.equal('Formatted types are not currently supported for Participant properties. File text/grammar.tem.md line 1 column 3');
            }
        });
    });

    describe('#setData', () => {

        it('should be able to set data', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);

            // check that we can set/get a valid template model
            const data = {
                $class: 'io.clause.latedeliveryandpenalty@0.1.0.TemplateModel',
                clauseId: '1234',
                forceMajeure: false,
                penaltyDuration: {
                    amount: 1,
                    unit: 'days'
                },
                penaltyPercentage: 10,
                capPercentage: 50,
                termination: {
                    amount: 10,
                    unit: 'days'
                },
                fractionalPart: 'days'
            };
            clause.setData(data);
            clause.getData().should.eql(data);
            clause.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1-8a8d5985cf049e318fc890162da22eb6d5c081412af20d4c1db20633644e2756');

            // check that the concerto data is really a Concerto object
            clause.getDataAsConcertoObject().getFullyQualifiedType().should.be.equal('io.clause.latedeliveryandpenalty@0.1.0.TemplateModel');
        });
        it('should throw error for bad $class', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            const data = {
                $class: 'bad.class.name'
            };
            (() => clause.setData(data)).should.throw('Invalid data, must be a valid instance of the template model io.clause.latedeliveryandpenalty@0.1.0.TemplateModel but got: {"$class":"bad.class.name"} ');
        });
    });

    describe('#toJSON', () => {

        it('should get a JSON representation of a clause', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            const data = {
                $class: 'io.clause.latedeliveryandpenalty@0.1.0.TemplateModel',
                clauseId: '1234',
                forceMajeure: false,
                penaltyDuration: {
                    amount: 1,
                    unit: 'days'
                },
                penaltyPercentage: 10,
                capPercentage: 50,
                termination: {
                    amount: 10,
                    unit: 'days'
                },
                fractionalPart: 'days'
            };
            clause.setData(data);
            clause.toJSON().should.eql({
                'data': data,
                'template': 'latedeliveryandpenalty@0.0.1'
            });
        });
    });

    describe.only('#draft', () => {
        it('should be able to draft a copyright license', async function () {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const clause = new Clause(template);
            const data = copyrightData;
            clause.setData(data);
            const newText = await clause.draft( 'markdown_cicero' );
            console.log(newText);
            newText.should.eql(copyrightSample);
        });
    });
});