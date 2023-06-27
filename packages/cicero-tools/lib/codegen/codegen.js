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

module.exports.AbstractPlugin = require('@accordproject/concerto-codegen').CodeGen.AbstractPlugin;

module.exports.GoLangVisitor = require('@accordproject/concerto-codegen').CodeGen.GoLangVisitor;
module.exports.JSONSchemaVisitor = require('@accordproject/concerto-codegen').CodeGen.JSONSchemaVisitor;
module.exports.XmlSchemaVisitor = require('@accordproject/concerto-codegen').CodeGen.XmlSchemaVisitor;
module.exports.PlantUMLVisitor = require('@accordproject/concerto-codegen').CodeGen.PlantUMLVisitor;
module.exports.TypescriptVisitor = require('@accordproject/concerto-codegen').CodeGen.TypescriptVisitor;
module.exports.JavaVisitor = require('@accordproject/concerto-codegen').CodeGen.JavaVisitor;
module.exports.FileWriter = require('@accordproject/concerto-codegen').FileWriter;

module.exports.CordaVisitor = require('./fromcto/corda/cordavisitor');

