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

import LogicManager from '../src/logicmanager';

import fs from 'fs';

const ctoSample = fs.readFileSync('./test/data/test.cto', 'utf8');

describe('LogicManager', () => {
    describe('#constructors-accessors', () => {

        it('should create a template logic', () => {
            const logicManager = new LogicManager('es6');
            expect(logicManager).not.toBeNull();
            expect(logicManager.getIntrospector()).not.toBeNull();
            expect(logicManager.getScriptManager()).not.toBeNull();
            expect(logicManager.getModelManager()).not.toBeNull();
        });

        it('should load a model to the model manager', () => {
            const logicManager = new LogicManager('es6');
            const modelFile = logicManager.getModelManager().addCTOModel(ctoSample, 'test.cto');
            expect(modelFile).not.toBeNull();
        });

        it('should load a model to the model manager (bulk)', () => {
            const logicManager = new LogicManager('es6');
            const modelFiles = logicManager.getModelManager().addModelFiles([ctoSample], ['test.cto']);
            expect(modelFiles).not.toBeNull();
        });

        it('should throw an error for unsupported language', () => {
            expect(() => new LogicManager('invalid-language')).toThrow('Unknown language invalid-language');
        });
    });
});
