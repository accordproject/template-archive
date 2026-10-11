#!/usr/bin/env node
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

/*
 * Emits the two ES module builds of cicero-core, next to the CommonJS build
 * that tsc writes to lib/:
 *
 *   lib/esm/          the `import` export condition, for Node
 *   lib/esm-browser/  the `browser` export condition, for bundlers targeting
 *                     the web
 *
 * Run it after tsc (`npm run build:esm`). The layout follows
 * accordproject/markdown-transform's scripts/build-esm.js.
 */

const fs = require('fs');
const path = require('path');
const { builtinModules } = require('module');
const esbuild = require('esbuild');

const packageDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
const srcDir = path.join(packageDir, 'src');

/**
 * Every source module is an entry point, so the output mirrors the module
 * graph that tsc emits for lib/ instead of flattening it into one file. A
 * consumer's bundler can then drop whole modules the consumer never reaches,
 * and code shared between entry points is hoisted into chunks.
 *
 * @param {string} dir - directory to scan
 * @param {string[]} found - accumulator
 * @return {string[]} absolute paths of the source modules under dir
 */
function collectEntryPoints(dir, found = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectEntryPoints(entryPath, found);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') && !entry.name.endsWith('.test.ts')) {
            found.push(entryPath);
        }
    }
    return found;
}

// Every dependency stays a bare import in both builds, so it resolves through
// the consumer's node_modules exactly like the require() calls in lib/.
// Bundling them instead would give cicero-core a private copy of each, which
// could not be deduplicated with the consumer's own copy.
const dependencies = [...new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
])];

const asExternal = names => names.flatMap(name => [name, `${name}/*`]);

const builtinSpecifiers = new Set([
    ...builtinModules,
    ...builtinModules.map(name => `node:${name}`),
]);

// The browser build replaces Node builtins with empty modules, so a downstream
// bundler without Node polyfills is never asked to resolve `fs` or `path`.
// A builtin that is also a declared dependency (`buffer`) is the npm polyfill
// of that builtin, so it stays a bare import and resolves to the package.
const stubNodeOnlyModulesPlugin = {
    name: 'stub-node-only-modules',
    setup(build) {
        build.onResolve({ filter: /^(node:|[a-z])/ }, args => {
            if (builtinSpecifiers.has(args.path) && !dependencies.includes(args.path)) {
                return { path: args.path, namespace: 'node-only-stub' };
            }
            return undefined;
        });
        build.onLoad({ filter: /.*/, namespace: 'node-only-stub' }, () => ({
            contents: 'module.exports = {};',
            loader: 'js',
        }));
    },
};

// src/ reads only `version` from package.json. Without this plugin esbuild
// would inline the whole manifest, scripts and devDependencies included.
const packageVersionOnlyPlugin = {
    name: 'package-version-only',
    setup(build) {
        const manifest = path.join(packageDir, 'package.json');
        build.onLoad({ filter: /package\.json$/ }, args => {
            if (path.resolve(args.path) !== manifest) {
                return undefined;
            }
            return { contents: JSON.stringify({ version: packageJson.version }), loader: 'json' };
        });
    },
};

/**
 * Build options for one target.
 *
 * @param {'node'|'browser'} target - the runtime the build is for
 * @return {object} esbuild options shared by every entry point of that target
 */
function buildOptionsFor(target) {
    if (target === 'node') {
        return {
            platform: 'node',
            external: [...asExternal(dependencies), ...builtinSpecifiers],
            plugins: [packageVersionOnlyPlugin],
        };
    }
    return {
        platform: 'browser',
        external: asExternal(dependencies),
        plugins: [packageVersionOnlyPlugin, stubNodeOnlyModulesPlugin],
    };
}

async function main() {
    const entryPoints = collectEntryPoints(srcDir);
    const targets = [
        { target: 'node', outdir: path.join(packageDir, 'lib', 'esm') },
        { target: 'browser', outdir: path.join(packageDir, 'lib', 'esm-browser') },
    ];

    for (const { target, outdir } of targets) {
        // Chunk names are content hashes, so stale chunks from an earlier
        // build would otherwise accumulate and be published.
        fs.rmSync(outdir, { recursive: true, force: true });
        await esbuild.build({
            ...buildOptionsFor(target),
            entryPoints,
            outdir,
            outbase: srcDir,
            bundle: true,
            splitting: true,
            format: 'esm',
            target: 'es2020',
            sourcemap: true,
            logLevel: 'warning',
            // The package has no "type": "module", so ES modules need the .mjs
            // extension. esbuild rewrites the relative specifiers it emits to
            // match, which Node requires since it does not infer extensions.
            outExtension: { '.js': '.mjs' },
        });
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
