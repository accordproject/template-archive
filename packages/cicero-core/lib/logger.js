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

let logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            name: 'combined-file',
            filename: 'combined.log'
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'error.log',
            level: 'error'
        })
    ]
});

logger.entry = logger.debug;
logger.exit = logger.debug;

logger.log('info', 'Logging initialized.', new Date());
module.exports = logger;