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

import { IllegalModelException, Introspector, ModelManager } from '@accordproject/concerto-core';
import JavascriptScriptManager from './javascriptscriptmanager';
import TypescriptScriptManager from './typescriptscriptmanager';
import LANGUAGES from './languages';

/**
 * LogicManager manages a set of scripts and associated models.
 * @class
 * @public
 * @abstract
 * @memberof module:cicero-core
 */
export default class LogicManager {

    language: any;
    modelManager: any;
    scriptManager: any;
    introspector: any;

    /**
     * Create the LogicManager.
     * @param {string} language  the language for the logic manager, e.g. 'es6' or 'typescript'
     * @param {Object} [options]  - arbitrary options associated with the logic manager
     */
    constructor(language, options?, ...args) {
        if(LANGUAGES.includes(language) === false) {
            throw new Error(`Unknown language ${language}`);
        }
        this.language = language;
        this.modelManager = new ModelManager(options);
        this.scriptManager = language === 'es6'
            ? new JavascriptScriptManager(this.language, this.modelManager, options)
            : new TypescriptScriptManager(this.language, this.modelManager, options);
        this.introspector = new Introspector(this.modelManager);
    }

    /**
     * Returns the language of the logic manager
     * @return {string} the language of the logic manager
     */
    getLanguage() {
        return this.language;
    }

    /**
     * Adds a logic file to the underlying script manager
     * @param {string} contents  the contents of the logic file
     * @param {string} identifier  the identifier of the logic file
     */
    addLogicFile(contents, identifier) {
        const script = this.scriptManager.createScript(identifier, this.language, contents);
        this.scriptManager.addScript(script);
    }

    /**
     * Provides access to the Introspector for the model manager
     * @return {Introspector} the Introspector for the model manager
     */
    getIntrospector() {
        return this.introspector;
    }

    /**
     * Provides access to the ScriptManager.
     * @return {ScriptManager} the ScriptManager
     */
    getScriptManager() {
        return this.scriptManager;
    }

    /**
     * Provides access to the ModelManager
     * @return {ModelManager} the ModelManager
     */
    getModelManager() {
        return this.modelManager;
    }

    /**
     * Validates that no loaded model declarations form a circular inheritance chain.
     * Unresolved external/imported supertypes are skipped so callers can run this
     * before ModelManager.updateExternalModels().
     * @param {ModelManager} modelManager - the ModelManager containing loaded model files
     * @throws {IllegalModelException} if a circular inheritance chain is detected
     */
    static validateNoCircularInheritance(modelManager) {
        const visited = new Set<string>();
        const resolveSuperType = (decl) => {
            if (typeof decl.getSuperTypeDeclaration !== 'function') {
                return null;
            }
            try {
                return decl.getSuperTypeDeclaration();
            } catch {
                // Skip unresolved external/imported supertypes before updateExternalModels()
                return null;
            }
        };

        for (const modelFile of modelManager.getModelFiles()) {
            for (const decl of modelFile.getAllDeclarations()) {
                if (typeof decl.getSuperTypeDeclaration !== 'function') {
                    continue;
                }
                const startFqn = decl.getFullyQualifiedName();
                if (visited.has(startFqn)) {
                    continue;
                }

                const path: string[] = [];
                const pathIndex = new Map<string, number>();
                let current = decl;

                while (current) {
                    const fqn = current.getFullyQualifiedName();
                    if (pathIndex.has(fqn)) {
                        const cycleStart = pathIndex.get(fqn) as number;
                        const cyclePath = [...path.slice(cycleStart), fqn].join(' -> ');
                        throw new IllegalModelException(
                            `Circular inheritance detected: ${cyclePath}`,
                            current.getModelFile(),
                            current.ast?.location
                        );
                    }
                    if (visited.has(fqn)) {
                        break;
                    }
                    pathIndex.set(fqn, path.length);
                    path.push(fqn);
                    current = resolveSuperType(current);
                }

                for (const fqn of path) {
                    visited.add(fqn);
                }
            }
        }
    }
}
