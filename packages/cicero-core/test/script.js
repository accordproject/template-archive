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

const Script = require('../src/script');
const { ModelManager } = require('@accordproject/concerto-core');

const chai = require('chai');
const fs = require('fs');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const jsSample = fs.readFileSync('./test/data/test.js','utf8');
const ctoSample = fs.readFileSync('./test/data/test.cto','utf8');

describe('Script', () => {
    let modelManager;

    beforeEach(async function () {
        modelManager = new ModelManager();
        modelManager.addCTOModel(ctoSample,'test.cto',true);
    });

    describe('#constructor', () => {

        it('should instantiate a JavaScript script', async function() {
            const script = new Script(modelManager,'test.js','.js',jsSample);
            script.getLanguage().should.equal('.js');
            script.getIdentifier().should.equal('test.js');
        });

        it('should fail to instantiate for empty script', async function() {
            (() => new Script(modelManager,'test.js','.js','')).should.throw('Empty script contents');
        });
    });
});
