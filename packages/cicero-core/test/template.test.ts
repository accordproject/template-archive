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

import Template from '../src/template';
import fs from 'fs';
import forge from 'node-forge';
import crypto from 'crypto';

/* eslint-disable */

function waitForEvent(emitter, eventType) {
    return new Promise((resolve) => {
        emitter.once(eventType, resolve);
    });
}

function sign(templateHash, timestamp, p12File, passphrase) {
    // decode p12 from base64
    const p12Der = forge.util.decode64(p12File);
    // get p12 as ASN.1 object
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    // decrypt p12 using the passphrase 'password'
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);
    //X509 cert forge type
    const certificateForge = p12.safeContents[0].safeBags[0].cert;
    //Private Key forge type
    const privateKeyForge = p12.safeContents[1].safeBags[0].key;
    //convert cert and private key from forge to PEM
    const certificatePem = forge.pki.certificateToPem(certificateForge);
    const privateKeyPem = forge.pki.privateKeyToPem(privateKeyForge);
    //convert private key in pem to private key type in node
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const sign = crypto.createSign('SHA256');
    sign.write(templateHash + timestamp);
    sign.end();
    const signature = sign.sign(privateKey, 'hex');
    return { signature: signature, certificate: certificatePem };
}

async function writeZip(template) {
    try {
        fs.mkdirSync('./test/data/archives');
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    // archiver is required lazily because it has no type declarations and is an
    // optional dev dependency; only the zip-based tests need it.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const archiver = require('archiver');
    let output = fs.createWriteStream(`./test/data/archives/${template}.zip`);
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);
    archive.directory(`test/data/${template}/`, false);
    archive.finalize();

    return await waitForEvent(output, 'close');
}
/* eslint-enable */

const options = { offline: false };

describe('Template', () => {

    describe('#toArchive', () => {

        it('should create the archive without signature', async () => {
            const template = await Template.fromDirectory('./test/data/signing-template/helloworldstate');
            const archiveBuffer = await template.toArchive('es6');
            expect(archiveBuffer).not.toBeNull();
        });

        it('should create the archive and sign it', async () => {
            const template = await Template.fromDirectory('./test/data/signing-template/helloworldstate');
            const p12File = fs.readFileSync('./test/data/keystore/keystore.p12', { encoding: 'base64' });
            const keystore = {
                p12File: p12File,
                passphrase: 'password'
            };
            const archiveBuffer = await template.toArchive('es6', { keystore });
            expect(archiveBuffer).not.toBeNull();
        });

        it('should throw an error if passphrase of the keystore is wrong', async () => {
            const template = await Template.fromDirectory('./test/data/signing-template/helloworldstate');
            const p12File = fs.readFileSync('./test/data/keystore/keystore.p12', { encoding: 'base64' });
            const keystore = {
                p12File: p12File,
                passphrase: '123'
            };
            await expect(template.toArchive('es6', { keystore })).rejects.toThrow('PKCS#12 MAC could not be verified. Invalid password?');
        });
    });

    describe('#signTemplate', () => {

        it('should sign the content hash and timestamp string using the keystore', async () => {
            const template = await Template.fromDirectory('./test/data/helloworldstate');
            const timestamp = Date.now();
            const templateHash = template.getHash();
            const p12File = fs.readFileSync('./test/data/keystore/keystore.p12', { encoding: 'base64' });
            const signatureData = sign(templateHash, timestamp, p12File, 'password');
            template.signTemplate(p12File, 'password', timestamp);
            const result = template.authorSignature;
            const expected = {
                templateSignature: {
                    templateHash,
                    timestamp,
                    signatoryCert: signatureData.certificate,
                    signature: signatureData.signature,
                }
            };
            expect(result).toEqual(expected);
        });
    });

    describe('#fromDirectory', () => {

        it('should create a template from a directory without signatures of the template developer', async () => {
            await expect(Template.fromDirectory('./test/data/verifying-template-signature/helloworldstateUnsigned', options)).resolves.toBeDefined();
        });

        it('should create a template from a directory with no @ClauseDataLogic in logic', async () => {
            await expect(Template.fromDirectory('./test/data/no-logic', options)).resolves.toBeDefined();
        });

        it('should create a template from a directory with no logic', async () => {
            return Template.fromDirectory('./test/data/text-only', options);
        });

        it('should create a template from a directory with a model using @template', async () => {
            return Template.fromDirectory('./test/data/template-decorator', options);
        });

        it('should create a template with typescript logic from a directory', async () => {
            return Template.fromDirectory('./test/data/text-only', options);
        });

        it('should create a template from a directory and download external models by default', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-typescript');
            expect(template.getLogicManager().getLanguage()).toBe('typescript');
            expect(template.getLogicManager().getScriptManager().getScript('logic/logic.ts')).not.toBeNull();
        });

        it('should create a template from a directory', async () => {
            await expect(Template.fromDirectory('./test/data/latedeliveryandpenalty', options)).resolves.toBeDefined();
        });

        it('should throw error when date of the signature is tampered', async () => {
            await expect(Template.fromDirectory('./test/data/verifying-template-signature/helloworldstateTamperDate', options)).rejects.toThrow('Template\'s author signature is invalid!');
        });

        it('should throw error when the template signature is tampered', async () => {
            await expect(Template.fromDirectory('./test/data/verifying-template-signature/helloworldstateTamperSign', options)).rejects.toThrow('Template\'s author signature is invalid!');
        });

        it('should create a template with logo', () => {
            const templatePromise = Template.fromDirectory('./test/data/template-logo', options);
            return templatePromise.then((template) => expect(template.getMetadata().getLogo()).toBeInstanceOf(Buffer));
        });

        it('should create a template without a logo if image is not named \'logo.png\'', () => {
            const templatePromise = Template.fromDirectory('./test/data/wrong-name-template-logo', options);
            return templatePromise.then((template) => expect(template.getMetadata().getLogo()).toBeNull());
        });

        it('should roundtrip a template with a logo', async () => {
            const template = await Template.fromDirectory('./test/data/template-logo', options);
            expect(template.getIdentifier()).toBe('logo@0.0.1');
            expect(template.getHash()).toBe('1878a4938351b1b7195f1d77c1c70fe56e5c80ec4b97ee6f61682f5cf551e13d');
            expect(template.getMetadata().getLogo()).toBeInstanceOf(Buffer);
            expect(template.getMetadata().getSample()).toBe('"Aman" "Sharma" added the support for logo and hence created this template for testing!\n');
            const buffer = await template.toArchive('es6');
            expect(buffer).not.toBeNull();
            const template2 = await Template.fromArchive(buffer);
            expect(template2.getIdentifier()).toBe(template.getIdentifier());
            template2.getHash(template.getHash());
            expect(template2.getMetadata().getLogo()).toEqual(template.getMetadata().getLogo());
            expect(template2.getMetadata().getSample()).toBe(template.getMetadata().getSample());
        });

        it('should roundtrip a source template (CR)', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-cr', options);
            expect(template.getIdentifier()).toBe('latedeliveryandpenalty@0.0.1');
            expect(template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty@0.1.0')).not.toBeNull();
            expect(template.getMetadata().getREADME()).not.toBeNull();
            expect(template.getMetadata().getRequest()).not.toBeNull();
            expect(template.getMetadata().getKeywords()).not.toBeNull();
            expect(template.getName()).toBe('latedeliveryandpenalty');
            expect(template.getDisplayName()).toBe('Latedeliveryandpenalty');
            expect(template.getDescription()).toBe('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            expect(template.getVersion()).toBe('0.0.1');
            expect(template.getMetadata().getSample()).toBe('Late Delivery and Penalty.\n\nIn case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.\n');
            expect(template.getHash()).toBe('b45582f37fa044434feb6ce44845d8165a5162b1f202c638d0114c40af39731a');
            const buffer = await template.toArchive('es6');
            expect(buffer).not.toBeNull();
            const template2 = await Template.fromArchive(buffer);
            expect(template2.getIdentifier()).toBe(template.getIdentifier());
            expect(template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty@0.1.0')).not.toBeNull();
            expect(template2.getMetadata().getREADME()).toBe(template.getMetadata().getREADME());
            expect(template2.getMetadata().getKeywords()).toEqual(template.getMetadata().getKeywords());
            expect(template2.getMetadata().getSamples()).toEqual(template.getMetadata().getSamples());
            // Hash doesn't match because setting a target language changes the hash
            expect(template2.getHash()).toBe('fcd2e43f223244ea940f61afbbe0c5061b028152ad448422315b1c7725ce9732');
            expect(template.getDisplayName()).toBe('Latedeliveryandpenalty');
            const buffer2 = await template2.toArchive('es6');
            expect(buffer2).not.toBeNull();
        });

        it('should roundtrip a compiled template (JavaScript)', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty_js', options);
            expect(template.getIdentifier()).toBe('latedeliveryandpenalty@0.0.1');
            expect(template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty@1.0.0')).not.toBeNull();
            expect(template.getMetadata().getREADME()).not.toBeNull();
            expect(template.getMetadata().getRequest()).not.toBeNull();
            expect(template.getMetadata().getKeywords()).not.toBeNull();
            expect(template.getName()).toBe('latedeliveryandpenalty');
            expect(template.getDescription()).toBe('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            expect(template.getVersion()).toBe('0.0.1');
            expect(template.getMetadata().getSample()).toBe('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.');
            expect(template.getHash()).toBe('96290389ddb99f3353b296d306a2277d276c03e14a7bea2171cf3ccc8bcb4d8f');
            const buffer = await template.toArchive('es6');
            expect(buffer).not.toBeNull();
            const template2 = await Template.fromArchive(buffer);
            expect(template2.getIdentifier()).toBe(template.getIdentifier());
            expect(template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty@1.0.0')).not.toBeNull();
            expect(template2.getMetadata().getREADME()).toBe(template.getMetadata().getREADME());
            expect(template2.getMetadata().getKeywords()).toEqual(template.getMetadata().getKeywords());
            expect(template2.getMetadata().getSamples()).toEqual(template.getMetadata().getSamples());
            expect(template2.getHash()).toBe(template.getHash());
            const buffer2 = await template2.toArchive('es6');
            expect(buffer2).not.toBeNull();
        });

        it('should throw an error if multiple template models are found', async () => {
            await expect(Template.fromDirectory('./test/data/multiple-concepts', options)).rejects.toThrow('Failed to find a concept with the @template decorator. The model for the template must contain a single concept with the @template decoratpr');
        });

        it('should throw an error if no template models are found', async () => {
            await expect(Template.fromDirectory('./test/data/no-concepts', options)).rejects.toThrow('Failed to find a concept with the @template decorator. The model for the template must contain a single concept with the @template decoratpr');
        });

        it('should throw an error if a package.json file does not exist', async () => {
            try {
                await Template.fromDirectory('./test/data/no-packagejson', options);
                expect(false).toBe(true);
            }
            catch (err) {
                // ignore
            }
        });

        it('should create a template from a directory with a locale sample', async () => {
            await expect(Template.fromDirectory('./test/data/locales-conga', options)).resolves.toBeDefined();
        });

        it('should throw an error if a text/sample.md file does not exist', async () => {
            try {
                await Template.fromDirectory('./test/data/no-sample', options);
                expect(false).toBe(true);
            }
            catch (err) {
                // ignore
            }
        });

        it('should throw an error if the locale is not in the IETF format', async () => {
            try {
                await Template.fromDirectory('./test/data/bad-locale', options);
                expect(false).toBe(true);
            }
            catch (err) {
                // ignore
            }
        });

        // Test case for issue #23
        it('should create template from a directory that has node_modules with duplicate namespace', async () => {
            await expect(Template.fromDirectory('./test/data/with-node_modules', options)).resolves.toBeDefined();
        });

        // Skipping, this is an upstream issue in template-engine
        it.skip('should throw an error for property that is not declared', async () => {
            await expect(Template.fromDirectory('./test/data/bad-property', options)).rejects.toThrow('Unknown property: currency');
        });

        // Skipping, this is an upstream issue in template-engine
        it.skip('should throw an error for clause property that is not declared', async () => {
            await expect(Template.fromDirectory('./test/data/bad-copyright-license', options)).rejects.toThrow('Unknown property: badPaymentClause');
        });

        it('should create an archive for a template with two Ergo modules', async () => {
            await expect(Template.fromDirectory('./test/data/hellomodule', options)).resolves.toBeDefined();
        });
    });

    describe('#fromArchive', () => {

        it('should create a template from a signed template archive', async () => {
            const template = await Template.fromDirectory('./test/data/verifying-template-signature/helloworldstateUnsigned', options);
            const p12File = fs.readFileSync('./test/data/keystore/keystore.p12', { encoding: 'base64' });
            const keystore = {
                p12File: p12File,
                passphrase: 'password'
            };
            const archiveBuffer = await template.toArchive('es6', { keystore });
            await expect(Template.fromArchive(archiveBuffer)).resolves.toBeDefined();
        });

        it('should create a template from an archive', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            const buffer = await template.toArchive('es6');
            await expect(Template.fromArchive(buffer)).resolves.toBeDefined();
        });

        it('should throw an error if multiple template models are found', async () => {
            await writeZip('multiple-concepts');
            const buffer = fs.readFileSync('./test/data/archives/multiple-concepts.zip');
            await expect(Template.fromArchive(buffer)).rejects.toThrow('Failed to find a concept with the @template decorator. The model for the template must contain a single concept with the @template decoratpr.');
        });

        it('should throw an error if a package.json file does not exist', async () => {
            await writeZip('no-packagejson');
            const buffer = fs.readFileSync('./test/data/archives/no-packagejson.zip');
            await expect(Template.fromArchive(buffer)).rejects.toThrow('Failed to find package.json');
        });

        it('should create a template from archive and check if it has a logo', async () => {
            const template = await Template.fromDirectory('./test/data/logo@0.0.1');
            const buffer = await template.toArchive('es6');
            const template2 = await Template.fromArchive(buffer);
            expect(template2.getMetadata().getLogo()).toBeInstanceOf(Buffer);
        });

        it('should await updateExternalModels before returning from fromArchive', async () => {
            const { ModelManager } = require('@accordproject/concerto-core');

            // Build a buffer offline so no network call during setup
            const source = await Template.fromDirectory('./test/data/latedeliveryandpenalty', { offline: true });
            const buffer = await source.toArchive('es6');

            // Patch updateExternalModels with an async spy that sets a flag when resolved
            let externalModelsResolved = false;
            const original = ModelManager.prototype.updateExternalModels;
            ModelManager.prototype.updateExternalModels = async function () {
                // Simulate a small async delay (e.g. network call)
                await new Promise(resolve => setTimeout(resolve, 50));
                externalModelsResolved = true;
            };

            try {
                // Call fromArchive without offline flag — should hit updateExternalModels path
                await Template.fromArchive(buffer);
            } finally {
                ModelManager.prototype.updateExternalModels = original;
            }

            // If fromArchive correctly awaits updateExternalModels, the flag must be true here
            expect(externalModelsResolved).toBe(true);
        });
    });

    describe('#fromCompiledArchive', () => {
        // TODO
    });

    describe('#setSamples', () => {

        it('should not throw for valid samples object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            expect(() => template.setSamples({ default: 'sample text' })).not.toThrow();
        });

        it('should throw for null samples object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            expect(() => template.setSamples(null)).toThrow('sample.md is required');
        });
    });

    describe('#setSample', () => {

        it('should not throw for valid sample object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            expect(() => template.setSample('sample text', 'default')).not.toThrow();
        });
    });

    describe('#setRequest', () => {

        it('should set a new request', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const newrequest: any = {};
            newrequest.$class = 'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyRequest';
            newrequest.forceMajeure = true;
            newrequest.agreedDelivery = 'December 17, 2018 03:24:00';
            newrequest.deliveredAt = null;
            newrequest.goodsValue = 300.00;
            template.setRequest(newrequest);
            const updatedRequest = template.getMetadata().getRequest();
            expect(updatedRequest.$class).toBe('io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyRequest');
            expect(updatedRequest.forceMajeure).toBe(true);
            expect(updatedRequest.goodsValue).toBe(300.00);
        });
    });

    describe('#setReadme', () => {
        it('should preserve the logo after calling setReadme', async () => {
            const template = await Template.fromDirectory('./test/data/template-logo', options);
            expect(template.getMetadata().getLogo()).toBeInstanceOf(Buffer);
            template.setReadme('new readme text');
            expect(template.getMetadata().getLogo()).toBeInstanceOf(Buffer);
        });

        it('should not throw for valid readme text', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            expect(() => template.setReadme('readme text')).not.toThrow();
        });
    });

    describe('Metadata regression tests', () => {
        it('should preserve the logo after calling setSamples', async () => {
            const template = await Template.fromDirectory('./test/data/template-logo', options);
            expect(template.getMetadata().getLogo()).toBeInstanceOf(Buffer);
            template.setSamples({ default: 'new sample' });
            expect(template.getMetadata().getLogo()).toBeInstanceOf(Buffer);
        });

        it('should preserve the logo after calling setRequest', async () => {
            const template = await Template.fromDirectory('./test/data/template-logo', options);
            const newRequest = { $class: 'logo@0.0.1.Request' };
            template.setRequest(newRequest);
            expect(template.getMetadata().getLogo()).toBeInstanceOf(Buffer);
        });

        it('should preserve the logo after calling setPackageJson', async () => {
            const template = await Template.fromDirectory('./test/data/template-logo', options);
            const pkg = template.getMetadata().getPackageJson();
            pkg.name = 'new_name';
            template.setPackageJson(pkg);
            expect(template.getMetadata().getLogo()).toBeInstanceOf(Buffer);
        });
    });

    describe('#getRequestTypes', () => {

        it('should return request types for single accordclauselogic function', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getRequestTypes();
            expect(types).toEqual([
                'org.accordproject.runtime@0.2.0.Request',
                'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyRequest',
            ]);
        });

        it('should return request types when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic', options);
            const types = template.getRequestTypes();
            expect(types).toEqual([
                'org.accordproject.runtime@0.2.0.Request',
                'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyRequest'
            ]);
        });
    });

    describe('#getResponseTypes', () => {

        it('should return response type for single accordclauselogic function', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getResponseTypes();
            expect(types).toEqual([
                'org.accordproject.runtime@0.2.0.Response',
                'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyResponse',
            ]);
        });

        it('should return response type when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic');
            const types = template.getResponseTypes();
            expect(types).toEqual([
                'org.accordproject.runtime@0.2.0.Response',
                'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyResponse',]);
        });
    });

    describe('#getEmitTypes', () => {

        it('should return the default emit type for a clause without emit type declaration', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getEmitTypes();
            expect(types).toEqual([]);
        });

        it('should return emit type when declared in a clause', async () => {
            const template = await Template.fromDirectory('./test/data/helloemit', options);
            const types = template.getEmitTypes();
            expect(types).toEqual([
                'org.accordproject.helloemit@1.0.0.Greeting',
            ]);
        });

        it('should return empty array when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic', options);
            const types = template.getEmitTypes();
            expect(types).toEqual([]);
        });
    });

    describe('#getStateTypes', () => {

        it('should return the default state type for a clause without state type declaration', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getStateTypes();
            expect(types).toEqual([
                'org.accordproject.runtime@0.2.0.State',
            ]);
        });

        it('should return state type when declared in a clause', async () => {
            const template = await Template.fromDirectory('./test/data/helloemit', options);
            const types = template.getStateTypes();
            expect(types).toEqual([
                'org.accordproject.runtime@0.2.0.State',
                'org.accordproject.helloemit@1.0.0.HelloWorldState'
            ]);
        });

        it('should return state type when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic', options);
            const types = template.getStateTypes();
            expect(types).toEqual([
                'org.accordproject.runtime@0.2.0.State',
            ]);
        });
    });

    describe('#getHash', () => {
        it('should return a SHA-256 hash', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            expect(template.getHash()).toBe('46b9b9b027ae9df1a30f05ddfbe5e279bc7800793a0cac9ef41d6e3a8506fe12');
        });
    });

    describe('#getFactory', () => {
        it('should return a Factory', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const name = template.getFactory().constructor.name;
            expect(name).toBe('Factory');
        });
    });

    describe('#getSerializer', () => {
        it('should return a Serializer', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const name = template.getSerializer().constructor.name;
            expect(name).toBe('Serializer');
        });
    });

    describe('#setPackageJson', () => {
        it('should set the package json of the metadata', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.name = 'new_name';
            template.setPackageJson(packageJson);
            expect(template.getMetadata().getPackageJson().name).toBe('new_name');
        });
    });

    describe('#setKeywords', () => {
        it('should set the keywords of the metadatas package json', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.keywords = ['payment', 'car', 'automobile'];
            template.setPackageJson(packageJson);
            expect(template.getMetadata().getKeywords()).toEqual(['payment', 'car', 'automobile']);
        });

        it('should find a specific keyword of the metadatas package json', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.keywords = ['payment', 'car', 'automobile'];
            template.setPackageJson(packageJson);
            expect(template.getMetadata().getKeywords()[2]).toBe('automobile');
        });

        it('should return empty array if no keywords exist', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.keywords = [];
            template.setPackageJson(packageJson);
            expect(template.getMetadata().getKeywords()).toEqual([]);
        });
    });

    describe('#accept', () => {

        it('should accept a visitor', async () => {
            const visitor = {
                visit: function (thing, parameters) { }
            };
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            expect(() => template.accept(visitor, {})).not.toThrow();
        });
    });
});
