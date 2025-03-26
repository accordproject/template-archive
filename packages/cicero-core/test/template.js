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

const Template = require('../src/template');
const fs = require('fs');
const archiver = require('archiver');
const forge = require('node-forge');
const crypto = require('crypto');

const chai = require('chai');
const assert = require('chai').assert;

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

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
            archiveBuffer.should.not.be.null;
        });

        it('should create the archive and sign it', async () => {
            const template = await Template.fromDirectory('./test/data/signing-template/helloworldstate');
            const p12File = fs.readFileSync('./test/data/keystore/keystore.p12', { encoding: 'base64' });
            const keystore = {
                p12File: p12File,
                passphrase: 'password'
            };
            const archiveBuffer = await template.toArchive('es6', { keystore });
            archiveBuffer.should.not.be.null;
        });

        it('should throw an error if passphrase of the keystore is wrong', async () => {
            const template = await Template.fromDirectory('./test/data/signing-template/helloworldstate');
            const p12File = fs.readFileSync('./test/data/keystore/keystore.p12', { encoding: 'base64' });
            const keystore = {
                p12File: p12File,
                passphrase: '123'
            };
            return template.toArchive('es6', { keystore }).should.be.rejectedWith('PKCS#12 MAC could not be verified. Invalid password?');
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
                templateHash,
                timestamp,
                signatoryCert: signatureData.certificate,
                signature: signatureData.signature
            };
            result.should.deep.equal(expected);
        });
    });

    describe('#fromDirectory', () => {

        it('should create a template from a directory without signatures of the template developer', () => {
            return Template.fromDirectory('./test/data/verifying-template-signature/helloworldstateUnsigned', options).should.be.fulfilled;
        });

        it('should create a template from a directory with no @ClauseDataLogic in logic', () => {
            Template.fromDirectory('./test/data/no-logic', options)
                .catch(err => {
                    console.log(err);
                });
            return Template.fromDirectory('./test/data/no-logic', options).should.be.fulfilled;
        });

        it('should create a template from a directory with no logic', async () => {
            return Template.fromDirectory('./test/data/text-only', options);
        });

        it('should create a template from a directory with a model using @template', async () => {
            return Template.fromDirectory('./test/data/template-decorator', options);
        });

        it('should create a template from a directory and download external models by default', async () => {
            return Template.fromDirectory('./test/data/text-only').should.be.fulfilled;
        });

        it('should create a template from a directory', () => {
            return Template.fromDirectory('./test/data/latedeliveryandpenalty', options).should.be.fulfilled;
        });

        it('should throw error when date of the signature is tampered', async () => {
            return Template.fromDirectory('./test/data/verifying-template-signature/helloworldstateTamperDate', options).should.be.rejectedWith('Template\'s author signature is invalid!');
        });

        it('should throw error when the template signature is tampered', async () => {
            return Template.fromDirectory('./test/data/verifying-template-signature/helloworldstateTamperSign', options).should.be.rejectedWith('Template\'s author signature is invalid!');
        });

        it('should create a template with logo', () => {
            const templatePromise = Template.fromDirectory('./test/data/template-logo', options);
            return templatePromise.then((template) => template.getMetadata().getLogo().should.be.an.instanceof(Buffer));
        });

        it('should create a template without a logo if image is not named \'logo.png\'', () => {
            const templatePromise = Template.fromDirectory('./test/data/wrong-name-template-logo', options);
            return templatePromise.then((template) => assert.equal(template.getMetadata().getLogo(), null));
        });

        it('should roundtrip a template with a logo', async () => {
            const template = await Template.fromDirectory('./test/data/template-logo', options);
            template.getIdentifier().should.equal('logo@0.0.1');
            template.getHash().should.be.equal('04f5ed5fe80b06fdde7083d6f82563808aa45942c6929cf268cb531bf5283cb2');
            template.getMetadata().getLogo().should.be.an.instanceof(Buffer);
            template.getMetadata().getSample().should.equal('"Aman" "Sharma" added the support for logo and hence created this template for testing!\n');
            const buffer = await template.toArchive('es6');
            buffer.should.not.be.null;
            const template2 = await Template.fromArchive(buffer);
            template2.getIdentifier().should.equal(template.getIdentifier());
            template2.getHash(template.getHash());
            template2.getMetadata().getLogo().should.deep.equal(template.getMetadata().getLogo());
            template2.getMetadata().getSample().should.equal(template.getMetadata().getSample());
        });

        it('should roundtrip a source template (CR)', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-cr', options);
            template.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1');
            template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty@0.1.0').should.not.be.null;
            template.getMetadata().getREADME().should.not.be.null;
            template.getMetadata().getRequest().should.not.be.null;
            template.getMetadata().getKeywords().should.not.be.null;
            template.getName().should.equal('latedeliveryandpenalty', options);
            template.getDisplayName().should.equal('Latedeliveryandpenalty');
            template.getDescription().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            template.getVersion().should.equal('0.0.1');
            template.getMetadata().getSample().should.equal('Late Delivery and Penalty.\n\nIn case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.\n');
            template.getHash().should.equal('a2ed60c23868edbbf6ea957652d3809ec2d89aca1eab55164b15623674d08f06');
            const buffer = await template.toArchive('es6');
            buffer.should.not.be.null;
            const template2 = await Template.fromArchive(buffer);
            template2.getIdentifier().should.equal(template.getIdentifier());
            template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty@0.1.0').should.not.be.null;
            template2.getMetadata().getREADME().should.equal(template.getMetadata().getREADME());
            template2.getMetadata().getKeywords().should.eql(template.getMetadata().getKeywords());
            template2.getMetadata().getSamples().should.eql(template.getMetadata().getSamples());
            // Hash doesn't match because setting a target language changes the hash
            template2.getHash().should.equal('3f04cb19df1a5b562661a39692780570b23e299f7985cd3f88e2721350906e89');
            template.getDisplayName().should.equal('Latedeliveryandpenalty');
            const buffer2 = await template2.toArchive('es6');
            buffer2.should.not.be.null;
        });

        it('should roundtrip a compiled template (JavaScript)', async function () {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty_js', options);
            template.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1');
            template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template.getMetadata().getREADME().should.not.be.null;
            template.getMetadata().getRequest().should.not.be.null;
            template.getMetadata().getKeywords().should.not.be.null;
            template.getName().should.equal('latedeliveryandpenalty');
            template.getDescription().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            template.getVersion().should.equal('0.0.1');
            template.getMetadata().getSample().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.');
            template.getHash().should.equal('64644d0e40f601a8ccc3a01251bdb1d9cc5a9b32215dd410d834ccc971f6fd2c');
            const buffer = await template.toArchive('es6');
            buffer.should.not.be.null;
            const template2 = await Template.fromArchive(buffer);
            template2.getIdentifier().should.equal(template.getIdentifier());
            template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template2.getMetadata().getREADME().should.equal(template.getMetadata().getREADME());
            template2.getMetadata().getKeywords().should.eql(template.getMetadata().getKeywords());
            template2.getMetadata().getSamples().should.eql(template.getMetadata().getSamples());
            template2.getHash().should.equal(template.getHash());
            const buffer2 = await template2.toArchive('es6');
            buffer2.should.not.be.null;
        });

        it('should throw an error if multiple template models are found', async () => {
            return Template.fromDirectory('./test/data/multiple-concepts', options).should.be.rejectedWith('Failed to find a concept with the @template decorator. The model for the template must contain a single concept with the @template decoratpr');
        });

        it('should throw an error if no template models are found', async () => {
            return Template.fromDirectory('./test/data/no-concepts', options).should.be.rejectedWith('Failed to find a concept with the @template decorator. The model for the template must contain a single concept with the @template decoratpr');
        });

        it('should throw an error if a package.json file does not exist', async () => {
            try {
                await Template.fromDirectory('./test/data/no-packagejson', options);
                assert.isOk(false, 'should throw an error if a package.json file does not exist');
            }
            catch (err) {
                // ignore
            }
        });

        it('should create a template from a directory with a locale sample', () => {
            return Template.fromDirectory('./test/data/locales-conga', options).should.be.fulfilled;
        });

        it('should throw an error if a text/sample.md file does not exist', async () => {
            try {
                await Template.fromDirectory('./test/data/no-sample', options);
                assert.isOk(false, 'should throw an error if a text/sample.md file does not exist');
            }
            catch (err) {
                // ignore
            }
        });

        it('should throw an error if the locale is not in the IETF format', async () => {
            try {
                await Template.fromDirectory('./test/data/bad-locale', options);
                assert.isOk(false, 'should throw an error if the locale is not in the IETF format');
            }
            catch (err) {
                // ignore
            }
        });

        // Test case for issue #23
        it('should create template from a directory that has node_modules with duplicate namespace', () => {
            return Template.fromDirectory('./test/data/with-node_modules', options).should.be.fulfilled;
        });

        // Skipping, this is an upstream issue in template-engine
        it.skip('should throw an error for property that is not declared', () => {
            return Template.fromDirectory('./test/data/bad-property', options).should.be.rejectedWith('Unknown property: currency');
        });

        // Skipping, this is an upstream issue in template-engine
        it.skip('should throw an error for clause property that is not declared', () => {
            return Template.fromDirectory('./test/data/bad-copyright-license', options).should.be.rejectedWith('Unknown property: badPaymentClause');
        });

        it('should create an archive for a template with two Ergo modules', async () => {
            return Template.fromDirectory('./test/data/hellomodule', options).should.be.fulfilled;
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
            return Template.fromArchive(archiveBuffer).should.be.fulfilled;
        });

        it('should create a template from an archive', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');
            const buffer = await template.toArchive('es6');
            return Template.fromArchive(buffer).should.be.fulfilled;
        });

        it('should throw an error if multiple template models are found', async () => {
            await writeZip('multiple-concepts');
            const buffer = fs.readFileSync('./test/data/archives/multiple-concepts.zip');
            return Template.fromArchive(buffer).should.be.rejectedWith('Failed to find a concept with the @template decorator. The model for the template must contain a single concept with the @template decoratpr.');
        });

        it('should throw an error if a package.json file does not exist', async () => {
            await writeZip('no-packagejson');
            const buffer = fs.readFileSync('./test/data/archives/no-packagejson.zip');
            return Template.fromArchive(buffer).should.be.rejectedWith('Failed to find package.json');
        });

        it('should create a template from archive and check if it has a logo', async () => {
            const template = await Template.fromDirectory('./test/data/logo@0.0.1');
            const buffer = await template.toArchive('es6');
            const template2 = await Template.fromArchive(buffer);
            template2.getMetadata().getLogo().should.be.an.instanceof(Buffer);
        });
    });

    describe('#fromCompiledArchive', () => {
        // TODO
    });

    describe('#setSamples', () => {

        it('should not throw for valid samples object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            return (() => template.setSamples({ default: 'sample text' })).should.not.throw();
        });

        it('should throw for null samples object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            return (() => template.setSamples(null)).should.throw('sample.md is required');
        });
    });

    describe('#setSample', () => {

        it('should not throw for valid sample object', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            return (() => template.setSample('sample text', 'default')).should.not.throw();
        });
    });

    describe('#setRequest', () => {

        it('should set a new request', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const newrequest = {};
            newrequest.$class = 'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyRequest';
            newrequest.forceMajeure = true;
            newrequest.agreedDelivery = 'December 17, 2018 03:24:00';
            newrequest.deliveredAt = null;
            newrequest.goodsValue = 300.00;
            template.setRequest(newrequest);
            const updatedRequest = template.getMetadata().getRequest();
            updatedRequest.$class.should.equal('io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyRequest');
            updatedRequest.forceMajeure.should.equal(true);
            updatedRequest.goodsValue.should.equal(300.00);
        });
    });

    describe('#setReadme', () => {

        it('should not throw for valid readme text', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            return (() => template.setReadme('readme text')).should.not.throw();
        });
    });

    describe('#getRequestTypes', () => {

        it('should return request types for single accordclauselogic function', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getRequestTypes();
            types.should.be.eql([
                'org.accordproject.runtime@0.2.0.Request',
                'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyRequest',
            ]);
        });

        it('should return request types when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic', options);
            const types = template.getRequestTypes();
            types.should.be.eql([
                'org.accordproject.runtime@0.2.0.Request',
                'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyRequest'
            ]);
        });
    });

    describe('#getResponseTypes', () => {

        it('should return response type for single accordclauselogic function', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getResponseTypes();
            types.should.be.eql([
                'org.accordproject.runtime@0.2.0.Response',
                'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyResponse',
            ]);
        });

        it('should return response type when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic');
            const types = template.getResponseTypes();
            types.should.be.eql([
                'org.accordproject.runtime@0.2.0.Response',
                'io.clause.latedeliveryandpenalty@0.1.0.LateDeliveryAndPenaltyResponse',]);
        });
    });

    describe('#getEmitTypes', () => {

        it('should return the default emit type for a clause without emit type declaration', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getEmitTypes();
            types.should.be.eql([]);
        });

        it('should return emit type when declared in a clause', async () => {
            const template = await Template.fromDirectory('./test/data/helloemit', options);
            const types = template.getEmitTypes();
            types.should.be.eql([
                'org.accordproject.helloemit@1.0.0.Greeting',
            ]);
        });

        it('should return empty array when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic', options);
            const types = template.getEmitTypes();
            types.should.be.eql([]);
        });
    });

    describe('#getStateTypes', () => {

        it('should return the default state type for a clause without state type declaration', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getStateTypes();
            types.should.be.eql([
                'org.accordproject.runtime@0.2.0.State',
            ]);
        });

        it('should return state type when declared in a clause', async () => {
            const template = await Template.fromDirectory('./test/data/helloemit', options);
            const types = template.getStateTypes();
            types.should.be.eql([
                'org.accordproject.runtime@0.2.0.State',
                'org.accordproject.helloemit@1.0.0.HelloWorldState'
            ]);
        });

        it('should return state type when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic', options);
            const types = template.getStateTypes();
            types.should.be.eql([
                'org.accordproject.runtime@0.2.0.State',
            ]);
        });
    });

    describe('#getHash', () => {
        it('should return a SHA-256 hash', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.getHash().should.equal('990212319c292d968b1d80012db4f14e002f9da3780326fcd06d3e48468901c0');
        });
    });

    describe('#getFactory', () => {
        it('should return a Factory', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const name = template.getFactory().constructor.name;
            name.should.be.equal('Factory');
        });
    });

    describe('#getSerializer', () => {
        it('should return a Serializer', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const name = template.getSerializer().constructor.name;
            name.should.be.equal('Serializer');
        });
    });

    describe('#setPackageJson', () => {
        it('should set the package json of the metadata', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.name = 'new_name';
            template.setPackageJson(packageJson);
            template.getMetadata().getPackageJson().name.should.be.equal('new_name');
        });
    });

    describe('#setKeywords', () => {
        it('should set the keywords of the metadatas package json', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.keywords = ['payment', 'car', 'automobile'];
            template.setPackageJson(packageJson);
            template.getMetadata().getKeywords().should.be.deep.equal(['payment', 'car', 'automobile']);
        });

        it('should find a specific keyword of the metadatas package json', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.keywords = ['payment', 'car', 'automobile'];
            template.setPackageJson(packageJson);
            template.getMetadata().getKeywords()[2].should.be.equal('automobile');
        });

        it('should return empty array if no keywords exist', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const packageJson = template.getMetadata().getPackageJson();
            packageJson.keywords = [];
            template.setPackageJson(packageJson);
            template.getMetadata().getKeywords().should.be.deep.equal([]);
        });
    });

    describe('#accept', () => {

        it('should accept a visitor', async () => {
            const visitor = {
                visit: function (thing, parameters) { }
            };
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            return (() => template.accept(visitor, {})).should.not.throw();
        });
    });
});
