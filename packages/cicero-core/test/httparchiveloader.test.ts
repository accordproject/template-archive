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

import HTTPArchiveLoader from '../src/loaders/httparchiveloader';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as unknown as jest.Mock;

describe('HTTPArchiveLoader', () => {

    describe('#load', () => {
        let axiosParams: any = {};

        afterEach(() => {
            jest.restoreAllMocks();
            mockedAxios.mockReset();
        });

        it('should load an archive from an unauthenticated URL', async function() {
            mockedAxios.mockImplementation((params: any) => {
                axiosParams = params;
                return Promise.resolve({ data: 'data' });
            });
            const loader = new HTTPArchiveLoader();

            loader.load('https://templates.accordproject.org/archives/ip-payment@0.13.0.cta', undefined);
            expect(axiosParams.headers).toBeUndefined();
        });

        it('should load an archive from an authenticated URL', async function() {
            mockedAxios.mockImplementation((params: any) => {
                axiosParams = params;
                return Promise.resolve({ data: 'data' });
            });
            const loader = new HTTPArchiveLoader();

            loader.load('https://templates.accordproject.org/archives/ip-payment@0.13.0.cta', { httpAuthHeader: 'Basic TOKEN' });
            expect(axiosParams.headers.authorization).toBe('Basic TOKEN');
        });

        it('should fail to load an archive from an authenticated URL with an unauthenticated request', async function() {
            mockedAxios.mockImplementation((params: any) => {
                axiosParams = params;
                return Promise.reject({
                    message: 'Unauthenticated',
                    reponse: {
                        data: 'Unauthenticated',
                        state: 401,
                    }
                });
            });
            const loader = new HTTPArchiveLoader();

            await expect(loader.load('https://templates.accordproject.org/archives/ip-payment@0.13.0.cta', undefined)).rejects.toBeDefined();
        });

        it('should load an archive with a custom timeout', async function() {
            mockedAxios.mockImplementation((params: any) => {
                axiosParams = params;
                return Promise.resolve({ data: 'data' });
            });
            const loader = new HTTPArchiveLoader();

            // ACT: We ask for a 10-second timeout (10000ms)
            await loader.load('https://templates.accordproject.org/archives/ip-payment@0.13.0.cta', { timeout: 10000 });

            // ASSERT: We check if Axios actually received that number
            expect(axiosParams.timeout).toBe(10000);
        });

    });
});
