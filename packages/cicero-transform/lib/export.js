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

const transform = require('@accordproject/markdown-transform').transform;
const formatDescriptor = require('@accordproject/markdown-transform').formatDescriptor;

/**
 * A Instance is an instance of a Clause or Contract template. It is executable business logic, linked to
 * a natural language (legally enforceable) template.
 * A Instance must be constructed with a template and then prior to execution the data for the clause must be set.
 * Set the data for the Instance by either calling the setData method or by
 * calling the parse method and passing in natural language text that conforms to the template grammar.
 * @public
 * @abstract
 * @class
 */
class Export {
    /**
     * Return the format descriptor for a given format
     *
     * @param {string} format the format
     * @return {object} the descriptor for that format
     */
    static formatDescriptor(format) {
        return formatDescriptor(format);
    }

    /**
     * Exports a contract instance to a specified format
     * @param {*} instance - the contract instance
     * @param {string} format - the target format
     * @param {string} [currentTime] - the definition of 'now', defaults to current time
     * @param {number} [utcOffset] - UTC Offset for this execution, defaults to local offset
     * @returns {object} the exported contract.
     */
    static toFormat(instance, format, currentTime, utcOffset) {
        // const kind = instance.instanceKind ? 'clause' : 'contract';
        const kind = 'contract';

        // Get the data
        const data = instance.getData();

        // Set current time
        instance.parserManager.setCurrentTime(currentTime, utcOffset);

        // Draft
        const ciceroMark = instance.templateMarkTransformer.draftCiceroMark(data, instance.parserManager, kind, {});
        return Export.exportCiceroMark(ciceroMark, format);
    }

    /**
     * Export CiceroMark
     * @param {object} input - the parsed CiceroMark DOM
     * @param {string} format - to the text generation
     * @return {Promise<object>} the result of parsing and printing back the text
     */
    static exportCiceroMark(input,format) {
        const parameters = {}; // XXX For later
        const options = {}; // XXX For later
        return transform(input, 'ciceromark_parsed', [format], parameters, options);
    }
}

module.exports = Export;
