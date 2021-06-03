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

/**
 * Cicero Core - defines the core data types for Cicero.
 * @module cicero-core
 */

module.exports.Clause = require('./lib/clause');
module.exports.Contract = require('./lib/contract');
module.exports.Template = require('./lib/template');
module.exports.TemplateLoader = require('./lib/templateloader');
module.exports.TemplateLibrary = require('./lib/templatelibrary');
module.exports.version = require('./package.json');
