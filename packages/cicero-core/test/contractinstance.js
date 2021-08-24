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
const ContractInstance = require('../lib/contractinstance');

const chai = require('chai');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const forge = require('node-forge');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));


/* eslint-disable */

function sign(instanceHash, timestamp, p12File, passphrase){
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
    sign.write(instanceHash + timestamp);
    sign.end();
    const signature = sign.sign(privateKey, 'hex');
    return {signature: signature, certificate: certificatePem};
}

/* eslint-enable */

describe('ContractInstance', () => {
    const sampleText = fs.readFileSync(path.resolve(__dirname, 'data/copyright-license', 'text/sample.md'), 'utf8');

    describe('#parse', () => {
        it('should be able to set the data from copyright-license natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', { offline: true });
            const contract = ContractInstance.fromTemplate(template);
            contract.parse(sampleText);
        });
    });

    describe('#draft', () => {

        it('should be able to roundtrip copyright-license natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license');
            const contract = ContractInstance.fromTemplate(template);
            contract.parse(sampleText);
            const nl = await contract.draft();
            nl.should.equal(TemplateLoader.normalizeText(sampleText));
        });
    });

    describe('#sign', () => {
        it('should sign the content hash and timestamp string using the keystore', async() => {
            const buffer = fs.readFileSync('./test/data/signContract/latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc');
            const instance = await ContractInstance.fromArchive(buffer);
            const timestamp = Date.now();
            const instanceHash = instance.getHash();
            const signatory = 'party1';
            const p12File = fs.readFileSync('./test/data/signContract/keystore.p12', { encoding: 'base64' });
            const signatureData = sign(instanceHash, timestamp, p12File, 'password');
            instance.sign(p12File, 'password', timestamp, signatory);
            const result = instance.contractSignatures[0];
            const expected = {
                signatory,
                instanceHash,
                timestamp,
                signatoryCert: signatureData.certificate,
                signature: signatureData.signature
            };
            result.should.deep.equal(expected);
        });
    });

    describe('#verify', () => {
        it('should verify a contract signature', async() => {
            const buffer = fs.readFileSync('./test/data/signContract/latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.v1.slc');
            const instance = await ContractInstance.fromArchive(buffer);
            const timestamp = Date.now();
            const signatory = 'party1';
            const p12File = fs.readFileSync('./test/data/signContract/keystore.p12', { encoding: 'base64' });
            instance.sign(p12File, 'password', timestamp, signatory);
            const partySignature = instance.contractSignatures[1];
            const { signatoryCert, signature } = partySignature;
            (() => instance.verify(signature, timestamp, signatoryCert)).should.not.throw();
        });

        it('should throw error for failed signature verification', async() => {
            const buffer = fs.readFileSync('./test/data/signContract/latedeliveryandpenalty@0.17.0-a3d6e61ddfe056ec65e240053e1f13e4f95a3e7804027ca6bb5652d0d65ac8ba.slc');
            const instance = await ContractInstance.fromArchive(buffer);
            const partySignature = instance.contractSignatures[1];
            const { signatoryCert, signature, timestamp } = partySignature;
            return (() => instance.verify(signature, timestamp, signatoryCert)).should.throw('Contract signature is invalid!');
        });
    });

    describe('#verifySignatures', () => {
        it('should verify all contract signatures', async() => {
            const buffer = fs.readFileSync('./test/data/signContract/latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.v1.slc');
            const instance = await ContractInstance.fromArchive(buffer);
            const timestamp = Date.now();
            const signatory = 'party1';
            const p12File = fs.readFileSync('./test/data/signContract/keystore.p12', { encoding: 'base64' });
            instance.sign(p12File, 'password', timestamp, signatory);
            (() => instance.verifySignatures()).should.not.throw();
        });

        it('should throw error while verifying the contract signatures', async() => {
            const buffer = fs.readFileSync('./test/data/signContract/latedeliveryandpenalty@0.17.0-a3d6e61ddfe056ec65e240053e1f13e4f95a3e7804027ca6bb5652d0d65ac8ba.slc');
            const instance = await ContractInstance.fromArchive(buffer);
            return (() => instance.verifySignatures()).should.throw('Contract signature is invalid!');
        });
    });

    describe('#signContract', () => {
        it('should verify all contract signatures', async() => {
            const buffer = fs.readFileSync('./test/data/signContract/latedeliveryandpenalty@0.17.0-d0c1a14e8a7af52e0927a23b8b30af3b5a75bee1ab788a15736e603b88a6312c.slc');
            const instance = await ContractInstance.fromArchive(buffer);
            const signatory = 'party1';
            const p12File = fs.readFileSync('./test/data/signContract/keystore.p12', { encoding: 'base64' });
            const buffer2 = await instance.signContract(p12File, 'password', signatory);
            buffer2.should.not.be.null;
        });
    });
});