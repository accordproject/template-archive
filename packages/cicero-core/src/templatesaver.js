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

const forge = require('node-forge');
const fsPath = require('path');
const JSZip = require('jszip');

/**
 * A utility to persist templates to data sources.
 * @class
 * @abstract
 * @private
 */
class TemplateSaver {

    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {Template} template - the template to persist
     * @param {string} [language] - target language for the archive (should be 'ergo')
     * @param {Object} [options] - JSZip options
     * @param {Object} [sign] - PKCS#7 signer cert and key, if specified
     * @return {Promise<Buffer>} the zlib buffer
     */
    static async toArchive(template, language, options, sign) {
        let digests = {};
        let md = forge.md.sha256.create();

        let processFile = (fn, content) => {
            if(sign !== undefined) {
                digests[fn] = md.start().update(content).digest().toHex();
            }
            zip.file(fn, content, options);
        };

        if(!language || typeof(language) !== 'string') {
            throw new Error('language is required and must be a string');
        }

        const metadata = template.getMetadata().createTargetMetadata(language);

        // work around Stuk/jszip issue #369
        const currentDate = new Date();
        const dateWithTzOffset = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
        JSZip.defaults.date = dateWithTzOffset;

        let zip = new JSZip();

        processFile('package.json', JSON.stringify(metadata.getPackageJson()));

        // save the grammar
        zip.file('text/', null, Object.assign({}, options, {
            dir: true
        }));

        if (template.getParserManager().getTemplatizedGrammar()) {
            processFile('text/grammar.tem.md', template.getParserManager().getTemplatizedGrammar());
        }

        // save the README.md if present
        if (metadata.getREADME()) {
            processFile('README.md', metadata.getREADME());
        }

        // Save the sample files
        const sampleFiles = metadata.getSamples();
        if(sampleFiles){
            Object.keys(sampleFiles).forEach(function (locale) {
                let fileName;
                if(locale === 'default'){
                    fileName = 'text/sample.md';
                } else {
                    fileName = `text/sample_${locale}.md`;
                }
                processFile(fileName, sampleFiles[locale]);
            });
        }

        // save the request.json if present & not text-only
        if (metadata.getRequest()) {
            processFile('request.json', JSON.stringify(metadata.getRequest()));
        }

        let modelFiles = template.getModelManager().getModels();
        zip.file('model/', null, Object.assign({}, options, {
            dir: true
        }));
        modelFiles.forEach(function (file) {
            processFile('model/' + file.name, file.content);
        });

        zip.file('logic/', null, Object.assign({}, options, {
            dir: true
        }));
        const scriptFiles = template.getScriptManager().getScriptsForTarget(language);
        scriptFiles.forEach(function (file) {
            let fileIdentifier = file.getIdentifier();
            let fileName = fsPath.basename(fileIdentifier);
            processFile('logic/' + fileName, file.contents);
        });

        let manifest = {
            version: 1,
            files: digests,
        };
        let manifestJson = JSON.stringify(manifest);
        zip.file('manifest.json', manifestJson, options);

        if(sign !== undefined) {
            let p7 = forge.pkcs7.createSignedData();
            p7.content = forge.util.createBuffer(manifestJson, 'utf8');
            p7.addCertificate(sign.cert);
            p7.addSigner({
                key: sign.key,
                certificate: sign.cert,
                digestAlgorithm: forge.pki.oids.sha256,
                authenticatedAttributes: [{
                    type: forge.pki.oids.contentType,
                    value: forge.pki.oids.data,
                }, {
                    type: forge.pki.oids.messageDigest,
                }, {
                    type: forge.pki.oids.signingTime,
                    value: new Date(),
                }],
            });
            p7.sign({detached: true});

            let pem = forge.pkcs7.messageToPem(p7);
            zip.file('manifest.pem', pem, options);
        }

        return zip.generateAsync({
            type: 'nodebuffer'
        }).then(something => {
            return Promise.resolve(something).then(result => {
                return result;
            });
        });
    }
}

module.exports = TemplateSaver;
