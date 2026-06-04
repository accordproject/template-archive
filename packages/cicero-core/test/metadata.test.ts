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

const ciceroVersion = require('../package.json').version;
import semver from 'semver';

import MetadataImport from '../src/metadata';
import TemplateLoader from '../src/templateloader';

// The src signatures do not mark optional params as optional; alias to a
// permissive type so call sites that omit defaulted args still type-check.
const Metadata: any = MetadataImport;

/**
 * Creates a caret range from a fixed version
 *
 * @param {string} version the version number
 * @returns {string} the caret range for that version number
 */
function caretRange(version) {
    return `^${version}`;
}

/**
 * Trims the pre-release tag
 *
 * @param {string} version the version number
 * @returns {string} the version number without pre-release tag
 */
function trimPreRelease(version) {
    return `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}`;
}

/**
 * Increases the patch number
 *
 * @param {string} version the version number
 * @returns {string} the version number with patch number increased by one
 */
function incPatch(version) {
    return semver.inc(version,'patch');
}

describe('Metadata', () => {

    describe('#constructor', () => {
        it('should throw an error if package.json is not provided', () => {
            expect(() => new Metadata()).toThrow('package.json is required and must be an object');
        });
        it('should throw an error if package.json is not an object', () => {
            expect(() => new Metadata('template')).toThrow('package.json is required and must be an object');
        });

        it('should throw an error if samples is not provided', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null)).toThrow('sample.md is required');
        });
        it('should throw an error if samples is not an object', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, 'sample')).toThrow('sample.md is required');
        });

        it('should throw an error if accordproject metadata is missing', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0'
            }, null, 'sample')).toThrow('Failed to find accordproject metadata in package.json');
        });

        it('should throw an error if request is not an object', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {}, 'request')).toThrow('request.json must be an object');
        });

        it('should throw an error if package.json does not contain a valid name', () => {
            expect(() => new Metadata({version: '1.0.0', accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}}, null, {})).toThrow('template name can only contain lowercase alphanumerics, _ or -');
            expect(() => new Metadata({
                name: 'template (no 1.)',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {})).toThrow('template name can only contain lowercase alphanumerics, _ or -');
        });

        it('should throw an error if readme is not a string', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, {}, {})).toThrow('README must be a string');
        });

        it('should throw an error if logo is not a Buffer', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, '', {}, {}, {})).toThrow('logo must be a Buffer');
        });

        it('should throw an error if keywords is not an array', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'contract',
                    cicero:ciceroVersion
                },
                keywords: {},
            }, null, {})).toThrow('keywords property in package.json must be an array.');
        });

        it('should throw an error if template isn\'t contract or clause', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'other',cicero:ciceroVersion},
            }, null, {})).toThrow('A cicero template must be either a "contract" or a "clause".');
        });

        it('should throw an error if cicero version is missing', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'other'},
            }, null, {})).toThrow('Failed to find accordproject cicero version in package.json');
        });

        it('should throw an error if template version is not valid semver ', () => {
            expect(() => new Metadata({
                name: 'template',
                version: 'BLAH',
                accordproject: {
                    template: 'clause',
                    cicero:ciceroVersion,
                    language: 'es6'
                },
            }, null, {})).toThrow('The template version must be a valid semantic version (semver) number.');
        });

        it('should throw an error if template version is not valid semver (1.0)', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0',
                accordproject: {
                    template: 'clause',
                    cicero:ciceroVersion,
                    language: 'es6'
                },
            }, null, {})).toThrow('The template version must be a valid semantic version (semver) number.');
        });

        it('should throw an error if cicero version is not valid semver range', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'clause',
                    cicero: 'BLAH',
                    language: 'es6'
                },
            }, null, {})).toThrow('The cicero version must be a valid semantic version (semver) range.');
        });

        it('should throw an error if cicero version is not valid semver for current version of cicero', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'clause',
                    cicero: '0.0.0',
                    language: 'es6'
                },
            }, null, {})).toThrow('The template targets Cicero version 0.0.0 but the current Cicero version is ');
        });

        it('should get the displayName from packageJson', () => {
            const displayName = 'My Display Name 👍 名称';
            const metadata = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'clause',
                    cicero:ciceroVersion,
                    language: 'es6'
                },
                displayName,
            }, null, {});
            expect(metadata.getDisplayName()).toBe(displayName);
        });

        it('should get the displayName by falling back to the name in packageJson', () => {
            const metadata = new Metadata({
                name: 'my-display_name',
                version: '1.0.0',
                accordproject: {
                    template: 'clause',
                    cicero:ciceroVersion,
                    language: 'es6'
                },
            }, null, {});
            expect(metadata.getDisplayName()).toBe('My Display Name');
        });

        it('should throw an error if the displayName is too long', () => {
            expect(() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'clause',
                    cicero:ciceroVersion,
                    language: 'es6'
                },
                displayName: new Array(216).join('A'),
            }, null, {})).toThrow('The template displayName property is limited to a maximum of 214 characters.');
        });
    });

    describe('#accessors', () => {
        it('should return metadata information', () => {
            const md = new Metadata({
                name: 'template',
                description: 'This is a template',
                version: '0.1.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, '#README', {
                en: 'sample'
            }, {
                '$class': 'org.accordproject.runtime@0.2.0.Request'
            });
            expect(md.getPackageJson()).not.toBeNull();
            expect(md.getVersion()).toBe('0.1.0');
            expect(md.getName()).toBe('template');
            expect(md.getIdentifier()).toBe('template@0.1.0');
            expect(md.getDescription()).toBe('This is a template');
        });
        it('should return all samples', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, '#README', {
                en: 'sample'
            }, {
                '$class': 'org.accordproject.runtime@0.2.0.Request'
            });
            expect(md.getSamples()).toEqual({
                en: 'sample'
            });
        });
        it('should return README', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, '#README', {
                en: 'sample'
            }, {
                '$class': 'org.accordproject.runtime@0.2.0.Request'
            });
            expect(md.getREADME()).toBe('#README');
        });
        it('should return request', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, '#README', {
                en: 'sample'
            }, {
                '$class': 'org.accordproject.runtime@0.2.0.Request'
            });
            expect(md.getRequest()).toEqual({
                '$class': 'org.accordproject.runtime@0.2.0.Request'
            });
        });
    });

    describe('#getSample(locale)', () => {

        it('should return requested sample', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion)}
            }, null, {
                en: 'sample'
            });
            expect(md.getSample('en')).toBe('sample');
        });
        it('should return null if sample is not in the samples', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            expect(md.getSample('en')).toBeNull();
            expect(md.getSample()).toBeNull();
            expect(md.getSample(null)).toBeNull();
        });

        it('should return default sample if locale not specified', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {
                default: 'sample'
            });
            expect(md.getSample()).toBe('sample');
        });
    });

    describe('#getType', () => {

        it('should return default type for a contract', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion)}
            }, null, {});
            expect(md.getTemplateType()).toBe(0);
        });
        it('should return for explicit contract type', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            expect(md.getTemplateType()).toBe(0);
        });
        it('should return for explicit clause type', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'clause',cicero:caretRange(ciceroVersion)}
            }, null, {});
            expect(md.getTemplateType()).toBe(1);
        });
    });

    describe('#satisfiesCiceroVersion', () => {

        it('should satisfy when cicero version is the same than current cicero version', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            expect(md.satisfiesCiceroVersion(ciceroVersion)).toBe(true);
        });
        it('should satisfy when cicero version has a lower patch number than cicero version', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            expect(md.satisfiesCiceroVersion(incPatch(ciceroVersion))).toBe(true);
        });
        it('should satisfy when cicero version has a lower patch number than current cicero version (with prerelease tag)', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            const version = `${incPatch(trimPreRelease(ciceroVersion))}-20190114233635`;
            expect(md.satisfiesCiceroVersion(version)).toBe(true);
        });
        it('should satisfy when cicero version has a lower patch number than current cicero version (with prerelease tag)', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = caretRange(ciceroVersion);
            const version = `${incPatch(trimPreRelease(ciceroVersion))}-20190114233635`;
            expect(md.satisfiesCiceroVersion(version)).toBe(true);
        });
        it('should not satisfy when cicero version has a lower minor number than current cicero version', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = '^0.11.0';
            expect(md.satisfiesCiceroVersion(ciceroVersion)).toBe(false);
        });
        it('should satisfy when cicero version is a prerelease for a version with patch number 0', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = '^0.12.0';
            expect(md.satisfiesCiceroVersion('0.12.0-20190114233635')).toBe(true);
        });
        it('should satisfy when cicero version is a prerelease for a version with patch number higher than 0', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = '^0.11.1';
            expect(md.satisfiesCiceroVersion('0.11.0-20190114233635')).toBe(false);
        });
        it('should not satisfy when cicero version has a higher minor number than current cicero version', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = '^0.11.0';
            expect(md.satisfiesCiceroVersion(ciceroVersion)).toBe(false);
        });
        it('should satisfy when cicero version has a higher minor number than current cicero version (with prerelease tag)', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = caretRange(ciceroVersion);
            expect(md.satisfiesCiceroVersion(`${trimPreRelease(ciceroVersion)}-20190114233635`)).toBe(true);
        });
    });

    describe('#getKeywords', () => {
        it('should return empty array of keywords when missing', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            expect(md.getKeywords()).toEqual([]);
        });
        it('should return empty array of keywords when null', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                keywords: null,
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            expect(md.getKeywords()).toEqual([]);
        });
        it('should return keywords when present', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                keywords: ['foo','bar'],
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            expect(md.getKeywords()).toEqual(['foo','bar']);
        });
    });

    describe('#getAuthor', () => {
        it('should return null when author is missing', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            expect(md.getAuthor()).toBeNull();
        });
        it('should return author when present', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                author: 'foo',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            expect(md.getAuthor()).toBe('foo');
        });
    });

    describe('#targetRuntime', () => {
        it('should return target runtime', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {
                en: 'sample'
            });
            expect(md.getRuntime()).toBe('es6');
        });

        it('should create a new metadata for the given target runtime', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion)}
            }, null, {
                en: 'sample'
            });
            const mdes5 = md.createTargetMetadata('es6');
            expect(mdes5.getPackageJson()).not.toBeNull();
            expect(mdes5.getName()).toBe('template');
            expect(mdes5.getRuntime()).toBe('es6');
        });
    });

    describe('#checkImage', () => {
        it('should not throw for correct png with correct dimensions', async () => {
            const buffer = await TemplateLoader.loadFileBuffer('./test/data', 'logo_128_128.png', true);
            expect(() => Metadata.checkImage(buffer)).not.toThrow();
        });
        it('should throw for correct png without correct dimensions', async () => {
            const buffer = await TemplateLoader.loadFileBuffer('./test/data', 'logo_256_256.png', true);
            expect(() => Metadata.checkImage(buffer)).toThrow('logo should be 128x128');
        });
        it('should throw for incorrect mime type', async () => {
            const buffer = await TemplateLoader.loadFileBuffer('./test/data', 'logo_wrong_mime.png', true);
            expect(() => Metadata.checkImage(buffer)).toThrow('the file type is not supported');
        });
        it('should throw for corrupted png', async () => {
            const buffer = await TemplateLoader.loadFileBuffer('./test/data', 'logo_corrupted.png', true);
            expect(() => Metadata.checkImage(buffer)).toThrow('not a valid png file');
        });
    });
});
