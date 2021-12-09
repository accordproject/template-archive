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

const expect = chai.expect;
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/commands');
const { ContractInstance } = require('@accordproject/cicero-core');

const template = path.resolve(__dirname, 'data/latedeliveryandpenalty/');
const templateJs = path.resolve(__dirname, 'data/latedeliveryandpenalty_js/');
const templateArchive = path.resolve(__dirname, 'data/latedeliveryandpenalty.cta');
const sample = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'text/sample.md');
const data = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data.json');
const request = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'request.json');
const params = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'params.json');
const state = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'state.json');
const dataOut = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data_out.json');
const sampleOut = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'text/sample_out.md');
const sampleOutJson = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'sample_out.json');
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
const draftResponse = 'Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.';

const sampleErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'text/sample_err.md');
const dataErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'data_err.json');
const stateErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'state_err.json');
const requestErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'request_err.json');
const paramsErr = path.resolve(__dirname, 'data/latedeliveryandpenalty/', 'params_err.json');

const slcArchive = path.resolve(__dirname, 'data/installment-sale@0.1.0-9d19db02620e3a51a4b44b22526f02a614ec19165f5d4aedad44f60489836f80.slc');
const slcRequest = path.resolve(__dirname, 'data/installment-sale-ergo/', 'request.json');
const slcParams = path.resolve(__dirname, 'data/installment-sale-ergo/', 'params.json');
const slcState = path.resolve(__dirname, 'data/installment-sale-ergo/', 'state.json');

describe('#validateParseArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: './',
            sample: 'text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: 'latedeliveryandpenalty',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, archive', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: 'latedeliveryandpenalty.cta',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty.cta$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        const args  = Commands.validateParseArgs({
            _: ['parse'],
            template: '../',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('no flags specified', () => {
        const args  = Commands.validateParseArgs({
            _: ['parse', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
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
            sample: 'text/sample_en.md'
        })).should.throw('A text/sample.md file is required. Try the --sample flag or create a text/sample.md in your template.');
    });
});

describe('#parse', () => {
    it('should parse a clause using a template', async () => {
        const result = await Commands.parse(template, sample, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(parseReponse);
    });

    it('should parse a clause using a template archive', async () => {
        const result = await Commands.parse(templateArchive, sample, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(parseReponse);
    });

    it('should fail parsing a clause using a template', async () => {
        const result = await Commands.parse(template, sampleErr, null);
        should.equal(result, undefined);
    });
});

describe('#parse-output', async () => {
    it('should parse a clause using a template and save to a JSON file', async () => {
        const result = await Commands.parse(template, sample, dataOut);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(parseReponse);
    });
});

describe('#validateDraftArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: './',
            data: 'data.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: 'latedeliveryandpenalty',
            data: 'latedeliveryandpenalty/data.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified, archive', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: 'latedeliveryandpenalty.cta',
            data: 'latedeliveryandpenalty/data.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty.cta$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified, parent folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            template: '../',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('no flags specified', () => {
        const args  = Commands.validateDraftArgs({
            _: ['draft', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateDraftArgs({
            _: ['draft'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateDraftArgs({
            _: ['draft'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad data.json', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateDraftArgs({
            _: ['draft'],
            data: 'data_en.json'
        })).should.throw('A data.json file is required. Try the --data flag or create a data.json in your template.');
    });
});

describe('#draft', () => {
    it('should create the text for a clause using a template', async () => {
        const result = await Commands.draft(template, data, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should create the text for a clause using a template archive', async () => {
        const result = await Commands.draft(templateArchive, data, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should fail drafting the text for a clause using a template', async () => {
        const result = await Commands.draft(template, dataErr, null);
        should.equal(result, undefined);
    });
});

describe('#draft-output', async () => {
    it('should create the text for a clause using a template and save to a file', async () => {
        const result = await Commands.draft(template, data, sampleOut);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should create the slate for a clause using a template and save to a JSON file', async () => {
        const result = await Commands.draft(template, data, sampleOutJson, null, null, { format: 'slate' });
        delete result.clauseId;
        delete result.$identifier;
        result.should.not.be.null;
    });

    it('should create the slate for a ciceromark_parsed using a template and save to a JSON file', async () => {
        const result = await Commands.draft(template, data, sampleOutJson, null, null, { format: 'ciceromark_parsed' });
        delete result.clauseId;
        delete result.$identifier;
        result.should.not.be.null;
    });
});

describe('#validateNormalizeArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: './',
            sample: 'text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: 'latedeliveryandpenalty',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, archive', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: 'latedeliveryandpenalty.cta',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty.cta$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            template: '../',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('no flags specified', () => {
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateNormalizeArgs({
            _: ['normalize'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateNormalizeArgs({
            _: ['normalize'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateNormalizeArgs({
            _: ['normalize'],
            sample: 'text/sample_en.md'
        })).should.throw('A text/sample.md file is required. Try the --sample flag or create a text/sample.md in your template.');
    });
    it('output specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            output: sampleOut,
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]text[/\\]sample_out.md$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('overwrite specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateNormalizeArgs({
            _: ['normalize'],
            overwrite: true,
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]text[/\\]sample.md$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('both output and overwrite specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateNormalizeArgs({
            _: ['normalize'],
            output: sampleOut,
            overwrite: true,
        })).should.throw('Cannot use both --overwrite and --output');
    });
});

describe('#normalize', () => {
    it('should normalize a clause using a template', async () => {
        const result = await Commands.normalize(template, sample, false, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should normalize a clause using a template archive', async () => {
        const result = await Commands.normalize(templateArchive, sample, false, null);
        delete result.clauseId;
        delete result.$identifier;
        result.should.eql(draftResponse);
    });

    it('should fail normalizing a clause using a template', async () => {
        const result = await Commands.normalize(template, sampleErr, false, null);
        should.equal(result, undefined);
    });
});

describe('#normalize-output', async () => {
    it('should parse a clause using a template and save to a JSON file', async () => {
        const result = await Commands.normalize(template, sample, false, dataOut);
        result.should.eql(draftResponse);
    });
});

describe('#validateTriggerArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('neither template nor contract specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified except data', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
            template: './',
            sample: 'text/sample.md',
            state: 'state.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
    });
    it('all args specified except sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
            template: './',
            data: 'data.json',
            state: 'state.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
        args.state.should.match(/state.json$/);
    });
    it('all args specified except data, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
            template: 'latedeliveryandpenalty',
            sample: 'latedeliveryandpenalty/text/sample.md',
            state: 'latedeliveryandpenalty/state.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/latedeliveryandpenalty[/\\]text[/\\]sample.md$/);
        args.state.should.match(/latedeliveryandpenalty[/\\]state.json$/);
    });
    it('party not defined', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        (() => Commands.validateTriggerArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            sample: 'latedeliveryandpenalty/text/sample.md',
            state: 'latedeliveryandpenalty/state.json',
            data: 'latedeliveryandpenalty/data.json',
            _: ['trigger']
        })).should.throw('No party name name provided. Try the --party flag to provide a party to be triggred.');
    });
    it('all args specified, parent folder, no sample, no data, no state', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            template: 'latedeliveryandpenalty',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('all args specified, child folder, no sample, no data, no state', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            template: '../',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('no flags specified', () => {
        (() => Commands.validateTriggerArgs({
            _: ['trigger', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateTriggerArgs({
            _: ['trigger'],
            verbose: true
        });
    });
    it('verbose flag specified with sample option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateTriggerArgs({
            _: ['trigger'],
            template: './',
            sample: 'text/sample.md',
            state: 'state.json',
            verbose: true
        });
    });
    it('verbose flag specified with data option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateTriggerArgs({
            _: ['trigger'],
            template: './',
            data: 'data.json',
            state: 'state.json',
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            sample: 'text/sample_en.md'
        })).should.throw('A sample file was specified as "text/sample_en.md" but does not exist at this location.');
    });
    it('bad data.json', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            data: 'data_en.md'
        })).should.throw('A data file was specified as "data_en.md" but does not exist at this location.');
    });
    it('bad requestjson', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateTriggerArgs({
            _: ['trigger'],
            request: ['request1.json']
        })).should.throw('A request.json file is required. Try the --request flag or create a request.json in your template.');
    });
    it('all args specified, slc archive, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data'));
        const args  = Commands.validateTriggerArgs({
            _: ['trigger'],
            contract: 'installment-sale@0.1.0-316a9177c6d52bfd4e1df6d543ddab775cc217cdb44f92120e2f24bd11f8381b.slc',
            request: ['installment-sale-ergo/request.json'],
            party: 'Acme Corp'
        });
        args.contract.should.match(/.slc$/);
    });
});

describe('#trigger', () => {
    it('should trigger a clause using a template and sample', async () => {
        const response = await Commands.trigger(template, null, sample, null, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger a clause using a template and data', async () => {
        const response = await Commands.trigger(template, null, null, data, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger a clause using a template archive and sample', async () => {
        const response = await Commands.trigger(templateArchive, null, sample, null, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger a clause using a template archive and data', async () => {
        const response = await Commands.trigger(templateArchive, null, null, data, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger with default state when state is not found with sample', async () => {
        const response = await Commands.trigger(template, null, sample, null, [request], stateErr);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger with default state when state is not found with data', async () => {
        const response = await Commands.trigger(template, null, null, data, [request], stateErr);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger with more than one request with sample', async () => {
        const response = await Commands.trigger(template, null, sample, null, [request,request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should trigger with more than one request with data', async () => {
        const response = await Commands.trigger(template, null, null, data, [request,request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should fail trigger on a bogus request', async () => {
        const response = await Commands.trigger(template, null, sample, data, [requestErr], state);
        should.equal(response,undefined);
    });

    it('should trigger a clause using a template (with currentTime set)', async () => {
        const response = await Commands.trigger(template, null, sample, data, [request], state, '2017-12-19T17:38:01Z');
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });
});

describe('#trigger-ergo', () => {
    it('should trigger a clause in ergo using a template', async () => {
        const response = await Commands.trigger(template, null, sample, data, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });
});

describe('#trigger-javascript', () => {
    it('should trigger a clause in ergo using a template', async () => {
        const response = await Commands.trigger(templateJs, null, sample, data, [request], state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });
});

describe('#trigger-slc', () => {
    it('should trigger a smart legal contract in ergo', async () => {
        const partyName = 'Acme Corp';
        const response = await Commands.trigger(null, slcArchive, null, null, [slcRequest], slcState, partyName);
        response.response.$class.should.be.equal('org.accordproject.installmentsale.Balance');
        response.response.balance.should.be.equal(7612.499999999999);
        response.state.$class.should.be.equal('org.accordproject.installmentsale.InstallmentSaleState');
    });
});

describe('#validateInvokeArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
        })).should.throw('No clause name provided. Try the --clauseName flag to provide a clause to be invoked.');
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            data: 'data.json',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'params.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified using sample only', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'params.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('party not defined', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        (() => Commands.validateInvokeArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            sample: 'latedeliveryandpenalty/text/sample.md',
            state: 'latedeliveryandpenalty/state.json',
            params: 'latedeliveryandpenalty/params.json',
            clauseName: 'latedeliveryandpenalty',
            _: ['invoke']
        })).should.throw('No party name name provided. Try the --party flag to provide a party to be invoked.');
    });
    it('all args specified using sample only, no clauseName', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            state: 'state.json',
            params: 'params.json'
        })).should.throw('No clause name provided. Try the --clauseName flag to provide a clause to be invoked.');
    });
    it('all args specified using sample only, no params', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            state: 'state.json',
            clauseName: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified using sample only, bad params', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'foobar.json'
        })).should.throw('A params file was specified as "foobar.json" but does not exist at this location.');
    });
    it('all args specified using sample only, no state', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            params: 'params.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified using sample only, bad state', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            state: 'foobar.json',
            params: 'params.json'
        })).should.throw('A state file was specified as "foobar.json" but does not exist at this location.');
    });
    it('all args specified using data only', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            clauseName: 'latedeliveryandpenalty',
            data: 'data.json',
            state: 'state.json',
            params: 'params.json'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.data.should.match(/data.json$/);
        args.state.should.match(/state.json$/);
        args.clauseName.should.match(/latedeliveryandpenalty$/);
        args.params.should.match(/params.json$/);
    });
    it('all args specified, parent folder, no sample, no state, no params, no clauseName', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: 'latedeliveryandpenalty',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            template: '../',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('no flags specified', () => {
        (() => Commands.validateInvokeArgs({
            _: ['invoke', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('verbose flag specified with sample option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'params.json',
            verbose: true
        });
    });
    it('verbose flag specified with data option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInvokeArgs({
            _: ['invoke'],
            template: './',
            data: 'data.json',
            clauseName: 'latedeliveryandpenalty',
            state: 'state.json',
            params: 'params.json',
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            sample: 'text/sample_en.md'
        })).should.throw('A sample file was specified as "text/sample_en.md" but does not exist at this location.');
    });
    it('bad params', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInvokeArgs({
            _: ['invoke'],
            sample: 'text/sample.md',
            clauseName: 'latedeliveryandpenalty',
            params: 'params1.json'
        })).should.throw('A params file was specified as "params1.json" but does not exist at this location.');
    });
    it('all args specified, slc archive, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data'));
        const args  = Commands.validateInvokeArgs({
            _: ['trigger'],
            contract: 'installment-sale@0.1.0-316a9177c6d52bfd4e1df6d543ddab775cc217cdb44f92120e2f24bd11f8381b.slc',
            clauseName: 'latedeliveryandpenalty',
            params: 'installment-sale-ergo/params.json',
            party: 'Acme Corp'
        });
        args.contract.should.match(/.slc$/);
    });
});

describe('#invoke', () => {
    it('should invoke a clause using a template and sample', async () => {
        const response = await Commands.invoke(template, null, sample, null, 'latedeliveryandpenalty', params, state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke a clause using a template and data', async () => {
        const response = await Commands.invoke(template, null, null, data, 'latedeliveryandpenalty', params, state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke a clause using a template archive and sample', async () => {
        const response = await Commands.invoke(template, null, sample, null, 'latedeliveryandpenalty', params, state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke a clause using a template archive and data', async () => {
        const response = await Commands.invoke(templateArchive, null, null, data, 'latedeliveryandpenalty', params, state);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke with default state when state is not found with sample', async () => {
        const response = await Commands.invoke(template, null, sample, null, 'latedeliveryandpenalty', params, stateErr);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should invoke with default state when state is not found with data', async () => {
        const response = await Commands.invoke(template, null, null, data, 'latedeliveryandpenalty', params, stateErr);
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });

    it('should get null response when params not found', async () => {
        const response = await Commands.invoke(template, sample, data, 'latedeliveryandpenalty', paramsErr, state);
        should.equal(response, undefined);
    });

    it('should fail invoke on a bogus request', async () => {
        const response = await Commands.invoke(template, null, sample, data, paramsErr, state);
        should.equal(response, undefined);
    });

    it('should invoke a clause using a template (with currentTime set)', async () => {
        const response = await Commands.invoke(template, null, sample, data,'latedeliveryandpenalty', params, state, '2017-12-19T17:38:01Z');
        response.response.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse');
        response.response.penalty.should.be.equal(4);
        response.response.buyerMayTerminate.should.be.equal(true);
    });
});

describe('#invoke-slc', () => {
    it('should invoke a smart legal contract in ergo', async () => {
        const partyName = 'Acme Corp';
        const response = await Commands.invoke(null, slcArchive, null, null, 'PayInstallment', slcParams, slcState, partyName, '2017-12-19T17:38:01Z');
        response.response.$class.should.be.equal('org.accordproject.installmentsale.Balance');
        response.response.balance.should.be.equal(7612.499999999999);
        response.state.$class.should.be.equal('org.accordproject.installmentsale.InstallmentSaleState');
    });
});

describe('#invoke-slc', () => {
    it('should invoke a smart legal contract in ergo', async () => {
        const response = await Commands.invoke(null, slcArchive, null, null, 'PayInstallment', slcParams, slcState, '2017-12-19T17:38:01Z');
        response.response.$class.should.be.equal('org.accordproject.installmentsale.Balance');
        response.response.balance.should.be.equal(7612.499999999999);
        response.state.$class.should.be.equal('org.accordproject.installmentsale.InstallmentSaleState');
    });
});

describe('#validateInitializeArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInitializeArgs({
            _: ['initialize'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInitializeArgs({
            _: ['initialize'],
            template: './',
            sample: 'text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateInitializeArgs({
            _: ['initt'],
            template: 'latedeliveryandpenalty',
            sample: 'latedeliveryandpenalty/text/sample.md'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.sample.should.match(/text[/\\]sample.md$/);
    });
    it('party not defined', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        (() => Commands.validateInitializeArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            sample: 'latedeliveryandpenalty/text/sample.md',
            _: ['initialize']
        })).should.throw('No party name name provided. Try the --party flag to provide a party to be initialized.');
    });
    it('all args specified, parent folder, no sample, no state', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInitializeArgs({
            _: ['initialize'],
            template: 'latedeliveryandpenalty',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');

    });
    it('all args specified, child folder, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/text'));
        (() => Commands.validateInitializeArgs({
            _: ['initialize'],
            template: '../',
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('no flags specified', () => {
        (() => Commands.validateInitializeArgs({
            _: ['initialize', path.resolve(__dirname, 'data/latedeliveryandpenalty/')],
        })).should.throw('A data file was not provided. Try the --sample flag to provide a data file in markdown format or the --data flag to provide a data file in JSON format.');
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInitializeArgs({
            _: ['initialize'],
            verbose: true
        });
    });
    it('verbose flag specified with sample option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInitializeArgs({
            _: ['invoke'],
            template: './',
            sample: 'text/sample.md',
            verbose: true
        });
    });
    it('verbose flag specified with data option', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInitializeArgs({
            _: ['invoke'],
            template: './',
            data: 'data.json',
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInitializeArgs({
            _: ['initialize'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
    it('bad sample.md', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInitializeArgs({
            _: ['initialize'],
            sample: 'text/sample_en.md'
        })).should.throw('A sample file was specified as "text/sample_en.md" but does not exist at this location.');
    });
    it('all args specified, slc archive, no sample', () => {
        process.chdir(path.resolve(__dirname, 'data'));
        const args  = Commands.validateInitializeArgs({
            _: ['trigger'],
            contract: 'installment-sale@0.1.0-316a9177c6d52bfd4e1df6d543ddab775cc217cdb44f92120e2f24bd11f8381b.slc',
            party: 'Acme Corp'
        });
        args.contract.should.match(/.slc$/);
    });
});

describe('#initialize', () => {
    it('should initialize a clause using a template with sample', async () => {
        const response = await Commands.initialize(template, null, sample, null);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });

    it('should initialize a clause using a template', async () => {
        const response = await Commands.initialize(template, null, sample, null);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });

    it('should initialize a clause using a template archive', async () => {
        const response = await Commands.initialize(templateArchive, null, sample, null, params);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
        response.params.request.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
    });

    it('should initialize a clause using a template archive with sample', async () => {
        const response = await Commands.initialize(templateArchive, null, sample);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });
    it('should initialize a clause using a template archive with sample and params', async () => {
        const response = await Commands.initialize(templateArchive, null, sample, null, params);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
        response.params.request.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
    });
    it('should initialize a clause using a template with data', async () => {
        const response = await Commands.initialize(template, null, null, data);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });
    it('should initialize a clause using a template with data and params', async () => {
        const response = await Commands.initialize(template, null, null, data, params);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
        response.params.request.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
    });
    it('should initialize a clause using a template archive with data', async () => {
        const response = await Commands.initialize(templateArchive, null, null, data);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
    });
    it('should initialize a clause using a template archive with data and params', async () => {
        const response = await Commands.initialize(templateArchive, null, null, data, params);
        response.state.$class.should.be.equal('org.accordproject.runtime.State');
        response.params.request.$class.should.be.equal('org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
    });
    it('should fail to initialize on a bogus sample', async () => {
        const response = await Commands.initialize(template, null, sampleErr);
        should.equal(response,undefined);
    });
});

describe('#intialize-slc', () => {
    it('should intialize a smart legal contract in ergo', async () => {
        const partyName =  'Acme Corp';
        const response = await Commands.initialize(null, slcArchive, null, partyName);
        response.response.$class.should.be.equal('org.accordproject.runtime.Response');
        response.state.$class.should.be.equal('org.accordproject.installmentsale.InstallmentSaleState');
        response.state.balance_remaining.should.be.equal(10000);
    });
});

describe('#validateCompileArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
            template: './',
            target: 'Go',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.target.should.match(/Go$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
            template: 'latedeliveryandpenalty',
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateCompileArgs({
            _: ['compile'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateCompileArgs({
            _: ['compile'],
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#compile', () => {

    it('should compile to a Go model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'Go', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a PlantUML model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'PlantUML', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a Typescript model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'Typescript', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a Java model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'Java', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a Corda model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'Corda', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should compile to a JSONSchema model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'JSONSchema', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
    it('should not compile to an unknown model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'BLAH', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.equal(0);
        dir.cleanup();
    });
});

describe('#validateArchiveArgs', () => {
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
            _: ['archive']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#archive', async () => {
    it('should create signed archive', async () => {
        const archiveName = 'test.cta';
        const p12path = path.resolve(__dirname, 'data/keystore.p12');
        const keystore = {
            path: p12path,
            passphrase: 'password'
        };
        const options = {
            keystore: keystore
        };
        const result = await Commands.archive(template, 'ergo', archiveName, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        newTemplate.should.have.own.property('authorSignature');
        fs.unlinkSync(archiveName);
    });

    it('should create a valid ergo archive', async () => {
        const archiveName = 'test.cta';
        const options = {};
        const result = await Commands.archive(template, 'ergo', archiveName, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        newTemplate.hasLogic().should.equal(true);
        fs.unlinkSync(archiveName);
    });

    it('should create a valid ergo archive with a default name', async () => {
        const archiveName = 'latedeliveryandpenalty@0.0.1.cta';
        const options = {};
        const result = await Commands.archive(template, 'ergo', null, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        newTemplate.hasLogic().should.equal(true);
        fs.unlinkSync(archiveName);
    });

    it('should create an Ergo archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        await Commands.archive(template, 'ergo', tmpArchive, options);
        fs.readFileSync(tmpArchive).length.should.be.above(0);
        tmpFile.cleanup();
    });
    it('should create a JavaScript archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        await Commands.archive(template, 'es6', tmpArchive, options);
        fs.readFileSync(tmpArchive).length.should.be.above(0);
        tmpFile.cleanup();
    });
    it('should not create an unknown archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        return Commands.archive(template, 'foo', tmpArchive, options)
            .should.be.rejectedWith('Unknown target: foo (available: es6,java)');
    });

});

describe('#validateSignArgs', () => {
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        const args  = Commands.validateSignArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            keystore: 'keystore.p12',
            passphrase: 'password',
            signatory: 'Acme Corp',
            _: ['sign']
        });
        args.contract.should.match(/.slc$/);
    });
    it('keystore not defined', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        (() => Commands.validateSignArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            passphrase: 'password',
            signatory: 'Acme Corp',
            _: ['sign']
        })).should.throw('Please enter the keystore\'s path. Try the --keystore flag to enter keystore\'s path.');
    });
    it('passphrase not defined', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        (() => Commands.validateSignArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            keystore: 'keystore.p12',
            signatory: 'Acme Corp',
            _: ['sign']
        })).should.throw('Please enter the passphrase of the keystore. Try the --passphrase flag to enter passphrase.');
    });
    it('signatory not defined', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        (() => Commands.validateSignArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            keystore: 'keystore.p12',
            passphrase: 'password',
            _: ['sign']
        })).should.throw('Please enter the signatory\'s name. Try the --signatory flag to enter signatory\'s name.');
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        Commands.validateSignArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            keystore: 'keystore.p12',
            passphrase: 'password',
            signatory: 'Acme Corp',
            _: ['sign'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateSignArgs({
            _: ['sign']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#sign', async () => {
    it('should sign the contract for a party/individual', async () => {
        const archiveName = 'test.slc';
        const signatory = 'Acme Corp';
        const slcPath = path.resolve(__dirname, 'data/contractsigning/latedeliveryandpenalty@0.17.0.slc');
        const keystore = path.resolve(__dirname, 'data/contractsigning/keystore.p12');
        const result = await Commands.sign(slcPath, keystore, 'password', signatory, archiveName);
        result.should.eql(true);
        const newInstance = await ContractInstance.fromArchive(fs.readFileSync(archiveName));
        newInstance.should.not.be.null;
        newInstance.contractSignatures.should.have.lengthOf(1);
        fs.unlinkSync(archiveName);
    });
    it('should sign the contract for a party/individual without specifying output path', async () => {
        const slcPath = path.resolve(__dirname, 'data/contractsigning/latedeliveryandpenalty@0.17.0.slc');
        const keystore = path.resolve(__dirname, 'data/contractsigning/keystore.p12');
        const signatory = 'Acme Corp';
        const result = await Commands.sign(slcPath, keystore, 'password', signatory);
        result.should.eql(true);
        fs.unlinkSync('latedeliveryandpenalty@0.17.0-bb3e944894500a0c41a25a6e995d6c0ee7c5af6d9e453f7bfd562da5057dcc5d.slc');
    });
});

describe('#validateVerifyArgs', () => {
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        const args  = Commands.validateVerifyArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.v1.slc',
            _: ['verify']
        });
        args.contract.should.match(/.slc$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        Commands.validateVerifyArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.v1.slc',
            _: ['verify'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateVerifyArgs({
            _: ['verify']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#verify', async () => {
    it('should verify contract signatures', async () => {
        const slcPath = path.resolve(__dirname, 'data/contractsigning/latedeliveryandpenalty@0.17.0-verifysignatures.slc');
        return Commands.verify(null, slcPath).should.be.fulfilled;
    });
});

describe('#validateInstantiateArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInstantiateArgs({
            instantiator: 'some-party',
            _: ['instantiate']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.target.should.match(/ergo/);
    });
    it('instantiator not defined', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        (() => Commands.validateInstantiateArgs({
            _: ['instantiate']
        })).should.throw('Please enter the instantiator\'s name. Try the --instantiator flag to enter instantiator\'s name.');
    });
    it('only target arg specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateInstantiateArgs({
            instantiator: 'some-party',
            _: ['instantiate'],
            target: 'ergo'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.target.should.match(/ergo/);
    });
    it('template arg specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateInstantiateArgs({
            instantiator: 'some-party',
            _: ['instantiate', 'data/latedeliveryandpenalty/']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.target.should.match(/ergo/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateInstantiateArgs({
            instantiator: 'some-party',
            _: ['instantiate'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateInstantiateArgs({
            _: ['archive']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#instantiate', async () => {
    it('should create a valid slc archive', async () => {
        const archiveName = 'test.slc';
        const result = await Commands.instantiate(template, data, 'ergo', archiveName);
        result.should.eql(true);
        fs.unlinkSync(archiveName);
    });

    it('should create a valid slc archive with a default name', async () => {
        const archiveName = 'latedeliveryandpenalty@0.0.1-ee84023d6c9670a97617db4d4f9aa3bdbf247a478cd3258471c23336445e3248.slc';
        const result = await Commands.instantiate(template, data, 'ergo', null);
        result.should.eql(true);
        fs.unlinkSync(archiveName);
    });
});

describe('#validateGetArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateGetArgs({
            _: ['get']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]model$/);
    });
    it('only output arg specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateGetArgs({
            _: ['get'],
            output: 'foo'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/foo/);
    });
    it('template directory specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateGetArgs({
            _: ['get', 'data/latedeliveryandpenalty/']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        args.output.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]model$/);
    });
    it('template archive specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateGetArgs({
            _: ['get', templateArchive]
        });
        args.template.should.eql(templateArchive);
        args.output.should.match(/model$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateGetArgs({
            _: ['get'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateGetArgs({
            _: ['get']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#get', async () => {
    it('should get dependencies for a template', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.get(template, dir.path);
        fs.readdirSync(dir.path).length.should.be.above(0);
        dir.cleanup();
    });
});

describe('#validateVerfiyArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(__dirname, 'data/signedArchive/'));
        const args  = Commands.validateVerifyArgs({
            _: ['verify']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]signedArchive$/);
    });
    it('template arg specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateVerifyArgs({
            _: ['verify', 'data/signedArchive/']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]signedArchive$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        Commands.validateVerifyArgs({
            _: ['verify'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(__dirname, 'data/'));
        (() => Commands.validateVerifyArgs({
            _: ['verify']
        })).should.throw(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#verify', async () => {
    it('should verify the signature of the template author/developer', async () => {
        const templatePath = path.resolve(__dirname, 'data/signedArchive/');
        return Commands.verify(templatePath).should.be.fulfilled;
    });
    it('should throw error when signture is invalid', async () => {
        const templatePath = path.resolve(__dirname, 'data/signedArchiveFail/');
        return Commands.verify(templatePath).should.be.rejectedWith('Template\'s author signature is invalid!');
    });
});

describe('#validateExportArgs', () => {
    it('all args specified', () => {
        process.chdir(path.resolve(__dirname, 'data'));
        const args  = Commands.validateExportArgs({
            _: ['export'],
            contract: 'installment-sale@0.1.0-316a9177c6d52bfd4e1df6d543ddab775cc217cdb44f92120e2f24bd11f8381b.slc',
            party: 'Acme Corp',
            format: 'pdf'
        });
        args.contract.should.match(/.slc$/);
    });

    it('all args specified (verbose)', () => {
        process.chdir(path.resolve(__dirname, 'data'));
        const args  = Commands.validateExportArgs({
            _: ['export'],
            contract: 'installment-sale@0.1.0-316a9177c6d52bfd4e1df6d543ddab775cc217cdb44f92120e2f24bd11f8381b.slc',
            format: 'pdf',
            party: 'Acme Corp',
            verbose: true,
        });
        args.contract.should.match(/.slc$/);
    });

    it('party not defined', () => {
        process.chdir(path.resolve(__dirname, 'data/contractsigning/'));
        (() => Commands.validateExportArgs({
            contract: 'latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc',
            format: 'pdf',
            verbose: true,
            _: ['export']
        })).should.throw('No party name name provided. Try the --party flag to provide a party to be exported.');
    });
});

describe('#export', async () => {
    it('should export a smart legal contract to markdown', async () => {
        const partyName = 'Acme Corp';
        const result = await Commands.export(slcArchive, partyName, null, null, null, { format: 'markdown' });
        result.should.equal('"Dan" agrees to pay to "Ned" the total sum e10000.0, in the manner following:\n\nE500.0 is to be paid at closing, and the remaining balance of E9500.0 shall be paid as follows:\n\nE500.0 or more per month on the first day of each and every month, and continuing until the entire balance, including both principal and interest, shall be paid in full -- provided, however, that the entire balance due plus accrued interest and any other amounts due here-under shall be paid in full on or before 24 months.\n\nMonthly payments, which shall start on month 3, include both principal and interest with interest at the rate of 1.5%, computed monthly on the remaining balance from time to time unpaid.');
    });

    it('should export a smart legal contract to ciceromark', async () => {
        const partyName = 'Acme Corp';
        const result = await Commands.export(slcArchive, partyName, null, null, null, { format: 'ciceromark' });
        result.$class.should.equal('org.accordproject.commonmark.Document');
    });

    it('should export a smart legal contract to ciceromark (output file)', async () => {
        const partyName = 'Acme Corp';
        const tmpFile = await tmp.file();
        const tmpJson = tmpFile.path + '.json';
        const result = await Commands.export(slcArchive, partyName, tmpJson, null, null, { format: 'ciceromark' });
        result.$class.should.equal('org.accordproject.commonmark.Document');
        tmpFile.cleanup();
    });

    it('should export a smart legal contract to pdf', async () => {
        const partyName = 'Acme Corp';
        const result = await Commands.export(slcArchive, partyName, null, null, null, { format: 'pdf' });
        result.should.not.be.null;
    });

    it('should export a smart legal contract to pdf (output file)', async () => {
        const partyName = 'Acme Corp';
        const tmpFile = await tmp.file();
        const tmpPdf = tmpFile.path + '.pdf';
        const result = await Commands.export(slcArchive, partyName, tmpPdf, null, null, { format: 'pdf' });
        result.should.not.be.null;
        tmpFile.cleanup();
    });

    it('should throw for an unknown format', async () => {
        const partyName = 'Acme Corp';
        expect(await Commands.export(slcArchive, partyName, null, null, null, { format: 'foobar' })).to.be.undefined;
    });
});
