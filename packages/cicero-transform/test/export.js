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

const ContractInstance = require('@accordproject/cicero-core').ContractInstance;
const Export = require('../lib/export');

const chai = require('chai');
const fs = require('fs');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

/**
 * Return a promise to an instance from either a directory or an archive file
 * @param {string} slcPath - path to the smart legal contract archive
 * @return {Promise<Instance>} a Promise to the instantiated template
 */
function loadInstance(slcPath) {
    const buffer = fs.readFileSync(slcPath);
    return ContractInstance.fromArchive(buffer);
}
const test1 = () => loadInstance('./test/data/installment-sale@0.1.0-316a9177c6d52bfd4e1df6d543ddab775cc217cdb44f92120e2f24bd11f8381b.slc');

describe('#export', () => {

    describe('#toMarkdown', () => {
        it('should be able to export to markdown', async function() {
            const instance = await test1();
            const result = await Export.toFormat(instance, 'markdown');
            result.should.equal('"Dan" agrees to pay to "Ned" the total sum e10000.0, in the manner following:\n\nE500.0 is to be paid at closing, and the remaining balance of E9500.0 shall be paid as follows:\n\nE500.0 or more per month on the first day of each and every month, and continuing until the entire balance, including both principal and interest, shall be paid in full -- provided, however, that the entire balance due plus accrued interest and any other amounts due here-under shall be paid in full on or before 24 months.\n\nMonthly payments, which shall start on month 3, include both principal and interest with interest at the rate of 1.5%, computed monthly on the remaining balance from time to time unpaid.');
        });
    });

});

describe('#formatDescriptor', () => {
    it('Lookup valid format', () => {
        const result = Export.formatDescriptor('commonmark');
        result.fileFormat.should.equal('json');
    });

    it('Lookup invalid format', () => {
        (() => Export.formatDescriptor('foobar')).should.throw('Unknown format: foobar');
    });
});
