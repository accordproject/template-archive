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

const ALLOWED_MIMETYPES = {
    'image/png': isPNG,
};

/**
 * Checks whether the file is PNG
 * @param {Buffer} buffer buffer of the file
 * @returns {Boolean} whether the file in PNG
 */
function isPNG(buffer) {
    // PNG header. Reference: http://www.libpng.org/pub/png/spec/1.2/PNG-Rationale.html#R.PNG-file-signature
    const header = [137,80,78,71,13,10,26,10];
    const bufferHeader = buffer.subarray(0, 8);
    return header.length === bufferHeader.length && header.every((x,i) => { return x === bufferHeader[i]; });
}

/**
 * Returns the mime-type of the file
 * @param {Buffer} buffer buffer of the file
 * @returns {Object} the mime-type of the file
 */
function getMimeType(buffer) {
    for (let mime of Object.keys(ALLOWED_MIMETYPES)) {
        if (ALLOWED_MIMETYPES[mime](buffer)) {
            return {
                mime: mime,
            };
        }
    }

    throw new Error('the file type is not supported');
}

module.exports = getMimeType;
