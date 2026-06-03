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

import GitHubArchiveLoader from '../../src/loaders/githubarchiveloader';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as unknown as jest.Mock;

describe('GitHubArchiveLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new GitHubArchiveLoader();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        mockedAxios.mockReset();
    });

    describe('#accepts', () => {
        it('should accept a github URL', () => {
            expect(loader.accepts('github://accordproject/githubarchiveloader')).toBe(true);
        });

        it('should not accept a non-github URL', () => {
            expect(loader.accepts('http://accordproject/githubarchiveloader')).toBe(false);
        });
    });

    describe('#load', () => {
        it('should load an archive from github', async () => {
            mockedAxios.mockImplementation(() => {
                return Promise.resolve({ data: Buffer.from('test') });
            });
            const mockedLoader = new GitHubArchiveLoader();
            const buffer = await mockedLoader.load(
                'github://accordproject/githubarchiveloader',
                undefined,
            );
            expect(buffer.toString()).toBe('test');
        });
    });
});
