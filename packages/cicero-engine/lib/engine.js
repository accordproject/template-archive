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

const Logger = require('./logger');

const {
    VM,
    VMScript
} = require('vm2');

/**
 * <p>
 * Engine class. Stateless execution of clauses against a request object, returning a response to the caller.
 * </p>
 * @private
 * @class
 * @abstract
 * @memberof module:cicero-engine
 */
class Engine {

    /**
     * Create the Engine.
     */
    constructor() {
        this.scripts = {};
    }

    /**
     * Compile and cache a clause
     * @param {Clause} clause  - the clause to compile
     * @private
     */
    compileClause(clause) {

        let allScripts = '';

        clause.getTemplate().getScriptManager().getScripts().forEach(function (element) {
            allScripts += element.getContents();
        }, this);

        allScripts += this.buildDispatchFunction(clause);
        // console.log(allScripts);

        const script = new VMScript(allScripts);
        this.scripts[clause.getIdentifier()] = script;
    }

    /**
     * Generate the runtime dispatch logic
     * @param {Clause} clause  - the clause to compile
     * @return {string} the Javascript code for dispatch
     * @private
     */
    buildDispatchFunction(clause) {

        // get the function declarations of all functions
        // that have the @clause annotation
        const functionDeclarations = clause.getTemplate().getScriptManager().getScripts().map((ele) => {
            return ele.getFunctionDeclarations();
        })
            .reduce((flat, next) => {
                return flat.concat(next);
            })
            .filter((ele) => {
                return ele.getDecorators().indexOf('AccordClauseLogic') >= 0;
            }).map((ele) => {
                return ele;
            });

        if (functionDeclarations.length === 0) {
            throw new Error('Did not find any function declarations with the @AccordClauseLogic annotation');
        }

        const head = `
        __dispatch(data,request);

        function __dispatch(data,request) {
            switch(request.getFullyQualifiedType()) {
        `;

        let methods = '';
        functionDeclarations.forEach((ele, n) => {
            methods += `
            case '${ele.getParameterTypes()[1]}':
                let type${n} = '${ele.getParameterTypes()[2]}';
                let ns${n} = type${n}.substr(0, type${n}.lastIndexOf('.'));
                let clazz${n} = type${n}.substr(type${n}.lastIndexOf('.')+1);
                let response${n} = factory.newTransaction(ns${n}, clazz${n});
                let context = {request: request, response: response${n}, data: data};
                ${ele.getName()}(context);
                return context.response;
            break;`;
        });

        const tail = `
            default:
                throw new Error('No function handler for ' + request.getFullyQualifiedType() );
            } // switch
            return 'oops';
        }
        
        `;

        const code = head + methods + tail;
        console.log(code);
        return code;
    }

    /**
     * Execute a clause, passing in the request object
     * @param {Clause} clause  - the clause to execute
     * @param {Object} request  - the request
     * @return {Promise} a promise that resolves to a result for the clause
     * @private
     */
    execute(clause, request) {

        const me = this;

        return new Promise(function (resolve, reject) {
            console.log('Engine processing ' + request.$class);
            // ensure the request is valid
            const tx = clause.getTemplate().getSerializer().fromJSON(request);
            tx.validate();

            let script = me.scripts[clause.getIdentifier()];

            if (!script) {
                me.compileClause(clause);
            }

            script = me.scripts[clause.getIdentifier()];

            if (!script) {
                throw new Error('Failed to created executable script for ' + clause.getIdentifier());
            }

            const data = clause.getData();
            const factory = clause.getTemplate().getFactory();
            const vm = new VM({
                timeout: 1000,
                sandbox: {
                    moment: require('moment'),
                    logger: new Logger(clause.getTemplate().getSerializer())
                }
            });

            // add immutables to the context
            vm.freeze(tx, 'request'); // Second argument adds object to global.
            vm.freeze(data, 'data'); // Second argument adds object to global.
            vm.freeze(factory, 'factory'); // Second argument adds object to global.

            const response = vm.run(script);

            response.validate();
            const result = {
                'clause': clause.getIdentifier(),
                'request': request,
                'response': clause.getTemplate().getSerializer().toJSON(response)
            };

            resolve(result);
        });
    }
}

module.exports = Engine;