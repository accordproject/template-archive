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
const path = require('path');
const assert = require('yeoman-assert');
const yo = require('yeoman-test');
const helpers = require('../generators/app/promptingHelpers');

describe('generator-cicero-template:app', () => {

    it('creates files', async () => {
        await yo
            .run(path.join(__dirname, '../generators/app'))
            .withPrompts({ templateName: 'test' }, { modeNamespace: 'foo' });
        assert.file('./test/text/sample.md');
        assert.file('./test/text/grammar.tem.md');
        assert.file('./test/logic/logic.ergo');
        assert.file('./test/package.json');
        assert.file('./test/logo.png');
        assert.file('./test/test/logic_default.feature');
        assert.file('./test/.cucumber.js');
    });

    describe('helpers', () => {

        it('has a good template name', async () => {
            assert(helpers.validateTemplateName('test'));
        });
        it('has a bad template name', async () => {
            const response = helpers.validateTemplateName('TEST');
            assert(typeof response === 'string');
        });

    });
});

