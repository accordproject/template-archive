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

const chai = require('chai');
const path = require('path');
const tmp = require('tmp-promise');
const fs = require('fs');

const Template = require('@accordproject/cicero-core').Template;

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/commands');

describe('cicero-cli', () => {
    const template = path.resolve(__dirname, 'data/latedeliveryandpenalty/');
    const sample = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'sample.txt');
    const request = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'request.json');
    const state = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'state.json');
    const contract = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'contract.json');
    const parseReponse = {
        '$class':'org.accordproject.latedeliveryandpenalty.TemplateModel',
        'forceMajeure':true,
        'penaltyDuration':{
            '$class':'org.accordproject.time.Duration',
            'amount':9,
            'unit':'days'
        },
        'penaltyPercentage':7,
        'capPercentage':2,
        'termination':{
            '$class':'org.accordproject.time.Duration',
            'amount':2,
            'unit':'weeks'
        },
        'fractionalPart':'days'
    };

    describe('#parse', () => {
        it('should parse a clause using a template', async () => {
            const result = await Commands.parse(template, sample, null);
            delete result.clauseId;
            result.should.eql(parseReponse);
        });
    });

    describe('#parsesave', async () => {
        it('should parse a clause using a template and save to a JSON file', async () => {
            const result = await Commands.parse(template, sample, contract);
            delete result.clauseId;
            result.should.eql(parseReponse);
        });
    });

    describe('#archive', async () => {
        it('should create a valid ergo archive', async () => {
            const archiveName = 'test.cta';
            const result = await Commands.archive('ergo', template, archiveName);
            result.should.eql(true);
            const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
            newTemplate.should.not.be.null;
            newTemplate.isTextOnly().should.equal(false);
            fs.unlinkSync(archiveName);
        });

        it('should create a valid javascript archive', async () => {
            const archiveName = 'test.cta';
            const result = await Commands.archive('javascript', template, archiveName);
            result.should.eql(true);
            const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
            newTemplate.should.not.be.null;
            newTemplate.isTextOnly().should.equal(false);
            fs.unlinkSync(archiveName);
        });

        it('should create a valid text-only archive', async () => {
            const archiveName = 'test.cta';
            const result = await Commands.archive('text', template, archiveName);
            result.should.eql(true);
            const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
            newTemplate.should.not.be.null;
            newTemplate.isTextOnly().should.equal(true);
            fs.unlinkSync(archiveName);
        });

    });

    describe('#validateParseArgs', () => {
        it('no args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('all args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: './',
                sample: 'sample.txt'
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('all args specified, parent folder', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: 'latedeliveryandpenalty',
                sample: 'latedeliveryandpenalty/sample.txt'
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('all args specified, parent folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: 'latedeliveryandpenalty',
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('all args specified, child folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/grammar'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: '../',
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('no flags specified', () => {
            const args  = Commands.validateParseArgs({
                _: ['parse', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('verbose flag specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            Commands.validateParseArgs({
                _: ['parse'],
                verbose: true
            });
        });
        it('bad package.json', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            (() => Commands.validateParseArgs({
                _: ['parse'],
            })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
        });
        it('bad sample.txt', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            (() => Commands.validateParseArgs({
                _: ['parse'],
                sample: 'sample_en.txt'
            })).should.throw('A sample text file is required. Try the --sample flag or create a sample.txt in the root folder of your template.');
        });
    });

    describe('#execute', () => {
        it('should execute a clause using a template', async () => {
            const response = await Commands.execute(template, sample, [request], state);
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(4);
            response.response.buyerMayTerminate.should.be.equal(true);
        });
    });

    describe('#executeergo', () => {
        it('should execute a clause in ergo using a template', async () => {
            const response = await Commands.execute(template, sample, [request], state);
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(4);
            response.response.buyerMayTerminate.should.be.equal(true);
        });
    });

    describe('#validateExecuteArgs', () => {
        it('no args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('all args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
                template: './',
                sample: 'sample.txt'
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('all args specified, parent folder', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
                template: 'latedeliveryandpenalty',
                sample: 'latedeliveryandpenalty/sample.txt'
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('all args specified, parent folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
                template: 'latedeliveryandpenalty',
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('all args specified, child folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/grammar'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
                template: '../',
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('no flags specified', () => {
            const args  = Commands.validateExecuteArgs({
                _: ['execute', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.sample.should.match(/sample.txt$/);
        });
        it('verbose flag specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            Commands.validateExecuteArgs({
                _: ['execute'],
                verbose: true
            });
        });
        it('bad package.json', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            (() => Commands.validateExecuteArgs({
                _: ['execute'],
            })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
        });
        it('bad sample.txt', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            (() => Commands.validateExecuteArgs({
                _: ['execute'],
                sample: 'sample_en.txt'
            })).should.throw('A sample text file is required. Try the --sample flag or create a sample.txt in the root folder of your template.');
        });
        it('bad requestjson', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            (() => Commands.validateExecuteArgs({
                _: ['execute'],
                request: ['request1.json']
            })).should.throw('A request file is required. Try the --request flag or create a request.json in the root folder of your template.');
        });
    });

    describe('#generate', () => {

        it('should generate a Go model', async () => {
            const dir = await tmp.dir({ unsafeCleanup: true});
            await Commands.generate('Go', template, dir.path, true);
            fs.readdirSync(dir.path).length.should.be.above(0);
            dir.cleanup();
        });
        it('should generate a PlantUML model', async () => {
            const dir = await tmp.dir({ unsafeCleanup: true});
            await Commands.generate('PlantUML', template, dir.path, true);
            fs.readdirSync(dir.path).length.should.be.above(0);
            dir.cleanup();
        });
        it('should generate a Typescript model', async () => {
            const dir = await tmp.dir({ unsafeCleanup: true});
            await Commands.generate('Typescript', template, dir.path, true);
            fs.readdirSync(dir.path).length.should.be.above(0);
            dir.cleanup();
        });
        it('should generate a Java model', async () => {
            const dir = await tmp.dir({ unsafeCleanup: true});
            await Commands.generate('Java', template, dir.path, true);
            fs.readdirSync(dir.path).length.should.be.above(0);
            dir.cleanup();
        });
        it('should generate a JSONSchema model', async () => {
            const dir = await tmp.dir({ unsafeCleanup: true});
            await Commands.generate('JSONSchema', template, dir.path, true);
            fs.readdirSync(dir.path).length.should.be.above(0);
            dir.cleanup();
        });
        it('should not generate an unknown model', async () => {
            const dir = await tmp.dir({ unsafeCleanup: true});
            await Commands.generate('BLAH', template, dir.path, true);
            fs.readdirSync(dir.path).length.should.be.equal(0);
            dir.cleanup();
        });
    });


    describe('#archive', () => {
        it('should generate an Ergo archive', async () => {
            const tmpFile = await tmp.file();
            const tmpArchive = tmpFile.path + '.cta';
            await Commands.archive('ergo', template, tmpArchive);
            fs.readFileSync(tmpArchive).length.should.be.above(0);
            tmpFile.cleanup();
        });
        it('should generate a JavaScript archive', async () => {
            const tmpFile = await tmp.file();
            const tmpArchive = tmpFile.path + '.cta';
            await Commands.archive('javascript', template, tmpArchive);
            fs.readFileSync(tmpArchive).length.should.be.above(0);
            tmpFile.cleanup();
        });
        it('should not an unknown archive', async () => {
            const tmpFile = await tmp.file();
            const tmpArchive = tmpFile.path + '.cta';
            return Commands.archive('foo', template, tmpArchive)
                .should.be.rejectedWith('language should be either \'ergo\' or \'javascript\' but is \'foo\'');
        });
        it('no args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateArchiveArgs({
                _: ['archive'],
            });
            args.template.should.match(/cicero-cli\/test\/data\/latedeliveryandpenalty$/);
            args.language.should.match(/ergo/);
        });
        it('verbose flag specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            Commands.validateArchiveArgs({
                _: ['archive'],
                verbose: true
            });
        });
        it('bad package.json', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            (() => Commands.validateArchiveArgs({
                _: ['execute'],
            })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
        });
    });
});
