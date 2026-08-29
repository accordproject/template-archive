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

import Argument from './argument';
import ArgumentType from './argumenttype';
import CiceroFunction from './function';
import Script from './script';
import ScriptManager from './scriptmanager';
import ts from 'typescript';

/**
 * Manages a set of scripts.
 * @class
 * @memberof module:cicero-core
 */
export default class JavascriptScriptManager extends ScriptManager {

    /**
     * Create the JavascriptScriptManager.
     * @param {any} [options]  - arbitrary options associated with the script manager
     */
    constructor(options?, ...args) {
        super(options);
    }

    /**
     * Creates a new Script
     *
     * @param {string} identifier - the identifier of the script
     * @param {string} language - the language identifier of the script
     * @param {string} contents - the contents of the script
     * @returns {Script} - the instantiated script
     */
    createScript(identifier, language, contents) {
        const sourceFile = ts.createSourceFile(
            identifier,
            contents,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.JS
        );

        const functions: CiceroFunction[] = [];
        const typesSet = new Set<string>();

        const addTypeName = (name: string) => {
            if (!name || typeof name !== 'string') {
                return;
            }
            const trimmed = name.trim();
            if (trimmed) {
                typesSet.add(trimmed);
                if (trimmed.includes('.')) {
                    const parts = trimmed.split('.');
                    const leaf = parts[parts.length - 1];
                    if (leaf) {
                        typesSet.add(leaf);
                    }
                }
            }
        };

        const extractParam = (paramNode: ts.ParameterDeclaration): Argument => {
            const paramName = paramNode.name.getText(sourceFile);
            const paramTypeName = paramNode.type ? paramNode.type.getText(sourceFile) : undefined;
            return new Argument(paramName, new ArgumentType(paramTypeName));
        };

        const visit = (node: ts.Node) => {
            if (ts.isFunctionDeclaration(node)) {
                const name = node.name ? node.name.text : 'anonymous';
                const args = node.parameters.map(extractParam);
                functions.push(new CiceroFunction(name, args));
            } else if (ts.isMethodDeclaration(node)) {
                const name = node.name ? node.name.getText(sourceFile) : 'anonymous';
                const args = node.parameters.map(extractParam);
                functions.push(new CiceroFunction(name, args));
            } else if (ts.isVariableStatement(node)) {
                for (const decl of node.declarationList.declarations) {
                    if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
                        const name = decl.name.getText(sourceFile);
                        const args = decl.initializer.parameters.map(extractParam);
                        functions.push(new CiceroFunction(name, args));
                    }
                }
            }

            if (ts.isTypeReferenceNode(node)) {
                addTypeName(node.typeName.getText(sourceFile));
            } else if (ts.isIdentifier(node)) {
                addTypeName(node.text);
            } else if (ts.isStringLiteral(node)) {
                addTypeName(node.text);
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        const jsDocMatches = contents.matchAll(/@(?:param|returns?|type)\s*\{([^}]+)\}/g);
        for (const match of jsDocMatches) {
            if (match[1]) {
                addTypeName(match[1]);
            }
        }

        return new Script(identifier, language, functions, contents, Array.from(typesSet));
    }
}
