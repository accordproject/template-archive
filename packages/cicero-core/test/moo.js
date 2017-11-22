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
const moo = require('moo');
const logger = require('../lib/logger');

// we use lexer states to distinguish between the tokens
// in the text and the tokens inside the variables
const lexer = moo.states({
    main: {
        varstart: {
            match: '[{',
            push: 'var',
        }, // push to the var state
        // a chunk is everything up until '[{', even across newlines. We then trim off the '[{'
        // we also push the lexer into the 'var' state
        Chunk: {
            match: /[^]*?\[{/,
            lineBreaks: true,
            push: 'var',
            value: x => x.slice(0, -2)
        },
        // we now need to consume everything up until the end of the buffer.
        // note that the order of these two rules is important!
        LastChunk : {
            match: /[^]+/,
            lineBreaks: true,
        },
    },
    var: {
        varend: {
            match: '}]',
            pop: true
        }, // pop back to main state
        varid: /[a-zA-Z_][_a-zA-Z0-9]*/,
        varstring: /".*?"/,
        varcond: /:\?/,
        varspace: / /,
    },
});

lexer.reset('[{v1}] \n one [{"foo":? v2}] [{v3}] two \n\nthree[{v4}]\nfour.');

let n = lexer.next();

while (n) {
    logger.info(n.type + ': ' + n.value);
    n = lexer.next();
}