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
const semver = require('semver');

const Metadata = require('../src/metadata');
const TemplateLoader = require('../src/templateloader');

const chai = require('chai');

const should = chai.should();
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

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
            (() => new Metadata()).should.throw('package.json is required and must be an object');
        });
        it('should throw an error if package.json is not an object', () => {
            (() => new Metadata('template')).should.throw('package.json is required and must be an object');
        });

        it('should throw an error if samples is not provided', () => {
            (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null)).should.throw('sample.md is required');
        });
        it('should throw an error if samples is not an object', () => {
            (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, 'sample')).should.throw('sample.md is required');
        });

        it('should throw an error if accordproject metadata is missing', () => {
            (() => new Metadata({
                name: 'template',
                version: '1.0.0'
            }, null, 'sample')).should.throw('Failed to find accordproject metadata in package.json');
        });

        it('should throw an error if request is not an object', () => {
            (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {}, 'request')).should.throw('request.json must be an object');
        });

        it('should throw an error if package.json does not contain a valid name', () => {
            (() => new Metadata({version: '1.0.0', accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}}, null, {})).should.throw('template name can only contain lowercase alphanumerics, _ or -');
            (() => new Metadata({
                name: 'template (no 1.)',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {})).should.throw('template name can only contain lowercase alphanumerics, _ or -');
        });

        it('should throw an error if readme is not a string', () => {
            (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, {}, {})).should.throw('README must be a string');
        });

        it('should throw an error if logo is not a Buffer', () => {
            (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, '', {}, {}, {})).should.throw('logo must be a Buffer');
        });

        it('should throw an error if keywords is not an array', () => {
            return (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'contract',
                    cicero:ciceroVersion
                },
                keywords: {},
            }, null, {})).should.throw('keywords property in package.json must be an array.');
        });

        it('should throw an error if template isn\'t contract or clause', () => {
            return (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'other',cicero:ciceroVersion},
            }, null, {})).should.throw('A cicero template must be either a "contract" or a "clause".');
        });

        it('should throw an error if cicero version is missing', () => {
            return (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'other'},
            }, null, {})).should.throw('Failed to find accordproject cicero version in package.json');
        });

        it('should throw an error if template version is not valid semver ', () => {
            return (() => new Metadata({
                name: 'template',
                version: 'BLAH',
                accordproject: {
                    template: 'clause',
                    cicero:ciceroVersion,
                    language: 'es6'
                },
            }, null, {})).should.throw('The template version must be a valid semantic version (semver) number.');
        });

        it('should throw an error if template version is not valid semver (1.0)', () => {
            return (() => new Metadata({
                name: 'template',
                version: '1.0',
                accordproject: {
                    template: 'clause',
                    cicero:ciceroVersion,
                    language: 'es6'
                },
            }, null, {})).should.throw('The template version must be a valid semantic version (semver) number.');
        });

        it('should throw an error if cicero version is not valid semver range', () => {
            return (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'clause',
                    cicero: 'BLAH',
                    language: 'es6'
                },
            }, null, {})).should.throw('The cicero version must be a valid semantic version (semver) range.');
        });

        it('should throw an error if cicero version is not valid semver for current version of cicero', () => {
            return (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'clause',
                    cicero: '0.0.0',
                    language: 'es6'
                },
            }, null, {})).should.throw('The template targets Cicero version 0.0.0 but the current Cicero version is ');
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
            metadata.getDisplayName().should.equal(displayName);
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
            metadata.getDisplayName().should.equal('My Display Name');
        });

        it('should throw an error if the displayName is too long', () => {
            return (() => new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {
                    template: 'clause',
                    cicero:ciceroVersion,
                    language: 'es6'
                },
                displayName: new Array(216).join('A'),
            }, null, {})).should.throw('The template displayName property is limited to a maximum of 214 characters.');
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
            md.getPackageJson().should.not.be.null;
            md.getVersion().should.equal('0.1.0');
            md.getName().should.equal('template');
            md.getIdentifier().should.equal('template@0.1.0');
            md.getDescription().should.equal('This is a template');
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
            md.getSamples().should.deep.equal({
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
            md.getREADME().should.equal('#README');
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
            md.getRequest().should.deep.equal({
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
            md.getSample('en').should.be.equal('sample');
        });
        it('should return null if sample is not in the samples', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            should.not.exist(md.getSample('en'));
            should.not.exist(md.getSample());
            should.not.exist(md.getSample(null));
        });

        it('should return default sample if locale not specified', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {
                default: 'sample'
            });
            md.getSample().should.be.equal('sample');
        });
    });

    describe('#getType', () => {

        it('should return default type for a contract', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.getTemplateType().should.be.equal(0);
        });
        it('should return for explicit contract type', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.getTemplateType().should.be.equal(0);
        });
        it('should return for explicit clause type', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'clause',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.getTemplateType().should.be.equal(1);
        });
    });

    describe('#satisfiesCiceroVersion', () => {

        it('should satisfy when cicero version is the same than current cicero version', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.satisfiesCiceroVersion(ciceroVersion).should.be.equal(true);
        });
        it('should satisfy when cicero version has a lower patch number than cicero version', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.satisfiesCiceroVersion(incPatch(ciceroVersion)).should.be.equal(true);
        });
        it('should satisfy when cicero version has a lower patch number than current cicero version (with prerelease tag)', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            const version = `${incPatch(trimPreRelease(ciceroVersion))}-20190114233635`;
            md.satisfiesCiceroVersion(version).should.be.equal(true);
        });
        it('should satisfy when cicero version has a lower patch number than current cicero version (with prerelease tag)', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = caretRange(ciceroVersion);
            const version = `${incPatch(trimPreRelease(ciceroVersion))}-20190114233635`;
            md.satisfiesCiceroVersion(version).should.be.equal(true);
        });
        it('should not satisfy when cicero version has a lower minor number than current cicero version', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = '^0.11.0';
            md.satisfiesCiceroVersion(ciceroVersion).should.be.equal(false);
        });
        it('should satisfy when cicero version is a prerelease for a version with patch number 0', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:'^0.25.0-alpha.1'}
            }, null, {});
            md.ciceroVersion = '^0.12.0';
            md.satisfiesCiceroVersion('0.12.0-20190114233635').should.be.equal(true);
        });
        it('should satisfy when cicero version is a prerelease for a version with patch number higher than 0', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = '^0.11.1';
            md.satisfiesCiceroVersion('0.11.0-20190114233635').should.be.equal(false);
        });
        it('should not satisfy when cicero version has a higher minor number than current cicero version', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = '^0.11.0';
            md.satisfiesCiceroVersion(ciceroVersion).should.be.equal(false);
        });
        it('should satisfy when cicero version has a higher minor number than current cicero version (with prerelease tag)', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {template: 'contract',cicero:caretRange(ciceroVersion)}
            }, null, {});
            md.ciceroVersion = caretRange(ciceroVersion);
            md.satisfiesCiceroVersion(`${trimPreRelease(ciceroVersion)}-20190114233635`).should.be.equal(true);
        });
    });

    describe('#getKeywords', () => {
        it('should return empty array of keywords when missing', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            md.getKeywords().should.deep.equal([]);
        });
        it('should return empty array of keywords when null', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                keywords: null,
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            md.getKeywords().should.deep.equal([]);
        });
        it('should return keywords when present', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                keywords: ['foo','bar'],
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            md.getKeywords().should.deep.equal(['foo','bar']);
        });
    });

    describe('#getAuthor', () => {
        it('should return null when author is missing', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            should.not.exist(md.getAuthor());
        });
        it('should return author when present', () => {
            const md = new Metadata({
                name: 'template',
                version: '1.0.0',
                author: 'foo',
                accordproject: {cicero:caretRange(ciceroVersion),runtime:'es6'}
            }, null, {});
            md.getAuthor().should.equal('foo');
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
            md.getRuntime().should.be.equal('es6');
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
            mdes5.getPackageJson().should.not.be.null;
            mdes5.getName().should.equal('template');
            mdes5.getRuntime().should.equal('es6');
        });
    });

    describe('#checkImage', () => {
        it('should not throw for correct png with correct dimensions', async () => {
            const buffer = await TemplateLoader.loadFileBuffer('./test/data', 'logo_128_128.png', true);
            (() => Metadata.checkImage(buffer)).should.not.throw();
        });
        it('should throw for correct png without correct dimensions', async () => {
            const buffer = await TemplateLoader.loadFileBuffer('./test/data', 'logo_256_256.png', true);
            (() => Metadata.checkImage(buffer)).should.throw('logo should be 128x128');
        });
        it('should throw for incorrect mime type', async () => {
            const buffer = await TemplateLoader.loadFileBuffer('./test/data', 'logo_wrong_mime.png', true);
            (() => Metadata.checkImage(buffer)).should.throw('the file type is not supported');
        });
        it('should throw for corrupted png', async () => {
            const buffer = await TemplateLoader.loadFileBuffer('./test/data', 'logo_corrupted.png', true);
            (() => Metadata.checkImage(buffer)).should.throw('not a valid png file');
        });
    });
});
