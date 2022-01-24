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

const JSZip = require('jszip');

const Logger = require('@accordproject/concerto-core').Logger;
const FileLoader = require('@accordproject/ergo-compiler').FileLoader;
const LogicManager = require('@accordproject/ergo-compiler').LogicManager;
const ParserManager = require('@accordproject/markdown-template').ParserManager;
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const ErgoEngine = require('@accordproject/ergo-engine/index.browser.js').EvalEngine;

const InstanceMetadata = require('./instancemetadata');
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
     * @param {string} instantiator - name of the person/party which instantiates the contract instance
     * @return {object} - the contract instance
     */
    static fromTemplateWithData(Instance, template, data, instantiator) {
        const metadata = InstanceMetadata.createMetadataFromTemplate(template.getMetadata());
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
            instantiator
        ));

        instance.setData(data);

        //grab the parties
        const contractModel = Util.getContractModel(instance.logicManager, instance.instanceKind);
        const properties = contractModel.getProperties();
        properties.map((property) => property.getDecorators().map((decorator) => {
            if (decorator.getName() === 'ContractParty') {
                const data = instance.data;
                const partyName = data[property.name];
                instance.parties.push(partyName);
            }
        }));
        return instance;
    }

    /**
     * Create an instance from a Template.
     * @param {*} Instance - the type to construct
     * @param {Template} template  - the template for the instance
     * @return {object} - the contract instance
     */
    static fromTemplate(Instance, template) {
        const templateMetadata = template.getMetadata();
        const logicManager = template.getLogicManager();
        const parserManager = new ParserManager(logicManager.getModelManager(), null, this.instanceKind);
        const ciceroMarkTransformer = new CiceroMarkTransformer();
        const ergoEngine = new ErgoEngine();
        const input = templateMetadata.getSample();
        const grammar = template.getParserManager().getTemplate();

        // Initialize the parser
        Util.initParser(
            parserManager,
            logicManager,
            ergoEngine,
            templateMetadata.getIdentifier(),
            templateMetadata.getTemplateType(),
            grammar,
            templateMetadata.getRuntime(),
        );

        const data = Util.parseText(parserManager, ciceroMarkTransformer, input, null, null, 'text/sample.md');
        return InstanceLoader.fromTemplateWithData(Instance, template, data);
    }

    /**
     * Create an instance from an archive
     * @param {*} Instance - the type to construct
     * @param {Buffer} buffer  - the buffer to a Smart Legal Contract (slc) file
     * @param {object} options - additional options
     * @return {Promise<Instance>} a Promise to the instance
     */
    static async fromArchive(Instance, buffer, options) {
        const logicManager = new LogicManager('es6', null, options);

        const method = 'fromArchive';
        const zip = await JSZip.loadAsync(buffer);
        const ctoModelFiles = [];
        const ctoModelFileNames = [];

        // add metadata
        const packageJsonObject = await InstanceLoader.loadZipFileContents(zip, 'package.json', true, true);
        // XXX likely we will need to discuss what metadata is relevant / needed for instances
        // XXX For now hijack the the template metadata
        const metadata = new InstanceMetadata(
            packageJsonObject,
        );

        // add contract data
        const data = await InstanceLoader.loadZipFileContents(zip, 'data.json', true, true);

        // add contract history
        const history = await InstanceLoader.loadZipFileContents(zip, 'history.json', true, false) || [];

        //grab instantiator
        const instantiator = history.length !== 0 ? history[0].currentState.instatiator : null;

        // add template grammar (.md form)
        const grammar = await InstanceLoader.loadZipFileContents(zip, 'text/grammar.tem.md', false, false);

        // add model files
        Logger.debug(method, 'Looking for model files');
        let ctoFiles =  await InstanceLoader.loadZipFilesContents(zip, /model[/\\].*\.cto$/);
        ctoFiles.forEach(async (file) => {
            ctoModelFileNames.push(file.name);
            ctoModelFiles.push(file.contents);
        });
        logicManager.getModelManager().addAPModelFiles(ctoModelFiles, ctoModelFileNames, true); // Archives can always be loaded offline

        // load and add the ergo files
        if(metadata.getRuntime() === 'ergo') {
            Logger.debug(method, 'Adding Ergo files to script manager');
            const scriptFiles = await InstanceLoader.loadZipFilesContents(zip, /logic[/\\].*\.ergo$/);
            scriptFiles.forEach(function (obj) {
                logicManager.addLogicFile(obj.contents, obj.name);
            });
        } else {
            // load and add compiled JS files - we assume all runtimes are JS based (review!)
            Logger.debug(method, 'Adding JS files to script manager');
            const scriptFiles = await InstanceLoader.loadZipFilesContents(zip, /logic[/\\].*\.js$/);
            scriptFiles.forEach(function (obj) {
                logicManager.addLogicFile(obj.contents, obj.name);
            });
        }

        // create the instance
        const instance = new (Function.prototype.bind.call(
            Instance,
            null,
            metadata,
            logicManager,
            grammar,
            null, // XXX No template reference here for now
            instantiator
        ));

        //grab contract history
        instance.history = history;

        //grab the author/developer's signature
        instance.authorSignature = await InstanceLoader.loadZipFileContents(zip, 'signature.json', true, false);

        instance.setData(data);

        // grab the party signatures
        const signatureFiles = await InstanceLoader.loadZipFilesContents(zip, /signatures[/\\].*\.json$/, true, false);
        signatureFiles.forEach((signatureFile) => {
            let signature = JSON.parse(signatureFile.contents);
            instance.contractSignatures.push(signature);
        });

        //grab the parties
        const contractModel = Util.getContractModel(instance.logicManager, instance.instanceKind);
        const properties = contractModel.getProperties();
        properties.map((property) => property.getDecorators().map((decorator) => {
            if (decorator.getName() === 'ContractParty') {
                const data = instance.data;
                const partyName = data[property.name];
                instance.parties.push(partyName);
            }
        }));
        return instance;
    }
}

module.exports = InstanceLoader;
