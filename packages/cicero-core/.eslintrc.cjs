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

module.exports = {
    root: true,
    env: {
        es2022: true,
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    ignorePatterns: [
        'node_modules/',
        'lib/',
        'umd/',
        'dist/',
        'coverage/',
        '**/*.snap',
        'test/data/',
    ],
    rules: {
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'linebreak-style': ['warn', 'unix'],
        'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
        'semi': ['error', 'always'],
        'no-console': 'warn',
        'curly': 'error',
        'eqeqeq': 'error',
        'no-throw-literal': 'error',
        'no-var': 'error',
        'no-tabs': 'error',
        'no-trailing-spaces': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { 'args': 'none', 'ignoreRestSiblings': true, 'caughtErrors': 'none' }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        'no-unused-vars': 'off',
    },
};
