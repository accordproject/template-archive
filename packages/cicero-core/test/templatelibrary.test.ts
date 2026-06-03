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

import TemplateLibraryImport from '../src/templatelibrary';

// The src signatures do not mark optional params as optional; alias to a
// permissive type so call sites that omit defaulted args still type-check.
const TemplateLibrary: any = TemplateLibraryImport;

describe('TemplateLibrary', () => {

    describe('#constructor', () => {

        it('should create with default url', async function() {
            const templateLibrary = new TemplateLibrary();
            expect(templateLibrary.url).toBe('https://templates.accordproject.org');
        });

        it('should create with custom url', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org');
            expect(templateLibrary.url).toBe('https://foo.org');
        });

        it('should create with Basic Auth httpHeader', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org', 'Basic someBasicCredential');
            expect(templateLibrary.url).toBe('https://foo.org');
            expect(templateLibrary.httpAuthHeader).toBe('Basic someBasicCredential');
        });

        it('should create with Bearer Token httpHeader', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org', 'Bearer someBearerToken');
            expect(templateLibrary.url).toBe('https://foo.org');
            expect(templateLibrary.httpAuthHeader).toBe('Bearer someBearerToken');
        });

        it('should create with AWS Signature', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org', 'AWSAccessKey AWSSecretKey');
            expect(templateLibrary.url).toBe('https://foo.org');
            expect(templateLibrary.httpAuthHeader).toBe('AWSAccessKey AWSSecretKey');
        });

        it('should work fine without httpHeader', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org');
            expect(templateLibrary.url).toBe('https://foo.org');
        });
    });

    describe('#getTemplateIndex', () => {

        it('should retrieve index', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex();
            expect(templateIndex).toHaveProperty(['helloworld@0.3.0']);
        });

        it('should retrieve index from cache', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex();
            expect(templateIndex).toHaveProperty(['helloworld@0.3.0']);
            const templateIndexTwice = await templateLibrary.getTemplateIndex();
            expect(templateIndexTwice).toHaveProperty(['helloworld@0.3.0']);
        });

        it('should fail to retrieve index', async function() {
            const templateLibrary = new TemplateLibrary('http://foo.bar');
            await expect(templateLibrary.getTemplateIndex()).rejects.toThrow('getaddrinfo ENOTFOUND foo.bar');
        });

        it('should retrieve index for latest versions', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: true});
            expect(templateIndex).not.toHaveProperty(['helloworld@0.0.5']);
        });

        it('should retrieve index for cicero version 0.3.0', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({ciceroVersion: '0.3.0'});
            expect(templateIndex).toHaveProperty(['helloworld@0.0.5']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.2.0']);
        });

        it('should retrieve index for cicero version 0.20.0', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({ciceroVersion: '0.20.10'});
            expect(templateIndex).toHaveProperty(['acceptance-of-delivery@0.13.0']);
            expect(templateIndex).toHaveProperty(['acceptance-of-delivery@0.13.1']);
            expect(templateIndex).toHaveProperty(['acceptance-of-delivery@0.13.2']);
            expect(Object.keys(templateIndex).length).toBe(109);
        });

        it('should retrieve index of latest templates for cicero version 0.20.0', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({ciceroVersion: '0.20.10',latestVersion: true});
            expect(templateIndex).not.toHaveProperty(['acceptance-of-delivery@0.13.0']);
            expect(templateIndex).not.toHaveProperty(['acceptance-of-delivery@0.13.1']);
            expect(templateIndex).toHaveProperty(['acceptance-of-delivery@0.13.2']);
            expect(Object.keys(templateIndex).length).toBe(48);
        });

        it('should retrieve latest version index for cicero version 0.21.0', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: true, ciceroVersion: '0.21.0'});
            expect(templateIndex).not.toHaveProperty(['helloworld@0.0.5']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.2.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.2.1']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.3.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.4.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.5.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.6.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.7.2']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.8.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.9.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.10.1']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.11.1']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.12.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.12.1']);
            expect(templateIndex).toHaveProperty(['helloworld@0.13.0']);
        });

        it('should retrieve latest version index for cicero version 0.20.9', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({ciceroVersion: '0.20.9'});
            expect(templateIndex).not.toHaveProperty(['helloworld@0.0.5']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.2.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.2.1']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.3.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.4.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.5.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.6.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.7.2']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.8.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.9.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.10.1']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.11.1']);
            expect(templateIndex).toHaveProperty(['helloworld@0.12.0']);
        });

        it('should retrieve latest version index for cicero version 0.20.11-20190129142217', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: false, ciceroVersion: '0.20.10-20190129142217'});
            expect(templateIndex).not.toHaveProperty(['helloworld@0.0.5']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.2.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.2.1']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.3.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.4.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.5.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.6.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.7.2']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.8.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.9.0']);
            expect(templateIndex).not.toHaveProperty(['helloworld@0.10.1']);
            expect(templateIndex).toHaveProperty(['helloworld@0.12.0']);
        });

    });

    describe('#getTemplate', () => {
        let axiosParams: any = {};
        let fromUrlParams: any = {};

        // Mock call for Template Index
        const mockAxios = (params: any) => {
            axiosParams = params;
            return Promise.resolve({
                data: {
                    'ip-payment@0.13.0': {
                        uri: 'ap://ip-payment@0.13.0#a4b918a2be2d984dbddd5d8b41703b0761d6cd03d1e65ad3d3cd4a11d2bb1ab2',
                        url: 'https://templates.accordproject.org/archives/ip-payment@0.13.0.cta',
                        ciceroUrl: 'https://templates.accordproject.org/archives/ip-payment@0.13.0-cicero.cta',
                        name: 'ip-payment',
                        displayName: 'IP Payment',
                        description: 'This clause is a payment clause for IP agreements, such as trademark or copyright licenses.',
                        version: '0.13.0',
                        ciceroVersion: '^0.21.0',
                        type: 1,
                        author: 'Accord Project'
                    }
                }
            });
        };

        // Mock call to download template archive
        const mockTemplateInstance = {
            __esModule: true,
            default: {
                fromUrl: (_url: string, options: any) => {
                    fromUrlParams = options;
                    return Promise.resolve({
                        getHash: () => 'a4b918a2be2d984dbddd5d8b41703b0761d6cd03d1e65ad3d3cd4a11d2bb1ab2'
                    });
                },
            }
        };

        beforeEach(() => {
            axiosParams = {};
            fromUrlParams = {};
        });

        afterEach(() => {
            jest.resetModules();
            jest.dontMock('axios');
            jest.dontMock('../src/template');
        });

        const loadMockedLibrary = () => {
            jest.resetModules();
            jest.doMock('axios', () => ({ __esModule: true, default: mockAxios }));
            jest.doMock('../src/template', () => mockTemplateInstance);
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('../src/templatelibrary').default;
        };

        it.skip('should retrieve a template', async function() {
            const templateLibrary = new TemplateLibrary();
            const template = await templateLibrary.getTemplate('ap://ip-payment@0.14.0#b652957cc16e643e4ddcbcf8ad755e14d4320d419e7fb151ee0cbaf0ac17fdd3');
            expect(template.getIdentifier()).toBe('ip-payment@0.14.0');
        });

        it('should retrieve a template without authentication', async () => {
            const MockedTemplateLibrary = loadMockedLibrary();

            const templateLibrary = new MockedTemplateLibrary();
            await templateLibrary.getTemplateIndex();
            expect(axiosParams.headers.authorization).toBeUndefined();

            await templateLibrary.getTemplate('ap://ip-payment@0.13.0#a4b918a2be2d984dbddd5d8b41703b0761d6cd03d1e65ad3d3cd4a11d2bb1ab2');
            expect(fromUrlParams).toBeUndefined();
        });

        it('should retrieve a template with authentication', async () => {
            const MockedTemplateLibrary = loadMockedLibrary();

            const templateLibrary = new MockedTemplateLibrary(null, 'Bearer TOKEN');
            await templateLibrary.getTemplateIndex();
            expect(axiosParams.headers.authorization).toBe('Bearer TOKEN');

            await templateLibrary.getTemplate('ap://ip-payment@0.13.0#a4b918a2be2d984dbddd5d8b41703b0761d6cd03d1e65ad3d3cd4a11d2bb1ab2');
            expect(fromUrlParams.httpAuthHeader).toBe('Bearer TOKEN');
        });
    });

    describe('#clearCache', () => {

        it('should be able to clear the cache', async function() {
            const templateLibrary = new TemplateLibrary();
            await templateLibrary.clearCache();
        });
    });

    describe('#acceptURI', () => {

        it('should accept ap:// protocols', async function() {
            expect(TemplateLibrary.acceptsURI('ap://foobar')).toBe(true);
        });
        it('should reject other protocols', async function() {
            expect(TemplateLibrary.acceptsURI('ab://foobar')).toBe(false);
        });
    });

    describe('#parseURI', () => {

        it('should fail parsing the URI for the wrong protocol', async function() {
            expect(() => TemplateLibrary.parseURI('ab://')).toThrow('Unsupported protocol: ab://');
        });
        it('should fail parsing the URI without @ or # modifiers', async function() {
            expect(() => TemplateLibrary.parseURI('ap://foobar')).toThrow('Invalid template specifier. Must contain @ and #: ap://foobar');
        });
    });

    describe('#getTemplateIndexCacheKey', () => {

        it('should get a cache key for the index', async function() {
            const templateLibrary = new TemplateLibrary();
            const key = templateLibrary.getTemplateIndexCacheKey();
            expect(key).toBe('https://templates.accordproject.org/template-library.json');
        });

        it('should get a cache key for the index based on options', async function() {
            const templateLibrary = new TemplateLibrary();
            const key = templateLibrary.getTemplateIndexCacheKey({'foo' : true});
            expect(key).toBe('https://templates.accordproject.org/ce35fd691fe6c26448191f4528e1ffefb1aa198ed17897c8a92cd012aa1c3719-template-library.json');
        });
    });

    describe('#getTemplateCacheKey', () => {

        it('should get a cache key for a template', async function() {
            const templateLibrary = new TemplateLibrary();
            const key = templateLibrary.getTemplateCacheKey('foo');
            expect(key).toBe('https://templates.accordproject.org/foo');
        });
    });
});