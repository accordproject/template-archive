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

const Introspector = require('@accordproject/concerto-core').Introspector;
const APModelManager = require('./apmodelmanager');
const ScriptManager = require('./scriptmanager');

/**
 * Packages the logic for a legal clause or contract template and a given target platform. This includes the model, Ergo logic and compiled version of that logic when required.
 * @class
 * @public
 * @abstract
 * @memberof module:cicero-core
 */
class LogicManager {

    /**
     * Create the LogicManager.
     * @param {Object} options  - e.g., { warnings: true }
     */
    constructor(options) {
        this.contractName = null;
        this.modelManager = new APModelManager();
        this.scriptManager = new ScriptManager(this.target, this.modelManager, options);
        this.introspector = new Introspector(this.modelManager);
    }

    /**
     * Provides access to the Introspector for this TemplateLogic. The Introspector
     * is used to reflect on the types defined within this TemplateLogic.
     * @return {Introspector} the Introspector for this TemplateLogic
     */
    getIntrospector() {
        return this.introspector;
    }

    /**
     * Provides access to the ScriptManager for this TemplateLogic. The ScriptManager
     * manage access to the scripts that have been defined within this TemplateLogic.
     * @return {ScriptManager} the ScriptManager for this TemplateLogic
     */
    getScriptManager() {
        return this.scriptManager;
    }

    /**
     * Provides access to the ModelManager for this TemplateLogic. The ModelManager
     * manage access to the models that have been defined within this TemplateLogic.
     * @return {ModelManager} the ModelManager for this TemplateLogic
     */
    getModelManager() {
        return this.modelManager;
    }

    /**
     * Adds a logic file (as a string) to the TemplateLogic.
     * @param {string} logicFile - The logic file as a string
     * @param {string} fileName - an optional file name to associate with the logic file
     */
    addLogicFile(logicFile,fileName) {
        const logicFileName = slash(fileName);
        let logicExt = '.' +  fileName.split('.').pop();
        let scriptObject = this.getScriptManager().createScript(logicFileName, logicExt, logicFile);
        this.getScriptManager().addScript(scriptObject);
    }

    /**
     * Adds a template file (as a string) to the TemplateLogic.
     * @param {string} templateFile - The template file as a string
     * @param {string} fileName - an optional file name to associate with the template file
     */
    addTemplateFile(templateFile,fileName) {
        this.getScriptManager().addTemplateFile(templateFile,slash(fileName));
    }

    /**
     * Update of a given logic file
     * @param {string} content - the logic content
     * @param {string} name - the logic name
     */
    updateLogic(content, name) {
        const scriptManager = this.getScriptManager();
        if (!scriptManager.getScript(name)) {
            this.addLogicFile(content,name);
        } else {
            const existingScript = scriptManager.getScript(name).getContents();
            if (existingScript.getContents() !== content) {
                scriptManager.modifyScript(name, existingScript.getLanguage(), content);
            }
        }
    }

}

module.exports = LogicManager;