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

const semver = require('semver');
const targetVersion = process.argv[2];

if (!semver.valid(targetVersion)) {
    console.error(`Error: the version "${targetVersion}" is invalid!`);
    process.exit(1);
}

const prerelease = semver.prerelease(targetVersion);
const tag = prerelease ? 'unstable' : 'stable';

console.log(`::set-output name=tag::--tag=${tag}`);
