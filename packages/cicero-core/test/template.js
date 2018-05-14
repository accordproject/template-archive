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
const fs = require('fs');
const archiver = require('archiver');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

/* eslint-disable */
function waitForEvent(emitter, eventType) {
    return new Promise((resolve) => {
        emitter.once(eventType, resolve);
    });
}

async function writeZip(template, ){
    try {
        fs.mkdirSync('./test/data/archives');
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
    let output = fs.createWriteStream(`./test/data/archives/${template}.zip`);
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(output);
    archive.directory(`test/data/${template}/`, false);
    archive.finalize();

    return await waitForEvent(output, 'close');
}
/* eslint-enable */

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
            template.getMetadata().getSample().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            const buffer = await template.toArchive();
            buffer.should.not.be.null;
            const template2 = await Template.fromArchive(buffer);
            template2.getIdentifier().should.equal(template.getIdentifier());
            template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template2.getGrammar().should.not.be.null;
            template2.getScriptManager().getScripts().length.should.equal(template.getScriptManager().getScripts().length);
            template2.getMetadata().getREADME().should.equal(template.getMetadata().getREADME());
            template2.getMetadata().getSamples().should.eql(template.getMetadata().getSamples());
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

        it('should create a template from a directory with a locale sample', () => {
            return Template.fromDirectory('./test/data/locales-conga').should.be.fulfilled;
        });

        it('should throw an error if a sample.txt file does not exist', async () => {
            return (() => Template.fromDirectory('./test/data/no-sample')).should.throw('Failed to find any sample files. e.g. sample.txt, sample_fr.txt');
        });

        it('should throw an error if the locale is not in the IETF format', async () => {
            return (() => Template.fromDirectory('./test/data/bad-locale')).should.throw('Invalid locale used in sample file, sample_!.txt. Locales should be IETF language tags, e.g. sample_fr.txt');
        });

        // Test case for issue #23
        it('should create template from a directory that has node_modules with duplicate namespace', () => {
            return Template.fromDirectory('./test/data/with-node_modules').should.be.fulfilled;
        });

        it('should throw an error for property that is not declared', () => {
            return Template.fromDirectory('./test/data/bad-property').should.be.rejectedWith('Template references a property \'currency\' that is not declared in the template model');
        });

        it('should throw an error for clause property that is not declared', () => {
            return Template.fromDirectory('./test/data/bad-copyright-license').should.be.rejectedWith('Template references a property \'badPaymentClause\' that is not declared in the template model');
        });

    });

    describe('#fromArchive', () => {

        it('should create a template from an archive', async () => {
            await writeZip('latedeliveryandpenalty');
            const buffer = fs.readFileSync('./test/data/archives/latedeliveryandpenalty.zip');
            return Template.fromArchive(buffer).should.be.fulfilled;
        });

        it('should throw an error if multiple template models are found', async () => {
            await writeZip('multiple-concepts');
            const buffer = fs.readFileSync('./test/data/archives/multiple-concepts.zip');
            return Template.fromArchive(buffer).should.be.rejectedWith('Found multiple concepts decorated with @AccordTemplateModel');
        });

        it('should throw an error if a package.json file does not exist', async () => {
            await writeZip('no-packagejson');
            const buffer = fs.readFileSync('./test/data/archives/no-packagejson.zip');
            return Template.fromArchive(buffer).should.be.rejectedWith('Failed to find package.json');
        });
    });

    describe('#getParser', () => {

        it('should throw an error if called before calling setGrammar or buildGrammar', async () => {
            const template = new Template({
                'name': 'conga',
                'version': '0.0.1',
                'description': '"Dan Selman" agrees to spend 100.0 conga coins on "swag"',
                'cicero': {
                    'template': 'clause',
                    'version': '^0.3.0-0'
                }
            },
            null,
            {
                'default':'"Dan Selman" agrees to spend 100.0 conga coins on "swag"',
            });
            return (() => template.getParser()).should.throw('Must call setGrammar or buildGrammar before calling getParser');
        });

        it('should return a parser object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            return template.getParser().should.be.an.instanceof(nearley.Parser);
        });
    });

    describe('#setSamples', () => {

        it('should not throw for valid samples object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            return (() => template.setSamples({ default: 'sample text' })).should.not.throw();
        });

        it('should throw for null samples object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            return (() => template.setSamples(null)).should.throw('sample.txt is required');
        });
    });

    describe('#setSample', () => {

        it('should not throw for valid sample object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            return (() => template.setSample('sample text','default')).should.not.throw();
        });
    });

    describe('#setReadme', () => {

        it('should not throw for valid readme text', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            return (() => template.setReadme('readme text')).should.not.throw();
        });
    });

    describe('#getRequestTypes', () => {

        it('should return request types for single accordclauselogic function', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            const types = template.getRequestTypes();
            types.should.be.eql([
                'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest',
            ]);
        });

        it('should throw error when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic');
            return (() => template.getRequestTypes()).should.throw('Did not find any function declarations with the @AccordClauseLogic annotation');
        });
    });

    describe('#getResponseTypes', () => {

        it('should return response type for single accordclauselogic function', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            const types = template.getResponseTypes();
            types.should.be.eql([
                'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse',
            ]);
        });

        it('should throw error when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic');
            return (() => template.getResponseTypes()).should.throw('Did not find any function declarations with the @AccordClauseLogic annotation');
        });
    });

    describe('#getFactory', () => {
        it('should return a Factory', async () => {
            const Factory = require('composer-common').Factory;
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            template.getFactory().should.be.an.instanceof(Factory);
        });
    });

    describe('#getSerializer', () => {
        it('should return a Serializer', async () => {
            const Serializer = require('composer-common').Serializer;
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            template.getSerializer().should.be.an.instanceof(Serializer);
        });
    });

    describe('#setPackageJson', () => {
        it('should set the package json of the metadata', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.name = 'new_name';
            template.setPackageJson(packageJson);
            template.getMetadata().getPackageJson().name.should.be.equal('new_name');
        });
    });

    describe('#accept', () => {

        it('should accept a visitor', async () => {
            const visitor = {
                visit: function(thing, parameters){}
            };
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            return (() => template.accept(visitor,{})).should.not.throw();
        });
    });
});