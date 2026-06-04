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

import fs from 'fs';

import ScriptManager from '../src/scriptmanager';

const jsSample = fs.readFileSync('./test/data/test.js','utf8');
const jsSample2 = fs.readFileSync('./test/data/test2.js','utf8');

describe('ScriptManager', () => {

    describe('#constructor', () => {

        it('should instantiate a script manager', async function() {
            expect(new ScriptManager(undefined)).not.toBeNull();
        });

        it('should support both JavaScript scripts', async function() {
            const scriptManager = new ScriptManager(undefined);
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            expect(scriptManager.getScript('test.js')).not.toBeNull();
            expect(scriptManager.getScripts().length).toBe(1);
            expect(scriptManager.getScriptsForTarget('es6').length).toBe(1);
        });

        it('should delete JavaScript scripts if they exist', async function() {
            const scriptManager = new ScriptManager(undefined);
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            expect(scriptManager.getScript('test.js')).not.toBeNull();
            scriptManager.deleteScript('test.js');
            expect(scriptManager.getScripts().length).toBe(0);
        });

        it('should fail deleting a script which does not exist', async function() {
            const scriptManager = new ScriptManager(undefined);
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            expect(() => scriptManager.deleteScript('test.foo')).toThrow('Script file does not exist');
        });

        it('should get scripts identifiers', async function() {
            const scriptManager = new ScriptManager(undefined);
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            expect(scriptManager.getScriptIdentifiers()).toEqual(['test.js']);
        });

        it('should update script', async function() {
            const scriptManager = new ScriptManager(undefined);
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            const script2 = scriptManager.createScript('test.js','.js',jsSample2);
            scriptManager.addScript(script1);
            expect(scriptManager.getScript('test.js').getContents()).toBe(jsSample);
            scriptManager.updateScript(script2);
            expect(scriptManager.getScript('test.js').getContents()).toBe(jsSample2);
        });

        it('should fail updating a script which does not exist', async function() {
            const scriptManager = new ScriptManager(undefined);
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            expect(() => scriptManager.updateScript(script1)).toThrow('Script file does not exist');
        });

        it('should modify script', async function() {
            const scriptManager = new ScriptManager(undefined);
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            scriptManager.modifyScript('test.js','es6',jsSample2);
            expect(scriptManager.getScript('test.js').getContents()).toBe(jsSample2);
        });

        it('clear all scripts', async function() {
            const scriptManager = new ScriptManager(undefined);
            const script1 = scriptManager.createScript('test.js', 'es6', jsSample);
            scriptManager.addScript(script1);
            scriptManager.clearScripts();
            expect(scriptManager.getScripts().length).toBe(0);
        });

    });

});
