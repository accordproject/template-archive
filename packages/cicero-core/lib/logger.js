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
const { LEVEL, MESSAGE } = require('triple-beam');
const jsonStringify = require('fast-safe-stringify');
const jsome = require('jsome');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const tsFormat = () => (new Date()).toLocaleTimeString();

/**
 * Helper function to test is a string is a stringified version of a JSON object
 * @param {string} str - the input string to test
 * @returns {boolean} - true iff the string can be parsed as JSON
 * @private
 */
function isJSON(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}

jsome.params.lintable = true;

const jsonColor =  winston.format(info => {
    const padding = info.padding && info.padding[info.level] || '';

    if(info[LEVEL] === 'error' && info.stack) {
        info[MESSAGE] = `${tsFormat()} - ${info.level}:${padding} ${info.message}\n${info.stack}`;
        return info;
    }

    if (info[LEVEL] === 'info') {
        if(typeof info.message === 'object') {
            info[MESSAGE] = `${tsFormat()} - ${info.level}:${padding}\n${jsome.getColoredString(info.message, null, 2)}`;
        } else if(isJSON(info.message)) {
            info[MESSAGE] =`${tsFormat()} - ${info.level}:${padding}\n${jsome.getColoredString(JSON.parse(info.message), null, 2)}`;
        } else {
            info[MESSAGE] = `${tsFormat()} - ${info.level}:${padding} ${info.message}`;
        }
        return info;
    }

    const stringifiedRest = jsonStringify(Object.assign({}, info, {
        level: undefined,
        message: undefined,
        splat: undefined
    }));

    if (stringifiedRest !== '{}') {
        info[MESSAGE] = `${tsFormat()} - ${info.level}:${padding} ${info.message} ${stringifiedRest}`;
    } else {
        info[MESSAGE] = `${tsFormat()} - ${info.level}:${padding} ${info.message}`;
    }
    return info;

});

const enumerateErrorFormat = winston.format(info => {
    if (info.message instanceof Error) {
        info.message = Object.assign({
            message: info.message.message,
            stack: info.message.stack
        }, info.message);
    }

    if (info instanceof Error) {
        return Object.assign({
            message: info.message,
            stack: info.stack
        }, info);
    }

    return info;
});

let logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.json(),
        enumerateErrorFormat(),
        winston.format.colorize(),
        jsonColor(),
    ),
    transports: [
        new winston.transports.Console({
            level: 'info',
        }),
    ]
});

// Only write log files to disk if we're running in development
// and not in a browser (webpack or browserify)
if(env === 'development' && !process.browser){
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