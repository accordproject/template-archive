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

const ApArchiveLoader = require('../../src/loaders/aparchiveloader');
const HTTPArchiveLoader = require('../../src/loaders/httparchiveloader');
const chai = require('chai');
const sinon = require('sinon');

chai.should();
chai.use(require('chai-as-promised'));

describe('ApArchiveLoader', () => {

    let apLoader;
    let httpLoadStub;

    beforeEach(() => {
        apLoader = new ApArchiveLoader();
        // STUNT DOUBLE: We stub the parent class's load method.
        // We don't want to make a real HTTP request; we just want to know
        // what URL the ApLoader TRIED to fetch.
        httpLoadStub = sinon.stub(HTTPArchiveLoader.prototype, 'load').resolves('ARCHIVE_DATA');
    });

    afterEach(() => {
        // Restore the original function after every test so we don't break other tests
        httpLoadStub.restore();
    });

    describe('#accepts', () => {
        it('should accept ap:// URLs', () => {
            apLoader.accepts('ap://helloworld@0.2.0#hash').should.be.true;
        });

        it('should reject non-ap URLs', () => {
            apLoader.accepts('http://google.com').should.be.false;
            apLoader.accepts('https://templates.accordproject.org').should.be.false;
        });
    });

    describe('#load', () => {
        it('should rewrite the URL and delegate to HTTP load', async () => {
            const inputUrl = 'ap://helloworld@0.2.0#97886fa';
            // The logic in source says: substring(5, atIndex) -> "helloworld"
            // substring(atIndex+1, hashIndex) -> "0.2.0"
            // Result should be: https://templates.accordproject.org/archives/helloworld@0.2.0.cta
            const expectedUrl = 'https://templates.accordproject.org/archives/helloworld@0.2.0.cta';

            const result = await apLoader.load(inputUrl, { option: 'test' });
            result.should.equal('ARCHIVE_DATA');
            // ASSERT: Did we transform the URL correctly?
            sinon.assert.calledWith(httpLoadStub, expectedUrl, { option: 'test' });
        });

        it('should throw error if @ is missing', async () => {
            const inputUrl = 'ap://helloworld#hash';
            (() => {
                apLoader.load(inputUrl, {});
            }).should.throw(/Invalid template specifier/);
        });

        it('should throw error if # is missing', async () => {
            const inputUrl = 'ap://helloworld@0.2.0';
            (() => {
                apLoader.load(inputUrl, {});
            }).should.throw(/Invalid template specifier/);
        });
    });
});