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

const logger = require('@accordproject/cicero-core').logger;
const ResourceValidator = require('composer-concerto/lib/serializer/resourcevalidator');
const Moment = require('moment');

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

        template.getScriptManager().getAllScripts().forEach(function (element) {
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
        Engine.hasFunctionDeclaration(clause,'__dispatch');
        const code = `
        __dispatch({contract:data,request:request,state:state,now:now,emit:[]});
        `;
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
        Engine.hasFunctionDeclaration(clause,'__init');
        const code = `
        __init({contract:data,request:request,now:now,emit:[]});
        `;
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
     * @param {string} currentTime - the definition of 'now'
     * @return {Promise} a promise that resolves to a result for the clause
     * @private
     */
    async execute(clause, request, state, currentTime) {
        const template = clause.getTemplate();
        // ensure the request is valid
        const validRequest = template.getSerializer().fromJSON(request, {validate: false, acceptResourcesForRelationships: true});
        validRequest.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        validRequest.validate();

        // Set the current time and UTC Offset
        const validNow = Engine.initCurrentTime(currentTime);
        const validUtcOffset = validNow.utcOffset();

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
                logger: logger,
                utcOffset: validUtcOffset
            }
        });

        // add immutables to the context
        vm.freeze(validContract, 'data'); // Second argument adds object to global.
        vm.freeze(validRequest, 'request'); // Second argument adds object to global.
        vm.freeze(validState, 'state'); // Second argument adds object to global.
        vm.freeze(validNow, 'now'); // Second argument adds object to global.

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
     * @param {string} currentTime - the definition of 'now'
     * @return {Promise} a promise that resolves to a result for the clause initialization
     * @private
     */
    async init(clause, request, currentTime) {
        const template = clause.getTemplate();
        // ensure the request is valid
        const validRequest = template.getSerializer().fromJSON(request, {validate: false, acceptResourcesForRelationships: true});
        validRequest.$validator = new ResourceValidator({permitResourcesForRelationships: true});
        validRequest.validate();

        // Set the current time and UTC Offset
        const validNow = Engine.initCurrentTime(currentTime);
        const validUtcOffset = validNow.utcOffset();

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
                logger: logger,
                utcOffset: validUtcOffset
            }
        });

        // add immutables to the context
        vm.freeze(validContract, 'data'); // Second argument adds object to global.
        vm.freeze(validRequest, 'request'); // Second argument adds object to global.
        vm.freeze(validNow, 'now'); // Second argument adds object to global.

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
     * Ensures there is a proper current time
     *
     * @param {string} currentTime - the definition of 'now'
     * @returns {object} if valid, the moment object for the current time
     */
    static initCurrentTime(currentTime) {
        if (!currentTime) {
            // Defaults to current local time
            return Moment();
        }
        const now = Moment.parseZone(currentTime, 'YYYY-MM-DDTHH:mm:ssZ', true);
        if (now.isValid()) {
            return now;
        } else {
            throw new Error(`${currentTime} is not a valid moment with the format 'YYYY-MM-DDTHH:mm:ssZ'`);
        }
    }

    /**
     * Looks for the presence of a function in a clause's logic
     *
     * @param {Clause} clause  - the clause
     * @param {string} name  - the function name
     */
    static hasFunctionDeclaration(clause, name) {
        // get the function declarations of either init or dispatch
        const funDecls = clause.getTemplate().getScriptManager().allFunctionDeclarations();
        if (!funDecls.some((ele) => { return ele.getName() === name; })) {
            throw new Error(`Function ${name} was not found in logic`);
        }
    }
}

module.exports = Engine;