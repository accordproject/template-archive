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

const Template = require('../lib/template');
const TemplateLoader = require('../lib/templateloader');
const Contract = require('../lib/contract');

const chai = require('chai');
const fs = require('fs');
const path = require('path');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('Contract', () => {
    const sampleText = fs.readFileSync(path.resolve(__dirname, 'data/copyright-license', 'sample.md'), 'utf8');

    describe('#parse', () => {
        it('should be able to set the data from copyright-license natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', { skipUpdateExternalModels: true });
            const contract = new Contract(template);
            contract.parse(sampleText);
        });
    });

    describe('#generateText', () => {

        it('should be able to roundtrip copyright-license natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license');
            const contract = new Contract(template);
            contract.parse(sampleText);
            const nl = await contract.generateText();
            nl.should.equal(TemplateLoader.normalizeText(sampleText));
        });
    });
});