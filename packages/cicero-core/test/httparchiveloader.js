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

let HTTPArchiveLoader = require('../lib/loaders/httparchiveloader');

const chai = require('chai');
const mock = require('mock-require');
const { expect } = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('HTTPArchiveLoader', () => {

    describe('#load', () => {
        let axiosParams = {};

        // Mock call for Template Index
        const mockAxios = (params) => {
            axiosParams = params;
            return Promise.resolve({
                data: 'data'
            });
        };

        it('should load an archive from an unauthenticated URL', async function() {
            mock('axios', mockAxios);
            HTTPArchiveLoader = mock.reRequire('../lib/loaders/httparchiveloader');
            const loader = new HTTPArchiveLoader();

            loader.load('https://templates.accordproject.org/archives/ip-payment@0.13.0.cta');
            expect(axiosParams.headers).to.be.undefined;

            mock.stop('axios');
        });

        it('should load an archive from an authenticated URL', async function() {
            mock('axios', mockAxios);
            HTTPArchiveLoader = mock.reRequire('../lib/loaders/httparchiveloader');
            const loader = new HTTPArchiveLoader();

            loader.load('https://templates.accordproject.org/archives/ip-payment@0.13.0.cta', { httpAuthHeader: 'Basic TOKEN' });
            expect(axiosParams.headers.authorization).to.equal('Basic TOKEN');

            mock.stop('axios');
        });

        it('should fail to load an archive from an authenticated URL with an unauthenticated request', async function() {
            mock('axios', (params) => {
                axiosParams = params;
                return Promise.reject({
                    message: 'Unauthenticated',
                    reponse: {
                        data: 'Unauthenticated',
                        state: 401,
                    }
                });
            });
            HTTPArchiveLoader = mock.reRequire('../lib/loaders/httparchiveloader');
            const loader = new HTTPArchiveLoader();

            loader.load('https://templates.accordproject.org/archives/ip-payment@0.13.0.cta').should.be.rejected;

            mock.stop('axios');
        });
    });
});