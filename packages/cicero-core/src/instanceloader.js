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

const FileLoader = require('@accordproject/ergo-compiler').FileLoader;
const ParserManager = require('@accordproject/markdown-template').ParserManager;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const ErgoEngine = require('@accordproject/ergo-engine/index.browser.js').EvalEngine;

const Util = require('./util');

/**
 * A utility class to create smart legal contract instances from data sources.
 * @class
 * @private
 * @abstract
 */
class InstanceLoader extends FileLoader {
    /**
     * Create an instance from a Template and data.
     * @param {*} Instance - the type to construct
     * @param {Template} template  - the template for the instance
     * @param {object} data - the contract data
     * @return {object} - the contract instance
     */
    static fromTemplateWithData(Instance, template, data) {
        const metadata = template.getMetadata();
        const logicManager = template.getLogicManager();
        const grammar = template.getParserManager().getTemplate();

        // create the instance
        const instance = new (Function.prototype.bind.call(
            Instance,
            null,
            metadata,
            logicManager,
            grammar,
            template,
        ));

        instance.setData(data);
        return instance;
    }

    /**
     * Create an instance from a Template.
     * @param {*} Instance - the type to construct
     * @param {Template} template  - the template for the instance
     * @return {object} - the contract instance
     */
    static fromTemplate(Instance, template) {
        const metadata = template.getMetadata();
        const logicManager = template.getLogicManager();
        const parserManager = new ParserManager(logicManager.getModelManager(), null, this.instanceKind);
        const ciceroMarkTransformer = new CiceroMarkTransformer();
        const ergoEngine = new ErgoEngine();
        const input = metadata.getSample();
        const grammar = template.getParserManager().getTemplate();

        // Initialize the parser
        Util.initParser(
            parserManager,
            logicManager,
            ergoEngine,
            metadata.getIdentifier(),
            metadata.getTemplateType(),
            grammar,
            metadata.getRuntime(),
        );

        const data = Util.parseText(parserManager, ciceroMarkTransformer, input, null, null, 'text/sample.md');
        return InstanceLoader.fromTemplateWithData(Instance, template, data);
    }
}

module.exports = InstanceLoader;
