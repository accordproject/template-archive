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

const fs = require('fs');

const ScriptManager = require('../src/scriptmanager');
const APModelManager = require('../src/apmodelmanager');

const modelManager = new APModelManager();
const jsSample = fs.readFileSync('./test/data/test.js','utf8');
const jsSample2 = fs.readFileSync('./test/data/test2.js','utf8');

describe('ScriptManager', () => {

    describe('#constructor', () => {

        it('should instantiate a script manager', async function() {
            (() => new ScriptManager('es6',modelManager)).should.not.be.null;
        });

        it('should support both JavaScript scripts', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','js',jsSample);
            scriptManager.addScript(script1);
            scriptManager.getScript('test.js').should.not.be.null;
            scriptManager.getScripts().length.should.equal(1);
            scriptManager.getScriptsForTarget('ergo').length.should.equal(0);
            scriptManager.getScriptsForTarget('js').length.should.equal(1);
            scriptManager.getScriptsForTarget('java').length.should.equal(0);
        });

        // it('should compile Ergo scripts', async function() {
        //     const scriptManager = new ScriptManager('es6',modelManager, null, {});
        //     const script1 = scriptManager.createScript('test.js','.js',jsSample);
        //     const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
        //     scriptManager.addScript(script1);
        //     scriptManager.addScript(script2);
        //     scriptManager.compileLogic().getContents().length.should.equal(47864);
        //     scriptManager.getCompiledScript().getContents().length.should.equal(47864);
        //     scriptManager.getAllScripts().length.should.equal(3);
        // });

        // it('should fail to compile an Ergo script with a parse error', async function() {
        //     const scriptManager = new ScriptManager('es6',modelManager);
        //     const script1 = scriptManager.createScript('test.js','.js',jsSample);
        //     const script2 = scriptManager.createScript('test2.ergo','.ergo',ergoSample2);
        //     scriptManager.addScript(script1);
        //     scriptManager.addScript(script2);
        //     (() => scriptManager.compileLogic()).should.throw('Parse error (at file test2.ergo line 33 col 0). ');
        // });

        // it('should return no compiled script when no Ergo or JS', async function() {
        //     const scriptManager = new ScriptManager('es6',modelManager);
        //     scriptManager.getCombinedScripts().should.equal('');
        //     should.equal(scriptManager.compileLogic(false),null);
        // });
        // it('should return no combined script when not compiled', async function() {
        //     const scriptManager = new ScriptManager('es6',modelManager);
        //     const script2 = scriptManager.createScript('test2.ergo','.ergo',ergoSample2);
        //     scriptManager.addScript(script2);
        //     scriptManager.getCombinedScripts().should.equal('');
        // });

        // it('should fail to compile an Ergo script with an undefined built-in function', async function() {
        //     const scriptManager = new ScriptManager('es6',modelManager);
        //     const ergoErr = fs.readFileSync(Path.join(TESTS_DIR,'smoke/builtinErr.ergo'), 'utf8');
        //     const script1 = scriptManager.createScript('builtinErr.ergo','.ergo',ergoErr);
        //     scriptManager.addScript(script1);
        //     (() => scriptManager.compileLogic()).should.throw('System error. [ec2en/function] Function org.accordproject.builtin.foo did not get inlined');
        // });

        it('should delete both JavaScript and Ergo scripts if they exist', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            // const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            // scriptManager.addScript(script2);
            scriptManager.getScript('test.js').should.not.be.null;
            // scriptManager.getScript('test.ergo').should.not.be.null;
            scriptManager.deleteScript('test.js');
            // scriptManager.deleteScript('test.ergo');
            scriptManager.getScripts().length.should.equal(0);
        });

        it('should fail deleting a script which does not exist', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            scriptManager.addScript(script1);
            return (() => scriptManager.deleteScript('test.ergo')).should.throw('Script file does not exist');
        });

        it('should clear scripts', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            // const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            // scriptManager.addScript(script2);
            scriptManager.getScript('test.js').should.not.be.null;
            // scriptManager.getScript('test.ergo').should.not.be.null;
            scriptManager.clearScripts();
        });

        it('should get scripts identifiers', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            // const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            // scriptManager.addScript(script2);
            scriptManager.getScriptIdentifiers().should.deep.equal(['test.js']);
        });

        it('should update script', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            const script2 = scriptManager.createScript('test.js','.js',jsSample2);
            scriptManager.addScript(script1);
            scriptManager.getScript('test.js').getContents().should.equal(jsSample);
            scriptManager.updateScript(script2);
            scriptManager.getScript('test.js').getContents().should.equal(jsSample2);
        });

        it('should fail updating a script which does not exist', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            // const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            // scriptManager.addScript(script1);
            return (() => scriptManager.updateScript(script1)).should.throw('Script file does not exist');
        });

        it('should modify script', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            scriptManager.addScript(script1);
            scriptManager.modifyScript('test.js','.js',jsSample2);
            scriptManager.getScript('test.js').getContents().should.equal(jsSample2);
        });

        it('clear all scripts', async function() {
            const scriptManager = new ScriptManager('es6',modelManager);
            const script1 = scriptManager.createScript('test.js','.js',jsSample);
            // const script2 = scriptManager.createScript('test.ergo','.ergo',ergoSample);
            scriptManager.addScript(script1);
            // scriptManager.addScript(script2);
            // scriptManager.compileLogic().getContents().length.should.equal(47864);
            // scriptManager.getCompiledJavaScript().length.should.equal(47864);
            scriptManager.clearScripts();
            return scriptManager.getScripts().length.should.equal(0);
        });

    });

});
