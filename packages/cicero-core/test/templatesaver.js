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

const JSZip = require('jszip');
const TemplateSaver = require('../src/templatesaver');
const Template = require('../src/template');

const chai = require('chai');
const expect = chai.expect;
chai.should();
chai.use(require('chai-as-promised'));

describe('TemplateSaver', () => {
    describe('#toArchive', () => {
        it('should save a template with a signature', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            template.authorSignature = {
                templateHash: 'hash',
                timestamp: Date.now(),
                signatoryCert: 'cert',
                signature: 'sig',
            };
            const buffer = await TemplateSaver.toArchive(template);
            buffer.should.not.be.null;

            // Verify the signature.json exists in the archive
            const zip = await JSZip.loadAsync(buffer);
            const sigFile = zip.file('signature.json');
            expect(sigFile).to.not.be.null;

            const sigString = await sigFile.async('string');
            const sig = JSON.parse(sigString);
            sig.templateSignature.signature.should.equal('sig');
        });

        it('should save a template with multiple locales', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            template.getMetadata().getSamples().fr = 'Bonjour';
            const buffer = await TemplateSaver.toArchive(template);
            buffer.should.not.be.null;

            // Verify the French sample text exists in the archive
            const zip = await JSZip.loadAsync(buffer);
            const sampleFile = zip.file('text/sample_fr.md');
            expect(sampleFile).to.not.be.null;

            const content = await sampleFile.async('string');
            content.should.equal('Bonjour');
        });
    });

    describe('#toArchive - compression', () => {
        it('should produce a compressed archive using DEFLATE', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            buffer.should.not.be.null;

            const zip = await JSZip.loadAsync(buffer);
            // Check that non-directory files use DEFLATE compression
            const files = Object.values(zip.files).filter(f => !f.dir);
            files.length.should.be.greaterThan(0);
            for (const file of files) {
                file._data.compression.magic.should.equal('\x08\x00',
                    `${file.name} should use DEFLATE (0x0800) compression`);
            }
        });

        it('should produce a smaller archive than STORE would', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const compressedBuffer = await TemplateSaver.toArchive(template);

            // Generate an uncompressed version for comparison
            const JSZipFresh = require('jszip');
            const zip = await JSZipFresh.loadAsync(compressedBuffer);
            const uncompressedBuffer = await zip.generateAsync({
                type: 'nodebuffer',
                compression: 'STORE'
            });

            compressedBuffer.length.should.be.lessThan(uncompressedBuffer.length);
        });
    });

    describe('#toArchive - archive structure', () => {
        it('should include package.json', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);
            const file = zip.file('package.json');
            expect(file).to.not.be.null;

            const content = JSON.parse(await file.async('string'));
            content.name.should.equal('latedeliveryandpenalty');
        });

        it('should include model files under model/', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);

            const modelFiles = Object.keys(zip.files).filter(
                f => f.startsWith('model/') && !zip.files[f].dir
            );
            modelFiles.length.should.be.greaterThan(0);
        });

        it('should include grammar template', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);
            const file = zip.file('text/grammar.tem.md');
            expect(file).to.not.be.null;

            const content = await file.async('string');
            content.length.should.be.greaterThan(0);
        });

        it('should include default sample text', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);
            const file = zip.file('text/sample.md');
            expect(file).to.not.be.null;
        });

        it('should include logic/ directory entry in archive', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);

            // logic/ directory should exist in the archive file list
            const logicEntries = Object.keys(zip.files).filter(
                f => f.startsWith('logic/')
            );
            logicEntries.length.should.be.greaterThan(0);
        });

        it('should include request.json when present', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);
            const file = zip.file('request.json');
            if (template.getMetadata().getRequest()) {
                expect(file).to.not.be.null;
            }
        });

        it('should include README.md when present', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);
            const file = zip.file('README.md');
            if (template.getMetadata().getREADME()) {
                expect(file).to.not.be.null;
            }
        });

        it('should not include signature.json when no signature exists', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);
            const file = zip.file('signature.json');
            expect(file).to.be.null;
        });
    });

    describe('#toArchive - backward compatibility', () => {
        it('should produce an archive loadable by Template.fromArchive', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template);

            // Load the compressed archive back
            const loaded = await Template.fromArchive(buffer);
            loaded.getIdentifier().should.equal(template.getIdentifier());
            loaded.getModelManager().getModels().length.should.equal(
                template.getModelManager().getModels().length
            );
        });

        it('should read pre-existing uncompressed .cta archives without error', async () => {
            const fs = require('fs');
            const JSZipCheck = require('jszip');
            const ctaBuffer = fs.readFileSync('./test/data/latedeliveryandpenalty.cta');
            // This .cta file uses STORE (no compression) — verify JSZip reads it fine
            const zip = await JSZipCheck.loadAsync(ctaBuffer);
            const files = Object.keys(zip.files);
            files.length.should.be.greaterThan(0);
            // Verify we can read content from the uncompressed archive
            const packageJsonFile = files.find(f => f.endsWith('package.json'));
            expect(packageJsonFile).to.not.be.undefined;
            const content = await zip.files[packageJsonFile].async('string');
            const pkg = JSON.parse(content);
            pkg.name.should.equal('latedeliveryandpenalty');
        });

        it('should preserve template content through compress roundtrip', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const originalTemplate = template.getTemplate();
            const originalSample = template.getMetadata().getSamples().default;

            const buffer = await TemplateSaver.toArchive(template);
            const loaded = await Template.fromArchive(buffer);

            loaded.getTemplate().should.equal(originalTemplate);
            loaded.getMetadata().getSamples().default.should.equal(originalSample);
        });
    });

    describe('#toArchive - template with logo', () => {
        it('should include logo.png as binary when present', async () => {
            const template = await Template.fromDirectory(
                './test/data/template-logo',
            );
            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);
            const file = zip.file('logo.png');
            expect(file).to.not.be.null;
        });
    });
});
