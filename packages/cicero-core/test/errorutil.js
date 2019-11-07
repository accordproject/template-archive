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

const chai = require('chai');

const should = chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const ParseException = require('@accordproject/concerto-core').ParseException;
const locationOfError = require('../lib/errorutil').locationOfError;

describe('Determine Error Location', () => {

    beforeEach(()=>{
    });

    it('when location is present', () => {
        const loc = locationOfError(new ParseException('Parse failed invalid syntax at line 34 col 56', null, 'myfile', null, 'cicero-core'));
        loc.start.line.should.eql(34);
        loc.start.column.should.eql(56);
        loc.end.line.should.eql(34);
        loc.end.endColumn.should.eql(57);
    });

    it('when location is absent', () => {
        const loc = locationOfError(new ParseException('Parse failed invalid syntax at XXX', null, 'myfile', null, 'cicero-core'));
        loc.should.eql('Parse failed invalid syntax at XXX File myfile');
    });

    it('when the error is absent', () => {
        const loc = locationOfError(null);
        should.equal(loc, null);
    });
});