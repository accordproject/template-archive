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

const Chai = require('chai');
Chai.should();
Chai.use(require('chai-things'));
Chai.use(require('chai-as-promised'));

const Fs = require('fs');
const Path = require('path');

const ModelManager = require('composer-common').ModelManager;
const ModelFile = require('composer-common/lib/introspect/modelfile');

describe('cicero-common', () => {
    const contractCtoFile = Path.resolve(__dirname, '..', 'models','common.cto');
    const contractCtoText = Fs.readFileSync(contractCtoFile, 'utf8');
    describe('#valid', () => {
        let modelManager = new ModelManager();
        it('contract model should be valid', () => {
            let modelFile = new ModelFile(modelManager, contractCtoText);
            modelManager.addModelFile(modelFile);
            (() => modelFile.validate()).should.not.throw();
        });
    });

});