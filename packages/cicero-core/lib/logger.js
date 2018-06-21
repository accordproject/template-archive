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

const winston = require('winston');
const jsome = require('jsome');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const tsFormat = () => (new Date()).toLocaleTimeString();

/**
 * Helper function to test is a string is a stringified version of a JSON object
 * @param {string} str - the input string to test
 * @returns {boolean} - true iff the string can be parsed as JSON
 */
function isJSON(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}

jsome.params.lintable = true;

const jsonColor = winston.format.printf(info => {
    if(typeof info.message === 'object') {
        return `${tsFormat()} - ${info.level}:
${jsome.getColoredString(info.message, null, 2)}`;
    } else if(isJSON(info.message)) {
        return `${tsFormat()} - ${info.level}:
${jsome.getColoredString(JSON.parse(info.message), null, 2)}`;
    }
    return `${tsFormat()} - ${info.level}: ${info.message}`;

});
let logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            colorize: true,
            timestamp: tsFormat,
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                jsonColor
            ),
        }),
    ]
});

if(env === 'development'){
    const logDir = 'log';
    // Create the log directory if it does not exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    logger.add(new winston.transports.File({
        name: 'logs-file',
        filename: `${logDir}/trace.log`,
        level: env === 'development' ? 'debug' : 'info'
    }));
}

logger.entry = logger.debug;
logger.exit = logger.debug;

module.exports = logger;