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

const { test, expect } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');
const Template = require('../../src/template');

const BUNDLE       = path.resolve(__dirname, '../../dist/cicero-core.browser.js');
const TEMPLATE_DIR = path.resolve(__dirname, '../data/helloworldstate');
const KEYSTORE     = path.resolve(__dirname, '../data/keystore/keystore.p12');

let signedArchiveB64;
let p12B64;

test.beforeAll(async () => {
    p12B64 = fs.readFileSync(KEYSTORE, { encoding: 'base64' });
    const template = await Template.fromDirectory(TEMPLATE_DIR);
    const buf = await template.toArchive('es6', {
        keystore: { p12File: p12B64, passphrase: 'password' },
    });
    signedArchiveB64 = buf.toString('base64');
});

async function injectBundle(page) {
    await page.goto('about:blank');
    await page.addScriptTag({ path: BUNDLE });
    await page.waitForFunction(() => typeof window['cicero-core'] !== 'undefined');
}

test('bundle exposes Template', async ({ page }) => {
    await injectBundle(page);
    const ok = await page.evaluate(() => typeof window['cicero-core'].Template === 'function');
    expect(ok).toBe(true);
});

test('fromArchive loads template in browser', async ({ page }) => {
    await injectBundle(page);
    const id = await page.evaluate(async (b64) => {
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const { Template } = window['cicero-core'];
        const t = await Template.fromArchive(bytes.buffer);
        return t.getIdentifier();
    }, signedArchiveB64);
    expect(id).toBe('helloworldstate@0.15.0');
});

test('signed archive auto-verifies on reload in browser', async ({ page }) => {
    await injectBundle(page);
    const hasSig = await page.evaluate(async (b64) => {
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const { Template } = window['cicero-core'];
        const t = await Template.fromArchive(bytes.buffer);
        return !!t.authorSignature?.templateSignature?.signature;
    }, signedArchiveB64);
    expect(hasSig).toBe(true);
});

test('wrong passphrase rejected in browser', async ({ page }) => {
    await injectBundle(page);
    const err = await page.evaluate(async ({ b64, p12 }) => {
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const { Template } = window['cicero-core'];
        const t = await Template.fromArchive(bytes.buffer);
        try {
            await t.toArchive('es6', { keystore: { p12File: p12, passphrase: 'wrong' } });
            return null;
        } catch (e) { return e.message; }
    }, { b64: signedArchiveB64, p12: p12B64 });
    expect(err).toContain('PKCS#12 MAC could not be verified');
});

test('tampered signature detected in browser', async ({ page }) => {
    await injectBundle(page);
    const err = await page.evaluate(async (b64) => {
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const { Template } = window['cicero-core'];
        const t = await Template.fromArchive(bytes.buffer);
        t.authorSignature.templateSignature.signature =
            'deadbeef' + t.authorSignature.templateSignature.signature.substring(8);
        try { t.verifyTemplateSignature(); return null; }
        catch (e) { return e.message; }
    }, signedArchiveB64);
    expect(err).toBe("Template's author signature is invalid!");
});
