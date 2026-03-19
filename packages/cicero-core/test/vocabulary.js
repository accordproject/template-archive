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

const Template = require('../src/template');
const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const expect = chai.expect;
const options = { offline: false };

const NS = 'io.clause.latedeliveryandpenalty@0.1.0';

describe('Vocabulary', () => {

    describe('#fromDirectory', () => {

        it('should load a template with vocabulary files', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            template.should.not.be.null;

            const vocManager = template.getVocabularyManager();
            vocManager.should.not.be.null;

            const vocFiles = template.getVocFiles();
            vocFiles.length.should.equal(2);
        });

        it('should load English vocabulary terms correctly', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            const vocManager = template.getVocabularyManager();

            const enVoc = vocManager.getVocabulary(NS, 'en');
            expect(enVoc).to.not.be.null;
            enVoc.getLocale().should.equal('en');

            const term = enVoc.getTerm('TemplateModel');
            term.should.equal('Template Model');
        });

        it('should load French vocabulary terms correctly', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            const vocManager = template.getVocabularyManager();

            const frVoc = vocManager.getVocabulary(NS, 'fr');
            expect(frVoc).to.not.be.null;
            frVoc.getLocale().should.equal('fr');

            const term = frVoc.getTerm('TemplateModel');
            term.should.equal('Modèle de gabarit');
        });

        it('should load property-level vocabulary terms', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            const vocManager = template.getVocabularyManager();

            const enVoc = vocManager.getVocabulary(NS, 'en');
            const term = enVoc.getTerm('TemplateModel', 'forceMajeure');
            term.should.equal('Force Majeure');
        });

        it('should still load templates without vocabulary files', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.should.not.be.null;

            const vocManager = template.getVocabularyManager();
            vocManager.should.not.be.null;

            const vocFiles = template.getVocFiles();
            vocFiles.length.should.equal(0);
        });
    });

    describe('#defaultLocale', () => {

        it('should read defaultLocale from package.json', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            template.getMetadata().getDefaultLocale().should.equal('en');
        });

        it('should return null when defaultLocale is not set', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            expect(template.getMetadata().getDefaultLocale()).to.be.null;
        });

        it('should preserve defaultLocale through archive round-trip', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            const buffer = await template.toArchive();
            const template2 = await Template.fromArchive(buffer, options);
            template2.getMetadata().getDefaultLocale().should.equal('en');
        });
    });

    describe('#getVocabulary (convenience with fallback)', () => {

        it('should return vocabulary for requested locale', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            const voc = template.getVocabulary(NS, 'fr');
            expect(voc).to.not.be.null;
            voc.getLocale().should.equal('fr');
            voc.getTerm('TemplateModel').should.equal('Modèle de gabarit');
        });

        it('should fall back to defaultLocale when requested locale is not found', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            // 'de' locale doesn't exist, should fall back to 'en' (the defaultLocale)
            const voc = template.getVocabulary(NS, 'de');
            expect(voc).to.not.be.null;
            voc.getLocale().should.equal('en');
            voc.getTerm('TemplateModel').should.equal('Template Model');
        });

        it('should use defaultLocale when no locale is specified', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            const voc = template.getVocabulary(NS);
            expect(voc).to.not.be.null;
            voc.getLocale().should.equal('en');
        });

        it('should return null when no locale and no defaultLocale', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const voc = template.getVocabulary(NS);
            expect(voc).to.be.null;
        });
    });

    describe('#toArchive and fromArchive (round-trip)', () => {

        it('should round-trip vocabulary files through an archive', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);

            // save to archive
            const buffer = await template.toArchive();

            // reload from archive
            const template2 = await Template.fromArchive(buffer, options);
            template2.should.not.be.null;

            const vocFiles = template2.getVocFiles();
            vocFiles.length.should.equal(2);

            const vocManager = template2.getVocabularyManager();
            const enVoc = vocManager.getVocabulary(NS, 'en');
            expect(enVoc).to.not.be.null;
            enVoc.getTerm('TemplateModel').should.equal('Template Model');

            const frVoc = vocManager.getVocabulary(NS, 'fr');
            expect(frVoc).to.not.be.null;
            frVoc.getTerm('TemplateModel').should.equal('Modèle de gabarit');
        });

        it('should round-trip templates without vocabularies', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);

            const buffer = await template.toArchive();
            const template2 = await Template.fromArchive(buffer, options);

            template2.should.not.be.null;
            template2.getVocFiles().length.should.equal(0);
        });
    });

    describe('#getHash', () => {

        it('should include vocabularies in hash computation', async function () {
            const templateWithVoc = await Template.fromDirectory('./test/data/latedeliveryandpenalty-vocab', options);
            const templateWithoutVoc = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);

            templateWithVoc.getHash().should.not.equal(templateWithoutVoc.getHash());
        });
    });
});
