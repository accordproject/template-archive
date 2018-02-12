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

const Metadata = require('../lib/metadata');

const chai = require('chai');

const should = chai.should();
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('Metadata', () => {

    describe('constructor', () => {
        it('should throw an error if package.json is not provided', () => {
            (() => new Metadata()).should.throw('package.json is required and must be an object');
        });
        it('should throw an error if package.json is not an object', () => {
            (() => new Metadata('template')).should.throw('package.json is required and must be an object');
        });

        it('should throw an error if samples is not provided', () => {
            (() => new Metadata({
                name: 'template'
            }, null)).should.throw('sample.txt is required');
        });
        it('should throw an error if samples is not an object', () => {
            (() => new Metadata({
                name: 'template'
            }, null, 'sample')).should.throw('sample.txt is required');
        });

        it('should throw an error if package.json does not contain a valid name', () => {
            (() => new Metadata({}, null, {})).should.throw('template name can only contain lowercase alphanumerics, _ or -');
            (() => new Metadata({
                name: 'template (no 1.)'
            }, null, {})).should.throw('template name can only contain lowercase alphanumerics, _ or -');
        });

        it('should throw an error if readme is not a string', () => {
            (() => new Metadata({
                name: 'template'
            }, {}, {})).should.throw('README must be a string');
        });

    });

    describe('#getSample(locale)', () => {

        it('should return requested sample', () => {
            const md = new Metadata({
                name: 'template'
            }, null, {
                en: 'sample'
            });
            md.getSample('en').should.be.equal('sample');
        });
        it('should return null if sample is not in the samples', () => {
            const md = new Metadata({
                name: 'template'
            }, null, {});
            should.not.exist(md.getSample('en'));
            should.not.exist(md.getSample());
            should.not.exist(md.getSample(null));
        });

        it('should return default sample if locale not specified', () => {
            const md = new Metadata({
                name: 'template'
            }, null, {
                default: 'sample'
            });
            md.getSample().should.be.equal('sample');
        });
    });
});