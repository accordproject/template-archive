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

import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as fs from 'fs';

import { Template } from '@accordproject/cicero-core';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CodeGen } = require('@accordproject/concerto-codegen');

import { Commands } from './commands';

const dataDir = path.resolve(__dirname, '..', 'test', 'data');
const template = path.resolve(dataDir, 'latedeliveryandpenalty');

describe('#validateCompileArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('all args specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
            template: './',
            target: 'Go',
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        expect(args.target).toMatch(/Go$/);
    });
    it('all args specified, parent folder', () => {
        process.chdir(path.resolve(dataDir, ''));
        const args  = Commands.validateCompileArgs({
            _: ['compile'],
            template: 'latedeliveryandpenalty',
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        Commands.validateCompileArgs({
            _: ['compile'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(dataDir, ''));
        expect(() => Commands.validateCompileArgs({
            _: ['compile'],
        })).toThrow(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#compile', () => {
    const formats = Object.keys(CodeGen.formats);
    let compileDir;

    beforeAll(async () => {
        compileDir = await tmp.dir({ unsafeCleanup: true });
    });

    afterAll(() => {
        if (compileDir) {
            compileDir.cleanup();
        }
    });

    for(let n=0; n<formats.length; n++) {
        it(`should compile to a ${formats[n]} model`, async () => {
            const output = path.resolve(compileDir.path, formats[n]);
            await Commands.compile(template, formats[n], output, true);
            expect(fs.readdirSync(output).length).toBeGreaterThan(0);
        });
    }

    it('should not compile to an unknown model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.compile(template, 'BLAH', dir.path, true);
        expect(fs.readdirSync(dir.path).length).toBe(0);
        dir.cleanup();
    });

    it('should compile a template archive to a Typescript model', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        const template = await Template.fromDirectory(path.resolve(dataDir, 'helloworldstate'));
        const buffer = await template.toArchive('es6');
        fs.writeFileSync(path.resolve(dir.path, 'helloworldstate.cta'), buffer);
        await Commands.compile(path.resolve(dir.path, 'helloworldstate.cta'), 'Typescript', dir.path, true);
        expect(fs.readdirSync(dir.path).length).toBeGreaterThan(0);
        dir.cleanup();
    });
});

describe('#validateArchiveArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const args  = Commands.validateArchiveArgs({
            _: ['archive']
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('only target arg specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const args  = Commands.validateArchiveArgs({
            _: ['archive'],
            target: 'typescript'
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('template arg specified', () => {
        process.chdir(path.resolve(dataDir, '..'));
        const args  = Commands.validateArchiveArgs({
            _: ['archive', 'data/latedeliveryandpenalty/']
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        Commands.validateArchiveArgs({
            _: ['archive'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(dataDir, ''));
        expect(() => Commands.validateArchiveArgs({
            _: ['archive']
        })).toThrow(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#archive', () => {
    it('should create signed archive', async () => {
        const archiveName = 'test.cta';
        const p12path = path.resolve(dataDir, 'keystore/keystore.p12');
        const keystore = {
            path: p12path,
            passphrase: 'password'
        };
        const options = {
            keystore: keystore
        };
        const result = await Commands.archive(template, null, archiveName, options);
        expect(result).toEqual(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        expect(newTemplate).not.toBeNull();
        expect(newTemplate).toHaveProperty('authorSignature');
        fs.unlinkSync(archiveName);
    });

    it('should create a valid typescript archive', async () => {
        const archiveName = 'test.cta';
        const options = {};
        const result = await Commands.archive(template, 'typescript', archiveName, options);
        expect(result).toEqual(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        expect(newTemplate).not.toBeNull();
        fs.unlinkSync(archiveName);
    });

    it('should create a valid typescript archive with a default name', async () => {
        const archiveName = 'latedeliveryandpenalty@0.0.1.cta';
        const options = {};
        const result = await Commands.archive(template, 'typescript', null, options);
        expect(result).toEqual(true);
        const newTemplate = await Template.fromArchive(fs.readFileSync(archiveName));
        expect(newTemplate).not.toBeNull();
        fs.unlinkSync(archiveName);
    });

    it('should create an typescript archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        await Commands.archive(template, 'typescript', tmpArchive, options);
        expect(fs.readFileSync(tmpArchive).length).toBeGreaterThan(0);
        tmpFile.cleanup();
    });
    it('should create a JavaScript archive', async () => {
        const tmpFile = await tmp.file();
        const tmpArchive = tmpFile.path + '.cta';
        const options = {};
        await Commands.archive(template, 'es6', tmpArchive, options);
        expect(fs.readFileSync(tmpArchive).length).toBeGreaterThan(0);
        tmpFile.cleanup();
    });
});

describe('#validateDraftArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        expect(args.data).toMatch(/data.json$/);
    });
    it('data arg specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const args  = Commands.validateDraftArgs({
            _: ['draft'],
            data: 'data.json',
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        expect(args.data).toMatch(/data.json$/);
    });
    it('template arg specified', () => {
        process.chdir(path.resolve(dataDir, '..'));
        const args  = Commands.validateDraftArgs({
            _: ['draft', 'data/latedeliveryandpenalty/'],
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        Commands.validateDraftArgs({
            _: ['draft'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(dataDir, ''));
        expect(() => Commands.validateDraftArgs({
            _: ['draft'],
        })).toThrow(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#draft', () => {
    const draftData = path.resolve(dataDir, 'latedeliveryandpenalty/data.json');
    const draftDataErr = path.resolve(dataDir, 'latedeliveryandpenalty/data_err.json');

    it('should draft markdown text from a template and data', async () => {
        const result = await Commands.draft(template, draftData, null, 'markdown', null, {});
        expect(result).toMatch(/Late Delivery and Penalty/);
    });
    it('should draft html text from a template and data', async () => {
        const result = await Commands.draft(template, draftData, null, 'html', null, {});
        expect(result).toMatch(/<html>/);
    });
    it('should stringify a non-string output format', async () => {
        const result = await Commands.draft(template, draftData, null, 'ciceromark_parsed', null, {});
        expect(typeof result).toBe('string');
        expect(JSON.parse(result)).toHaveProperty('$class');
    });
    it('should draft from a template archive', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        const archiveTemplate = await Template.fromDirectory(template);
        const buffer = await archiveTemplate.toArchive('es6');
        const archivePath = path.resolve(dir.path, 'latedeliveryandpenalty.cta');
        fs.writeFileSync(archivePath, buffer);
        const result = await Commands.draft(archivePath, draftData, null, 'markdown', null, {});
        expect(result).toMatch(/Late Delivery and Penalty/);
        dir.cleanup();
    });
    it('should write drafted text to an output file', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        const outputPath = path.resolve(dir.path, 'output.md');
        await Commands.draft(template, draftData, outputPath, 'markdown', null, {});
        expect(fs.readFileSync(outputPath, 'utf8')).toMatch(/Late Delivery and Penalty/);
        dir.cleanup();
    });
    it('should reject when the data does not match the template model', async () => {
        await expect(Commands.draft(template, draftDataErr, null, 'markdown', null, {})).rejects.toThrow();
    });
});

describe('#validateGetArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const args  = Commands.validateGetArgs({
            _: ['get']
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        expect(args.output).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]model$/);
    });
    it('only output arg specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const args  = Commands.validateGetArgs({
            _: ['get'],
            output: 'foo'
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        expect(args.output).toMatch(/foo/);
    });
    it('template directory specified', () => {
        process.chdir(path.resolve(dataDir, '..'));
        const args  = Commands.validateGetArgs({
            _: ['get', 'data/latedeliveryandpenalty/']
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty$/);
        expect(args.output).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]latedeliveryandpenalty[/\\]model$/);
    });
    it('template archive specified', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        const template = await Template.fromDirectory(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const buffer = await template.toArchive('es6');
        const archivePath = path.resolve(dir.path, 'latedeliveryandpenalty.cta');
        fs.writeFileSync(archivePath, buffer);
        process.chdir(path.resolve(dataDir, '..'));
        const args  = Commands.validateGetArgs({
            _: ['get', archivePath]
        });
        expect(args.template).toEqual(archivePath);
        expect(args.output).toMatch(/model$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        Commands.validateGetArgs({
            _: ['get'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(dataDir, ''));
        expect(() => Commands.validateGetArgs({
            _: ['get']
        })).toThrow(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#get', () => {
    it('should get dependencies for a template', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        await Commands.get(template, dir.path);
        expect(fs.readdirSync(dir.path).length).toBeGreaterThan(0);
        dir.cleanup();
    });
});

describe('#validateVerfiyArgs', () => {
    it('no args specified', () => {
        process.chdir(path.resolve(dataDir, 'signedArchive/'));
        const args  = Commands.validateVerifyArgs({
            _: ['verify']
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]signedArchive$/);
    });
    it('template arg specified', () => {
        process.chdir(path.resolve(dataDir, '..'));
        const args  = Commands.validateVerifyArgs({
            _: ['verify', 'data/signedArchive/']
        });
        expect(args.template).toMatch(/cicero-cli[/\\]test[/\\]data[/\\]signedArchive$/);
    });
    it('verbose flag specified', () => {
        process.chdir(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        Commands.validateVerifyArgs({
            _: ['verify'],
            verbose: true
        });
    });
    it('bad package.json', () => {
        process.chdir(path.resolve(dataDir, ''));
        expect(() => Commands.validateVerifyArgs({
            _: ['verify']
        })).toThrow(' not a valid cicero template. Make sure that package.json exists and that it has a cicero entry.');
    });
});

describe('#verify', () => {
    it('should verify the signature of the template author/developer', async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        const template = await Template.fromDirectory(path.resolve(dataDir, 'latedeliveryandpenalty/'));
        const p12File = fs.readFileSync(path.resolve(dataDir, 'keystore/keystore.p12'), { encoding: 'base64' });
        const keystore = {
            p12File: p12File,
            passphrase: 'password'
        };
        const archiveBuffer = await template.toArchive('es6', { keystore });
        const archivePath = path.resolve(dir.path, 'latedeliveryandpenalty.cta');
        fs.writeFileSync(archivePath, archiveBuffer);
        process.chdir(path.resolve(dataDir, ''));
        await expect(Commands.verify(archivePath)).resolves.not.toThrow();
    });
    it.skip('should throw error when signature is invalid', async () => {
        const templatePath = path.resolve(dataDir, 'signedArchiveFail/');
        await expect(Commands.verify(templatePath)).rejects.toThrow('Template\'s author signature is invalid!');
    });
});
