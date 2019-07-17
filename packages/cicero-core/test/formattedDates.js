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

const Template = require('../lib/template');
const Clause = require('../lib/clause');

const chai = require('chai');
const fs = require('fs');
const path = require('path');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const getTestTemplates = p => fs.readdirSync(p).filter(f => {return f.startsWith('formatted-dates-') && fs.statSync(path.join(p, f)).isDirectory();});
const testTemplates = getTestTemplates(path.resolve(__dirname, 'data/'));

describe('FormattedDates', () => {

    testTemplates.forEach(testTemplate => {
        describe(`#constructor - ${testTemplate}`, () => {

            it('should create a template that uses formatted dates', async function() {
                const location = path.resolve(__dirname, `data/${testTemplate}`);
                const template = await Template.fromDirectory(location);
                const clause = new Clause(template);
                clause.should.not.be.null;
            });
        });

        describe(`#parse - ${testTemplate}`, () => {

            it('should be able to set the data from formatted-dates natural language text', async function() {
                const location = path.resolve(__dirname, `data/${testTemplate}`);
                const template = await Template.fromDirectory(location);
                const clause = new Clause(template);
                const formattedDatesInput = fs.readFileSync(path.resolve(__dirname, 'data/', testTemplate + '/sample.txt'), 'utf8');
                clause.parse(formattedDatesInput, '2019-01-04T00:00:00Z');
                const result = clause.getData();
                delete result.clauseId;
                const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/', testTemplate + '/expected.json'), 'utf8'));
                result.should.eql(expected);
            });
        });

        describe(`#generateText - ${testTemplate}`, () => {

            it('should be able to roundtrip formatted-dates natural language text', async function() {
                const location = path.resolve(__dirname, `data/${testTemplate}`);
                const template = await Template.fromDirectory(location);
                const clause = new Clause(template);
                const formattedDatesInput = fs.readFileSync(path.resolve(__dirname, 'data/', testTemplate + '/sample.txt'), 'utf8');
                clause.parse(formattedDatesInput);
                const nl = await clause.generateText(null, '2019-01-04T00:00:00+01:02');
                nl.should.equal(formattedDatesInput);
            });
        });
    });
});