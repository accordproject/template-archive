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

let TemplateLibrary = require('../lib/templatelibrary');

const chai = require('chai');
const mock = require('mock-require');
const { expect } = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('TemplateLibrary', () => {

    describe('#constructor', () => {

        it('should create with default url', async function() {
            const templateLibrary = new TemplateLibrary();
            templateLibrary.url.should.equal('https://templates.accordproject.org');
        });

        it('should create with custom url', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org');
            templateLibrary.url.should.equal('https://foo.org');
        });

        it('should create with Basic Auth httpHeader', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org', 'Basic someBasicCredential');
            templateLibrary.url.should.equal('https://foo.org');
            templateLibrary.httpAuthHeader.should.equal('Basic someBasicCredential');
        });

        it('should create with Bearer Token httpHeader', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org', 'Bearer someBearerToken');
            templateLibrary.url.should.equal('https://foo.org');
            templateLibrary.httpAuthHeader.should.equal('Bearer someBearerToken');
        });

        it('should create with AWS Signature', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org', 'AWSAccessKey AWSSecretKey');
            templateLibrary.url.should.equal('https://foo.org');
            templateLibrary.httpAuthHeader.should.equal('AWSAccessKey AWSSecretKey');
        });

        it('should work fine without httpHeader', async function() {
            const templateLibrary = new TemplateLibrary('https://foo.org');
            templateLibrary.url.should.equal('https://foo.org');
        });
    });

    describe('#getTemplateIndex', () => {

        it('should retrieve index', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex();
            templateIndex.should.have.property('helloworld@0.3.0');
        });

        it('should retrieve index from cache', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex();
            templateIndex.should.have.property('helloworld@0.3.0');
            const templateIndexTwice = await templateLibrary.getTemplateIndex();
            templateIndexTwice.should.have.property('helloworld@0.3.0');
        });

        it('should fail to retrieve index', async function() {
            const templateLibrary = new TemplateLibrary('http://foo.bar');
            return templateLibrary.getTemplateIndex().should.be.rejectedWith('getaddrinfo ENOTFOUND foo.bar');
        });

        it('should retrieve index for latest versions', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: true});
            templateIndex.should.not.have.property('helloworld@0.0.5');
        });

        it('should retrieve index for cicero version 0.3.0', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({ciceroVersion: '0.3.0'});
            templateIndex.should.have.property('helloworld@0.0.5');
            templateIndex.should.not.have.property('helloworld@0.2.0');
        });

        it('should retrieve index for cicero version 0.20.0', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({ciceroVersion: '0.20.10'});
            templateIndex.should.have.property('acceptance-of-delivery@0.13.0');
            templateIndex.should.have.property('acceptance-of-delivery@0.13.1');
            templateIndex.should.have.property('acceptance-of-delivery@0.13.2');
            Object.keys(templateIndex).length.should.equal(109);
        });

        it('should retrieve index of latest templates for cicero version 0.20.0', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({ciceroVersion: '0.20.10',latestVersion: true});
            templateIndex.should.not.have.property('acceptance-of-delivery@0.13.0');
            templateIndex.should.not.have.property('acceptance-of-delivery@0.13.1');
            templateIndex.should.have.property('acceptance-of-delivery@0.13.2');
            Object.keys(templateIndex).length.should.equal(48);
        });

        it('should retrieve latest version index for cicero version 0.21.0', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: true, ciceroVersion: '0.21.0'});
            templateIndex.should.not.have.property('helloworld@0.0.5');
            templateIndex.should.not.have.property('helloworld@0.2.0');
            templateIndex.should.not.have.property('helloworld@0.2.1');
            templateIndex.should.not.have.property('helloworld@0.3.0');
            templateIndex.should.not.have.property('helloworld@0.4.0');
            templateIndex.should.not.have.property('helloworld@0.5.0');
            templateIndex.should.not.have.property('helloworld@0.6.0');
            templateIndex.should.not.have.property('helloworld@0.7.2');
            templateIndex.should.not.have.property('helloworld@0.8.0');
            templateIndex.should.not.have.property('helloworld@0.9.0');
            templateIndex.should.not.have.property('helloworld@0.10.1');
            templateIndex.should.not.have.property('helloworld@0.11.1');
            templateIndex.should.not.have.property('helloworld@0.12.0');
            templateIndex.should.not.have.property('helloworld@0.12.1');
            templateIndex.should.have.property('helloworld@0.13.0');
        });

        it('should retrieve latest version index for cicero version 0.20.9', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({ciceroVersion: '0.20.9'});
            templateIndex.should.not.have.property('helloworld@0.0.5');
            templateIndex.should.not.have.property('helloworld@0.2.0');
            templateIndex.should.not.have.property('helloworld@0.2.1');
            templateIndex.should.not.have.property('helloworld@0.3.0');
            templateIndex.should.not.have.property('helloworld@0.4.0');
            templateIndex.should.not.have.property('helloworld@0.5.0');
            templateIndex.should.not.have.property('helloworld@0.6.0');
            templateIndex.should.not.have.property('helloworld@0.7.2');
            templateIndex.should.not.have.property('helloworld@0.8.0');
            templateIndex.should.not.have.property('helloworld@0.9.0');
            templateIndex.should.not.have.property('helloworld@0.10.1');
            templateIndex.should.not.have.property('helloworld@0.11.1');
            templateIndex.should.have.property('helloworld@0.12.0');
        });

        it('should retrieve latest version index for cicero version 0.20.11-20190129142217', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: false, ciceroVersion: '0.20.10-20190129142217'});
            templateIndex.should.not.have.property('helloworld@0.0.5');
            templateIndex.should.not.have.property('helloworld@0.2.0');
            templateIndex.should.not.have.property('helloworld@0.2.1');
            templateIndex.should.not.have.property('helloworld@0.3.0');
            templateIndex.should.not.have.property('helloworld@0.4.0');
            templateIndex.should.not.have.property('helloworld@0.5.0');
            templateIndex.should.not.have.property('helloworld@0.6.0');
            templateIndex.should.not.have.property('helloworld@0.7.2');
            templateIndex.should.not.have.property('helloworld@0.8.0');
            templateIndex.should.not.have.property('helloworld@0.9.0');
            templateIndex.should.not.have.property('helloworld@0.10.1');
            templateIndex.should.have.property('helloworld@0.12.0');
        });

        it('should retrieve latest version index for cicero version 0.21.1-20190129142217', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: true, ciceroVersion: '0.21.11-20190129142217'});
            templateIndex.should.not.have.property('helloworld@0.0.5');
            templateIndex.should.not.have.property('helloworld@0.2.0');
            templateIndex.should.not.have.property('helloworld@0.2.1');
            templateIndex.should.not.have.property('helloworld@0.3.0');
            templateIndex.should.not.have.property('helloworld@0.4.0');
            templateIndex.should.not.have.property('helloworld@0.5.0');
            templateIndex.should.not.have.property('helloworld@0.6.0');
            templateIndex.should.not.have.property('helloworld@0.7.2');
            templateIndex.should.not.have.property('helloworld@0.8.0');
            templateIndex.should.not.have.property('helloworld@0.9.0');
            templateIndex.should.not.have.property('helloworld@0.10.1');
            templateIndex.should.not.have.property('helloworld@0.11.1');
            templateIndex.should.not.have.property('helloworld@0.12.0');
            templateIndex.should.not.have.property('helloworld@0.12.1');
            templateIndex.should.have.property('helloworld@0.13.0');
        });
    });

    describe('#getTemplate', () => {
        let axiosParams = {};
        let fromUrlParams = {};

        // Mock call for Template Index
        const mockAxios = (params) => {
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
            fromUrl: (_url, options) => {
                fromUrlParams = options;
                return Promise.resolve({
                    getHash: () => 'a4b918a2be2d984dbddd5d8b41703b0761d6cd03d1e65ad3d3cd4a11d2bb1ab2'
                });
            },
        };

        it('should retrieve a template', async function() {
            const templateLibrary = new TemplateLibrary();
            const template = await templateLibrary.getTemplate('ap://ip-payment@0.13.0#a4b918a2be2d984dbddd5d8b41703b0761d6cd03d1e65ad3d3cd4a11d2bb1ab2');
            template.getIdentifier().should.equal('ip-payment@0.13.0');
        });

        it('should retrieve a template without authentication', async () => {
            mock('axios', mockAxios);
            mock('../lib/template', mockTemplateInstance);
            TemplateLibrary = mock.reRequire('../lib/templatelibrary');

            const templateLibrary = new TemplateLibrary();
            await templateLibrary.getTemplateIndex();
            expect(axiosParams.headers.authorization).to.be.undefined;

            await templateLibrary.getTemplate('ap://ip-payment@0.13.0#a4b918a2be2d984dbddd5d8b41703b0761d6cd03d1e65ad3d3cd4a11d2bb1ab2');
            expect(fromUrlParams).to.be.undefined;

            mock.stop('axios');
            mock.stop('./template');
        });

        it('should retrieve a template with authentication', async () => {
            mock('axios', mockAxios);
            mock('../lib/template', mockTemplateInstance);
            TemplateLibrary = mock.reRequire('../lib/templatelibrary');

            const templateLibrary = new TemplateLibrary(null, 'Bearer TOKEN');
            await templateLibrary.getTemplateIndex();
            expect(axiosParams.headers.authorization).to.equal('Bearer TOKEN');

            await templateLibrary.getTemplate('ap://ip-payment@0.13.0#a4b918a2be2d984dbddd5d8b41703b0761d6cd03d1e65ad3d3cd4a11d2bb1ab2');
            expect(fromUrlParams.httpAuthHeader).to.equal('Bearer TOKEN');

            mock.stop('axios');
            mock.stop('./template');
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
            TemplateLibrary.acceptsURI('ap://foobar').should.equal(true);
        });
        it('should reject other protocols', async function() {
            TemplateLibrary.acceptsURI('ab://foobar').should.equal(false);
        });
    });

    describe('#parseURI', () => {

        it('should fail parsing the URI for the wrong protocol', async function() {
            (() => TemplateLibrary.parseURI('ab://')).should.throw('Unsupported protocol: ab://');
        });
        it('should fail parsing the URI without @ or # modifiers', async function() {
            (() => TemplateLibrary.parseURI('ap://foobar')).should.throw('Invalid template specifier. Must contain @ and #: ap://foobar');
        });
    });

    describe('#getTemplateIndexCacheKey', () => {

        it('should get a cache key for the index', async function() {
            const templateLibrary = new TemplateLibrary();
            const key = templateLibrary.getTemplateIndexCacheKey();
            key.should.equal('https://templates.accordproject.org/template-library.json');
        });

        it('should get a cache key for the index based on options', async function() {
            const templateLibrary = new TemplateLibrary();
            const key = templateLibrary.getTemplateIndexCacheKey({'foo' : true});
            key.should.equal('https://templates.accordproject.org/ce35fd691fe6c26448191f4528e1ffefb1aa198ed17897c8a92cd012aa1c3719-template-library.json');
        });
    });

    describe('#getTemplateCacheKey', () => {

        it('should get a cache key for a template', async function() {
            const templateLibrary = new TemplateLibrary();
            const key = templateLibrary.getTemplateCacheKey('foo');
            key.should.equal('https://templates.accordproject.org/foo');
        });
    });
});