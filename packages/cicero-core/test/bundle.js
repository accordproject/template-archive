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

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

/* eslint-disable */

const BUNDLE_PATH = path.resolve(__dirname, '../dist/cicero-core.js');
const bundleExists = fs.existsSync(BUNDLE_PATH);

const { Template } = bundleExists ? require('../dist/cicero-core.js') : {};

const TEMPLATE_DIR = path.resolve(__dirname, 'data/helloworldstate');
const KEYSTORE_PATH = path.resolve(__dirname, 'data/keystore/keystore.p12');

describe('webpack bundle', () => {

    before(function() {
        if (!bundleExists) { this.skip(); }
    });

    let p12File;

    before(() => {
        if (!bundleExists) { return; }
        p12File = fs.readFileSync(KEYSTORE_PATH, { encoding: 'base64' });
    });

    describe('#Template (from bundle)', () => {

        it('should export Template', () => {
            Template.should.not.be.null;
        });

        it('should load a template from a directory', async () => {
            const template = await Template.fromDirectory(TEMPLATE_DIR);
            template.getIdentifier().should.equal('helloworldstate@0.15.0');
        });

    });

    describe('#signing (from bundle)', () => {

        it('should sign a template and produce an archive', async () => {
            const template = await Template.fromDirectory(TEMPLATE_DIR);
            const keystore = { p12File, passphrase: 'password' };
            const buffer = await template.toArchive('es6', { keystore });
            buffer.should.not.be.null;
            buffer.length.should.be.above(0);
        });

        it('should round-trip sign then reload and auto-verify', async () => {
            const template = await Template.fromDirectory(TEMPLATE_DIR);
            const keystore = { p12File, passphrase: 'password' };
            const buffer = await template.toArchive('es6', { keystore });
            const reloaded = await Template.fromArchive(buffer);
            reloaded.getIdentifier().should.equal(template.getIdentifier());
            reloaded.authorSignature.should.not.be.null;
            reloaded.authorSignature.templateSignature.signature.should.be.a('string');
        });

        it('should reject a wrong keystore passphrase', async () => {
            const template = await Template.fromDirectory(TEMPLATE_DIR);
            const keystore = { p12File, passphrase: 'wrong' };
            return template.toArchive('es6', { keystore })
                .should.be.rejectedWith('PKCS#12 MAC could not be verified. Invalid password?');
        });

        it('should detect a tampered signature', async () => {
            const template = await Template.fromDirectory(TEMPLATE_DIR);
            const keystore = { p12File, passphrase: 'password' };
            const buffer = await template.toArchive('es6', { keystore });
            const reloaded = await Template.fromArchive(buffer);
            reloaded.authorSignature.templateSignature.signature = 'deadbeef' +
                reloaded.authorSignature.templateSignature.signature.substring(8);
            (() => reloaded.verifyTemplateSignature()).should.throw('Template\'s author signature is invalid!');
        });

    });

});
