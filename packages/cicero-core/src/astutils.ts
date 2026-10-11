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

/**
 * Strips the 'I' prefix commonly added by Concerto TypeScript interface codegen.
 * E.g., 'ILateDeliveryAndPenaltyRequest' -> 'LateDeliveryAndPenaltyRequest'
 *
 * @param {string} typeName - the type name to process
 * @returns {string} the type name without 'I' prefix
 */
export function stripIPrefix(typeName: string): string {
    if (!typeName || typeof typeName !== 'string') {
        return '';
    }
    const trimmed = typeName.trim();
    if (/^I[A-Z]/.test(trimmed)) {
        return trimmed.substring(1);
    }
    return trimmed;
}

/**
 * Unwraps complex or generic type strings to find underlying model type names.
 * E.g., 'Promise<MyResponse>' -> ['MyResponse']
 *       '(e: MyEvent) => void' -> ['MyEvent']
 *       'MyType[]' -> ['MyType']
 *
 * @param {string} rawType - the raw type string from AST or JSDoc
 * @returns {string[]} array of candidate type names
 */
export function unwrapTypeNames(rawType: string): string[] {
    if (!rawType || typeof rawType !== 'string') {
        return [];
    }
    const results = new Set<string>();
    const trimmed = rawType.trim();
    if (!trimmed || trimmed === 'any' || trimmed === 'void' || trimmed === 'undefined' || trimmed === 'null') {
        return [];
    }

    results.add(trimmed);
    const stripped = stripIPrefix(trimmed);
    if (stripped) {
        results.add(stripped);
    }

    if (trimmed.includes('.')) {
        const parts = trimmed.split('.');
        const leaf = parts[parts.length - 1];
        if (leaf) {
            results.add(leaf);
            const leafStripped = stripIPrefix(leaf);
            if (leafStripped) {
                results.add(leafStripped);
            }
        }
    }

    const genericMatches = trimmed.matchAll(/<([A-Za-z0-9_$.]+)>/g);
    for (const match of genericMatches) {
        if (match[1]) {
            const inner = match[1].trim();
            results.add(inner);
            const innerStripped = stripIPrefix(inner);
            if (innerStripped) {
                results.add(innerStripped);
            }
        }
    }

    const callbackMatches = trimmed.matchAll(/:\s*([A-Za-z0-9_$.]+)/g);
    for (const match of callbackMatches) {
        if (match[1]) {
            const inner = match[1].trim();
            if (inner !== 'void' && inner !== 'any') {
                results.add(inner);
                const innerStripped = stripIPrefix(inner);
                if (innerStripped) {
                    results.add(innerStripped);
                }
            }
        }
    }

    return Array.from(results);
}

/**
 * Extracts type annotations from JSDoc comments (@param, @returns, @type).
 *
 * @param {string} contents - the source code text
 * @returns {string[]} array of referenced type names
 */
export function extractJSDocTypes(contents: string): string[] {
    if (!contents || typeof contents !== 'string') {
        return [];
    }
    const types = new Set<string>();
    const jsDocMatches = contents.matchAll(/@(?:param|returns?|type)\s*\{([^}]+)\}/g);
    for (const match of jsDocMatches) {
        if (match[1]) {
            const unwrapped = unwrapTypeNames(match[1]);
            for (const t of unwrapped) {
                types.add(t);
            }
        }
    }
    return Array.from(types);
}

/**
 * Checks whether a ModelManager class declaration matches any type in the referenced set.
 *
 * @param {any} decl - the ClassDeclaration instance from ModelManager
 * @param {Set<string>} referencedTypes - the set of types referenced in logic
 * @returns {boolean} true if declaration matches a referenced type
 */
export function matchesDeclaration(decl: any, referencedTypes: Set<string>): boolean {
    const fqn = decl.getFullyQualifiedName();
    const name = decl.getName();
    const namespace = decl.getModelFile ? decl.getModelFile().getNamespace() : decl.getNamespace();
    const unversionedFqn = namespace ? `${namespace}.${name}` : name;

    if (referencedTypes.has(fqn) || referencedTypes.has(unversionedFqn)) {
        return true;
    }

    if (referencedTypes.has(name) || referencedTypes.has(`I${name}`)) {
        return true;
    }

    for (const refType of referencedTypes) {
        const cleanRef = stripIPrefix(refType);
        if (cleanRef === fqn || cleanRef === unversionedFqn || cleanRef === name) {
            return true;
        }
        if (cleanRef.endsWith(`.${name}`)) {
            return true;
        }
    }

    return false;
}
