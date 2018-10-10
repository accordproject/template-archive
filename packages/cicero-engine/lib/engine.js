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
const logger = require('@accordproject/cicero-core').logger;
const ResourceValidator = require('composer-concerto/lib/serializer/resourcevalidator');

const {
    VM,
    VMScript
} = require('vm2');

/**
 * <p>
 * Engine class. Stateless execution of clauses against a request object, returning a response to the caller.
 * </p>
 * @class
 * @public
 * @memberof module:cicero-engine
 */
class Engine {

    /**
     * Create the Engine.
     */
    constructor() {
        this.scripts = {};
        this.initScripts = {};
    }

    /**
     * Compile and cache a clause with JavaScript logic
     * @param {Clause} clause  - the clause to compile
     * @private
     */
    compileJsClause(clause) {
        let allJsScripts = '';
        let allJsInitScripts = '';
        let template = clause.getTemplate();

        template.getScriptManager().getScripts().forEach(function (element) {
            if (element.getLanguage() === '.js') {
                allJsScripts += element.getContents();
                allJsInitScripts += element.getContents();
            }
        }, this);

        if (allJsScripts === '') {
            throw new Error('Did not find any JavaScript logic');
        }
        allJsScripts += this.buildDispatchFunction(clause);
        allJsInitScripts += this.buildInitFunction(clause);
        const script = new VMScript(allJsScripts);
        const initScript = new VMScript(allJsInitScripts);
        this.scripts[clause.getIdentifier()] = script;
        this.initScripts[clause.getIdentifier()] = initScript;
    }

    /**
     * Generate the runtime dispatch logic
     * @param {Clause} clause - the clause to compile
     * @return {String} the dispatch code
     * @private
     */
    buildDispatchFunction(clause) {
        // get the function declarations of all functions
        // that have the @clause annotation
        const functionDeclarations = clause.getTemplate().getScriptManager().getScripts().filter((ele) => {
            return ele.getLanguage() === ('.js');
        }).map((ele) => {
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
        __dispatch(contractdata,data,request,state,moment());

        function __dispatch(contract,data,request,state,now) {
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
                let context${n} = {request: request, state: state, contract: contract, data: data, response: response${n}, emit: [], now: now};
                ${ele.getName()}(context${n});
                return { response: context${n}.response, state: context${n}.state, emit: context${n}.emit };
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
        logger.debug(code);
        return code;
    }

    /**
     * Generate the initialization logic
     * @param {Clause} clause - the clause to compile
     * @return {String} the initialization code
     * @private
     */
    buildInitFunction(clause) {
        // get the function declarations of all functions
        // that have the @clause annotation
        const functionDeclarations = clause.getTemplate().getScriptManager().getScripts().filter((ele) => {
            return ele.getLanguage() === ('.js');
        }).map((ele) => {
            return ele.getFunctionDeclarations();
        })
            .reduce((flat, next) => {
                return flat.concat(next);
            })
            .filter((ele) => {
                return ele.getDecorators().indexOf('AccordClauseLogicInit') >= 0;
            }).map((ele) => {
                return ele;
            });

        if (functionDeclarations.length > 1) {
            throw new Error('Shoult have at most one function declaration with the @AccordClauseLogicInit annotation');
        }

        const head = `
        __init(contractdata,data,request,moment());

        function __init(contract,data,request,now) {
        `;

        let methods = '';
        if (functionDeclarations.length === 0) {
            methods += `
                return { response: serializer.fromJSON({ '$class': 'org.accordproject.cicero.runtime.Response' }, {validate: false, acceptResourcesForRelationships: true}), state: serializer.fromJSON({ '$class': 'org.accordproject.cicero.contract.AccordContractState', 'stateId' : 'org.accordproject.cicero.contract.AccordContractState#1' }, {validate: false, acceptResourcesForRelationships: true}), emit: [] };`;
        } else {
            const ele = functionDeclarations[0];
            methods += `
                let type0 = '${ele.getParameterTypes()[2]}';
                let ns0 = type0.substr(0, type0.lastIndexOf('.'));
                let clazz0 = type0.substr(type0.lastIndexOf('.')+1);
                let response0 = factory.newTransaction(ns0, clazz0);
                let context0 = {request: request, contract: contract, data: data, response: response0, emit: [], now: now};
                ${ele.getName()}(context0);
                return { response: context0.response, state: context0.state, emit: context0.emit };`;
        }
        const tail = `
        }
        `;

        const code = head + methods + tail;
        logger.debug(code);
        return code;
    }

    /**
     * Execute a clause, passing in the request object
     * @param {Clause} clause  - the clause to execute
     * @param {object} request  - the request, a JS object that can be deserialized
     * using the Composer serializer.
     * @param {object} state  - the contract state, a JS object that can be deserialized
     * using the Composer serializer.
     * @return {Promise} a promise that resolves to a result for the clause
     * @private
     */
    async execute(clause, request, state) {
        const template = clause.getTemplate();
        // ensure the request is valid
        const validRequest = template.getSerializer().fromJSON(request, {validate: false, acceptResourcesForRelationships: true});
        validRequest.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        validRequest.validate();

        // ensure the state is valid
        const validState = template.getSerializer().fromJSON(state, {validate: false, acceptResourcesForRelationships: true});
        validState.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        validState.validate();

        logger.debug('Engine processing request ' + request.$class + ' with state ' + state.$class);

        let script = this.scripts[clause.getIdentifier()];

        this.compileJsClause(clause);
        script = this.scripts[clause.getIdentifier()];

        const validContract = clause.getDataAsComposerObject();
        const factory = template.getFactory();
        const vm = new VM({
            timeout: 1000,
            sandbox: {
                moment: require('moment'),
                serializer:template.getSerializer(),
                logger: new Logger(template.getSerializer())
            }
        });

        // add immutables to the context
        vm.freeze(validContract, 'contractdata'); // Second argument adds object to global.
        vm.freeze(validContract, 'data'); // Second argument adds object to global.
        vm.freeze(validRequest, 'request'); // Second argument adds object to global.
        vm.freeze(validState, 'state'); // Second argument adds object to global.

        vm.freeze(factory, 'factory'); // Second argument adds object to global.

        // execute the logic
        const result = vm.run(script);

        // ensure the response is valid
        result.response.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        result.response.validate();
        const responseResult = template.getSerializer().toJSON(result.response, {convertResourcesToRelationships: true});

        // ensure the new state is valid
        result.state.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        result.state.validate();
        const stateResult = template.getSerializer().toJSON(result.state, {convertResourcesToRelationships: true});

        // ensure all the emits are valid
        let emitResult = [];
        for (let i = 0; i < result.emit.length; i++) {
            result.emit[i].$validator = new ResourceValidator({permitResourcesForRelationships: true});
            result.emit[i].validate();
            emitResult.push(template.getSerializer().toJSON(result.emit[i], {convertResourcesToRelationships: true}));
        }

        return {
            'clause': clause.getIdentifier(),
            'request': request,
            'response': responseResult,
            'state': stateResult,
            'emit': emitResult,
        };
    }

    /**
     * Initialize a clause, passing in the request object
     * @param {Clause} clause  - the clause to execute
     * @param {object} request  - the request, a JS object that can be deserialized
     * using the Composer serializer.
     * @return {Promise} a promise that resolves to a result for the clause initialization
     * @private
     */
    async init(clause, request) {
        const template = clause.getTemplate();
        // ensure the request is valid
        const validRequest = template.getSerializer().fromJSON(request, {validate: false, acceptResourcesForRelationships: true});
        validRequest.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        validRequest.validate();

        logger.debug('Engine processing initialization request ' + request.$class);

        let script = this.initScripts[clause.getIdentifier()];

        this.compileJsClause(clause);
        script = this.initScripts[clause.getIdentifier()];

        const validContract = clause.getDataAsComposerObject();
        const factory = template.getFactory();
        const vm = new VM({
            timeout: 1000,
            sandbox: {
                moment: require('moment'),
                serializer:template.getSerializer(),
                logger: new Logger(template.getSerializer())
            }
        });

        // add immutables to the context
        vm.freeze(validContract, 'contractdata'); // Second argument adds object to global.
        vm.freeze(validContract, 'data'); // Second argument adds object to global.
        vm.freeze(validRequest, 'request'); // Second argument adds object to global.

        vm.freeze(factory, 'factory'); // Second argument adds object to global.

        // execute the logic
        const result = vm.run(script);

        // ensure the response is valid
        result.response.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        result.response.validate();
        const responseResult = template.getSerializer().toJSON(result.response, {convertResourcesToRelationships: true});

        // ensure the new state is valid
        result.state.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        result.state.validate();
        const stateResult = template.getSerializer().toJSON(result.state, {convertResourcesToRelationships: true});

        // ensure all the emits are valid
        let emitResult = [];
        for (let i = 0; i < result.emit.length; i++) {
            result.emit[i].$validator = new ResourceValidator({permitResourcesForRelationships: true});
            result.emit[i].validate();
            emitResult.push(template.getSerializer().toJSON(result.emit[i], {convertResourcesToRelationships: true}));
        }

        return {
            'clause': clause.getIdentifier(),
            'request': request,
            'response': responseResult,
            'state': stateResult,
            'emit': emitResult,
        };
    }
}

module.exports = Engine;