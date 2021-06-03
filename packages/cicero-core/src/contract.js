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

const forge = require('node-forge');
const crypto = require('crypto');
const fs = require('fs');

const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const TemplateInstance = require('./templateinstance.js');

/**
 * A Contract is executable business logic, linked to a natural language (legally enforceable) template.
 * A Clause must be constructed with a template and then prior to execution the data for the clause must be set.
 * Set the data for the clause (an instance of the template model) by either calling the setData method or by
 * calling the parse method and passing in natural language text that conforms to the template grammar.
 * @public
 * @class
 */
class Contract extends TemplateInstance {

    /**
     * Create the Clause and link it to a Template.
     * @param {Template} template  - the template for the clause
     */
     constructor(template) {
        super(template);
    }

     /**
     * Sign Instance
     * @param {string} contractText - contract text extracted from contract markdown
     * @param {object} signatureObject - contains signatures if existing parties who signed the contract. null if no one hasn't signed.
     * @param {string} keyStorePath - path of the keystore to be used
     * @param {string} keyStorePassword - password for the keystore file
     * @return {object} object conatining array of all signatures
     */
      signInstance(contractText, signatureObject, keyStorePath, keyStorePassword) {
        const ciceroMarkTransformer = new CiceroMarkTransformer();
        const dom = ciceroMarkTransformer.fromMarkdownCicero( contractText, 'json' );
        const resultText = this.formatCiceroMark(dom);
        const hasher = crypto.createHash('sha256');
        hasher.update(resultText);
        const instanceHash = hasher.digest('hex');
        
        if(signatureObject !== null){
            const contractHash = signatureObject.contractSignatures[0].contractHash;
            if(instanceHash === contractHash){
                const newSignatureObject = this.applySignature(instanceHash, keyStorePath, keyStorePassword);
                const signatureArray = signatureObject.contractSignatures.concat(newSignatureObject);
                const returnObject = {
                    contractSignatures : signatureArray
                }
                return returnObject;
            }else{
                return 'Signature failed as the agreed contract was changed.'
            }
        }else{
            const newSignatureObject = this.applySignature(instanceHash, keyStorePath, keyStorePassword);
            const signatureArray = [newSignatureObject];
            const returnObject = {
                contractSignatures : signatureArray
            }
            return returnObject;
        }

    }

    /**
     * Apply Signature
     * @param {string} instanceHash - Hash of the template instance
     * @param {string} keyStorePath - path of the keystore to be used
     * @param {string} keyStorePassword - password for the keystore file
     * @return {object} object containing signatory's metadata, timestamp, instance hash, signatory's certificate, signature
     */
    applySignature(instanceHash, keyStorePath, keyStorePassword) {
        const timeStamp = Date.now();
        const p12Ffile = fs.readFileSync(keyStorePath, { encoding: 'base64' });
        // decode p12 from base64
        const p12Der = forge.util.decode64(p12Ffile);
        // get p12 as ASN.1 object
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        // decrypt p12 using the password 'password'
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, keyStorePassword);
        //X509 cert forge type
        const certificateForge = p12.safeContents[0].safeBags[0].cert;
        const subjectAttributes = certificateForge.subject.attributes;
        //Private Key forge type
        const privateKeyForge = p12.safeContents[1].safeBags[0].key;
        //convert cert and private key from forge to PEM
        const certificatePem = forge.pki.certificateToPem(certificateForge);
        const privateKeyPem = forge.pki.privateKeyToPem(privateKeyForge);
        //convert private key in pem to private key type in node
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        const sign = crypto.createSign('SHA256');
        sign.write(instanceHash + timeStamp);
        sign.end();
        const signature = sign.sign(privateKey, 'hex');
        const signatureObject = {
            signatoryInfo: subjectAttributes,
            timeStamp: timeStamp,
            contractHash: instanceHash,
            signatoryCert: certificatePem,
            signature: signature
        };
        return signatureObject;
    }

    /**
     * Verify Signatures
     * @param {string} contractText - contract text extracted from contract markdown
     * @param {object} signatureObject - contains signatures if existing parties who signed the contract. null if no one hasn't signed.
     * @return {object} status and message for verificaion message
     */
    verifySignatures(contractText, signatureObject) {
        const ciceroMarkTransformer = new CiceroMarkTransformer();
        const dom = ciceroMarkTransformer.fromMarkdownCicero( contractText, 'json' );
        const resultText = this.formatCiceroMark(dom);
        const hasher = crypto.createHash('sha256');
        hasher.update(resultText);
        const instanceHash = hasher.digest('hex');
        const contractSignatures = signatureObject.contractSignatures;
        
        for (let i = 0; i < contractSignatures.length; i++) {
            const { signatoryInfo, timeStamp, contractHash, signatoryCert, signature } = contractSignatures[i];
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
            verify.write(instanceHash + timeStamp);
            verify.end();
            const result = verify.verify(publicKey, signature, 'hex');
            if (!result) {
                const returnObject = {
                    status: 'Failed',
                    msg: `Invalid Signature found`
                };
                return returnObject;
            }
        }
        const returnObject = {
            status: 'Success',
            msg: 'Contract Signatures Verified Successfully.'
        };
        return returnObject;
    }

}

module.exports = Contract;