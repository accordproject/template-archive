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

import { test, expect, type Page } from '@playwright/test';
import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
// Node-side build of a signed archive, using the cicero-core node entry point (lib/index.js).
import { Template } from '@accordproject/cicero-core';

// A bundler targeting the web resolves cicero-core's `browser` export
// condition to lib/esm-browser and bundles it into the application, resolving
// the bare imports that graph leaves (Concerto, the markdown packages, jszip,
// node-forge, the buffer polyfill) from node_modules. This suite does the same
// with esbuild and runs the result in Chromium, so it tests what browser
// consumers actually ship.
const ENTRY = `
export { Clause, Template, TemplateLoader, TemplateLibrary, Script, version } from '@accordproject/cicero-core';
`;

const PKG_ROOT = path.resolve(__dirname, '../../packages/cicero-core');
const TEMPLATE_DIR = path.join(PKG_ROOT, 'test', 'data', 'helloworldstate');
const KEYSTORE = path.join(PKG_ROOT, 'test', 'data', 'keystore', 'keystore.p12');
const VERSION = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')).version;

let bundle: string;
let inputs: string[];
let signedArchiveB64: string;
let p12B64: string;
let templateHash: string;
let logoB64: string;

test.beforeAll(async () => {
    const result = await esbuild.build({
        stdin: { contents: ENTRY, resolveDir: __dirname, loader: 'js' },
        bundle: true,
        platform: 'browser',
        format: 'iife',
        globalName: 'ciceroCore',
        write: false,
        metafile: true,
        logLevel: 'silent',
    });
    bundle = result.outputFiles[0].text;
    inputs = Object.keys(result.metafile.inputs).map(input => input.split('\\').join('/'));

    p12B64 = fs.readFileSync(KEYSTORE, { encoding: 'base64' });
    logoB64 = fs.readFileSync(path.join(TEMPLATE_DIR, 'logo.png'), { encoding: 'base64' });
    const template = await (Template as any).fromDirectory(TEMPLATE_DIR);
    templateHash = template.getHash();
    const buf = await template.toArchive('es6', {
        keystore: { p12File: p12B64, passphrase: 'password' },
    });
    signedArchiveB64 = buf.toString('base64');
});

/**
 * Loads the bundle into a blank page, exposing its exports on
 * `window.ciceroCore`.
 *
 * @param {Page} page - the Playwright page
 */
async function loadBundle(page: Page): Promise<void> {
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ content: bundle });
}

test.describe('browser ES module build', () => {
    test('the bundler resolves cicero-core to lib/esm-browser', () => {
        const ownModules = inputs.filter(input => /(^|\/)packages\/cicero-core\/(?!node_modules\/)/.test(input));
        expect(ownModules.length).toBeGreaterThan(0);
        expect(ownModules.filter(input => !input.includes('/lib/esm-browser/'))).toEqual([]);
    });

    test('Node polyfills stay out of the bundle, except the buffer package', () => {
        const polyfills = inputs.filter(input => /node_modules\/(crypto-browserify|stream-browserify|path-browserify|bn\.js|browserify-[a-z]+)\//.test(input));
        expect(polyfills).toEqual([]);
        expect(inputs.some(input => /node_modules\/buffer\//.test(input))).toBe(true);
    });

    test('exposes the cicero-core API and version', async ({ page }) => {
        await loadBundle(page);
        const api = await page.evaluate(() => {
            const mod = (window as any).ciceroCore;
            return {
                missing: ['Clause', 'Template', 'TemplateLoader', 'TemplateLibrary', 'Script']
                    .filter(name => typeof mod[name] !== 'function'),
                version: mod.version,
            };
        });
        expect(api.missing).toEqual([]);
        expect(api.version).toBe(VERSION);
    });

    test('fromArchive loads a template in the browser', async ({ page }) => {
        await loadBundle(page);
        const id = await page.evaluate(async (b64: string) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any).ciceroCore;
            const t = await Template.fromArchive(bytes.buffer);
            return t.getIdentifier();
        }, signedArchiveB64);
        expect(id).toBe('helloworldstate@0.15.0');
    });

    test('signed archive auto-verifies on reload in the browser', async ({ page }) => {
        await loadBundle(page);
        const hasSig = await page.evaluate(async (b64: string) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any).ciceroCore;
            const t = await Template.fromArchive(bytes.buffer);
            return !!t.authorSignature?.templateSignature?.signature;
        }, signedArchiveB64);
        expect(hasSig).toBe(true);
    });

    test('wrong passphrase is rejected in the browser', async ({ page }) => {
        await loadBundle(page);
        const err = await page.evaluate(async ({ b64, p12 }: { b64: string; p12: string }) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any).ciceroCore;
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

    // The browser has no Node crypto; the hash must still match Node's.
    test('the template hash matches the one computed in Node', async ({ page }) => {
        await loadBundle(page);
        const hash = await page.evaluate(async (b64: string) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any).ciceroCore;
            const t = await Template.fromArchive(bytes.buffer);
            return t.getHash();
        }, signedArchiveB64);
        expect(hash).toBe(templateHash);
    });

    // The browser has no global Buffer; the logo still loads as one.
    test('the logo loads as a Buffer in the browser', async ({ page }) => {
        await loadBundle(page);
        const logo = await page.evaluate(async (b64: string) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any).ciceroCore;
            const t = await Template.fromArchive(bytes.buffer);
            return t.getMetadata().getLogo().toString('base64');
        }, signedArchiveB64);
        expect(logo).toBe(logoB64);
    });

    test('toArchive writes an archive in the browser that loads again', async ({ page }) => {
        await loadBundle(page);
        const reloaded = await page.evaluate(async (b64: string) => {
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const { Template } = (window as any).ciceroCore;
            const t = await Template.fromArchive(bytes.buffer);
            const archive = await t.toArchive('es6');
            const again = await Template.fromArchive(archive);
            return { id: again.getIdentifier(), hash: again.getHash(), size: archive.length };
        }, signedArchiveB64);
        expect(reloaded.id).toBe('helloworldstate@0.15.0');
        expect(reloaded.hash).toBe(templateHash);
        expect(reloaded.size).toBeGreaterThan(0);
    });
});
