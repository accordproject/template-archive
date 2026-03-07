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

const TemplateSaver = require("../src/templatesaver");
const Template = require("../src/template");

const chai = require("chai");
chai.should();
chai.use(require("chai-as-promised"));

describe("TemplateSaver", () => {
    describe("#toArchive", () => {
        it("should save a template with a signature", async () => {
            const template = await Template.fromDirectory(
                "./test/data/latedeliveryandpenalty",
            );
            template.authorSignature = {
                templateHash: "hash",
                timestamp: Date.now(),
                signatoryCert: "cert",
                signature: "sig",
            };
            const buffer = await TemplateSaver.toArchive(template);
            buffer.should.not.be.null;
        });

        it("should save a template with multiple locales", async () => {
            const template = await Template.fromDirectory(
                "./test/data/latedeliveryandpenalty",
            );
            template.getMetadata().getSamples().fr = "Bonjour";
            const buffer = await TemplateSaver.toArchive(template);
            buffer.should.not.be.null;
        });
    });
});
