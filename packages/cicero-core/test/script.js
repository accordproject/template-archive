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
const fs = require('fs');

const Script = require('../lib/script');
const CiceroModelManager = require('../lib/ciceromodelmanager');

const modelManager = new CiceroModelManager();
const jsSample = fs.readFileSync('./test/data/test.js','utf8');
const ergoSample = fs.readFileSync('./test/data/test.ergo', 'utf8');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('Script', () => {

    describe('#constructor', () => {

        it('should instantiate a JavaScript script', async function() {
            const script = new Script(modelManager,'test.js','.js',jsSample);
            script.getName().should.equal('test.js');
            script.getContents().should.equal(jsSample);
            script.getTokens().length.should.equal(39);
        });

        it('should instantiate an Ergo script', async function() {
            const script = new Script(modelManager,'test.ergo','.ergo',ergoSample);
            script.getName().should.equal('test.ergo');
            script.getContents().should.equal(ergoSample);
            script.getTokens().length.should.equal(0);
        });

        it('should fail to instantiate for empty script', async function() {
            (() => new Script(modelManager,'test.js','.js','')).should.throw('Empty script contents');
        });

        it('should fail to instantiate for buggy JavaScript', async function() {
            (() => new Script(modelManager,'test.js','.js','foo bar')).should.throw('Failed to parse test.js: Unexpected token');
        });

    });

});
