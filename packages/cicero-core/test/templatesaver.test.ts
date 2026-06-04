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

import JSZip from 'jszip';
import TemplateSaver from '../src/templatesaver';
import Template from '../src/template';

describe('TemplateSaver', () => {
    describe('#toArchive', () => {
        it('should save a template with a signature', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            template.authorSignature = {
                templateSignature: {
                    templateHash: 'hash',
                    timestamp: Date.now(),
                    signatoryCert: 'cert',
                    signature: 'sig',
                },
            };
            const buffer = await TemplateSaver.toArchive(template, undefined, undefined);
            expect(buffer).not.toBeNull();

            // Verify the signature.json exists in the archive
            const zip = await JSZip.loadAsync(buffer);
            const sigFile = zip.file('signature.json');
            expect(sigFile).not.toBeNull();

            const sigString = await sigFile.async('string');
            const sig = JSON.parse(sigString);
            expect(sig.templateSignature.signature).toBe('sig');
        });

        it('should save a template with multiple locales', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            template.getMetadata().getSamples().fr = 'Bonjour';
            const buffer = await TemplateSaver.toArchive(template, undefined, undefined);
            expect(buffer).not.toBeNull();

            // Verify the French sample text exists in the archive
            const zip = await JSZip.loadAsync(buffer);
            const sampleFile = zip.file('text/sample_fr.md');
            expect(sampleFile).not.toBeNull();

            const content = await sampleFile.async('string');
            expect(content).toBe('Bonjour');
        });
    });
});
