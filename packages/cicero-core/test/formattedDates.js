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

describe('FormattedDates', () => {

    const formattedDatesInput = fs.readFileSync(path.resolve(__dirname, 'data/formatted-dates', 'sample.txt'), 'utf8');

    describe('#constructor', () => {

        it('should create a template that uses formatted dates', async function() {
            const template = await Template.fromDirectory('./test/data/formatted-dates');
            const clause = new Clause(template);
            clause.should.not.be.null;
        });
    });

    describe('#parse', () => {

        it('should be able to set the data from formatted-dates natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/formatted-dates');
            const clause = new Clause(template);
            clause.parse(formattedDatesInput);
            const result = clause.getData();
            delete result.clauseId;
            const data = {
                $class: 'org.accordproject.test.TemplateModel',
                dateTimeProperty: '2018-01-01T05:15:20.123+01:02',
            };
            result.should.eql(data);
        });
    });

    describe('#generateText', () => {

        it('should be able to roundtrip formatted-dates natural language text', async function() {
            const template = await Template.fromDirectory('./test/data/formatted-dates');
            const clause = new Clause(template);
            clause.parse(formattedDatesInput);
            const nl = clause.generateText();
            nl.should.equal(formattedDatesInput);
        });
    });
});