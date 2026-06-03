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

import getMimeType from '../src/mimetype';

import fs from 'fs';
import path from 'path';

describe('MimeType', () => {
    describe('#getMimeType', () => {
        it('should return the mime-type of the image' , () => {
            const filePath = path.resolve('./test/data/template-logo', 'logo.png');
            const buffer = fs.readFileSync(filePath);
            expect(getMimeType(buffer)).toHaveProperty('mime', 'image/png');
        });
        it('should throw error for disallowed mime-types' , () => {
            const filePath = path.resolve('./test/data', 'dummy.pdf');
            const buffer = fs.readFileSync(filePath);
            expect(() => getMimeType(buffer)).toThrow('the file type is not supported');
        });
    });
});
