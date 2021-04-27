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

let request = require('supertest');
const decache = require('decache');
const chai = require('chai');

let server;

chai.should();

const body = require('./data/latedeliveryandpenalty/request.json');
const state = require('./data/latedeliveryandpenalty/state.json');
const triggerData = require('./data/latedeliveryandpenalty/data.json');
const responseBody = {
    '$class': 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse',
    penalty: 4,
    buyerMayTerminate: true,
};

const parseBody = {
    '$class': 'org.accordproject.latedeliveryandpenalty.TemplateModel',
    'clauseId': '1',
    'forceMajeure': true,
    'penaltyDuration': {
        '$class': 'org.accordproject.time.Duration',
        'amount': 9,
        'unit': 'days'
    },
    'penaltyPercentage': 7,
    'capPercentage': 2,
    'termination': {
        '$class': 'org.accordproject.time.Duration',
        'amount': 2,
        'unit': 'weeks'
    },
    'fractionalPart': 'days'
};
const parseCopyrightBody = {
    '$class': 'org.accordproject.copyrightlicense.CopyrightLicenseContract',
    'contractId': '1',
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
        'clauseId': '2',
        'amountText': 'one hundred US Dollars',
        'amount': {
            '$class': 'org.accordproject.money.MonetaryAmount',
            'doubleValue': 100,
            'currencyCode': 'USD'
        },
        'paymentProcedure': 'bank transfer'
    }
};
const draftLateText = 'Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.';
const draftCopyrightText = `Copyright License Agreement

This COPYRIGHT LICENSE AGREEMENT (the "Agreement"), dated as of 01/01/2018 (the "Effective Date"), is made by and between "Me" ("Licensee"), a "NY" "Company" with offices located at "1 Broadway", and "Myself" ("Licensor"), a "NY" "Company" with offices located at "2 Broadway".

WHEREAS, Licensor solely and exclusively owns or controls the Work (as defined below) and wishes to grant to Licensee a license to the Work, and Licensee wishes to obtain a license to the Work for the uses and purposes described herein, each subject to the terms and conditions set forth herein.

NOW, THEREFORE, in consideration of the mutual covenants, terms, and conditions set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

License.

Grant of Rights. Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee and its affiliates during the Term (as defined below) an exclusive, transferable right and license in the "United States" (the "Territory"), to reproduce, publicly perform, display, transmit, and distribute the Work, including translate, alter, modify, and create derivative works of the Work, through all media now known or hereinafter developed for purposes of "stuff". The "Work" is defined as "other stuff".

Permissions. Licensor has obtained from all persons and entities who are, or whose trademark or other property is, identified, depicted, or otherwise referred to in the Work, such written and signed licenses, permissions, waivers, and consents (collectively, "Permissions" and each, individually, a "Permission"), including those relating to publicity, privacy, and any intellectual property rights, as are or reasonably may be expected to be necessary for Licensee to exercise its rights in the Work as permitted under this Agreement, without incurring any payment or other obligation to, or otherwise violating any right of, any such person or entity.

Copyright Notices. Licensee shall ensure that its use of the Work is marked with the appropriate copyright notices specified by Licensor in a reasonably prominent position in the order and manner provided by Licensor. Licensee shall abide by the copyright laws and what are considered to be sound practices for copyright notice provisions in the Territory. Licensee shall not use any copyright notices that conflict with, confuse, or negate the notices Licensor provides and requires hereunder.

{{#clause paymentClause}}
Payment. As consideration in full for the rights granted herein, Licensee shall pay Licensor a one-time fee in the amount of "one hundred US Dollars" (100.0 USD) upon execution of this Agreement, payable as follows: "bank transfer".
{{/clause}}

General.

Interpretation. For purposes of this Agreement, (a) the words "include," "includes," and "including" are deemed to be followed by the words "without limitation"; (b) the word "or" is not exclusive; and (c) the words "herein," "hereof," "hereby," "hereto," and "hereunder" refer to this Agreement as a whole. This Agreement is intended to be construed without regard to any presumption or rule requiring construction or interpretation against the party drafting an instrument or causing any instrument to be drafted.

Entire Agreement. This Agreement, including and together with any related attachments, constitutes the sole and entire agreement of the parties with respect to the subject matter contained herein, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, with respect to such subject matter.

Severability. If any term or provision of this Agreement is invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability will not affect the enforceability of any other term or provision of this Agreement, or invalidate or render unenforceable such term or provision in any other jurisdiction. [Upon a determination that any term or provision is invalid, illegal, or unenforceable, [the parties shall negotiate in good faith to/the court may] modify this Agreement to effect the original intent of the parties as closely as possible in order that the transactions contemplated hereby be consummated as originally contemplated to the greatest extent possible.]

Assignment. Licensee may freely assign or otherwise transfer all or any of its rights, or delegate or otherwise transfer all or any of its obligations or performance, under this Agreement without Licensor's consent. This Agreement is binding upon and inures to the benefit of the parties hereto and their respective permitted successors and assigns.`;

const draftCopyrightTextUnquoted = `Copyright License Agreement

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

describe('cicero-server environment', () => {
    beforeEach(()=>{
        process.env.CICERO_DIR = './test/data1';
    });

    it('/should fail to start the server without CICERO_DIR defined', async () => {
        delete process.env.CICERO_DIR;
        (() => require('../app')).should.throw('You must set the CICERO_DIR environment variable.');
        decache('../app');
    });
});

describe('cicero-server', () => {

    before(()=>{
        process.env.CICERO_DIR = './test/data';
        server = require('../app');
        request = request(server);
    });

    it('/should trigger a simple stateless request (ergo)', async () => {
        return request.post('/trigger/latedeliveryandpenalty')
            .send({ 'request' : body, 'data' : triggerData })
            .expect(200)
            .expect('Content-Type',/json/)
            .then(response => {
                response.body.response.should.include(responseBody);
                response.body.should.not.have.property('state');
            });
    });

    it('/should fail to trigger without data', async () => {
        return request.post('/trigger/latedeliveryandpenalty')
            .send({ 'request' : body })
            .expect(500);
    });

    it('/should trigger a simple stateless request with a sample clause (ergo)', async () => {
        return request.post('/trigger/latedeliveryandpenalty')
            .send({ 'request' : body, 'data' : triggerData })
            .expect(200)
            .expect('Content-Type',/json/)
            .then(response => {
                response.body.response.should.include(responseBody);
                response.body.should.not.have.property('state');
            });
    });

    it('/should trigger a stateful request (ergo)', async () => {
        return request.post('/trigger/latedeliveryandpenalty')
            .send({
                data: triggerData,
                request: body,
                state,
            })
            .expect(200)
            .expect('Content-Type',/json/)
            .then(response => {
                response.body.response.should.include(responseBody);
                response.body.state.should.include(state);
            });
    });

    it('/should parse a template sample', async () => {
        return request.post('/parse/latedeliveryandpenalty')
            .send({ sample: draftLateText })
            .expect(200)
            .expect('Content-Type',/json/)
            .then(response => {
                delete response.body.clauseId;
                const expectedBody = Object.assign({}, parseBody);
                delete expectedBody.clauseId;
                response.body.should.deep.include(expectedBody);
            });
    });

    it('/should fail to parse without sample', async () => {
        return request.post('/parse/latedeliveryandpenalty')
            .send({})
            .expect(500);
    });

    it('/should draft from a template', async () => {
        return request.post('/draft/latedeliveryandpenalty')
            .send({ data: parseBody })
            .expect(200)
            .expect('Content-Type',/text/)
            .then(response => {
                response.text.should.equal(draftLateText);
            });
    });

    it('/should fail to draft without data', async () => {
        return request.post('/draft/latedeliveryandpenalty')
            .send({})
            .expect(500);
    });

    it('/should draft from a template (copyright-notice)', async () => {
        return request.post('/draft/copyright-license')
            .send({ data: parseCopyrightBody })
            .expect(200)
            .expect('Content-Type',/text/)
            .then(response => {
                response.text.should.equal(draftCopyrightText);
            });
    });

    it('/should draft from a template (copyright-notice)', async () => {
        return request.post('/draft/copyright-license')
            .send({ data: parseCopyrightBody, options: { unquoteVariables: true } })
            .expect(200)
            .expect('Content-Type',/text/)
            .then(response => {
                response.text.should.equal(draftCopyrightTextUnquoted);
            });
    });

    after(() => {
        server.close();
    });
});
