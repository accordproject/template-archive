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
import TemplateInstance from '../src/templateinstance';
import Template from '../src/template';
import Clause from '../src/clause';
import Contract from '../src/contract';

const options = { offline: true };

describe('TemplateInstance', () => {

    describe('#constructor', () => {

        it('should fail to instantiate', async function() {
            expect(() => new (TemplateInstance as any)(null)).toThrow('Abstract class "TemplateInstance" cannot be instantiated directly.');
        });

    });

    describe('#toArchive', () => {

        it('should write the instance data to instance.json beside the template files', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            const data = { ...template.getMetadata().getSampleData(), penaltyPercentage: 99.5 };
            clause.setData(data);

            const zip = await JSZip.loadAsync(await clause.toArchive());
            expect(JSON.parse(await zip.file('instance.json').async('string'))).toEqual(data);
            expect(zip.file('package.json')).not.toBeNull();
            expect(zip.file('text/grammar.tem.md')).not.toBeNull();
        });

        it('should fail to archive an instance without data', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            await expect(new Clause(template).toArchive()).rejects.toThrow('Cannot archive a template instance without data. Call setData first.');
        });

        it('should not write instance.json for a template archive', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const zip = await JSZip.loadAsync(await template.toArchive('es6'));
            expect(zip.file('instance.json')).toBeNull();
        });

    });

    describe('#fromArchive', () => {

        it('should round-trip a clause and its data', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.setData({ ...template.getMetadata().getSampleData(), penaltyPercentage: 99.5 });

            const loaded = await Clause.fromArchive(await clause.toArchive(), options);
            expect(loaded).toBeInstanceOf(Clause);
            expect(loaded.getData()).toEqual(clause.getData());
            expect(loaded.getDataAsConcertoObject()).not.toBeNull();
            expect(loaded.getIdentifier()).toBe(clause.getIdentifier());
        });

        it('should construct the subclass it is called on', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.setData(template.getMetadata().getSampleData());

            const loaded = await Contract.fromArchive(await clause.toArchive(), options);
            expect(loaded).toBeInstanceOf(Contract);
        });

        it('should load an instance archive as a template', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const clause = new Clause(template);
            clause.setData(template.getMetadata().getSampleData());

            const loaded = await Template.fromArchive(await clause.toArchive(), options);
            expect(loaded.getIdentifier()).toBe(template.getIdentifier());
        });

        it('should fail to load a template archive that has no instance.json', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            await expect(Clause.fromArchive(await template.toArchive('es6'), options))
                .rejects.toThrow('Failed to find instance.json in archive file. Use Template.fromArchive to load a template archive.');
        });

        it('should fail to load instance data that does not match the template model', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const zip = await JSZip.loadAsync(await template.toArchive('es6'));
            zip.file('instance.json', JSON.stringify({ $class: 'org.example.Wrong' }));
            const buffer = await zip.generateAsync({ type: 'nodebuffer' });
            await expect(Clause.fromArchive(buffer, options)).rejects.toThrow('Invalid data, must be a valid instance of the template model');
        });

    });

});