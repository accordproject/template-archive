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
const nearley = require('nearley');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('Template', () => {

    describe('#fromDirectory', () => {

        it('should create a template from a directory', () => {
            return Template.fromDirectory('./test/data/latedeliveryandpenalty').should.be.fulfilled;
        });

        it('should roundtrip a template', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            template.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1');
            template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template.getGrammar().should.not.be.null;
            template.getScriptManager().getScripts().length.should.equal(1);
            template.getMetadata().getREADME().should.not.be.null;
            template.getName().should.equal('latedeliveryandpenalty');
            template.getDescription().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            template.getVersion().should.equal('0.0.1');
            const buffer = await template.toArchive();
            buffer.should.not.be.null;
            const template2 = await Template.fromArchive(buffer);
            template2.getIdentifier().should.equal(template.getIdentifier());
            template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template2.getGrammar().should.not.be.null;
            template2.getScriptManager().getScripts().length.should.equal(template.getScriptManager().getScripts().length);
            template2.getMetadata().getREADME().should.equal(template.getMetadata().getREADME());
            const buffer2 = await template2.toArchive();
            buffer2.should.not.be.null;
        });

        it('should throw an error if multiple template models are found', async () => {
            return Template.fromDirectory('./test/data/multiple-concepts').should.be.rejectedWith('Found multiple concepts decorated with @AccordTemplateModel');
        });

        it('should throw an error if no template models are found', async () => {
            return Template.fromDirectory('./test/data/no-concepts').should.be.rejectedWith('Failed to find the template model. Decorate a concept with @AccordTemplateModel("conga").');
        });

        it('should throw an error if a package.json file does not exist', async () => {
            return (() => Template.fromDirectory('./test/data/no-packagejson')).should.throw('Failed to find package.json');
        });

    });

    describe('#getParser', () => {

        it('should throw an error if called before calling setGrammar or buildGrammar', async () => {
            const template = new Template({
                'name': 'conga',
                'version': '0.0.1',
                'description': '"Dan Selman" agrees to spend 100.0 conga coins on "swag"'
            });
            return (() => template.getParser()).should.throw('Must call setGrammar or buildGrammar before calling getParser');
        });

        it('should return a parser object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            return template.getParser().should.be.an.instanceof(nearley.Parser);
        });
    });
});