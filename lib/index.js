"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.Script = exports.TemplateLibrary = exports.TemplateLoader = exports.Template = exports.Clause = void 0;
/**
 * Cicero Core - defines the core data types for Cicero.
 * @module cicero-core
 */
const clause_1 = __importDefault(require("./clause"));
exports.Clause = clause_1.default;
const template_1 = __importDefault(require("./template"));
exports.Template = template_1.default;
const templateloader_1 = __importDefault(require("./templateloader"));
exports.TemplateLoader = templateloader_1.default;
const templatelibrary_1 = __importDefault(require("./templatelibrary"));
exports.TemplateLibrary = templatelibrary_1.default;
const script_1 = __importDefault(require("./script"));
exports.Script = script_1.default;
// version is read at runtime to avoid pulling package.json into rootDir
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../package.json').version;
exports.version = version;
//# sourceMappingURL=index.js.map