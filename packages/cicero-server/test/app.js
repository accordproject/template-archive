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
const responseBody = {
    '$class': 'org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse',
    penalty: 4,
    buyerMayTerminate: true,
};
const parseBody = {
    '$class': 'org.accordproject.latedeliveryandpenalty.TemplateModel',
    'capPercentage': 2,
    'forceMajeure': true,
    'fractionalPart': 'days',
    'penaltyPercentage': 7
};
const draftText = 'Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.';

describe('cicero-server bad CICERO_DIR environment', () => {

    it('/should fail to start the server without CICERO_DIR defined', async () => {
        delete process.env.CICERO_DIR;
        (() => require('../app')).should.throw('You must set the CICERO_DIR environment variable.');
        process.env.CICERO_DIR = './test/data';
        decache('../app');
    });

});

describe('cicero-server bad CICERO_DATA environment', () => {

    it('/should fail to start the server without CICERO_DATA defined', async () => {
        delete process.env.CICERO_DATA;
        (() => require('../app')).should.throw('You must set the CICERO_DATA environment variable.');
        process.env.CICERO_DATA = './test/data';
        decache('../app');
    });

});

describe('cicero-server', () => {

    before(()=>{
        process.env.CICERO_DIR = './test/data';
        process.env.CICERO_DATA = './test/data';
        server = require('../app');
        request = request(server);
    });

    it('/should trigger a simple stateless request (ergo)', async () => {
        return request.post('/trigger/latedeliveryandpenalty/data.json')
            .send(body)
            .expect(200)
            .expect('Content-Type',/json/)
            .then(response => {
                response.body.response.should.include(responseBody);
                response.body.should.not.have.property('state');
            });
    });

    it('/should trigger a simple stateless request with a sample clause (ergo)', async () => {
        return request.post('/trigger/latedeliveryandpenalty/text%2Fsample.md')
            .send(body)
            .expect(200)
            .expect('Content-Type',/json/)
            .then(response => {
                response.body.response.should.include(responseBody);
                response.body.should.not.have.property('state');
            });
    });

    it('/should fail to trigger a simple stateless request with a bad data file (ergo)', async () => {
        return request.post('/trigger/latedeliveryandpenalty/bad.txt')
            .send(body)
            .expect(500);
    });

    it('/should trigger a stateful request (ergo)', async () => {
        return request.post('/trigger/latedeliveryandpenalty/data.json')
            .send({
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

    it('/should parse a simple stateless request (ergo)', async () => {
        return request.post('/parse/latedeliveryandpenalty/data.json')
            .send(body)
            .expect(200)
            .expect('Content-Type',/json/)
            .then(response => {
                response.body.should.include(parseBody);
            });
    });

    it('/should draft a simple stateless request (ergo)', async () => {
        return request.post('/draft/latedeliveryandpenalty/data.json')
            .send(body)
            .expect(200)
            .expect('Content-Type',/text/)
            .then(response => {
                response.text.should.equal(draftText);
            });
    });

    after(() => {
        server.close();
    });
});
