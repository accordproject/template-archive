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
const Clause = require('../lib/clause');

const forge = require('node-forge');
const fs = require('fs');
const archiver = require('archiver');

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

async function writeZip(template){
    try {
        fs.mkdirSync('./test/data/archives');
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
    let output = fs.createWriteStream(`./test/data/archives/${template}.zip`);
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(output);
    archive.directory(`test/data/${template}/`, false);
    archive.finalize();

    return await waitForEvent(output, 'close');
}
/* eslint-enable */

const options = { skipUpdateExternalModels: true };

describe('Template', () => {

    describe('#toArchive', () => {

        it('should create a signed archive', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const certb64 = 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUMzRENDQWNTZ0F3SUJBZ0lCQVRBTkJna3Foa2lHOXcwQkFRc0ZBREFaTVJjd0ZRWURWUVFEREE1U2IzbHoKSUZSbGMzUWdRMEVnTVRBZUZ3MHhPVEE0TVRZeU1EQTVNemRhRncweU1EQTRNVFV5TURBNU16ZGFNQjR4SERBYQpCZ05WQkFNTUUxSnZlWE1nUTI5a1pTQlRhV2R1YVc1bklERXdnZ0VpTUEwR0NTcUdTSWIzRFFFQkFRVUFBNElCCkR3QXdnZ0VLQW9JQkFRQ3BpVUd2aE5SUkYyTkk0aFRmdWpXaTVicUVhck5acVJTbzU2dEd4c2oxYWVPRWpkeDkKcDBFR0FrOVlCTkRvdXVZMDVJK1VqK2I2ZmRyNWVPZ1dxK2JiS05VZ2d1ckgwN2tEMzYwNTZkM3F5TWJYZXJZQQppUzUvTkVocEZacWdQN0hYb1liRDc5M2l1L1BCRW1FMSs5N1ZlVFRsNXg5WHNxQTVxM3B1bTRGN1lVY3c0N2ZHCnRwNm1SaStseVJMQWltOHZkcHNyc21hNHU1NWdpUHZ2Q1NIU2hhYzd3Sk1xQ3JTNUVLMTZURVVoSnlPUHJNWGsKWnNyL3JqamRkaEVRbDJscXNSUTlrOHlMN2dLd3NRSFBtSnc5c1hMemc5QzBaRll6Q0lBYmVBRVFUSUJXUzNCNApIN0hXQlRZV1AvaVhYRzBzU05heDNrd29UbndoNCtaaVF4WC9BZ01CQUFHaktqQW9NQTRHQTFVZER3RUIvd1FFCkF3SUhnREFXQmdOVkhTVUJBZjhFRERBS0JnZ3JCZ0VGQlFjREF6QU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUEKb2NHaXJxcXBOUlJBNFlhcUZUNUx6UnV6U2FoSGNoYzNQUHhPRk9OTGtKalRUVVFVT2UzbUF3NFM3NXF4c0luWQpsdGp0djkxeS9YN04vL0preHphTWJoSVpIOWlreEhzRzhEY2RubVRaeEplRll4Y1phdlhsV1ptejBCOEJoRjgxClByUGZwcEtLV1kvcE5UeHFLbHlkS0ZDbjhwU0hWTzZ4YkdRSHFwVHBFbE8xamtUeUFVcDl3TXNxNTk5Tm05bjEKZDVCU0szcWV6RXNweTJQb3ZmWC9DRG1lQ2REcHBBNHptRXFVd3ZMNmtwMjFYdjEwQ243dW5ZTjdhY3ZwSkdTTwo5WFdudGp2eGZBaWxDbGtoZmppNnZMSkdNRDFhNEtxQ28vODJ1RmRHZXowekQvWlU1NlU2RE5CL1d0VWlrUnY1CkRmampMRDh0VHFsWUJNSEwzRmtCMnc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==';
            const keyb64 = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBcVlsQnI0VFVVUmRqU09JVTM3bzFvdVc2aEdxeldha1VxT2VyUnNiSTlXbmpoSTNjCmZhZEJCZ0pQV0FUUTZMcm1OT1NQbEkvbStuM2ErWGpvRnF2bTJ5alZJSUxxeDlPNUE5K3RPZW5kNnNqRzEzcTIKQUlrdWZ6UklhUldhb0QreDE2R0d3Ky9kNHJ2endSSmhOZnZlMVhrMDVlY2ZWN0tnT2F0NmJwdUJlMkZITU9PMwp4cmFlcGtZdnBja1N3SXB2TDNhYks3Sm11THVlWUlqNzd3a2gwb1duTzhDVEtncTB1UkN0ZWt4RklTY2pqNnpGCjVHYksvNjQ0M1hZUkVKZHBhckVVUFpQTWkrNENzTEVCejVpY1BiRnk4NFBRdEdSV013aUFHM2dCRUV5QVZrdHcKZUIreDFnVTJGai80bDF4dExFaldzZDVNS0U1OEllUG1Za01WL3dJREFRQUJBb0lCQUM0cHJwWVJVQktva0tORwoxREk3TE9Hbk5ndGFWbTJpaVhxWVlsM0tRT3Y2SWpaMHZrWUVwY0x5SEJLMmRQLzU3RGNZeVRQRm56b3p6TTFECks4Y0lsYnExT3BzNHFwOHd1bDhncDdWdVJidnBZYU5JeVlnSjBueFdpeVQ1K2ZtS2ZtMWRrU21IQmQ3NEdKNUkKMStsd0pMUHg1Z0ozMVdQMndvUVJlaXZsOGZMYkQ0N3BxRC9MOG9tbkRPVmsyTmZwOVRxOGwzZXppVTJwakk2bApPa0VkTGpQVktlQ2p3bk5pR3RHcWNNdW1NamphKzRmUlBkOXdzbEFVb21iN1JOUjNrUGt0YUFlWUVEVHc3QzVpCjgvcjhUbXhqMXNoSEJFRUNadmY0NU5UUDhRM3ZvMml1WnIzVEVCMC85N2NMZTRmWVJOdituSExvWDEvcHNVeW0KdERkL25MRUNnWUVBMlR4TlN3ZmtKOElwS0RhV3FINXdiN2l4bkVxUExhUEJNbGliaXZyNk8xcThHb3ZkQ2EyaQowYTBsZ0Y1R25xYmJ0SmExMU9RZmRka0hSQzNES0hNRXNZN0h3cUFkYm0rdmxNenRjY1NZYVRhNnVpTkhBN0RNCk9nV2ZNMEJCbzlJbGhKdk1wb0pIN1ZWMDU2ZEk3Z3BtRG0vdjJ1aTlxbHFub216ZWcvZUFpaWtDZ1lFQXg4bjIKbUs0UVB5Mktkd1lMMWYrTjhEQ3FGSDZLQmt1Tk5HR0l2L05Wclh5RUluV21kMFBLSEFDam9KZHNvK3hsMmxNZAoyZjY4U0dMdkRQY0FnZTZ4VTJLUnpvWUl6OXVWNzhXUWJkdWdnZHlLSXUxa0ZoT2I1YzAxN2s3Qm50R281TDMwCmo3MzBYN2dDUlFJVDhJMHFoV2g1dmkxekxHaHRXWDZCMGtoR2MrY0NnWUVBdVdEQ1BNTVJLZlNBbHJadXZuNlgKaUY4K0FiZUdrMVhvcWdQL1NBeUF1V0htbjJpM1NXa0pScERSTGNoRnoyRm9uNlQwcWlXNXl5RlhHQkZOTnhsZgo2ZjJEN2t3Z2tYdHhoRE9VZEw5bHFITnh5U0lObWRLbmxPUHpSUk1TY0xBR0lER3I1SFBNMlhWUmU5Vy9ZSk16CklDTFp0aDlpcXhzTmJvZ2xJc3gwdm5FQ2dZQWVwWDliT2xBcHNNMnRwbExJZDlRSkJSNEIyTXRKWGV1Q0huZ0EKb2M0QnQ3ajVKRHp0ekl0RE1tSG5MM010emdSdHNoUkJMVThxZDJxZC9ZR3BiTGpzeHBFQk1oUkY5alFRdktpRQpBWTJrZmZUK21KV2l3VTFIdWV2TTYyM044L0ZKYlU0SGdxYnF5K29sTmNWalAvUkcxSmpnTUU2YmdFVk4xaGNKCjc2Wkcvd0tCZ0hHR0J4T0VRWFZ5cG5ZV3BTZUw5Z2lXY1hZY24rRnFEWW5LTHZ1VE1yYmJ2NTlmc1VaWXRmTWoKajBhbDJNdlV3ZTAvUXJZTTluTXhXblZjZG10bSt4bWo1VXdSaU16NXczNnRPY3I2RDV3Zis5MFI5SWpoeFl1Wgo4T3JHR1ZMNVl0YzZFVytoT0dZcTV5Y3hObm5MM3BVUXlrWG81YjFPamZZaHYrMUs0cGVWCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg==';
            const cert = forge.pki.certificateFromPem(forge.util.decode64(certb64));
            const key = forge.pki.privateKeyFromPem(forge.util.decode64(keyb64));
            const buffer = await template.toArchive('ergo', {}, {cert: cert, key: key});
            buffer.should.not.be.null;
        });
    });

    describe('#fromDirectory', () => {

        it('should create a template from a directory with no @AccordClauseLogic in logic', () => {
            return Template.fromDirectory('./test/data/no-logic', options).should.be.fulfilled;
        });

        it('should create a template from a directory with no logic', async () => {
            const template = await Template.fromDirectory('./test/data/text-only', options);
            template.hasLogic().should.equal(true);
        });

        it('should create a template from a directory and download external models by default', async () => {
            return Template.fromDirectory('./test/data/text-only').should.be.fulfilled;
        });

        it('should create a template from a directory', () => {
            return Template.fromDirectory('./test/data/latedeliveryandpenalty', options).should.be.fulfilled;
        });

        it('should throw error when Ergo logic does not parse', async () => {
            return Template.fromDirectory('./test/data/bad-logic', options).should.be.rejectedWith('Parse error (at file logic/logic.ergo line 14 col 4). \n    define agreed = request.agreedDelivery;\n    ^^^^^^                                 ');
        });

        it('should throw an error if archive language is not a valid target', async () => {
            const templatePromise = Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            return templatePromise.then((template) => template.toArchive('foo')).should.be.rejectedWith('Unknown target: foo (available: es5,es6,cicero,java)');
        });

        it('should throw an error if archive language is is absent', async () => {
            const templatePromise = Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            return templatePromise.then((template) => template.toArchive()).should.be.rejectedWith('language is required and must be a string');
        });

        it('should roundtrip a source template (Ergo)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.hasLogic().should.equal(true);
            template.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1');
            template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template.getParserManager().getGrammar().should.not.be.null;
            template.getScriptManager().getScripts().length.should.equal(1);
            template.getScriptManager().getLogic().length.should.equal(1);
            template.getMetadata().getREADME().should.not.be.null;
            template.getMetadata().getRequest().should.not.be.null;
            template.getMetadata().getKeywords().should.not.be.null;
            template.getName().should.equal('latedeliveryandpenalty', options);
            template.getDisplayName().should.equal('Latedeliveryandpenalty');
            template.getDescription().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            template.getVersion().should.equal('0.0.1');
            template.getMetadata().getSample().should.equal(`Late Delivery and Penalty
----

In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed.
1. Any fractional part of a days is to be considered a full days.
1. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery.
1. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.`);
            template.getHash().should.equal('3652879e7e86ddead7d4d83b91fac48abd4050551f84032613e6f3b4dd051f80');
            const buffer = await template.toArchive('ergo');
            buffer.should.not.be.null;
            const template2 = await Template.fromArchive(buffer);
            template2.getIdentifier().should.equal(template.getIdentifier());
            template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template2.getParserManager().getGrammar().should.not.be.null;
            template2.getParserManager().getTemplatizedGrammar().should.equal(template.getParserManager().getTemplatizedGrammar());
            template2.getScriptManager().getScripts().length.should.equal(template.getScriptManager().getScripts().length);
            template2.getMetadata().getREADME().should.equal(template.getMetadata().getREADME());
            template2.getMetadata().getKeywords().should.eql(template.getMetadata().getKeywords());
            template2.getMetadata().getSamples().should.eql(template.getMetadata().getSamples());
            template2.getHash().should.equal(template.getHash());
            template.getDisplayName().should.equal('Latedeliveryandpenalty');
            const buffer2 = await template2.toArchive('ergo');
            buffer2.should.not.be.null;
        });

        it('should roundtrip a source template (CR)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty-cr', options);
            template.hasLogic().should.equal(true);
            template.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1');
            template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template.getParserManager().getGrammar().should.not.be.null;
            template.getScriptManager().getScripts().length.should.equal(1);
            template.getScriptManager().getLogic().length.should.equal(1);
            template.getMetadata().getREADME().should.not.be.null;
            template.getMetadata().getRequest().should.not.be.null;
            template.getMetadata().getKeywords().should.not.be.null;
            template.getName().should.equal('latedeliveryandpenalty', options);
            template.getDisplayName().should.equal('Latedeliveryandpenalty');
            template.getDescription().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            template.getVersion().should.equal('0.0.1');
            template.getMetadata().getSample().should.equal('Late Delivery and Penalty.\n\nIn case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7.0% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2.0% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.\n');
            template.getHash().should.equal('a608eb805bd3c5f82b6a0b97695c5f0f12f643165ad95be8c8697ebd155f4282');
            const buffer = await template.toArchive('ergo');
            buffer.should.not.be.null;
            const template2 = await Template.fromArchive(buffer);
            template2.getIdentifier().should.equal(template.getIdentifier());
            template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template2.getParserManager().getGrammar().should.not.be.null;
            template2.getParserManager().getTemplatizedGrammar().should.equal(template.getParserManager().getTemplatizedGrammar());
            template2.getScriptManager().getScripts().length.should.equal(template.getScriptManager().getScripts().length);
            template2.getMetadata().getREADME().should.equal(template.getMetadata().getREADME());
            template2.getMetadata().getKeywords().should.eql(template.getMetadata().getKeywords());
            template2.getMetadata().getSamples().should.eql(template.getMetadata().getSamples());
            template2.getHash().should.equal(template.getHash());
            template.getDisplayName().should.equal('Latedeliveryandpenalty');
            const buffer2 = await template2.toArchive('ergo');
            buffer2.should.not.be.null;
        });

        it('should roundtrip a compiled template (JavaScript)', async function() {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty_js', options);
            template.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1');
            template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template.getParserManager().getGrammar().should.not.be.null;
            template.getScriptManager().getScripts().length.should.equal(1);
            template.getMetadata().getREADME().should.not.be.null;
            template.getMetadata().getRequest().should.not.be.null;
            template.getMetadata().getKeywords().should.not.be.null;
            template.getName().should.equal('latedeliveryandpenalty');
            template.getDescription().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
            template.getVersion().should.equal('0.0.1');
            template.getMetadata().getSample().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 days of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 weeks, the Buyer is entitled to terminate this Contract.');
            template.getHash().should.equal('59aa7dff1eb1bb80145baa891021c7b95f408431dca39e32f364c32115fa8f43');
            const buffer = await template.toArchive('cicero');
            buffer.should.not.be.null;
            const template2 = await Template.fromArchive(buffer);
            template2.getIdentifier().should.equal(template.getIdentifier());
            template2.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
            template2.getParserManager().getGrammar().should.not.be.null;
            template2.getParserManager().getTemplatizedGrammar().should.equal(template.getParserManager().getTemplatizedGrammar());
            template2.getScriptManager().getScripts().length.should.equal(template.getScriptManager().getScripts().length);
            template2.getMetadata().getREADME().should.equal(template.getMetadata().getREADME());
            template2.getMetadata().getKeywords().should.eql(template.getMetadata().getKeywords());
            template2.getMetadata().getSamples().should.eql(template.getMetadata().getSamples());
            template2.getHash().should.equal(template.getHash());
            const buffer2 = await template2.toArchive('cicero');
            buffer2.should.not.be.null;
        });

        it('should throw an error if multiple template models are found', async () => {
            return Template.fromDirectory('./test/data/multiple-concepts', options).should.be.rejectedWith('Found multiple instances of org.accordproject.cicero.contract.AccordClause in conga. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordClause.');
        });

        it('should throw an error if no template models are found', async () => {
            return Template.fromDirectory('./test/data/no-concepts', options).should.be.rejectedWith('Failed to find an asset that extends org.accordproject.cicero.contract.AccordClause in conga. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordClause.');
        });

        it('should throw an error if a package.json file does not exist', async () => {
            try {
                await Template.fromDirectory('./test/data/no-packagejson', options);
                assert.isOk(false,'should throw an error if a package.json file does not exist');
            }
            catch(err) {
                // ignore
            }
        });

        it('should create a template from a directory with a locale sample', () => {
            return Template.fromDirectory('./test/data/locales-conga', options).should.be.fulfilled;
        });

        it('should throw an error if a text/sample.md file does not exist', async () => {
            try {
                await Template.fromDirectory('./test/data/no-sample', options);
                assert.isOk(false,'should throw an error if a text/sample.md file does not exist');
            }
            catch(err) {
                // ignore
            }
        });

        it('should throw an error if the locale is not in the IETF format', async () => {
            try {
                await Template.fromDirectory('./test/data/bad-locale', options);
                assert.isOk(false,'should throw an error if the locale is not in the IETF format');
            }
            catch(err) {
                // ignore
            }
        });

        // Test case for issue #23
        it('should create template from a directory that has node_modules with duplicate namespace', () => {
            return Template.fromDirectory('./test/data/with-node_modules', options).should.be.fulfilled;
        });

        it('should throw an error for property that is not declared', () => {
            return Template.fromDirectory('./test/data/bad-property', options).should.be.rejectedWith('Template references a property \'currency\' that is not declared in the template model');
        });

        it('should throw an error for clause property that is not declared', () => {
            return Template.fromDirectory('./test/data/bad-copyright-license', options).should.be.rejectedWith('Template references a property \'badPaymentClause\' that is not declared in the template model');
        });

        it('should create an archive for a template with two Ergo modules', async () => {
            return Template.fromDirectory('./test/data/hellomodule', options).should.be.fulfilled;
        });

        it('should fail creating an archive for a template for a wrong Ergo module call', async () => {
            return Template.fromDirectory('./test/data/hellomodule-bug', options).should.be.rejectedWith('Type error (at file logic/logic.ergo line 23 col 11). This operator received unexpected arguments');
        });
    });

    describe('#fromArchive', () => {

        it('should create a template from an archive', async () => {
            const buffer = fs.readFileSync('./test/data/latedeliveryandpenalty.cta');
            return Template.fromArchive(buffer).should.be.fulfilled;
        });

        it('should throw an error if multiple template models are found', async () => {
            await writeZip('multiple-concepts');
            const buffer = fs.readFileSync('./test/data/archives/multiple-concepts.zip');
            return Template.fromArchive(buffer).should.be.rejectedWith('Found multiple instances of org.accordproject.cicero.contract.AccordClause in conga. The model for the template must contain a single asset that extends org.accordproject.cicero.contract.AccordClause.');
        });

        it('should throw an error if a package.json file does not exist', async () => {
            await writeZip('no-packagejson');
            const buffer = fs.readFileSync('./test/data/archives/no-packagejson.zip');
            return Template.fromArchive(buffer).should.be.rejectedWith('Failed to find package.json');
        });
    });

    describe('#fromUrl', () => {

        it('should throw an error if an archive loader cannot be found', async () => {

            try {
                await Template.fromUrl('ab://ip-payment@0.9.0#hash', null);
                assert.isOk(false,'should throw an error if an archive loader cannot be found');
            }
            catch(err) {
                // ignore
            }
        });

        it('should create a template from an archive at a given URL', async () => {
            const url = 'https://templates.accordproject.org/archives/ip-payment@0.12.0.cta';
            return Template.fromUrl(url, null).should.be.fulfilled;
        });

        it('should create a template from an archive at a given AP URL', async () => {
            const url = 'ap://ip-payment@0.12.0#hash';
            return Template.fromUrl(url, null).should.be.fulfilled;
        });

        it('should throw an error if creating a template from a wrongly formed AP URL', async () => {
            try {
                await Template.fromUrl('ap://ip-payment@0.9.0', null);
                assert.isOk(false,'should throw an error if creating a template from a wrongly formed AP URL');
            }
            catch(err) {
                // ignore
            }
        });

        it('should create a template from an archive at a given github URL', async () => {
            const url = 'github://accordproject/cicero-template-library/master/build/archives/ip-payment@0.12.0.cta';
            return Template.fromUrl(url, {'encoding':null,'headers':{'Accept': '*/*','Accept-Encoding': 'deflate, gzip'}}).should.be.fulfilled;
        });

        it.skip('should throw an error if creating a template from a wrong URL', async () => {
            const url = 'https://templates.accordproject.org/archives/doesnotexist@0.3.0.cta';
            return Template.fromUrl(url, null).should.be.rejectedWith('Request to URL [https://templates.accordproject.org/archives/doesnotexist@0.3.0.cta] returned with error code: 404');
        });

        it('should throw an error if creating a template from a github URL to an archive with the wrong Cicero version', async () => {
            const url = 'github://accordproject/cicero-template-library/master/build/archives/acceptance-of-delivery@0.3.0.cta';
            return Template.fromUrl(url, {'encoding':null,'headers':{'Accept': '*/*','Accept-Encoding': 'deflate, gzip'}}).should.be.rejectedWith('The template targets Cicero (^0.4.6) but the Cicero version is');
        });

        it('should throw an error if creating a template from a non existing URL', async () => {
            const url = 'https://emplates.accordproject.org/archives/doesnotexist@0.3.0.cta';
            return Template.fromUrl(url, {'encoding':null,'headers':{'Accept': '*/*','Accept-Encoding': 'deflate, gzip'}}).should.be.rejectedWith('Server did not respond for URL [https://emplates.accordproject.org/archives/doesnotexist@0.3.0.cta]');
        });
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
            return (() => template.setSample('sample text','default')).should.not.throw();
        });
    });

    describe('#setRequest', () => {

        it('should set a new request', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const newrequest = {};
            newrequest.$class = 'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest';
            newrequest.forceMajeure = true;
            newrequest.agreedDelivery = 'December 17, 2018 03:24:00';
            newrequest.deliveredAt = null;
            newrequest.goodsValue = 300.00;
            template.setRequest(newrequest);
            const updatedRequest = template.getMetadata().getRequest();
            updatedRequest.$class.should.equal('io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest');
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
                'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest',
            ]);
        });

        it('should return empty array when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic', options);
            const types = template.getRequestTypes();
            types.should.be.eql([]);
        });
    });

    describe('#getResponseTypes', () => {

        it('should return response type for single accordclauselogic function', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getResponseTypes();
            types.should.be.eql([
                'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse',
            ]);
        });

        it('should return empty array when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic');
            const types = template.getRequestTypes();
            types.should.be.eql([]);
        });
    });

    describe('#getEmitTypes', () => {

        it('should return the default emit type for a clause without emit type declaration', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            const types = template.getEmitTypes();
            types.should.be.eql([
                'org.accordproject.base.Event',
            ]);
        });

        it('should return emit type when declared in a clause', async () => {
            const template = await Template.fromDirectory('./test/data/helloemit', options);
            const types = template.getEmitTypes();
            types.should.be.eql([
                'org.accordproject.helloemit.Greeting',
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
                'org.accordproject.cicero.contract.AccordContractState',
            ]);
        });

        it('should return state type when declared in a clause', async () => {
            const template = await Template.fromDirectory('./test/data/helloemit', options);
            const types = template.getStateTypes();
            types.should.be.eql([
                'org.accordproject.cicero.contract.AccordContractState',
            ]);
        });

        it('should return empty array when no logic is defined', async () => {
            const template = await Template.fromDirectory('./test/data/no-logic', options);
            const types = template.getStateTypes();
            types.should.be.eql([]);
        });
    });

    describe('#getHash', () => {
        it('should return a SHA-256 hash', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.getHash().should.equal('3652879e7e86ddead7d4d83b91fac48abd4050551f84032613e6f3b4dd051f80');
        });
    });

    describe('#getLogicManager', () => {
        it('should return a Template Logic', async () => {
            const LogicManager = require('@accordproject/ergo-compiler').LogicManager;
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.getLogicManager('cicero').should.be.an.instanceof(LogicManager);
        });
    });

    describe('#getFactory', () => {
        it('should return a Factory', async () => {
            const Factory = require('@accordproject/concerto-core').Factory;
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.getFactory().should.be.an.instanceof(Factory);
        });
    });

    describe('#getSerializer', () => {
        it('should return a Serializer', async () => {
            const Serializer = require('@accordproject/concerto-core').Serializer;
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.getSerializer().should.be.an.instanceof(Serializer);
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

    describe('#getLogic', () => {

        it('should return all Ergo scripts', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.getScriptManager().getLogic().length.should.equal(1);
        });
    });

    describe('#grammarHasErgoExpression', () => {

        it('should return false on template grammars without Ergo expressions', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.getScriptManager().getLogic().length.should.equal(1);
            template.grammarHasErgoExpression().should.equal(false);
        });

        it('should return true on template grammars with Ergo expressions', async () => {
            const template = await Template.fromDirectory('./test/data/block-ergo', options);
            template.getScriptManager().getLogic().length.should.equal(0);
            template.grammarHasErgoExpression().should.equal(true);
        });
    });

    describe('#accept', () => {

        it('should accept a visitor', async () => {
            const visitor = {
                visit: function(thing, parameters){}
            };
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            return (() => template.accept(visitor,{})).should.not.throw();
        });
    });

    describe('#markdown', () => {

        it('should load latedeliveryandpenalty markdown template and parse', async () => {
            const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty', options);
            template.getParserManager().getParser().should.not.be.null;

            const sampleText = fs.readFileSync('./test/data/latedeliveryandpenalty/text/sample.md', 'utf8');
            const clause = new Clause(template);
            clause.parse(sampleText);
            const result = clause.getData();
            delete result.clauseId;

            const expected = {
                '$class': 'io.clause.latedeliveryandpenalty.TemplateModel',
                'forceMajeure': true,
                'penaltyDuration': {
                    '$class': 'org.accordproject.time.Duration',
                    'amount': 9,
                    'unit': 'days'
                },
                'penaltyPercentage': 7,
                'capPercentage': 2,
                'termination': {
                    '$class': 'org.accordproject.time.Duration',
                    'amount': 2,
                    'unit': 'weeks'
                },
                'fractionalPart': 'days'
            };
            result.should.deep.equal(expected);
        });

        it('should load copyright-license markdown template and parse', async () => {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            template.getParserManager().getParser().should.not.be.null;

            const sampleText = fs.readFileSync('./test/data/copyright-license/text/sample.md', 'utf8');
            const clause = new Clause(template);
            clause.parse(sampleText);
            const result = clause.getData();
            delete result.contractId;
            delete result.clauseId;
            delete result.paymentClause.clauseId;
            delete result.effectiveDate;

            const expected = {
                '$class': 'org.accordproject.copyrightlicense.CopyrightLicenseContract',
                'licensee': {
                    '$class': 'org.accordproject.cicero.contract.AccordParty',
                    'partyId': 'Me'
                },
                'licenseeState': 'NY',
                'licenseeEntityType': 'Company',
                'licenseeAddress': '1 Broadway',
                'licensor': {
                    '$class': 'org.accordproject.cicero.contract.AccordParty',
                    'partyId': 'Myself'
                },
                'licensorState': 'NY',
                'licensorEntityType': 'Company',
                'licensorAddress': '2 Broadway',
                'territory': 'United States',
                'purposeDescription': 'stuff',
                'workDescription': 'other stuff',
                'paymentClause': {
                    '$class': 'org.accordproject.copyrightlicense.PaymentClause',
                    'amountText': 'one hundred US Dollars',
                    'amount': {
                        '$class': 'org.accordproject.money.MonetaryAmount',
                        'doubleValue': 100,
                        'currencyCode': 'USD'
                    },
                    'paymentProcedure': 'bank transfer'
                }
            };
            result.should.deep.equal(expected);
        });
    });
});
