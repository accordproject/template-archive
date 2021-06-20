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

const Util = require('../lib/util');
const FileLoader = require('@accordproject/ergo-compiler').FileLoader;

const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('Util', () => {

    describe('#checkImage', () => {
        it('should not throw for correct png with correct dimensions', async () => {
            const buffer = await FileLoader.loadFileBuffer('./test/data', 'logo_128_128.png', true);
            (() => Util.checkImage(buffer)).should.not.throw();
        });
        it('should throw for correct png without correct dimensions', async () => {
            const buffer = await FileLoader.loadFileBuffer('./test/data', 'logo_256_256.png', true);
            (() => Util.checkImage(buffer)).should.throw('logo should be 128x128');
        });
        it('should throw for incorrect mime type', async () => {
            const buffer = await FileLoader.loadFileBuffer('./test/data', 'logo_wrong_mime.png', true);
            (() => Util.checkImage(buffer)).should.throw('the file type is not supported');
        });
        it('should throw for corrupted png', async () => {
            const buffer = await FileLoader.loadFileBuffer('./test/data', 'logo_corrupted.png', true);
            (() => Util.checkImage(buffer)).should.throw('not a valid png file');
        });
    });
});
