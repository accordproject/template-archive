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

const fs = require('fs');
const fsPath = require('path');
const slash = require('slash');
const JSZip = require('jszip');
const xregexp = require('xregexp');
const languageTagRegex = require('ietf-language-tag-regex');
const DefaultArchiveLoader = require('./loaders/defaultarchiveloader');
const FileLoader = require('@accordproject/ergo-compiler').FileLoader;
const Logger = require('@accordproject/concerto-core').Logger;

// Matches 'sample.md' or 'sample_TAG.md' where TAG is an IETF language tag (BCP 47)
const IETF_REGEXP = languageTagRegex({ exact: false }).toString().slice(1,-2);
const SAMPLE_FILE_REGEXP = xregexp('text[/\\\\]sample(_(' + IETF_REGEXP + '))?.md$');

/**
 * A utility class to create templates from data sources.
 * @class
 * @private
 * @abstract
 */
class TemplateLoader extends FileLoader {
    /**
     * Create a template from an archive.
     * @param {*} Template - the type to construct
     * @param {Buffer} buffer  - the buffer to a Cicero Template Archive (cta) file
     * @param {object} options - additional options
     * @return {Promise<Template>} a Promise to the template
     */
    static async fromArchive(Template, buffer, options) {
        const method = 'fromArchive';
        const zip = await JSZip.loadAsync(buffer);
        // const allFiles = await TemplateLoader.loadZipFilesContents(zip, /.*/);
        // console.log(allFiles);
        const ctoModelFiles = [];
        const ctoModelFileNames = [];
        const sampleTextFiles = {};

        const readmeContents = await TemplateLoader.loadZipFileContents(zip, 'README.md');
        const logo = await TemplateLoader.loadZipFileBuffer(zip, 'logo.png');
        let sampleFiles = await TemplateLoader.loadZipFilesContents(zip, SAMPLE_FILE_REGEXP);
        sampleFiles.forEach( async (sampleFile) => {
            let matches = sampleFile.name.match(SAMPLE_FILE_REGEXP);
            let locale = 'default';
            // Locale match found
            if(matches !== null && matches[2]){
                locale = matches[2];
            }
            sampleTextFiles[locale] = sampleFile.contents;
        });

        const requestContents = await TemplateLoader.loadZipFileContents(zip, 'request.json', true);
        const packageJsonObject = await TemplateLoader.loadZipFileContents(zip, 'package.json', true, true);
        const grammar = await TemplateLoader.loadZipFileContents(zip, 'text/grammar.tem.md', false, false);

        Logger.debug(method, 'Looking for model files');
        let ctoFiles =  await TemplateLoader.loadZipFilesContents(zip, /model[/\\].*\.cto$/);
        ctoFiles.forEach(async (file) => {
            ctoModelFileNames.push(file.name);
            ctoModelFiles.push(file.contents);
        });

        // create the template
        const template = new (Function.prototype.bind.call(Template, null, packageJsonObject, readmeContents, sampleTextFiles, requestContents, logo, options));

        // add model files
        Logger.debug(method, 'Adding model files to model manager');
        template.getModelManager().addAPModelFiles(ctoModelFiles, ctoModelFileNames, true); // Archives can always be loaded offline

        Logger.debug(method, 'Setting grammar');
        if(!grammar) {
            throw new Error('A template must contain a grammar.tem.md file.');
        } else {
            const templateKind = template.getMetadata().getTemplateType() !== 0 ? 'clause' : 'contract';
            template.parserManager.setTemplate(grammar);
            template.parserManager.setTemplateKind(templateKind);
            template.parserManager.buildParser();
        }

        // load and add the ergo files
        if(template.getMetadata().getRuntime() === 'ergo') {
            Logger.debug(method, 'Adding Ergo files to script manager');
            const scriptFiles = await TemplateLoader.loadZipFilesContents(zip, /logic[/\\].*\.ergo$/);
            scriptFiles.forEach(function (obj) {
                template.getLogicManager().addLogicFile(obj.contents, obj.name);
            });
        } else {
            // load and add compiled JS files - we assume all runtimes are JS based (review!)
            Logger.debug(method, 'Adding JS files to script manager');
            const scriptFiles = await TemplateLoader.loadZipFilesContents(zip, /logic[/\\].*\.js$/);
            scriptFiles.forEach(function (obj) {
                template.getLogicManager().addLogicFile(obj.contents, obj.name);
            });
        }

        TemplateLoader.registerFormulas(template.parserManager,template.getLogicManager());

        // check the integrity of the model and logic of the template
        template.validate();

        return template; // Returns template
    }

    /**
     * Create a template from an URL.
     * @param {*} Template - the type to construct
     * @param {String} url  - the URL to a Cicero Template Archive (cta) file
     * @param {object} options - additional options
     * @return {Promise} a Promise to the template
     */
    static async fromUrl(Template, url, options) {
        const loader = new DefaultArchiveLoader();
        const buffer = await loader.load(url, options);
        return TemplateLoader.fromArchive(Template, buffer, options);
    }

    /**
     * Builds a Template from the contents of a directory.
     * The directory must include a package.json in the root (used to specify
     * the name, version and description of the template).
     *
     * @param {*} Template - the type to construct
     * @param {String} path to a local directory
     * @param {Object} [options] - an optional set of options to configure the instance.
     * @return {Promise<Template>} a Promise to the instantiated template
     */
    static async fromDirectory(Template, path, options = {}) {
        const method = 'fromDirectory';

        // grab the README.md
        const readmeContents = await TemplateLoader.loadFileContents(path, 'README.md');

        // grab the logo.png
        const logo = await TemplateLoader.loadFileBuffer(path, 'logo.png');

        // grab the request.json
        const requestJsonObject = await TemplateLoader.loadFileContents(path, 'request.json', true );

        // grab the package.json
        const packageJsonObject = await TemplateLoader.loadFileContents(path, 'package.json', true, true );

        // grab the sample files
        Logger.debug(method, 'Looking for sample files');
        const sampleFiles = await TemplateLoader.loadFilesContents(path, SAMPLE_FILE_REGEXP);
        const sampleTextFiles = {};

        sampleFiles.forEach((file) => {
            const matches = file.name.match(SAMPLE_FILE_REGEXP);

            let locale = 'default';
            // Match found
            if(matches !== null && matches[2]){
                locale = matches[2];
            }
            Logger.debug(method, 'Using sample file locale', locale);
            sampleTextFiles[locale] = file.contents;
        });

        // create the template
        const template = new (Function.prototype.bind.call(Template, null, packageJsonObject, readmeContents, sampleTextFiles, requestJsonObject, logo, options));
        const modelFiles = [];
        const modelFileNames = [];
        const ctoFiles = await TemplateLoader.loadFilesContents(path, /model[/\\].*\.cto$/);
        ctoFiles.forEach((file) => {
            modelFileNames.push(slash(file.name));
            modelFiles.push(file.contents);
        });

        const externalModelFiles = await template.getModelManager().addAPModelFiles(modelFiles, modelFileNames, options && options.offline);
        if(!options || !options.offline){
            externalModelFiles.forEach(function (file) {
                fs.writeFileSync(path + '/model/' + file.name, file.content);
            });
        }

        // load and add the template
        let grammar = await TemplateLoader.loadFileContents(path, 'text/grammar.tem.md', false, false);

        if(!grammar) {
            throw new Error('A template must either contain a grammar.tem.md file.');
        } else {
            const templateKind = template.getMetadata().getTemplateType() !== 0 ? 'clause' : 'contract';
            template.parserManager.setTemplate(grammar);
            template.parserManager.setTemplateKind(templateKind);
            template.parserManager.buildParser();
            Logger.debug(method, 'Loaded grammar.tem.md', grammar);
        }

        Logger.debug(method, 'Loaded grammar.tem.md');

        // load and add the ergo files
        if(template.getMetadata().getRuntime() === 'ergo') {
            const ergoFiles = await TemplateLoader.loadFilesContents(path, /logic[/\\].*\.ergo$/);
            ergoFiles.forEach((file) => {
                const resolvedPath = slash(fsPath.resolve(path));
                const resolvedFilePath = slash(fsPath.resolve(file.name));
                const truncatedPath = resolvedFilePath.replace(resolvedPath+'/', '');
                template.getLogicManager().addLogicFile(file.contents, truncatedPath);
            });
        } else {
            // load and add compiled JS files - we assume all runtimes are JS based (review!)
            const jsFiles = await TemplateLoader.loadFilesContents(path, /logic[/\\].*\.js$/);
            jsFiles.forEach((file) => {
                const resolvedPath = slash(fsPath.resolve(path));
                const resolvedFilePath = slash(fsPath.resolve(file.name));
                const truncatedPath = resolvedFilePath.replace(resolvedPath+'/', '');
                template.getLogicManager().addLogicFile(file.contents, truncatedPath);
            });
        }

        TemplateLoader.registerFormulas(template.parserManager,template.getLogicManager());

        // check the template
        template.validate();

        return template;
    }

    /**
     * Prepare the text for parsing (normalizes new lines, etc)
     * @param {*} parserManager - the parser manager
     * @param {*} logicManager - the logic manager
     */
    static registerFormulas(parserManager,logicManager){
        const formulas = parserManager.getFormulas();
        formulas.forEach(x => {
            logicManager.addTemplateFile(x.code,x.name);
        });
    }

    /**
     * Prepare the text for parsing (normalizes new lines, etc)
     * @param {string} input - the text for the clause
     * @return {string} - the normalized text for the clause
     */
    static normalizeText(input) {
        // we replace all \r and \n with \n
        let text =  input.replace(/\r/gm,'');
        return text;
    }

}

module.exports = TemplateLoader;