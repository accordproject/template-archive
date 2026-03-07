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

const GitHubArchiveLoader = require('../../src/loaders/githubarchiveloader');
const mock = require('mock-require');

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

describe('GitHubArchiveLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new GitHubArchiveLoader();
    });

    describe('#accepts', () => {
        it('should accept a github URL', () => {
            loader.accepts('github://accordproject/githubarchiveloader').should
                .be.true;
        });

        it('should not accept a non-github URL', () => {
            loader.accepts('http://accordproject/githubarchiveloader').should.be
                .false;
        });
    });

    describe('#load', () => {
        it('should load an archive from github', async () => {
            const axiosMock = (request) => {
                return Promise.resolve({ data: Buffer.from('test') });
            };
            mock('axios', axiosMock);
            try {
                mock.reRequire('../../src/loaders/httparchiveloader');
                const MockedLoader = mock.reRequire(
                    '../../src/loaders/githubarchiveloader',
                );
                const mockedLoader = new MockedLoader();
                const buffer = await mockedLoader.load(
                    'github://accordproject/githubarchiveloader',
                );
                buffer.toString().should.equal('test');
            } finally {
                mock.stop('axios');
            }
        });
    });
});
