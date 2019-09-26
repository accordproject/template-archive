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
const should = require('chai').should();

const Template = require('@accordproject/cicero-core').Template;

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/commands');

describe('cicero-cli', () => {
    const template = path.resolve(__dirname, 'data/latedeliveryandpenalty/');
    const templateJs = path.resolve(__dirname, 'data/latedeliveryandpenalty_js/');
    const templateArchive = path.resolve(__dirname, 'data/latedeliveryandpenalty.cta');
    const sample = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'sample.md');
    const data = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data.json');
    const request = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'request.json');
    const state = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'state.json');
    const dataOut = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data_out.json');
    const sampleOut = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'sample_out.md');
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
    const generateTextResponse = 'Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.';

    const sampleErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'sample_err.md');
    const dataErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data_err.json');
    const stateErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'state_err.json');
    const requestErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'request_err.json');

    describe('#parse', () => {
        it('should parse a clause using a template', async () => {
            const result = await Commands.parse(template, sample, null);
            delete result.clauseId;
            result.should.eql(parseReponse);
        });

        it('should parse a clause using a template archive', async () => {
            const result = await Commands.parse(templateArchive, sample, null);
            delete result.clauseId;
            result.should.eql(parseReponse);
        });

        it('should fail parsing a clause using a template', async () => {
            const result = await Commands.parse(template, sampleErr, null);
            should.equal(result,undefined);
        });
    });

    describe('#parsesave', async () => {
        it('should parse a clause using a template and save to a JSON file', async () => {
            const result = await Commands.parse(template, sample, dataOut);
            delete result.clauseId;
            result.should.eql(parseReponse);
        });
    });

    describe('#generateText', () => {
        it('should generate the text for a clause using a template', async () => {
            const result = await Commands.generateText(template, data, null);
            delete result.clauseId;
            result.should.eql(generateTextResponse);
        });

        it('should generate the text for a clause using a template archive', async () => {
            const result = await Commands.generateText(templateArchive, data, null);
            delete result.clauseId;
            result.should.eql(generateTextResponse);
        });

        it('should fail generating the text for a clause using a template', async () => {
            const result = await Commands.generateText(template, dataErr, null);
            should.equal(result,undefined);
        });
    });

    describe('#generateTextsave', async () => {
        it('should generate the text for a clause using a template and save to a JSON file', async () => {
            const result = await Commands.generateText(template, data, sampleOut);
            delete result.clauseId;
            result.should.eql(generateTextResponse);
        });
    });

    describe('#archive', async () => {
        it('should create a valid ergo archive', async () => {
            const archiveName = 'test.cta';
            const result = await Commands.archive('ergo', template, archiveName);
            result.should.eql(true);
            const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
            newTemplate.should.not.be.null;
            newTemplate.hasLogic().should.equal(true);
            fs.unlinkSync(archiveName);
        });

        it('should create a valid ergo archive with a default name', async () => {
            const archiveName = 'latedeliveryandpenalty@0.0.1.cta';
            const result = await Commands.archive('ergo', template, null);
            result.should.eql(true);
            const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
            newTemplate.should.not.be.null;
            newTemplate.hasLogic().should.equal(true);
            fs.unlinkSync(archiveName);
        });

    });

    describe('#validateParseArgs', () => {
        it('no args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: './',
                sample: 'sample.md'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, parent folder', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: 'latedeliveryandpenalty',
                sample: 'latedeliveryandpenalty/sample.md'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, archive', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: 'latedeliveryandpenalty.cta',
                sample: 'latedeliveryandpenalty/sample.md'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty.cta$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, parent folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: 'latedeliveryandpenalty',
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, child folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/grammar'));
            const args  = Commands.validateParseArgs({
                _: ['parse'],
                template: '../',
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('no flags specified', () => {
            const args  = Commands.validateParseArgs({
                _: ['parse', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
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
        it('bad sample.md', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            (() => Commands.validateParseArgs({
                _: ['parse'],
                sample: 'sample_en.md'
            })).should.throw('A sample.md file is required. Try the --sample flag or create a sample.md in the root folder of your template.');
        });
    });

    describe('#validateGenerateTextArgs', () => {
        it('no args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateGenerateTextArgs({
                _: ['generateText'],
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.data.should.match(/data.json$/);
        });
        it('all args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateGenerateTextArgs({
                _: ['generateText'],
                template: './',
                data: 'data.json'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.data.should.match(/data.json$/);
        });
        it('all args specified, parent folder', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateGenerateTextArgs({
                _: ['generateText'],
                template: 'latedeliveryandpenalty',
                data: 'latedeliveryandpenalty/data.json'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.data.should.match(/data.json$/);
        });
        it('all args specified, archive', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateGenerateTextArgs({
                _: ['generateText'],
                template: 'latedeliveryandpenalty.cta',
                data: 'latedeliveryandpenalty/data.json'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty.cta$/);
            args.data.should.match(/data.json$/);
        });
        it('all args specified, parent folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateGenerateTextArgs({
                _: ['generateText'],
                template: 'latedeliveryandpenalty',
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.data.should.match(/data.json$/);
        });
        it('all args specified, child folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/grammar'));
            const args  = Commands.validateGenerateTextArgs({
                _: ['generateText'],
                template: '../',
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.data.should.match(/data.json$/);
        });
        it('no flags specified', () => {
            const args  = Commands.validateGenerateTextArgs({
                _: ['generateText', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.data.should.match(/data.json$/);
        });
        it('verbose flag specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            Commands.validateGenerateTextArgs({
                _: ['generateText'],
                verbose: true
            });
        });
        it('bad package.json', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            (() => Commands.validateGenerateTextArgs({
                _: ['generateText'],
            })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
        });
        it('bad data.json', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            (() => Commands.validateGenerateTextArgs({
                _: ['generateText'],
                data: 'data_en.json'
            })).should.throw('A data.json file is required. Try the --data flag or create a data.json in the root folder of your template.');
        });
    });

    describe('#init', () => {
        it('should initialize a clause using a template', async () => {
            const response = await Commands.init(template, sample);
            response.state.$class.should.be.equal('org.accordproject.cicero.contract.AccordContractState');
            response.state.stateId.should.be.equal('org.accordproject.cicero.contract.AccordContractState#1');
        });

        it('should initialize a clause using a template archive', async () => {
            const response = await Commands.init(templateArchive, sample);
            response.state.$class.should.be.equal('org.accordproject.cicero.contract.AccordContractState');
            response.state.stateId.should.be.equal('org.accordproject.cicero.contract.AccordContractState#1');
        });

        it('should fail to initialize on a bogus sample', async () => {
            const response = await Commands.init(template, sampleErr);
            should.equal(response,undefined);
        });
    });

    describe('#execute', () => {
        it('should execute a clause using a template', async () => {
            const response = await Commands.execute(template, sample, [request], state);
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(4);
            response.response.buyerMayTerminate.should.be.equal(true);
        });

        it('should execute a clause using a template archive', async () => {
            const response = await Commands.execute(templateArchive, sample, [request], state);
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(4);
            response.response.buyerMayTerminate.should.be.equal(true);
        });

        it('should execute with default state when state is not found', async () => {
            const response = await Commands.execute(template, sample, [request], stateErr);
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(4);
            response.response.buyerMayTerminate.should.be.equal(true);
        });

        it('should execute with more than one request', async () => {
            const response = await Commands.execute(template, sample, [request,request], state);
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(4);
            response.response.buyerMayTerminate.should.be.equal(true);
        });

        it('should fail execute on a bogus request', async () => {
            const response = await Commands.execute(template, sample, [requestErr], state);
            should.equal(response,undefined);
        });

        it('should execute a clause using a template (with currentTime set)', async () => {
            const response = await Commands.execute(template, sample, [request], state, '2017-12-19T17:38:01Z');
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(3.1111111111111107);
            response.response.buyerMayTerminate.should.be.equal(false);
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

    describe('#executejavascript', () => {
        it('should execute a clause in ergo using a template', async () => {
            const response = await Commands.execute(templateJs, sample, [request], state);
            response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
            response.response.penalty.should.be.equal(4);
            response.response.buyerMayTerminate.should.be.equal(true);
        });
    });

    describe('#validateInitArgs', () => {
        it('no args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateInitArgs({
                _: ['init'],
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateInitArgs({
                _: ['init'],
                template: './',
                sample: 'sample.md'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, parent folder', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateInitArgs({
                _: ['initt'],
                template: 'latedeliveryandpenalty',
                sample: 'latedeliveryandpenalty/sample.md'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, parent folder, no sample, no state', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateInitArgs({
                _: ['init'],
                template: 'latedeliveryandpenalty',
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, child folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/grammar'));
            const args  = Commands.validateInitArgs({
                _: ['init'],
                template: '../',
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('no flags specified', () => {
            const args  = Commands.validateInitArgs({
                _: ['init', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('verbose flag specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            Commands.validateInitArgs({
                _: ['init'],
                verbose: true
            });
        });
        it('bad package.json', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            (() => Commands.validateInitArgs({
                _: ['init'],
            })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
        });
        it('bad sample.md', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            (() => Commands.validateInitArgs({
                _: ['init'],
                sample: 'sample_en.md'
            })).should.throw('A sample.md file is required. Try the --sample flag or create a sample.md in the root folder of your template.');
        });
    });

    describe('#validateExecuteArgs', () => {
        it('no args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
                template: './',
                sample: 'sample.md',
                state: 'state.json'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, parent folder', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
                template: 'latedeliveryandpenalty',
                sample: 'latedeliveryandpenalty/sample.md',
                state: 'latedeliveryandpenalty/state.json'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, parent folder, no sample, no state', () => {
            process.chdir(path.resolve(__dirname, 'data/'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
                template: 'latedeliveryandpenalty',
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('all args specified, child folder, no sample', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/grammar'));
            const args  = Commands.validateExecuteArgs({
                _: ['execute'],
                template: '../',
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
        });
        it('no flags specified', () => {
            const args  = Commands.validateExecuteArgs({
                _: ['execute', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.sample.should.match(/sample.md$/);
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
        it('bad sample.md', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            (() => Commands.validateExecuteArgs({
                _: ['execute'],
                sample: 'sample_en.md'
            })).should.throw('A sample.md file is required. Try the --sample flag or create a sample.md in the root folder of your template.');
        });
        it('bad requestjson', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            (() => Commands.validateExecuteArgs({
                _: ['execute'],
                request: ['request1.json']
            })).should.throw('A request.json file is required. Try the --request flag or create a request.json in the root folder of your template.');
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
        it('should generate a Corda model', async () => {
            const dir = await tmp.dir({ unsafeCleanup: true});
            await Commands.generate('Corda', template, dir.path, true);
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
            await Commands.archive('ergo', template, tmpArchive, false);
            fs.readFileSync(tmpArchive).length.should.be.above(0);
            tmpFile.cleanup();
        });
        it('should generate a JavaScript archive', async () => {
            const tmpFile = await tmp.file();
            const tmpArchive = tmpFile.path + '.cta';
            await Commands.archive('cicero', template, tmpArchive, false);
            fs.readFileSync(tmpArchive).length.should.be.above(0);
            tmpFile.cleanup();
        });
        it('should not an unknown archive', async () => {
            const tmpFile = await tmp.file();
            const tmpArchive = tmpFile.path + '.cta';
            return Commands.archive('foo', template, tmpArchive, false)
                .should.be.rejectedWith('Unknown target: foo (available: es5,es6,cicero,java)');
        });
        it('no args specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateArchiveArgs({
                _: ['archive']
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.target.should.match(/ergo/);
        });
        it('only target arg specified', () => {
            process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
            const args  = Commands.validateArchiveArgs({
                _: ['archive'],
                target: 'ergo'
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.target.should.match(/ergo/);
        });
        it('template arg specified', () => {
            process.chdir(path.resolve(__dirname));
            const args  = Commands.validateArchiveArgs({
                _: ['archive', 'data/latedeliveryandpenalty/']
            });
            args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
            args.target.should.match(/ergo/);
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
                _: ['execute']
            })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
        });
    });
});
