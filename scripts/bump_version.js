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
const path = require('path');
const glob = require('glob');
const semver = require('semver');

/**
 * This script updates managed Accord Project version references during release.
 * It updates workspace package dependencies and repo-tracked template fixture
 * manifests that declare a Cicero compatibility range or internal package
 * dependency.
 *
 * Example:
 * node ./scripts/bump_version.js <tag-or-version>
 */

const workspacePattern = 'packages/*/package.json';
const fixturePattern = 'packages/*/test/data/**/package.json';
const fixtureIgnorePatterns = ['**/node_modules/**'];
const managedPackageNames = [
    '@accordproject/cicero-cli',
    '@accordproject/cicero-core',
    '@accordproject/generator-cicero-template',
];

/**
 * @param {string} rawVersion the raw CLI version or tag
 * @returns {string} normalized semver version
 */
function normalizeTargetVersion(rawVersion) {
    if (!rawVersion) {
        throw new Error('A version argument is required.');
    }

    const targetVersion = rawVersion.replace(/^v/, '');

    if (!semver.valid(targetVersion)) {
        throw new Error(`Invalid version "${rawVersion}". Expected a semantic version like 0.27.0 or v0.27.0.`);
    }

    return targetVersion;
}

/**
 * @param {string} content the original file content
 * @returns {number|null} indentation width, or null for a single-line file
 */
function detectIndentation(content) {
    if (!content.includes('\n')) {
        return null;
    }

    const match = content.match(/^\s+"/m);
    return match ? match[0].length - 1 : 2;
}

/**
 * @param {object} packageJson the package json object
 * @param {string} originalContent the original file content
 * @returns {string} serialized package json preserving the original style
 */
function serializePackageJson(packageJson, originalContent) {
    const indentation = detectIndentation(originalContent);
    const hasTrailingNewline = originalContent.endsWith('\n');
    const serialized = indentation === null ?
        JSON.stringify(packageJson) :
        JSON.stringify(packageJson, null, indentation);

    return hasTrailingNewline ? `${serialized}\n` : serialized;
}

/**
 * @param {string} currentValue the current version or range
 * @param {string} targetVersion the target version
 * @returns {string} updated version string
 */
function rewriteVersion(currentValue, targetVersion) {
    if (typeof currentValue !== 'string') {
        return currentValue;
    }

    if (currentValue.startsWith('^') || currentValue.startsWith('~')) {
        return `${currentValue[0]}${targetVersion}`;
    }

    return targetVersion;
}

/**
 * @param {object} packageJson the package json object
 * @param {string} depType dependency section to update
 * @param {string} targetVersion target version
 * @param {boolean} preserveRange whether to preserve ^ or ~ from the original value
 * @returns {boolean} true if a dependency was changed
 */
function updateManagedDependencies(packageJson, depType, targetVersion, preserveRange) {
    let changed = false;
    const dependencyMap = packageJson[depType];

    if (!dependencyMap) {
        return changed;
    }

    managedPackageNames.forEach((depName) => {
        if (depName in dependencyMap) {
            const nextValue = preserveRange ?
                rewriteVersion(dependencyMap[depName], targetVersion) :
                targetVersion;

            if (dependencyMap[depName] !== nextValue) {
                dependencyMap[depName] = nextValue;
                changed = true;
            }
        }
    });

    return changed;
}

/**
 * @param {string} manifestPath path to package.json
 * @returns {{packageJson: object, originalContent: string}} parsed manifest data
 */
function readManifest(manifestPath) {
    const originalContent = fs.readFileSync(manifestPath, 'utf8');
    return {
        packageJson: JSON.parse(originalContent),
        originalContent,
    };
}

/**
 * @param {string[]} manifestPaths package.json file paths
 * @param {(packageJson: object) => boolean} mutateManifest mutator returning whether the manifest changed
 * @returns {number} number of files updated
 */
function updateManifestFiles(manifestPaths, mutateManifest) {
    let updatedCount = 0;

    manifestPaths.forEach((manifestPath) => {
        const { packageJson, originalContent } = readManifest(manifestPath);

        if (mutateManifest(packageJson)) {
            fs.writeFileSync(manifestPath, serializePackageJson(packageJson, originalContent), 'utf8');
            updatedCount++;
        }
    });

    return updatedCount;
}

/**
 * @param {string} cwd working directory root
 * @returns {string[]} workspace manifest paths
 */
function getWorkspaceManifestPaths(cwd) {
    return glob.sync(workspacePattern, { cwd, nodir: true })
        .map((manifestPath) => path.join(cwd, manifestPath));
}

/**
 * @param {string} cwd working directory root
 * @returns {string[]} fixture manifest paths
 */
function getFixtureManifestPaths(cwd) {
    return glob.sync(fixturePattern, {
        cwd,
        nodir: true,
        ignore: fixtureIgnorePatterns,
    }).map((manifestPath) => path.join(cwd, manifestPath));
}

/**
 * @param {string} targetVersion target version
 * @param {{cwd?: string}} [options] script options
 * @returns {{targetVersion: string, updatedWorkspaceCount: number, updatedFixtureCount: number}} update summary
 */
function bumpDependencies(targetVersion, options = {}) {
    const normalizedVersion = normalizeTargetVersion(targetVersion);
    const cwd = options.cwd || process.cwd();

    const workspaceManifests = getWorkspaceManifestPaths(cwd);
    const fixtureManifests = getFixtureManifestPaths(cwd);

    const updatedWorkspaceCount = updateManifestFiles(workspaceManifests, (packageJson) => {
        const updatedDependencies = updateManagedDependencies(packageJson, 'dependencies', normalizedVersion, false);
        const updatedDevDependencies = updateManagedDependencies(packageJson, 'devDependencies', normalizedVersion, false);

        return updatedDependencies || updatedDevDependencies;
    });

    const updatedFixtureCount = updateManifestFiles(fixtureManifests, (packageJson) => {
        let changed = false;

        if (
            packageJson.accordproject &&
            typeof packageJson.accordproject === 'object' &&
            'cicero' in packageJson.accordproject
        ) {
            const nextVersion = rewriteVersion(packageJson.accordproject.cicero, normalizedVersion);

            if (packageJson.accordproject.cicero !== nextVersion) {
                packageJson.accordproject.cicero = nextVersion;
                changed = true;
            }
        }

        const updatedDependencies = updateManagedDependencies(packageJson, 'dependencies', normalizedVersion, true);
        const updatedDevDependencies = updateManagedDependencies(packageJson, 'devDependencies', normalizedVersion, true);

        return updatedDependencies || updatedDevDependencies || changed;
    });

    return {
        targetVersion: normalizedVersion,
        updatedWorkspaceCount,
        updatedFixtureCount,
    };
}

if (require.main === module) {
    try {
        const result = bumpDependencies(process.argv[2]);
        console.log(
            `Updated ${result.updatedWorkspaceCount} workspace manifests and ${result.updatedFixtureCount} fixture manifests to ${result.targetVersion}.`
        );
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = {
    bumpDependencies,
    getFixtureManifestPaths,
    getWorkspaceManifestPaths,
    managedPackageNames,
    normalizeTargetVersion,
    rewriteVersion,
    serializePackageJson,
};
