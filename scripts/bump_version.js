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

/**
 * This script updates the devDependencies and dependencies in the workspaces
 * to match the version specified by the given parameter.
 * The expected parameter should be the tag for the package.
 *
 * Example:
 * node ./script/bump_version.js <tag>
 */

const workspacesPattern = 'packages/*/package.json'; // Adjust this pattern based on your workspace setup
const packageNames = [
    "@accordproject/cicero-cli",
    "@accordproject/cicero-core",
    "@accordproject/generator-cicero-template",
];

function bumpDependencies() {
    const targetPackageVersion = process.argv[2].replace(/^v/, '');
    const workspacePackages = glob.sync(workspacesPattern);

    workspacePackages.forEach((packagePath) => {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        ['dependencies', 'devDependencies'].forEach((depType) => {
            packageNames.forEach(dep => {
                if (packageJson[depType] && (dep in packageJson[depType])) {
                    packageJson[depType][dep] = targetPackageVersion;
                }
            });
        });

        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    });

    console.log('Dependencies updated successfully!');
}

bumpDependencies();
