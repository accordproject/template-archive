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

const ParserManager = require('../lib/parsermanager');
const Template = require('../lib/template');

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));


describe('ParserManager', () => {

    describe('#getTemplateAst', () => {

        it('should return the AST for a template', async () => {
            const packageJson = {
                name: 'my-template',
                version: '0.0.1',
                accordproject: {
                    template: 'clause',
                    cicero: '^0.20.0',
                    runtime: 'ergo'
                },
            };
            const template = new Template(packageJson, 'my readme', {default: 'This is a new template. Created by "Dan".'});
            const mm = template.getLogicManager().getModelManager();
            mm.addModelFile(`
namespace org.acme

import org.accordproject.cicero.contract.AccordClause from https://models.accordproject.org/cicero/contract.cto

asset MyClause extends AccordClause {
    o String author
}
`, 'mymodel.cto', true );

            await mm.updateExternalModels();

            const parserManager = new ParserManager(template);
            parserManager.buildGrammar( 'This is a new template. Created by {{author}}.' );
            const ast = parserManager.getTemplateAst();
            ast.type.should.equal('ContractTemplate');
            ast.data.length.should.equal(3);
        });
    });
});