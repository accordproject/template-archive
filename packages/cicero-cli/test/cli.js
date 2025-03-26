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
const {CodeGen} = require('@accordproject/concerto-codegen');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const Commands = require('../lib/commands');

const template = path.resolve(__dirname, 'data/latedeliveryandpenalty/');

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

describe('#compile', async () => {
    const formats = Object.keys(CodeGen.formats);
    const dir = await tmp.dir({ unsafeCleanup: true });
    for(let n=0; n<formats.length; n++) {
        it(`should compile to a ${formats[n]} model`, async () => {
            const output = path.resolve(dir.path, formats[n]);
            await Commands.compile(template, formats[n], output, true);
            fs.readdirSync(output).length.should.be.above(0);
        });
    }
    dir.cleanup();

    it('should not compile to an unknown model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'BLAH', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.equal(0);
        dir.cleanup();
    });

    it('should compile a template archive to a Typescript model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        const template = await Template.fromDirectory(path.resolve(__dirname, 'data/helloworldstate'));
        const buffer = await template.toArchive('es6');
        fs.writeFileSync(path.resolve(dir.path, 'helloworldstate.cta'), buffer);
        await Commands.compile(path.resolve(dir.path, 'helloworldstate.cta'), 'Typescript', dir.path, true);
        fs.readdirSync(dir.path).length.should.be.above(0);
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
    });
    it('only target arg specified', () => {
        process.chdir(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const args  = Commands.validateArchiveArgs({
            _: ['archive'],
            target: 'typescript'
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('template arg specified', () => {
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateArchiveArgs({
            _: ['archive', 'data/latedeliveryandpenalty/']
        });
        args.template.should.match(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
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
        const p12path = path.resolve(__dirname, 'data/keystore/keystore.p12');
        const keystore = {
            path: p12path,
            passphrase: 'password'
        };
        const options = {
            keystore: keystore
        };
        const result = await Commands.archive(template, null, archiveName, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        newTemplate.should.have.own.property('authorSignature');
        fs.unlinkSync(archiveName);
    });

    it('should create a valid typescript archive', async () => {
        const archiveName = 'test.cta';
        const options = {};
        const result = await Commands.archive(template, 'typescript', archiveName, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        fs.unlinkSync(archiveName);
    });

    it('should create a valid typescript archive with a default name', async () => {
        const archiveName = 'latedeliveryandpenalty@0.0.1.cta';
        const options = {};
        const result = await Commands.archive(template, 'typescript', null, options);
        result.should.eql(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        newTemplate.should.not.be.null;
        fs.unlinkSync(archiveName);
    });

    it('should create an typescript archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        await Commands.archive(template, 'typescript', tmpArchive, options);
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
    it('template archive specified', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        const template = await Template.fromDirectory(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const buffer = await template.toArchive('es6');
        const archivePath = path.resolve(dir.path, 'latedeliveryandpenalty.cta');
        fs.writeFileSync(archivePath, buffer);
        process.chdir(path.resolve(__dirname));
        const args  = Commands.validateGetArgs({
            _: ['get', archivePath]
        });
        args.template.should.eql(archivePath);
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
        const dir = await tmp.dir({ unsafeCleanup: true });
        const template = await Template.fromDirectory(path.resolve(__dirname, 'data/latedeliveryandpenalty/'));
        const p12File = fs.readFileSync(path.resolve(__dirname, 'data/keystore/keystore.p12'), { encoding: 'base64' });
        const keystore = {
            p12File: p12File,
            passphrase: 'password'
        };
        const archiveBuffer = await template.toArchive('es6', { keystore });
        const archivePath = path.resolve(dir.path, 'latedeliveryandpenalty.cta');
        fs.writeFileSync(archivePath, archiveBuffer);
        process.chdir(path.resolve(__dirname, 'data/'));
        return Commands.verify(archivePath).should.be.fulfilled;
    });
    it('should throw error when signature is invalid', async () => {
        const templatePath = path.resolve(__dirname, 'data/signedArchiveFail/');
        return Commands.verify(templatePath).should.be.rejectedWith('Template\'s author signature is invalid!');
    });
});
