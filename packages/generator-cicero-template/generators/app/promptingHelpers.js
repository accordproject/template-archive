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
// FROM https://github.com/micromata/generator-http-fake-backend/blob/master/generators/app/promptingHelpers.js

const chalk = require('chalk');
const helper = {};

helper.validateTemplateName = function (value) {
    const check = (/^[a-z_-]*$/).test(value);

    if (!check) {
        return chalk.red('The template name can only contain lowercase letters, _ & -');
    } else {
        return check;
    }
};

module.exports = helper;