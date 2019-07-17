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

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const nearley = require('nearley');
const grammar = require('../lib/tdl.js');
let parser;

describe('Static Parser', () => {

    beforeEach(()=>{
        parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    });

    describe('Clause Template', () => {
        it('should parse a basic clause', () => {
            (()=> parser.feed('foo {{bar_}}\n')).should.not.throw();
            parser.results.should.not.be.empty;
        });

        it('should not parse a basic clause with invalid variable characters', () => {
            (()=> parser.feed('foo {{bar!}}\n')).should.throw();
            parser.should.not.have.property('results');
        });

        it('should parse a basic clause without a trailing carriage return', () => {
            (()=> parser.feed('foo {{bar}}')).should.not.throw();
            parser.results.should.not.be.empty;
        });

        // https://github.com/accordproject/cicero/issues/25
        it('should parse a clause without any variables', () => {
            (()=> parser.feed('foo\n')).should.not.throw();
            parser.results.should.not.be.empty;
        });

        it('should parse a basic clause with unicode characters', () => {
            (()=> parser.feed('ほげ {{bar}}\n')).should.not.throw();
            parser.should.not.be.empty;
        });

        it('should not parse a basic clause with unicode variable names', () => {
            (()=> parser.feed('foo {{ぴよ}}\n')).should.throw();
            parser.should.not.have.property('results');
        });
    });

    describe('Contract Template', () => {
        it('should parse a basic contract', () => {
            (()=> parser.feed('foo {{#clause bar}} foo {{/clause}}')).should.not.throw();
            parser.results.should.not.be.empty;
        });

        it('should parse a basic contract with a trailing carriage return', () => {
            (()=> parser.feed('foo {{#clause bar}} foo {{/clause}}\n')).should.not.throw();
            parser.results.should.not.be.empty;
        });

        it('should parse a basic contract with inline clause variables', () => {
            (()=> parser.feed('a {{#clause b}} c {{d}} {{/clause}}')).should.not.throw();
            parser.results.should.not.be.empty;
        });

        it('should parse a contract with multiple inline clause variables', () => {
            (()=> parser.feed('a {{#clause b}} c {{d}} {{/clause}}{{#clause e}} f {{g}} {{/clause}}')).should.not.throw();
            parser.results.should.not.be.empty;
        });

        it('should not parse a contract with a nested external clause variables', () => {
            (()=> parser.feed('a {{#clause b}} c {{>d}} {{/clause}}')).should.throw();
            parser.should.not.have.property('results');
        });

        it('should not parse a contract with a nested inline clause variables', () => {
            (()=> parser.feed('a {{#clause b}} c {{#clause d}} {{/clause}} {{/clause}}')).should.throw();
            parser.should.not.have.property('results');
        });

        it('should parse a basic contract with external clause variables', () => {
            (()=> parser.feed('a {{>b}}')).should.not.throw();
            parser.results.should.not.be.empty;
        });
    });
});