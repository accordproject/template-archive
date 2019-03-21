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

const TemplateLibrary = require('../lib/templatelibrary');

const chai = require('chai');

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
            return templateLibrary.getTemplateIndex().should.be.rejectedWith('Error: getaddrinfo ENOTFOUND foo.bar foo.bar:80');
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

        it('should retrieve latest version index for cicero version 0.10.1', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: true, ciceroVersion: '0.10.1'});
            templateIndex.should.not.have.property('helloworld@0.0.5');
            templateIndex.should.not.have.property('helloworld@0.2.0');
            templateIndex.should.not.have.property('helloworld@0.2.1');
            templateIndex.should.not.have.property('helloworld@0.3.0');
            templateIndex.should.not.have.property('helloworld@0.4.0');
            templateIndex.should.not.have.property('helloworld@0.5.0');
            templateIndex.should.not.have.property('helloworld@0.6.0');
            templateIndex.should.not.have.property('helloworld@0.7.2');
            templateIndex.should.have.property('helloworld@0.8.0');
        });

        it('should retrieve latest version index for cicero version 0.10.0-20190129142217', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: false, ciceroVersion: '0.10.0-20190129142217'});
            templateIndex.should.not.have.property('helloworld@0.0.5');
            templateIndex.should.not.have.property('helloworld@0.2.0');
            templateIndex.should.not.have.property('helloworld@0.2.1');
            templateIndex.should.not.have.property('helloworld@0.3.0');
            templateIndex.should.not.have.property('helloworld@0.4.0');
            templateIndex.should.not.have.property('helloworld@0.5.0');
            templateIndex.should.not.have.property('helloworld@0.6.0');
            templateIndex.should.have.property('helloworld@0.7.2');
        });

        it('should retrieve latest version index for cicero version 0.10.2-20190129142217', async function() {
            const templateLibrary = new TemplateLibrary();
            const templateIndex = await templateLibrary.getTemplateIndex({latestVersion: true, ciceroVersion: '0.10.2-20190129142217'});
            templateIndex.should.not.have.property('helloworld@0.0.5');
            templateIndex.should.not.have.property('helloworld@0.2.0');
            templateIndex.should.not.have.property('helloworld@0.2.1');
            templateIndex.should.not.have.property('helloworld@0.3.0');
            templateIndex.should.not.have.property('helloworld@0.4.0');
            templateIndex.should.not.have.property('helloworld@0.5.0');
            templateIndex.should.not.have.property('helloworld@0.6.0');
            templateIndex.should.not.have.property('helloworld@0.7.2');
            templateIndex.should.have.property('helloworld@0.8.0');
        });
    });

    describe.skip('#getTemplate', () => {

        it('should retrieve a template', async function() {
            const templateLibrary = new TemplateLibrary();
            const template = await templateLibrary.getTemplate('ap://ip-payment@0.8.0#378bbc0bc6f4f7f18fc18eb48952daae0fc30e1503688bb33ffb0238ca5db7f3');
            template.getIdentifier().should.equal('ip-payment@0.8.0');
        });
    });

    describe('#clearCache', () => {

        it('should be able to clear the cache', async function() {
            const templateLibrary = new TemplateLibrary();
            await templateLibrary.clearCache();
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