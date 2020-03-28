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

const getMimeType = require('../src/mimetype');

const chai = require('chai');
const fs = require('fs');
const path = require('path');

chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));
const expect = chai.expect;

describe('MimeType', () => {
    describe('#getMimeType', () => {
        it('should return the mime-type of the image' , () => {
            const filePath = path.resolve('./test/data/template-logo', 'logo.png');
            const buffer = fs.readFileSync(filePath);
            expect(getMimeType(buffer)).to.have.property('mime', 'image/png');
        });
        it('should throw error for disallowed mime-types' , () => {
            const filePath = path.resolve('./test/data', 'dummy.pdf');
            const buffer = fs.readFileSync(filePath);
            expect(() => getMimeType(buffer)).to.throw('the file type is not supported');
        });
    });
});
