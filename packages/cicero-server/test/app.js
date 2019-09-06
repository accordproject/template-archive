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

describe('cicero-server bad environment', () => {

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

    it('/should execute a simple stateless request (ergo)', async () => {
        return request.post('/execute/latedeliveryandpenalty/data.json')
            .send(body)
            .expect(200)
            .then(response => {
                response.body.response.should.include(responseBody);
                response.body.should.not.have.property('state');
            });
    });

    it('/should execute a simple stateless request with a sample clause (ergo)', async () => {
        return request.post('/execute/latedeliveryandpenalty/sample.md')
            .send(body)
            .expect(200)
            .then(response => {
                response.body.response.should.include(responseBody);
                response.body.should.not.have.property('state');
            });
    });

    it('/should fail to execute a simple stateless request with a bad data file (ergo)', async () => {
        return request.post('/execute/latedeliveryandpenalty/bad.txt')
            .send(body)
            .expect(500);
    });

    it('/should execute a stateful request (ergo)', async () => {
        return request.post('/execute/latedeliveryandpenalty/data.json')
            .send({
                request: body,
                state,
            })
            .expect(200)
            .then(response => {
                response.body.response.should.include(responseBody);
                response.body.state.should.include(state);
            });
    });

    after(() => {
        server.close();
    });
});

