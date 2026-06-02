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

const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const test = require('node:test');

const scriptPath = path.join(__dirname, 'bump_version.js');

/**
 * @param {string} filePath absolute file path
 * @param {string} content file content
 */
function writeFile(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * @returns {string} temporary repository root
 */
function createRepoRoot() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'template-archive-bump-version-'));
}

test('bump_version updates workspace and fixture manifests while skipping fixture node_modules', () => {
    const repoRoot = createRepoRoot();
    const workspaceManifestPath = path.join(repoRoot, 'packages/cicero-cli/package.json');
    const fixtureManifestPath = path.join(repoRoot, 'packages/cicero-core/test/data/block-join/package.json');
    const nestedNodeModulesPath = path.join(
        repoRoot,
        'packages/cicero-core/test/data/with-node_modules/node_modules/my-model-package/package.json'
    );

    writeFile(
        workspaceManifestPath,
        '{\n  "name": "@accordproject/cicero-cli",\n  "dependencies": {\n    "@accordproject/cicero-core": "0.25.0"\n  },\n  "devDependencies": {\n    "@accordproject/generator-cicero-template": "0.25.0"\n  }\n}\n'
    );
    writeFile(
        fixtureManifestPath,
        '{\n  "name": "volumediscountolist",\n  "accordproject": {\n    "template": "contract",\n    "cicero": "^0.25.0"\n  },\n  "dependencies": {\n    "@accordproject/cicero-cli": "^0.20.1"\n  },\n  "devDependencies": {\n    "@accordproject/generator-cicero-template": "^0.19.0"\n  }\n}\n'
    );
    writeFile(
        nestedNodeModulesPath,
        '{\n  "name": "my-model-package",\n  "version": "0.0.1",\n  "accordproject": {\n    "cicero": "^9.9.9"\n  },\n  "dependencies": {\n    "@accordproject/cicero-core": "^9.9.9"\n  }\n}\n'
    );

    const output = execFileSync(process.execPath, [scriptPath, 'v1.2.3'], {
        cwd: repoRoot,
        encoding: 'utf8',
    });

    assert.match(output, /Updated 1 workspace manifests and 1 fixture manifests to 1.2.3/);

    const workspaceManifest = JSON.parse(fs.readFileSync(workspaceManifestPath, 'utf8'));
    assert.equal(workspaceManifest.dependencies['@accordproject/cicero-core'], '1.2.3');
    assert.equal(workspaceManifest.devDependencies['@accordproject/generator-cicero-template'], '1.2.3');

    const fixtureManifest = JSON.parse(fs.readFileSync(fixtureManifestPath, 'utf8'));
    assert.equal(fixtureManifest.accordproject.cicero, '^1.2.3');
    assert.equal(fixtureManifest.dependencies['@accordproject/cicero-cli'], '^1.2.3');
    assert.equal(fixtureManifest.devDependencies['@accordproject/generator-cicero-template'], '^1.2.3');

    const nestedNodeModulesManifest = JSON.parse(fs.readFileSync(nestedNodeModulesPath, 'utf8'));
    assert.equal(nestedNodeModulesManifest.accordproject.cicero, '^9.9.9');
    assert.equal(nestedNodeModulesManifest.dependencies['@accordproject/cicero-core'], '^9.9.9');
});

test('bump_version rejects invalid versions', () => {
    const repoRoot = createRepoRoot();
    const result = spawnSync(process.execPath, [scriptPath, 'not-a-version'], {
        cwd: repoRoot,
        encoding: 'utf8',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Invalid version "not-a-version"/);
});
