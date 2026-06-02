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

const fs = require('fs');
const glob = require('glob');
const semver = require('semver');

/**
 * This script updates the devDependencies and dependencies in the workspaces
 * and test fixtures to match the version specified by the given parameter.
 * The expected parameter should be the tag for the package.
 *
 * Example:
 * node ./scripts/bump_version.js <tag>
 */

const workspacesPattern = 'packages/*/package.json';
const fixturePattern = 'packages/*/test/data/**/package.json';
const packageNames = [
    '@accordproject/cicero-cli',
    '@accordproject/cicero-core',
    '@accordproject/generator-cicero-template',
];

/**
 * @param {object} packageJson package.json content
 * @param {string} depType dependency section to update
 * @param {string} targetPackageVersion version to write
 * @returns {boolean} true if the dependency section changed
 */
function updateManagedDependencies(packageJson, depType, targetPackageVersion) {
    let updated = false;

    packageNames.forEach((dep) => {
        if (packageJson[depType] && dep in packageJson[depType] && packageJson[depType][dep] !== targetPackageVersion) {
            packageJson[depType][dep] = targetPackageVersion;
            updated = true;
        }
    });

    return updated;
}

function bumpDependencies() {
    const targetPackageVersion = semver.clean(process.argv[2]);

    if (!targetPackageVersion) {
        throw new Error(`Invalid version "${process.argv[2]}". Expected a semantic version like 0.27.0 or v0.27.0.`);
    }

    const fixturePackageVersion = `^${targetPackageVersion}`;
    const workspacePackages = glob.sync(workspacesPattern);
    const fixturePackages = glob.sync(fixturePattern, { ignore: '**/node_modules/**' });
    let updatedWorkspaceCount = 0;
    let updatedFixtureCount = 0;

    workspacePackages.forEach((packagePath) => {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        let updated = false;

        ['dependencies', 'devDependencies'].forEach((depType) => {
            updated = updateManagedDependencies(packageJson, depType, targetPackageVersion) || updated;
        });

        if (updated) {
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
            updatedWorkspaceCount++;
        }
    });

    fixturePackages.forEach((packagePath) => {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        let updated = false;

        if (packageJson.accordproject && packageJson.accordproject.cicero !== fixturePackageVersion) {
            packageJson.accordproject.cicero = fixturePackageVersion;
            updated = true;
        }

        ['dependencies', 'devDependencies'].forEach((depType) => {
            updated = updateManagedDependencies(packageJson, depType, fixturePackageVersion) || updated;
        });

        if (updated) {
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
            updatedFixtureCount++;
        }
    });

    console.log(
        `Updated ${updatedWorkspaceCount} workspace manifests and ${updatedFixtureCount} fixture manifests to ${targetPackageVersion}.`
    );
}

try {
    bumpDependencies();
} catch (err) {
    console.error(err.message);
    process.exit(1);
}
