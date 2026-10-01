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
const compositearchiveloader_1 = __importDefault(require("./compositearchiveloader"));
const httparchiveloader_1 = __importDefault(require("./httparchiveloader"));
const githubarchiveloader_1 = __importDefault(require("./githubarchiveloader"));
const aparchiveloader_1 = __importDefault(require("./aparchiveloader"));
/**
 * A default CompositeArchiveLoader implementation which supports
 * ap://, github://, http:// and https:// URLs.
 * @class
 * @private
 */
class DefaultArchiveLoader extends compositearchiveloader_1.default {
    /**
     * Create the DefaultArchiveLoader.
     * @param {ModelManager} modelManager - the model manager to use
     */
    constructor() {
        super();
        const http = new httparchiveloader_1.default();
        const github = new githubarchiveloader_1.default();
        const ap = new aparchiveloader_1.default();
        this.addArchiveLoader(github);
        this.addArchiveLoader(http);
        this.addArchiveLoader(ap);
    }
}
exports.default = DefaultArchiveLoader;
//# sourceMappingURL=defaultarchiveloader.js.map