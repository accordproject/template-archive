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

        it('should compress archive entries with DEFLATE', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty',
            );
            const buffer = await TemplateSaver.toArchive(template, undefined, undefined);

            // Walk the local file headers and check the compression method of each file entry
            const methods: Record<string, number> = {};
            let offset = 0;
            while (buffer.readUInt32LE(offset) === 0x04034b50) {
                const method = buffer.readUInt16LE(offset + 8);
                const compressedSize = buffer.readUInt32LE(offset + 18);
                const nameLength = buffer.readUInt16LE(offset + 26);
                const extraLength = buffer.readUInt16LE(offset + 28);
                const name = buffer.toString('utf8', offset + 30, offset + 30 + nameLength);
                methods[name] = method;
                offset += 30 + nameLength + extraLength + compressedSize;
            }
            const fileNames = Object.keys(methods).filter(name => !name.endsWith('/'));
            expect(fileNames.length).toBeGreaterThan(0);
            fileNames.forEach(name => expect(methods[name]).toBe(8)); // 8 = DEFLATE

            // The same entries stored without compression should produce a larger archive
            const zip = await JSZip.loadAsync(buffer);
            const stored = new JSZip();
            for (const name of fileNames) {
                stored.file(name, await zip.file(name).async('uint8array'));
            }
            const storedBuffer = await stored.generateAsync({ type: 'uint8array', compression: 'STORE' });
            expect(buffer.length).toBeLessThan(storedBuffer.length);
        });

        it('should preserve logic files in archive when target language is omitted', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty-typescript',
            );
            expect(template.hasLogic()).toBe(true);
            const buffer = await TemplateSaver.toArchive(template, undefined, undefined);
            expect(buffer).not.toBeNull();

            const zip = await JSZip.loadAsync(buffer);
            const logicFile = zip.file('logic/logic.ts');
            expect(logicFile).not.toBeNull();
            const logicContent = await logicFile.async('string');
            expect(logicContent.length).toBeGreaterThan(0);

            const reloaded = await Template.fromArchive(buffer);
            expect(reloaded.hasLogic()).toBe(true);
            expect(reloaded.getScriptManager().getScript('logic/logic.ts')).not.toBeNull();
            expect(reloaded.getHash()).toBe(template.getHash());
        });

        it('should preserve nested logic file paths in archive', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty-typescript',
            );
            const sm = template.getScriptManager();
            const helperScript = sm.createScript('logic/helpers/util.ts', 'typescript', 'export function util() { return 42; }');
            sm.addScript(helperScript);

            const buffer = await TemplateSaver.toArchive(template, undefined, undefined);
            const zip = await JSZip.loadAsync(buffer);
            expect(zip.file('logic/helpers/util.ts')).not.toBeNull();
            expect(zip.file('logic/util.ts')).toBeNull();
        });

        it('should accept options as the second argument when language is omitted', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty-typescript',
            );
            const buffer = await TemplateSaver.toArchive(template, {});
            expect(buffer).not.toBeNull();
            const reloaded = await Template.fromArchive(buffer);
            expect(reloaded.hasLogic()).toBe(true);
        });

        it('should normalize Windows-style backslashes in script paths into forward slashes in archive', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty-typescript',
            );
            const sm = template.getScriptManager();
            const winScript = sm.createScript('logic\\helpers\\winutil.ts', 'typescript', 'export function winutil() { return 1; }');
            sm.addScript(winScript);

            const buffer = await TemplateSaver.toArchive(template);
            const zip = await JSZip.loadAsync(buffer);
            expect(zip.file('logic/helpers/winutil.ts')).not.toBeNull();
            expect(zip.file('logic/helpers\\winutil.ts')).toBeNull();

            const reloaded = await Template.fromArchive(buffer);
            expect(reloaded.getScriptManager().getScript('logic/helpers/winutil.ts')).not.toBeNull();
        });

        it('should throw when an unsupported target language is provided', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty-typescript',
            );
            await expect(TemplateSaver.toArchive(template, 'invalidLang')).rejects.toThrow('Unsupported language');
        });

        it('should preserve logic when target language is explicitly null', async () => {
            const template = await Template.fromDirectory(
                './test/data/latedeliveryandpenalty-typescript',
            );
            const buffer = await TemplateSaver.toArchive(template, null);
            expect(buffer).not.toBeNull();
            const reloaded = await Template.fromArchive(buffer);
            expect(reloaded.hasLogic()).toBe(true);
            expect(reloaded.getScriptManager().getScript('logic/logic.ts')).not.toBeNull();
        });
    });
});

