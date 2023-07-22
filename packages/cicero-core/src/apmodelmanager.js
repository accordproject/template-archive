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

const slash = require('slash');
const fsPath = require('path');
const fs = require('fs');

const Parser = require('@accordproject/concerto-cto').Parser;
const ModelManager = require('@accordproject/concerto-core').ModelManager;
const ModelFile = require('@accordproject/concerto-core').ModelFile;

const processModelFiles = (modelFiles) => {
    let models = [];
    modelFiles.forEach(function (file) {
        // ignore the system namespace when creating an archive
        if (file.isSystemModelFile()) {
            return;
        }
        let fileName = file.getName();
        if (fileName === 'UNKNOWN' || !fileName) {
            fileName = file.getNamespace() + '.cto';
        } else {
            fileName = fsPath.basename(fileName);
        }
        models.push({ 'name' : fileName, 'namespace': file.getNamespace(), 'content' : file.definitions });
    });
    return models;
};

/**
 * Accord Project Model Manager. Bootstraps the ModelManager with system files.
 * @class
 * @public
 * @abstract
 * @memberof module:cicero-core
 */
class APModelManager extends ModelManager {

    /**
     */
    constructor() {
        super();

        const readAndAddModelFile = (fileName) => {
            const modelFile = fsPath.resolve(__dirname, fileName);
            const modelFileContent = fs.readFileSync(modelFile, 'utf8');
            const name = slash(fileName);
            this.addCTOModel(modelFileContent, name);
        };
        readAndAddModelFile('./external/@models.accordproject.org.time@0.2.0.cto');
        readAndAddModelFile('./external/@models.accordproject.org.money@0.2.0.cto');
        readAndAddModelFile('./external/@models.accordproject.org.accordproject.contract.cto');
        readAndAddModelFile('./external/@models.accordproject.org.accordproject.runtime.cto');

        this.validateModelFiles();
        this.builtInNamespaces = this.getNamespaces();
    }

    /**
     * Gets all the CTO models
     * @return {Array<{name:string, content:string}>} the name and content of each CTO file
     */
    getModels() {
        return processModelFiles(this.getModelFiles());
    }

    /**
     * Adds a model file (as a string) to the TemplateLogic.
     * @param {string} modelFileContent - The model file content as a string
     * @param {string} fileName - an optional file name to associate with the model file
     */
    addAPModelFile(modelFileContent, fileName) {
        const name = slash(fileName);
        const ast = Parser.parse(modelFileContent, fileName);
        const modelFile = new ModelFile(this, ast, modelFileContent, name);
        if (!this.builtInNamespaces.includes(modelFile.getNamespace())) {
            this.addModelFile(modelFile,modelFileContent,name,true);
        }
    }

    /**
     * Add a set of model files to the TemplateLogic
     * @param {string[]} modelFiles - An array of Concerto files as
     * strings.
     * @param {string[]} [modelFileNames] - An optional array of file names to
     * associate with the model files
     * @param {boolean} offline - do not update external models
     * @return {Array<{name:string, namespace: string, content:string}>}
     * A list of external non-system model files added in addition to the source set.
     */
    async addAPModelFiles(modelFiles, modelFileNames, offline) {
        modelFiles.map((modelFileContent, index) => {
            const modelFileName = modelFileNames[index];
            this.addAPModelFile(modelFileContent, modelFileName);
        });
        if (offline) {
            this.validateModelFiles();
            return [];
        } else {
            const externalModelFiles = await this.updateExternalModels();
            return processModelFiles(externalModelFiles);
        }
    }
}

module.exports = APModelManager;