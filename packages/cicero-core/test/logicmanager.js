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

const LogicManager = require('../src/logicmanager');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const fs = require('fs');

const ctoSample = fs.readFileSync('./test/data/test.cto','utf8');
const jsSample = fs.readFileSync('./test/data/test.js', 'utf8');
const jsSample2 = fs.readFileSync('./test/data/test2.js', 'utf8');

describe('LogicManager', () => {
    describe('#constructors-accessors', () => {

        it('should create a template logic', () => {
            const logicManager = new LogicManager('es6');
            logicManager.should.not.be.null;
            logicManager.getIntrospector().should.not.be.null;
            logicManager.getScriptManager().should.not.be.null;
            logicManager.getModelManager().should.not.be.null;
        });

        it('should load a model to the model manager', () => {
            const logicManager = new LogicManager('es6');
            const modelFile = logicManager.getModelManager().addCTOModel(ctoSample,'test.cto');
            modelFile.should.not.be.null;
        });

        it('should load a model to the model manager (bulk)', () => {
            const logicManager = new LogicManager('es6');
            const modelFiles = logicManager.getModelManager().addModelFiles([ctoSample],['test.cto']);
            modelFiles.should.not.be.null;
        });

        it.skip('should load a logic file to the script manager', () => {
            const logicManager = new LogicManager('es6');
            logicManager.getScriptManager().getCompiledScript().getContents().length.should.equal(47864);
            logicManager.getScriptManager().getCompiledScript().getContents().length.should.equal(47864);
            logicManager.registerCompiledLogicSync();
            logicManager.getScriptManager().getCompiledScript().getContents().length.should.equal(47864);
            logicManager.registerCompiledLogicSync();
            logicManager.getScriptManager().getCompiledScript().getContents().length.should.equal(47864);
        });

        it.skip('should register a logic file to the script manager', () => {
            const logicManager = new LogicManager('es6');
            logicManager.registerCompiledLogicSync();
            logicManager.getScriptManager().getCompiledScript().getContents().length.should.equal(47864);
        });

        it('should succeed creating a dispatch call for a JS logic file with a contract class (ES6)', () => {
            const logicManager = new LogicManager('es6');
            logicManager.addLogicFile(jsSample2,'test2.js');
        });

        it('should succeed creating an invoke call for a JS logic file with a contract class (ES6)', () => {
            const logicManager = new LogicManager('es6');
            logicManager.addLogicFile(jsSample2,'test2.js');
        });

        it('should succeed creating an invoke call for a JS logic file with a contract class (ES6)', () => {
            const logicManager = new LogicManager('es6');
            logicManager.addLogicFile(jsSample2,'test2.js');
        });

        it('should fail creating an invoke call for a JS logic file with no contract class (ES6)', () => {
            const logicManager = new LogicManager('es6');
            logicManager.addLogicFile(jsSample,'test.js');
        });

    });
});
