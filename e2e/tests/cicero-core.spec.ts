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

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
// Node-side build of a signed archive, using the cicero-core node entry point (lib/index.js).
import { Template } from '@accordproject/cicero-core';

const PKG_ROOT = path.resolve(__dirname, '../../packages/cicero-core');
const BUNDLE = path.join(PKG_ROOT, 'umd', 'cicero-core.js');
const TEMPLATE_DIR = path.join(PKG_ROOT, 'test', 'data', 'helloworldstate');
const KEYSTORE = path.join(PKG_ROOT, 'test', 'data', 'keystore', 'keystore.p12');

let signedArchiveB64: string;
let p12B64: string;

test.beforeAll(async () => {
    p12B64 = fs.readFileSync(KEYSTORE, { encoding: 'base64' });
    const template = await (Template as any).fromDirectory(TEMPLATE_DIR);
    const buf = await template.toArchive('es6', {
        keystore: { p12File: p12B64, passphrase: 'password' },
    });
    signedArchiveB64 = buf.toString('base64');
});

/**
 * Loads about:blank and injects the UMD bundle as a script tag, then waits
 * for the global to appear.
 * @param page - the Playwright page
 */
async function injectBundle(page: Page): Promise<void> {
    await page.goto('about:blank');
    await page.addScriptTag({ path: BUNDLE });
    await page.waitForFunction(() => typeof (window as any)['cicero-core'] !== 'undefined');
}

test.describe('@accordproject/cicero-core UMD', () => {
    test('bundle exposes Template on the global', async ({ page }) => {
        await injectBundle(page);
        const ok = await page.evaluate(() => typeof (window as any)['cicero-core'].Template === 'function');
        expect(ok).toBe(true);
    });

    test('fromArchive loads a template in the browser', async ({ page }) => {
        await injectBundle(page);
        const id = await page.evaluate(async (b64: string) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any)['cicero-core'];
            const t = await Template.fromArchive(bytes.buffer);
            return t.getIdentifier();
        }, signedArchiveB64);
        expect(id).toBe('helloworldstate@0.15.0');
    });

    test('signed archive auto-verifies on reload in the browser', async ({ page }) => {
        await injectBundle(page);
        const hasSig = await page.evaluate(async (b64: string) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any)['cicero-core'];
            const t = await Template.fromArchive(bytes.buffer);
            return !!t.authorSignature?.templateSignature?.signature;
        }, signedArchiveB64);
        expect(hasSig).toBe(true);
    });

    test('wrong passphrase is rejected in the browser', async ({ page }) => {
        await injectBundle(page);
        const err = await page.evaluate(async ({ b64, p12 }: { b64: string; p12: string }) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any)['cicero-core'];
            const t = await Template.fromArchive(bytes.buffer);
            try {
                await t.toArchive('es6', { keystore: { p12File: p12, passphrase: 'wrong' } });
                return null;
            } catch (e: any) {
                return e.message;
            }
        }, { b64: signedArchiveB64, p12: p12B64 });
        expect(err).toContain('PKCS#12 MAC could not be verified');
    });
});
