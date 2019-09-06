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
     * @return {Promise<Buffer>} the zlib buffer
     */
    static async toArchive(template, language, options) {
        if(!language || typeof(language) !== 'string') {
            throw new Error('language is required and must be a string');
        }

        const metadata = template.getMetadata().createTargetMetadata(language);

        let zip = new JSZip();

        let packageFileContents = JSON.stringify(metadata.getPackageJson());
        zip.file('package.json', packageFileContents, options);

        // save the grammar
        zip.file('grammar/', null, Object.assign({}, options, {
            dir: true
        }));

        if (template.getParserManager().getTemplatizedGrammar()) {
            zip.file('grammar/template.tem', template.getParserManager().getTemplatizedGrammar(), options);
        }

        // save the README.md if present
        if (metadata.getREADME()) {
            zip.file('README.md', metadata.getREADME(), options);
        }

        // Save the sample files
        const sampleFiles = metadata.getSamples();
        if(sampleFiles){
            Object.keys(sampleFiles).forEach(function (locale) {
                let fileName;
                if(locale === 'default'){
                    fileName = 'sample.md';
                } else {
                    fileName = `sample_${locale}.md`;
                }
                zip.file(fileName, sampleFiles[locale], options);
            });
        }

        // save the request.json if present & not text-only
        if (metadata.getRequest()) {
            let requestFileContents = JSON.stringify(metadata.getRequest());
            zip.file('request.json', requestFileContents, options);
        }

        let modelFiles = template.getModelManager().getModels();
        zip.file('models/', null, Object.assign({}, options, {
            dir: true
        }));
        modelFiles.forEach(function (file) {
            zip.file('models/' + file.name, file.content, options);
        });

        zip.file('lib/', null, Object.assign({}, options, {
            dir: true
        }));
        const scriptFiles = template.getScriptManager().getScriptsForTarget(language);
        scriptFiles.forEach(function (file) {
            let fileIdentifier = file.getIdentifier();
            let fileName = fsPath.basename(fileIdentifier);
            zip.file('lib/' + fileName, file.contents, options);
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

module.exports = TemplateSaver;