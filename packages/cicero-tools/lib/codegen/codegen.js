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

module.exports.AbstractPlugin = require('composer-concerto-tools').CodeGen.AbstractPlugin;
module.exports.FileWriter = require('composer-concerto-tools').CodeGen.FileWriter;

module.exports.GoLangVisitor = require('composer-concerto-tools').CodeGen.GoLangVisitor;
module.exports.JSONSchemaVisitor = require('composer-concerto-tools').CodeGen.JSONSchemaVisitor;
module.exports.XmlSchemaVisitor = require('composer-concerto-tools').CodeGen.XmlSchemaVisitor;
module.exports.PlantUMLVisitor = require('composer-concerto-tools').CodeGen.PlantUMLVisitor;
module.exports.TypescriptVisitor = require('composer-concerto-tools').CodeGen.TypescriptVisitor;
module.exports.JavaVisitor = require('composer-concerto-tools').CodeGen.JavaVisitor;

module.exports.CordaVisitor = require('./fromcto/corda/cordavisitor');

