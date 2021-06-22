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
const Instance = require('../lib/instance');
const ContractInstance = require('../lib/contractinstance');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const options = { offline: true };

describe('Instance', () => {
    describe('#constructor', () => {

        it('should fail to instantiate', async function() {
            (() => new Instance()).should.throw('Abstract class "Instance" cannot be instantiated directly.');
        });
    });

    describe('#archive', () => {

        it('should roundtrip a smart legal contract (Ergo)', async function() {
            const template = await Template.fromDirectory('./test/data/copyright-license', options);
            const instance = ContractInstance.fromTemplate(template);

            const buffer = await instance.toArchive('ergo');
            buffer.should.not.be.null;

            const instance2 = await ContractInstance.fromArchive(buffer);
            instance2.getIdentifier().should.equal(instance.getIdentifier());
            instance2.getData().should.deep.equal(instance.getData());
            instance2.getGrammar().should.equal(instance.getGrammar());
            instance2.getTemplateMark().should.deep.equal(instance.getTemplateMark());
        });
    });
});
