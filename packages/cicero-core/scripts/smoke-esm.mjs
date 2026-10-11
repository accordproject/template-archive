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

/**
 * Smoke test for the ES module builds, run after `npm run build`.
 *
 * The jest suites run src/ through ts-jest, so nothing else exercises what a
 * consumer actually loads: Node's `import` resolves to lib/esm, and a bundler
 * targeting the web resolves the `browser` condition to lib/esm-browser.
 *
 * Run with `npm run test:esm`.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { builtinModules, createRequire } from 'module';
import { fileURLToPath } from 'url';

import { Template, version } from '@accordproject/cicero-core';

const require = createRequire(import.meta.url);
const packageDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
const TEMPLATE_DIR = path.join(packageDir, 'test', 'data', 'helloworldstate');
const KEYSTORE = path.join(packageDir, 'test', 'data', 'keystore', 'keystore.p12');

// Builtins the browser build may import because the package depends on the
// npm polyfill of the same name (see build-esm.js).
const POLYFILLED_BUILTINS = Object.keys(packageJson.dependencies).filter(name => builtinModules.includes(name));

const checks = [];

/**
 * Register a named check.
 *
 * @param {string} name - what the check covers
 * @param {Function} fn - the check body; throws to fail
 */
function check(name, fn) {
    checks.push([name, fn]);
}

/**
 * Lists the .mjs files of one build.
 *
 * @param {string} build - 'esm' or 'esm-browser'
 * @return {Array<[string, string]>} [relative path, source] pairs
 */
function modulesOf(build) {
    const dir = path.join(packageDir, 'lib', build);
    return fs.readdirSync(dir, { recursive: true })
        .filter(file => file.endsWith('.mjs'))
        .map(file => [`lib/${build}/${file}`, fs.readFileSync(path.join(dir, file), 'utf8')]);
}

/**
 * Specifiers a module loads with a runtime require() call. In an ES module
 * these are invisible to a bundler, and esbuild's __require helper throws
 * "Dynamic require ... is not supported" wherever no require() is in scope.
 *
 * @param {string} source - module source
 * @return {string[]} the required specifiers
 */
function runtimeRequires(source) {
    return [...source.matchAll(/\b__require\("([^"]+)"\)/g)].map(match => match[1]);
}

check('Node resolves the import condition to lib/esm', () => {
    const resolved = import.meta.resolve('@accordproject/cicero-core');
    assert.ok(resolved.includes('/lib/esm/'), `expected lib/esm, got ${resolved}`);
});

check('ESM and CJS entry points expose the same names', async () => {
    const esm = await import('@accordproject/cicero-core');
    const cjs = require('@accordproject/cicero-core');
    const esmNames = Object.keys(esm).filter(key => key !== 'default').sort();
    const cjsNames = Object.keys(cjs).filter(key => key !== 'default' && key !== '__esModule').sort();
    assert.deepStrictEqual(esmNames, cjsNames);
});

check('version and ./package.json match the package', () => {
    assert.strictEqual(version, packageJson.version);
    assert.strictEqual(require('@accordproject/cicero-core/package.json').version, packageJson.version);
});

check('a template loads from a directory and hashes like the CJS build', async () => {
    const esmTemplate = await Template.fromDirectory(TEMPLATE_DIR);
    const cjsTemplate = await require('@accordproject/cicero-core').Template.fromDirectory(TEMPLATE_DIR);
    assert.strictEqual(esmTemplate.getIdentifier(), 'helloworldstate@0.15.0');
    assert.ok(esmTemplate.getMetadata().getLogo(), 'the logo was not loaded');
    assert.strictEqual(esmTemplate.getHash(), cjsTemplate.getHash());
});

check('a signed archive round-trips and verifies', async () => {
    const template = await Template.fromDirectory(TEMPLATE_DIR);
    const archive = await template.toArchive('es6', {
        keystore: { p12File: fs.readFileSync(KEYSTORE, { encoding: 'base64' }), passphrase: 'password' },
    });
    assert.ok(Buffer.isBuffer(archive), 'toArchive did not return a Buffer');
    const reloaded = await Template.fromArchive(archive);
    assert.strictEqual(reloaded.getIdentifier(), template.getIdentifier());
    assert.strictEqual(reloaded.getHash(), template.getHash());
    assert.ok(reloaded.authorSignature?.templateSignature?.signature, 'the signature was not kept');
});

check('the Node build has no runtime requires', () => {
    const offenders = [];
    for (const [file, source] of modulesOf('esm')) {
        for (const specifier of runtimeRequires(source)) {
            offenders.push(`${file} requires ${specifier}`);
        }
    }
    assert.deepStrictEqual(offenders, [], 'use an import statement so the browser build can follow it');
});

check('the browser build has no Node builtins, runtime requires or free process', () => {
    const builtins = new Set([...builtinModules, ...builtinModules.map(name => `node:${name}`)]);
    const offenders = [];
    for (const [file, source] of modulesOf('esm-browser')) {
        for (const [, specifier] of source.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*"([^"]+)"/g)) {
            if (builtins.has(specifier) && !POLYFILLED_BUILTINS.includes(specifier)) {
                offenders.push(`${file} imports ${specifier}`);
            }
        }
        for (const specifier of runtimeRequires(source)) {
            offenders.push(`${file} requires ${specifier}`);
        }
        // A free `process` is answered by a webpack consumer's ProvidePlugin
        // with an extensionless `process/browser` request, which webpack
        // rejects from an .mjs module.
        if (/\bprocess\s*\./.test(source)) {
            offenders.push(`${file} references process`);
        }
    }
    assert.deepStrictEqual(offenders, []);
});

let failures = 0;
for (const [name, fn] of checks) {
    try {
        await fn();
        console.log(`ok   ${name}`);
    } catch (err) {
        failures++;
        console.error(`FAIL ${name}\n     ${err.message}`);
    }
}

if (failures > 0) {
    console.error(`\n${failures} of ${checks.length} ESM smoke checks failed`);
    process.exit(1);
}
console.log(`\n${checks.length} ESM smoke checks passed`);
