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

const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const url = require('url');
const handlebars = require('handlebars');

const ModelLoader = require('@accordproject/concerto-core').ModelLoader;
const CTOParser = require('@accordproject/concerto-cto').Parser;

/**
 * Translate CTO URL to a CTO file name
 *
 * @param {string} requestUrl - the URL of the CTO file
 * @param {string} the file name
 */
function mapNameExternal(requestUrl) {
    let parsedUrl = url.parse(requestUrl);
    // external ModelFiles have a name that starts with '@'
    // (so that they are identified as external when an archive is read back in)
    const name = (parsedUrl.host + parsedUrl.pathname).replace(/\//g, '.');
    return '@' + name;
}

/**
 * Translate CTO URL to a JS file name
 *
 * @param {string} requestUrl - the URL of the CTO file
 * @param {string} the file name
 */
function mapNameJs(requestUrl) {
    let fileName = mapNameExternal(requestUrl);
    const reg = /@((\d+.)+\d+)/gi; // Remove option tag from file name
    fileName = fileName.replace(reg, '');
    let fileNameSplit = fileName.split('.');
    const name = fileNameSplit[fileNameSplit.length - 2];
    return name.charAt(0).toUpperCase() + name.slice(1) + 'Model';
}

function mapContentJs(content) {
    return content;
}

/**
 * Fetches all external for a set of models dependencies and
 * saves all the models to a target directory
 *
 * @param {object} modelManager - the model manager
 * @param {string} output - the output directory
 * @param {boolean} clean - true if deleting the files
 */
function buildExternal(modelManager, output, clean) {
    if (clean) {
        modelManager.getModelFiles().forEach(function(file) {
            if (file.isSystemModelFile()) {
                return;
            }
            const fileName = file.getName();
            const newFile = path.join(output,fileName);
            try {
                fs.unlinkSync(newFile);
                console.log('Deleted: ' + newFile);
            } catch (err) {
                console.error('Delete failure: ' + newFile);
            }
        });
    } else {
        mkdirp.sync(output);
        modelManager.writeModelsToFileSystem(output);
        return `Loaded external models in '${output}'.`;
    }
}

/**
 * Fetches all external for a set of models dependencies and
 * saves all the JS versions of the models to a target directory
 *
 * @param {object} modelManager - the model manager
 * @param {string} output - the output directory
 * @param {boolean} clean - true if deleting the files
 * @param {string} templateFile - the Handlebars template file
 * @param {function} nameFun - the function to process the name
 * @param {function} contentFun - the function to process the content
 * @param {string} ext - file extension
 */
function buildAux(modelManager, output, clean, templateFile, nameFun, contentFun, ext) {
    const source = fs.readFileSync(path.join(__dirname,templateFile),'utf8');
    const template = handlebars.compile(source);

    mkdirp.sync(output);
    modelManager.getModelFiles().forEach(function(file) {
        if (file.isSystemModelFile()) {
            return;
        }
        const fileName = nameFun(file.getName());
        const context = {
            'name' : fileName,
            'namespace': file.getNamespace(),
            'content' : contentFun(file.getDefinitions())
        };
        const result = template(context);
        const newFile = path.join(output,fileName + ext);
        if (clean) {
            try {
                fs.unlinkSync(newFile);
                console.log('Deleted: ' + newFile);
            } catch (err) {
                console.error('Delete failure: ' + newFile);
            }
        } else {
            console.log('Creating: ' + newFile);
            fs.writeFileSync(newFile,result);
        }
    });
}

/**
 * Fetches all external for a set of models dependencies and
 * saves all the JS versions of the models to a target directory
 *
 * @param {object} modelManager - the model manager
 * @param {string} output - the output directory
 * @param {boolean} clean - true if deleting the files
 */
function buildJs(modelManager, output, clean) {
    buildAux(modelManager, output, clean, 'jstarget.hbs', mapNameJs, mapContentJs, '.js');
}

/**
 * Fetches all external for a set of models dependencies and
 * saves all the JS versions of the models to a target directory
 *
 * @param {object} dir - current directory
 * @param {string} workload - configuration
 * @param {boolean} clean - true if deleting the files
 */
async function process(dir, workload, clean = false) {
    const ctoFiles = workload.models;
    const modelManager = await ModelLoader.loadModelManager(ctoFiles);
    if (workload.output) {
        buildExternal(modelManager, path.join(dir,workload.output), clean);
    }
    if (workload.js) {
        buildJs(modelManager, path.join(dir, workload.js), clean);
    }
}

module.exports = { process };
