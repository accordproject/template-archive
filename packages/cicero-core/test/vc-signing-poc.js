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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert/strict');
const JSZip = require('jszip');

const Template = require('../src/template');

const TEMPLATE_PATH = path.join(__dirname, 'data', 'helloworldstate');
const OUT_DIR = path.join(__dirname, 'out');
const ARCHIVE_PATH = path.join(OUT_DIR, 'helloworldstate-signed.cta');
const PASSPHRASE = 'poc-passphrase';

async function main() {
    // 1. Generate an Ed25519 keypair and serialize the private half as
    //    Encrypted PKCS#8 PEM (the same shape end-users will provide).
    const { privateKey } = crypto.generateKeyPairSync('ed25519');
    const pem = privateKey.export({
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: PASSPHRASE,
    });

    // 2. Load a template from disk.
    const template = await Template.fromDirectory(TEMPLATE_PATH);
    console.log('Loaded template:', template.getIdentifier());

    // 3. Build a signed archive using did:key (no DID hosting needed).
    const archiveBuf = await template.toArchive('typescript', {
        signer: {
            privateKeyPem: { pem, passphrase: PASSPHRASE },
            issuerDid: 'did:key',
        },
    });
    console.log('Signed archive size:', archiveBuf.length, 'bytes');

    // 3a. Persist the signed archive to disk for inspection.
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(ARCHIVE_PATH, archiveBuf);
    console.log('Signed archive written to:', ARCHIVE_PATH);

    // 4. Inspect the in-memory credential.
    const credential = template.authorSignature;
    assert.ok(credential, 'authorSignature should be a VC after signing');
    assert.ok(credential.proof, 'VC must have a proof');
    assert.equal(credential.proof.cryptosuite, 'eddsa-jcs-2022');
    assert.ok(credential.issuer.startsWith('did:key:z6Mk'));
    assert.equal(
        credential.credentialSubject.templateName,
        template.getMetadata().getName(),
    );
    console.log('\n--- Signed Verifiable Credential ---');
    console.log(JSON.stringify(credential, null, 2));
    console.log('--- end credential ---\n');

    // 5. Round-trip: load the archive back. fromArchive() runs the
    //    template validator which (when authorSignature is present)
    //    awaits verifyTemplateSignature().
    const restored = await Template.fromArchive(archiveBuf);
    assert.ok(restored.authorSignature, 'restored template carries the VC');
    assert.equal(
        restored.authorSignature.credentialSubject.templateHash,
        credential.credentialSubject.templateHash,
    );
    console.log('Round-trip OK — signature verified during load');

    // 6. Tamper detection (credential-level): replace the templateHash on
    //    the restored credential and re-verify; should reject.
    const tampered = JSON.parse(JSON.stringify(restored.authorSignature));
    tampered.credentialSubject.templateHash = 'tampered';
    restored.authorSignature = tampered;
    await assert.rejects(
        () => restored.verifyTemplateSignature(),
        /author signature is invalid/,
        'tampered credential must be rejected',
    );
    console.log('Tamper detection (credential-level) OK');

    // 7. Tamper detection (archive content): unzip the signed archive,
    //    mutate a field type inside model/model.cto, repack, and try to
    //    load. The recomputed templateHash will not match the one signed
    //    into the credential, so verification must fail.
    const tamperedArchive = await tamperModelFieldType(
        archiveBuf,
        'model/model.cto',
        'o String name',
        'o Integer name',
    );
    await assert.rejects(
        () => Template.fromArchive(tamperedArchive),
        /author signature is invalid/,
        'tampered model file must fail verification on load',
    );
    console.log('Tamper detection (model-content) OK');

    console.log('\nAll POC assertions passed.');
}

async function tamperModelFieldType(archiveBuf, filename, find, replace) {
    const zip = await JSZip.loadAsync(archiveBuf);
    const original = await zip.file(filename).async('string');
    if (!original.includes(find)) {
        throw new Error(`tamper helper: '${find}' not found in ${filename}`);
    }
    const mutated = original.replace(find, replace);
    zip.file(filename, mutated);
    return zip.generateAsync({ type: 'nodebuffer' });
}

main().catch(err => {
    console.error('POC failed:', err);
    process.exit(1);
});
