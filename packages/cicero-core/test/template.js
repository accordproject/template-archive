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

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));
const sinon = require('sinon');

describe('Template', () => {

    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#fromDirectory', () => {

        it('should create a template from a directory', () => {
            return Template.fromDirectory('./test/data/latedeliveryandpenalty').should.be.fulfilled;
        });

        it('should roundtrip a template', () => {
            return Template.fromDirectory('./test/data/latedeliveryandpenalty')
                .then((template) => {
                    template.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1');
                    template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
                    template.getGrammar().should.not.be.null;
                    template.getScriptManager().getScripts().length.should.equal(1);
                    template.getMetadata().getREADME().should.not.be.null;
                    template.getName().should.equal('latedeliveryandpenalty');
                    template.getDescription().should.equal('Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, the Seller shall pay to the Buyer for every 9 DAY of delay penalty amounting to 7% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a DAY is to be considered a full DAY. The total amount of penalty shall not however, exceed 2% of the total value of the Equipment involved in late delivery. If the delay is more than 2 WEEK, the Buyer is entitled to terminate this Contract.');
                    template.getVersion().should.equal('0.0.1');
                    return template.toArchive();
                })
                .then((buffer) => {
                    buffer.should.not.be.null;
                    return Template.fromArchive(buffer);
                })
                .then((template) => {
                    template.getIdentifier().should.equal('latedeliveryandpenalty@0.0.1');
                    template.getModelManager().getModelFile('io.clause.latedeliveryandpenalty').should.not.be.null;
                    template.getGrammar().should.not.be.null;
                    template.getScriptManager().getScripts().length.should.equal(1);
                    template.getMetadata().getREADME().should.not.be.null;
                    return template.toArchive();
                });
        });
    });
});