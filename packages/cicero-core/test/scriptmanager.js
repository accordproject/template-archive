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
const Script = require('../src/script');
const Function = require('../src/function');

const jsSample = fs.readFileSync('./test/data/test.js','utf8');
const jsSample2 = fs.readFileSync('./test/data/test2.js','utf8');

describe('ScriptManager', () => {

    describe('#constructor', () => {

        it('should instantiate a script manager', async function() {
            (() => new ScriptManager()).should.not.be.null;
        });

        it('should support both JavaScript scripts', async function() {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            scriptManager.getScript('test.js').should.not.be.null;
            scriptManager.getScripts().length.should.equal(1);
            scriptManager.getScriptsForTarget('es6').length.should.equal(1);
        });

        it('should delete JavaScript scripts if they exist', async function() {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            scriptManager.getScript('test.js').should.not.be.null;
            scriptManager.deleteScript('test.js');
            scriptManager.getScripts().length.should.equal(0);
        });

        it('should fail deleting a script which does not exist', async function() {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            return (() => scriptManager.deleteScript('test.foo')).should.throw('Script file does not exist');
        });

        it('should get scripts identifiers', async function() {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            scriptManager.getScriptIdentifiers().should.deep.equal(['test.js']);
        });

        it('should update script', async function() {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            const script2 = scriptManager.createScript('test.js','.js',jsSample2);
            scriptManager.addScript(script1);
            scriptManager.getScript('test.js').getContents().should.equal(jsSample);
            scriptManager.updateScript(script2);
            scriptManager.getScript('test.js').getContents().should.equal(jsSample2);
        });

        it('should fail updating a script which does not exist', async function() {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            return (() => scriptManager.updateScript(script1)).should.throw('Script file does not exist');
        });

        it('should modify script', async function() {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            scriptManager.modifyScript('test.js','es6',jsSample2);
            scriptManager.getScript('test.js').getContents().should.equal(jsSample2);
        });

        it('clear all scripts', async function() {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            scriptManager.clearScripts();
            return scriptManager.getScripts().length.should.equal(0);
        });

    });

    describe('#getFunctions (regression: dd75611)', () => {

        it('should not throw a TypeError when calling getFunctions', () => {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            (() => scriptManager.getFunctions()).should.not.throw();
        });

        it('should return an empty array when scripts have no function declarations', () => {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            scriptManager.getFunctions().should.deep.equal([]);
        });

        it('should aggregate function declarations from loaded scripts', () => {
            const scriptManager = new ScriptManager();
            const func1 = new Function('paymentClause', []);
            const func2 = new Function('__dispatch', []);
            const script1 = new Script('test.js', 'es6', [func1, func2], jsSample);
            scriptManager.addScript(script1);
            const functions = scriptManager.getFunctions();
            functions.length.should.equal(2);
            functions[0].getName().should.equal('paymentClause');
            functions[1].getName().should.equal('__dispatch');
        });

        it('should aggregate functions across multiple scripts', () => {
            const scriptManager = new ScriptManager();
            const func1 = new Function('paymentClause', []);
            const func2 = new Function('__dispatch', []);
            const script1 = new Script('test.js', 'es6', [func1], jsSample);
            const script2 = new Script('test2.js', 'es6', [func2], jsSample2);
            scriptManager.addScript(script1);
            scriptManager.addScript(script2);
            const functions = scriptManager.getFunctions();
            functions.length.should.equal(2);
            functions.map(f => f.getName()).should.include.members(['paymentClause', '__dispatch']);
        });
    });

    describe('#hasFunction (regression: dd75611)', () => {

        it('should return true for an existing function', () => {
            const scriptManager = new ScriptManager();
            const func1 = new Function('paymentClause', []);
            const script1 = new Script('test.js', 'es6', [func1], jsSample);
            scriptManager.addScript(script1);
            scriptManager.hasFunction('paymentClause').should.be.true;
        });

        it('should return false for a non-existent function', () => {
            const scriptManager = new ScriptManager();
            const func1 = new Function('paymentClause', []);
            const script1 = new Script('test.js', 'es6', [func1], jsSample);
            scriptManager.addScript(script1);
            scriptManager.hasFunction('nonExistent').should.be.false;
        });

        it('should not throw a TypeError when checking function existence', () => {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            (() => scriptManager.hasFunction('anything')).should.not.throw();
        });
    });

    describe('#getFunction (regression: dd75611)', () => {

        it('should return the correct function declaration by name', () => {
            const scriptManager = new ScriptManager();
            const func1 = new Function('paymentClause', []);
            const func2 = new Function('__dispatch', []);
            const script1 = new Script('test.js', 'es6', [func1, func2], jsSample);
            scriptManager.addScript(script1);
            const result = scriptManager.getFunction('paymentClause');
            result.getName().should.equal('paymentClause');
        });

        it('should throw an error for a non-existent function', () => {
            const scriptManager = new ScriptManager();
            const func1 = new Function('paymentClause', []);
            const script1 = new Script('test.js', 'es6', [func1], jsSample);
            scriptManager.addScript(script1);
            (() => scriptManager.getFunction('nonExistent')).should.throw('Function nonExistent was not found');
        });

        it('should throw a regular Error, not a TypeError, for a missing function', () => {
            const scriptManager = new ScriptManager();
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            (() => scriptManager.getFunction('anything')).should.throw(Error, /was not found/);
            (() => scriptManager.getFunction('anything')).should.not.throw(TypeError);
        });
    });

});
