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

const Instance = require('./instance');
const InstanceLoader = require('./instanceloader');
const InstanceSaver = require('./instancesaver');
const crypto = require('crypto');
const stringify = require('json-stable-stringify');
const forge = require('node-forge');

const Util = require('./util');

/**
 * A Contract is executable business logic, linked to a natural language (legally enforceable) template.
 * A Clause must be constructed with a template and then prior to execution the data for the clause must be set.
 * Set the data for the clause (an instance of the template model) by either calling the setData method or by
 * calling the parse method and passing in natural language text that conforms to the template grammar.
 * @public
 * @class
 */
class ContractInstance extends Instance {
    /**
     * Create an instance from a Template.
     * @param {Template} template  - the template for the instance
     * @return {object} - the clause instance
     */
    static fromTemplate(template) {
        return InstanceLoader.fromTemplate(ContractInstance, template);
    }

    /**
     * Create an instance from a Template with data.
     * @param {Template} template  - the template for the instance
     * @param {object} data - the contract data
     * @param {string} instantiator - name of the person/party which instantiates the contract instance
     * @return {object} - the clause instance
     */
    static fromTemplateWithData(template, data, instantiator) {
        const instance = InstanceLoader.fromTemplateWithData(ContractInstance, template, data, instantiator);

        //Add state
        Util.addHistory(
            instance,
            instance.instantiator,
            'instantiate',
            'Instantiated Succesfully',
            'Draft'
        );
        return instance;
    }

    /**
     * Create a smart legal contract archive
     * @param {string} runtime - the target runtime
     * @param {object} options - JSZip options
     * @return {Promise<Buffer>} the zlib buffer
     */
    toArchive(runtime, options) {
        return InstanceSaver.toArchive(this, runtime, options);
    }

    /**
     * Create a smart legal contract instance from an archive.
     * @param {Buffer} buffer  - the buffer to a Smart Legal Contract (slc) file
     * @param {object} options - additional options
     * @return {Promise<ContractInstance>} a Promise to the instance
     */
    static async fromArchive(buffer, options) {
        const instance = await InstanceLoader.fromArchive(ContractInstance, buffer, options);
        return instance;
    }

    /**
     * Sign a smart legal contract.
     * @param {String} p12File - base64 encoded string of p12 keystore file
     * @param {String} passphrase - passphrase for the keystore file
     * @param {String} signatory - name of the signatory
     * @return {Promise<Buffer>} the zlib buffer
     */
    async signContract(p12File, passphrase, signatory) {
        if (this.contractSignatures.length !== 0 ) {
            this.verifySignatures();
        }
        const timestamp = Date.now();
        this.sign(p12File, passphrase, timestamp, signatory);

        //Add state
        Util.addHistory(
            this,
            signatory,
            'sign',
            'Signed Succesfully',
            'Signing in Progress'
        );

        return this.toArchive('ergo');
    }

    /**
     * signs a string made up of contract hash and time stamp using private key derived
     * from the keystore
     * @param {String} p12File - base64 encoded string of p12 keystore file
     * @param {String} passphrase - passphrase for the keystore file
     * @param {Number} timestamp - timestamp of the moment of signature is done
     * @param {String} signatory - name of the signatory
     * @ppublic
     */
    sign(p12File, passphrase, timestamp, signatory) {
        if (typeof(p12File) !== 'string') {throw new Error('p12File should be of type String!');}
        if (typeof(passphrase) !== 'string') {throw new Error('passphrase should be of type String!');}
        if (typeof(timestamp) !== 'number') {throw new Error('timestamp should be of type Number!');}

        const instanceHash = this.getHash();
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
        const signatureObject = {
            signatory,
            instanceHash,
            timestamp,
            signatoryCert: certificatePem,
            signature
        };
        this.contractSignatures.push(signatureObject);
    }

    /**
     * Gets a content based SHA-256 hash for this contract instance. Hash
     * is based on the metadata for the contract instance plus the contents of
     * all the models and all the script files.
     * @return {string} the SHA-256 hash in hex format
     */
    getHash() {
        const content = {};
        content.metadata = this.metadata;
        if(this.parserManager.getTemplate()) {
            content.grammar = this.parserManager.getTemplate();
        }
        content.models = {};
        content.scripts = {};

        let modelFiles = this.getModelManager().getModels();
        modelFiles.forEach(function (file) {
            content.models[file.namespace] = file.content;
        });

        let scriptManager = this.getScriptManager();
        let scriptFiles = scriptManager.getScripts();
        scriptFiles.forEach(function (file) {
            content.scripts[file.getIdentifier()] = file.contents;
        });

        content.data = this.getData();

        const hasher = crypto.createHash('sha256');
        hasher.update(stringify(content));
        return hasher.digest('hex');
    }

    /**
     * Verify the signatures of the parties/individuals who signed the contract
     */
    verifySignatures() {
        if(this.contractSignatures.length > 0){
            this.contractSignatures.forEach((contractSignature)=>{
                const { timestamp, signatoryCert, signature } = contractSignature;
                this.verify(signature, timestamp, signatoryCert);
            });
        } else {
            throw new Error('The contract is not signed by any party/individual.');
        }
    }

    /**
     * Verify the signatures of a partcular party/individual
     * @param {string} signature  - cryptographic signature of the signatory generated while signing process
     * @param {number} timestamp - timestamp of signing of the contract
     * @param {string} signatoryCert  - x509 certificate of the signatory
     */
    verify(signature, timestamp, signatoryCert) {
        const contractHash = this.getHash();
        //X509 cert converted from PEM to forge type
        const certificateForge = forge.pki.certificateFromPem(signatoryCert);
        //public key in forge type
        const publicKeyForge = certificateForge.publicKey;
        //convert public key from forge to pem
        const publicKeyPem = forge.pki.publicKeyToPem(publicKeyForge);
        //convert public key in pem to public key type in node.
        const publicKey = crypto.createPublicKey(publicKeyPem);
        //signature verification process
        const verify = crypto.createVerify('SHA256');
        verify.write(contractHash + timestamp);
        verify.end();
        const result = verify.verify(publicKey, signature, 'hex');
        if (!result) {
            throw new Error('Contract signature is invalid!');
        }
    }
}

module.exports = ContractInstance;
