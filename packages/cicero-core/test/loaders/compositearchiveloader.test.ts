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

import CompositeArchiveLoader from '../../src/loaders/compositearchiveloader';

describe('CompositeArchiveLoader', () => {

    let compositeLoader;
    let mockLoader1;
    let mockLoader2;

    beforeEach(() => {
        compositeLoader = new CompositeArchiveLoader();
        // Create dummy loaders (The "Employees")
        mockLoader1 = {
            accepts: jest.fn(),
            load: jest.fn()
        };
        mockLoader2 = {
            accepts: jest.fn(),
            load: jest.fn()
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('#constructor', () => {
        it('should start with zero loaders', () => {
            expect(compositeLoader.getArchiveLoaders()).toHaveLength(0);
        });
    });

    describe('#addArchiveLoader', () => {
        it('should add loaders to the list', () => {
            compositeLoader.addArchiveLoader(mockLoader1);
            expect(compositeLoader.getArchiveLoaders()).toHaveLength(1);
            compositeLoader.addArchiveLoader(mockLoader2);
            expect(compositeLoader.getArchiveLoaders()).toHaveLength(2);
        });
    });

    describe('#clearArchiveLoaders', () => {
        it('should remove all loaders', () => {
            compositeLoader.addArchiveLoader(mockLoader1);
            compositeLoader.clearArchiveLoaders();
            expect(compositeLoader.getArchiveLoaders()).toHaveLength(0);
        });
    });

    describe('#accepts', () => {
        it('should return true if one of the loaders accepts the URL', () => {
            // Mock: Loader 1 says NO, Loader 2 says YES
            mockLoader1.accepts.mockReturnValue(false);
            mockLoader2.accepts.mockReturnValue(true);
            compositeLoader.addArchiveLoader(mockLoader1);
            compositeLoader.addArchiveLoader(mockLoader2);

            const result = compositeLoader.accepts('http://test.url');
            expect(result).toBe(true);
        });

        it('should return false if NONE of the loaders accept the URL', () => {
            mockLoader1.accepts.mockReturnValue(false);
            mockLoader2.accepts.mockReturnValue(false);
            compositeLoader.addArchiveLoader(mockLoader1);
            compositeLoader.addArchiveLoader(mockLoader2);

            const result = compositeLoader.accepts('http://test.url');
            expect(result).toBe(false);
        });
    });

    describe('#load', () => {
        it('should delegate load to the first accepting loader', async () => {
            mockLoader1.accepts.mockReturnValue(false);
            mockLoader2.accepts.mockReturnValue(true);
            mockLoader2.load.mockResolvedValue('ARCHIVE_DATA'); // Simulate successful load

            compositeLoader.addArchiveLoader(mockLoader1);
            compositeLoader.addArchiveLoader(mockLoader2);

            const result = await compositeLoader.load('http://test.url', {});
            expect(result).toBe('ARCHIVE_DATA');
            expect(mockLoader2.load).toHaveBeenCalledWith('http://test.url', {});
        });

        it('should throw an error if NO loader accepts the URL', () => {
            mockLoader1.accepts.mockReturnValue(false);
            mockLoader2.accepts.mockReturnValue(false);

            compositeLoader.addArchiveLoader(mockLoader1);
            compositeLoader.addArchiveLoader(mockLoader2);

            expect(() => {
                compositeLoader.load('http://unknown.url', {});
            }).toThrow(/Failed to find a model file loader/);
        });
    });
});
