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

const ParseException = require('@accordproject/ergo-compiler').ComposerConcerto.ParseException;

/**
 * Exception throws when ergo compilation fails
 * @extends BaseFileException
 * @see See  {@link BaseFileException}
 * @class
 * @memberof module:ergo-compiler
 * @private
 */
class TemplateException extends ParseException {
    /**
     * Create a TemplateException
     * @param {string} message - the message for the exception
     * @param {string} fileLocation - the optional file location associated with the exception
     * @param {string} fileName - the optional file name associated with the exception
     * @param {string} fullMessageOverride - the optional pre-existing full message
     * @param {string} component - the optional component which throws this error
     */
    constructor(message, fileLocation, fileName, fullMessageOverride, component) {
        super(message, fileLocation, fileName, fullMessageOverride, component || 'cicero-core');
    }
}

module.exports = TemplateException;
