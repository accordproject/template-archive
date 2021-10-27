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

const fsPath = require('path');
const JSZip = require('jszip');

/**
 * A utility to persist instances to data sources.
 * @class
 * @abstract
 * @private
 */
class InstanceSaver {

    /**
     * Persists this instance to a Smart Legal Contract (slc) file.
     * @param {Instance} instance - the instance to persist
     * @param {string} [runtime] - target runtime for the archive
     * @param {Object} [options] - JSZip options
     * @return {Promise<Buffer>} the zlib buffer
     */
    static async toArchive(instance, runtime, options) {
        if(!runtime || typeof(runtime) !== 'string') {
            throw new Error('runtime is required and must be a string');
        }

        let zip = new JSZip();

        // save the metadata
        const metadata = instance.getMetadata().createTargetMetadata(runtime);

        let packageFileContents = JSON.stringify(metadata.getPackageJson());
        zip.file('package.json', packageFileContents, options);

        // save the contract data
        const dataContents = JSON.stringify(instance.getData());

        zip.file('data.json', dataContents, options);

        // save the contract state
        const historyContents = JSON.stringify(instance.history);

        zip.file('history.json', historyContents, options);

        // save the grammar
        zip.file('text/', null, Object.assign({}, options, {
            dir: true
        }));

        if (instance.getParserManager().getTemplate()) {
            zip.file('text/grammar.tem.md', instance.getParserManager().getTemplate(), options);
        }

        // save the author/developer signature
        const authorSignature = JSON.stringify(instance.authorSignature);

        zip.file('signature.json', authorSignature, options);

        //save the party signatures
        let signatures = instance.contractSignatures;
        zip.file('signatures/', null, Object.assign({}, options, {
            dir: true
        }));
        signatures.forEach(function (signatureObject) {
            let signature = JSON.stringify(signatureObject);
            zip.file(`signatures/${signatureObject.signatory}.json`, signature, options);
        });

        let modelFiles = instance.getModelManager().getModels();
        zip.file('model/', null, Object.assign({}, options, {
            dir: true
        }));
        modelFiles.forEach(function (file) {
            zip.file('model/' + file.name, file.content, options);
        });

        zip.file('logic/', null, Object.assign({}, options, {
            dir: true
        }));
        const scriptFiles = instance.getScriptManager().getScriptsForTarget(runtime);
        scriptFiles.forEach(function (file) {
            let fileIdentifier = file.getIdentifier();
            let fileName = fsPath.basename(fileIdentifier);
            zip.file('logic/' + fileName, file.contents, options);
        });

        return zip.generateAsync({
            type: 'nodebuffer'
        }).then(something => {
            return Promise.resolve(something).then(result => {
                return result;
            });
        });
    }
}

module.exports = InstanceSaver;
