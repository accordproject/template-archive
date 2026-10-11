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
import { extractJSDocTypes, unwrapTypeNames } from './astutils';

let tsModule: any = null;

/**
 * Lazy loads the typescript module to prevent bundling it in production browser builds.
 * @returns {any} the typescript module or null if unavailable
 */
function getTs(): any {
    if (!tsModule) {
        try {
            tsModule = require('typescript');
        } catch (e) {
            return null;
        }
    }
    return tsModule;
}

/**
 * Manages a set of scripts.
 * @class
 * @memberof module:cicero-core
 */
export default class TypescriptScriptManager extends ScriptManager {

    /**
     * Create the TypescriptScriptManager.
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
        const ts = getTs();
        if (!ts) {
            const jsDocTypes = extractJSDocTypes(contents);
            return new Script(identifier, language, [], contents, jsDocTypes);
        }

        const sourceFile = ts.createSourceFile(
            identifier,
            contents,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
        );

        const functions: CiceroFunction[] = [];
        const typesSet = new Set<string>();

        const addTypes = (rawType: string) => {
            if (!rawType || typeof rawType !== 'string') {
                return;
            }
            const unwrapped = unwrapTypeNames(rawType);
            for (const t of unwrapped) {
                typesSet.add(t);
            }
        };

        const extractParam = (paramNode: any): Argument => {
            const paramName = paramNode.name.getText(sourceFile);
            const paramTypeName = paramNode.type ? paramNode.type.getText(sourceFile) : undefined;
            if (paramTypeName) {
                addTypes(paramTypeName);
            }
            return new Argument(paramName, new ArgumentType(paramTypeName));
        };

        const visit = (node: any) => {
            // Function declarations
            if (ts.isFunctionDeclaration(node)) {
                const name = node.name ? node.name.text : 'anonymous';
                const args = node.parameters.map(extractParam);
                if (node.type) {
                    addTypes(node.type.getText(sourceFile));
                }
                functions.push(new CiceroFunction(name, args));
            } else if (ts.isMethodDeclaration(node)) {
                const name = node.name ? node.name.getText(sourceFile) : 'anonymous';
                const args = node.parameters.map(extractParam);
                if (node.type) {
                    addTypes(node.type.getText(sourceFile));
                }
                functions.push(new CiceroFunction(name, args));
            } else if (ts.isVariableStatement(node)) {
                for (const decl of node.declarationList.declarations) {
                    if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
                        const name = decl.name.getText(sourceFile);
                        const args = decl.initializer.parameters.map(extractParam);
                        if (decl.initializer.type) {
                            addTypes(decl.initializer.type.getText(sourceFile));
                        }
                        functions.push(new CiceroFunction(name, args));
                    }
                }
            }

            // Generic type arguments in calls, e.g. emit<Greeting>(...)
            if (ts.isCallExpression(node)) {
                if (node.typeArguments) {
                    for (const typeArg of node.typeArguments) {
                        addTypes(typeArg.getText(sourceFile));
                    }
                }
                // Also check emit(new Greeting(...))
                for (const arg of node.arguments) {
                    if (ts.isNewExpression(arg)) {
                        addTypes(arg.expression.getText(sourceFile));
                    }
                }
            }

            // Object literal with $class property: { $class: 'org.accordproject.Greeting' }
            if (ts.isPropertyAssignment(node)) {
                const propName = node.name.getText(sourceFile);
                if (propName === '$class' || propName === '"$class"' || propName === "'$class'") {
                    if (ts.isStringLiteral(node.initializer)) {
                        addTypes(node.initializer.text);
                    }
                }
            }

            // Type references (interfaces, type aliases used in annotations)
            if (ts.isTypeReferenceNode(node)) {
                addTypes(node.typeName.getText(sourceFile));
            }

            // Type assertions, e.g. `val as MyType` or `<MyType>val`
            if (ts.isAsExpression(node)) {
                addTypes(node.type.getText(sourceFile));
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        const jsDocTypes = extractJSDocTypes(contents);
        for (const t of jsDocTypes) {
            typesSet.add(t);
        }

        return new Script(identifier, language, functions, contents, Array.from(typesSet));
    }
}
