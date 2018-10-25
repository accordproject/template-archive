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

const ScriptManager = require('../lib/scriptmanager');
const CiceroModelManager = require('../lib/ciceromodelmanager');

const modelManager = new CiceroModelManager();
const jsSample = fs.readFileSync('./test/data/test.js','utf8');
const jsSample2 = fs.readFileSync('./test/data/test2.js','utf8');
const ergoSample = fs.readFileSync('./test/data/test.ergo', 'utf8');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('ScriptManager', () => {

    describe('#constructor', () => {

        it('should instantiate a script manager', async function() {
            (() => new ScriptManager(modelManager)).should.not.be.null;
        });

        it('should support both JavaScript and Ergo scripts', async function() {
            const scriptManager = new ScriptManager(modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            scriptManager.addScript(script2);
            scriptManager.getScript('test.js').should.not.be.null;
            scriptManager.getScript('test.ergo').should.not.be.null;
        });

        it('should delete both JavaScript and Ergo scripts if they exist', async function() {
            const scriptManager = new ScriptManager(modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            scriptManager.addScript(script2);
            scriptManager.getScript('test.js').should.not.be.null;
            scriptManager.getScript('test.ergo').should.not.be.null;
            scriptManager.deleteScript('test.js');
            scriptManager.deleteScript('test.ergo');
            scriptManager.getScripts().length.should.equal(0);
        });

        it('should fail deleting a script which does not exist', async function() {
            const scriptManager = new ScriptManager(modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            scriptManager.addScript(script1);
            return (() => scriptManager.deleteScript('test.ergo')).should.throw('Script file does not exist');
        });

        it('should clear scripts', async function() {
            const scriptManager = new ScriptManager(modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            scriptManager.addScript(script2);
            scriptManager.getScript('test.js').should.not.be.null;
            scriptManager.getScript('test.ergo').should.not.be.null;
            scriptManager.clearScripts();
        });

        it('should get scripts identifiers', async function() {
            const scriptManager = new ScriptManager(modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            scriptManager.addScript(script2);
            scriptManager.getScriptIdentifiers().should.deep.equal(['test.js','test.ergo']);
        });

        it('should update script', async function() {
            const scriptManager = new ScriptManager(modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            const script2 = scriptManager.createScript('test.js','.js',jsSample2);
            scriptManager.addScript(script1);
            scriptManager.getScript('test.js').getTokens().length.should.equal(39);
            scriptManager.updateScript(script2);
            scriptManager.getScript('test.js').getTokens().length.should.equal(32);
        });

        it('should fail updating a script which does not exist', async function() {
            const scriptManager = new ScriptManager(modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            return (() => scriptManager.updateScript(script2)).should.throw('Script file does not exist');
        });

        it('should modify script', async function() {
            const scriptManager = new ScriptManager(modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            scriptManager.addScript(script1);
            scriptManager.modifyScript('test.js','.js',jsSample2);
            scriptManager.getScript('test.js').getTokens().length.should.equal(32);
        });

    });

});
