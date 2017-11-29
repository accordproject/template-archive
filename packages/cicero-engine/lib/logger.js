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

const logger = require('cicero-core').logger;

/**
 * <p>
 * A logger class, exposed to logic
 * </p>
 * @public
 * @memberof module:cicero-engine
 */
class Logger {

    /**
     * Create the Logger.
     * @param {Serializer} serializer - the composer serializer to use to convert objects to JSON
     */
    constructor(serializer) {
        this.serializer = serializer;
    }


    /**
     * Log an info level message
     * @param {object} obj - the object to log
     */
    info(obj) {

        if(typeof obj === 'object') {
            let printable = {};
            const keys = Object.keys(obj);

            keys.forEach(function(key) {
                let element = obj[key];
                if(element.getType) {
                    printable[key] = this.serializer.toJSON(element, {validate: false});
                }
                else {
                    printable[key] = element;
                }
            }, this);

            logger.info( 'CICERO-ENGINE', JSON.stringify(printable));
        }
        else {
            logger.info( 'CICERO-ENGINE', obj);
        }
    }
}

module.exports = Logger;