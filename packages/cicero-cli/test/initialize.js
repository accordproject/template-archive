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

const chai = require('chai');
const path = require('path');
require('chai').should();

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/commands');

const template = path.resolve(__dirname, 'data/helloworldstate/');
const sample = path.resolve(__dirname, 'data/helloworldstate/', 'text/sample.md');
const params = path.resolve(__dirname, 'data/helloworldstate/', 'params.json');

describe('#initializeWithParameters', () => {
    it('should initialize with some parameters', async () => {
        const response = await Commands.initialize(template, sample, params);
        response.state.$class.should.be.equal('org.accordproject.helloworldstate.HelloWorldState');
        response.state.counter.should.be.equal(2);
    });
});
