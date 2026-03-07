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

"use strict";

const Argument = require("../src/argument");
const ArgumentType = require("../src/argumenttype");
const Function = require("../src/function");
const Contract = require("../src/contract");

const chai = require("chai");
chai.should();
chai.use(require("chai-as-promised"));

describe("Core Classes", () => {
    describe("Argument", () => {
        it("should create an Argument", () => {
            const arg = new Argument("name", "type");
            arg.getName().should.equal("name");
            arg.getType().should.equal("type");
        });
    });

    describe("ArgumentType", () => {
        it("should create an ArgumentType", () => {
            const type = new ArgumentType("type");
            type.getName().should.equal("type");
        });
    });

    describe("Function", () => {
        it("should create a Function", () => {
            const func = new Function("name", []);
            func.getName().should.equal("name");
            func.getArguments().should.deep.equal([]);
        });
    });

    describe("Contract", () => {
        it("should have a constructor", () => {
            Contract.should.not.be.null;
        });
    });
});
