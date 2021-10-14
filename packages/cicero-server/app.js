#!/usr/bin/env node
/* eslint-disable no-console */
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

const app = require('express')();
const fs = require('fs');
const bodyParser = require('body-parser');
const Template = require('@accordproject/cicero-core').Template;
const ClauseInstance = require('@accordproject/cicero-core').ClauseInstance;
const ContractInstance = require('@accordproject/cicero-core').ContractInstance;
const Engine = require('@accordproject/cicero-engine').Engine;

if(!process.env.CICERO_DIR) {
    throw new Error('You must set the CICERO_DIR environment variable.');
}

function checkContractsPath() {
    if(!process.env.CICERO_CONTRACTS) {
        throw new Error('You must set the CICERO_CONTRACTS environment variable.');
    }
}

const PORT = process.env.CICERO_PORT | 6001;

// to automatically decode JSON POST
app.use(bodyParser.json());

// set the port for Express
app.set('port', PORT);

/**
 * Handle POST requests to /trigger/:template
 * The clause is created using the template and the data.
 *
 * Template
 * ----------
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - request
 *  - data
 *  - state (optional - for stateless execution)
 *
 * Response
 * ----------
 * JSON formated response object
 *
 */
app.post('/trigger/:template', async function (req, httpResponse, next) {
    try {
        const clause = await initTemplateInstance(req);

        const engine = new Engine();
        let result;
        if(Object.keys(req.body).length === 3 &&
           Object.prototype.hasOwnProperty.call(req.body,'request') &&
           Object.prototype.hasOwnProperty.call(req.body,'state') &&
           Object.prototype.hasOwnProperty.call(req.body,'data')) {
            clause.setData(req.body.data);
            result = await engine.trigger(clause, req.body.request, req.body.state);
        } else if(Object.keys(req.body).length === 2 &&
           Object.prototype.hasOwnProperty.call(req.body,'request') &&
           Object.prototype.hasOwnProperty.call(req.body,'data')) {
            const state = { '$class' : 'org.accordproject.runtime.State' };
            clause.setData(req.body.data);
            result = await engine.trigger(clause, req.body.request, state);
            delete result.state;
        } else {
            throw new Error('Missing request, state or data in /trigger body');
        }
        httpResponse.send(result);
    }
    catch(err) {
        return next(err);
    }
});

/**
 * Handle POST requests to /parse/:template
 * The body of the POST should contain the sample text.
 * The clause is created using the template, parsing the text and if parsing succeeds returning the contract data.
 *
 * Template
 * ----------
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - sample
 *
 * Response
 * ----------
 * A data string containing the parsed output
 *
 */
app.post('/parse/:template', async function (req, httpResponse, next) {
    try {
        const clause = await initTemplateInstance(req);
        if(Object.keys(req.body).length === 1 &&
           Object.prototype.hasOwnProperty.call(req.body,'sample')) {
            clause.parse(req.body.sample.toString());
            httpResponse.send(clause.getData());
        } else {
            throw new Error('Missing sample in /parse body');
        }
    } catch(err) {
        return next(err);
    }
});

/**
 * Handle POST requests to /draft/:template
 * The body of the POST should contain the request data and any options.
 * The clause is created using the template and the data.
 * The call returns the text of the contract.
 *
 * Template
 * ----------
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - data
 *  - options
 *
 * Response
 * ----------
 * A string containing the draft output
 *
 */
app.post('/draft/:template', async function (req, httpResponse, next) {
    try {
        const clause = await initTemplateInstance(req);
        if(Object.keys(req.body).length === 1 &&
           Object.prototype.hasOwnProperty.call(req.body,'data')) {
            clause.setData(req.body.data);
            httpResponse.send(clause.draft());
        } else if(Object.keys(req.body).length === 2 &&
                  Object.prototype.hasOwnProperty.call(req.body,'data') &&
                  Object.prototype.hasOwnProperty.call(req.body,'options')) {
            clause.setData(req.body.data);
            httpResponse.send(clause.draft(req.body.options));
        } else {
            throw new Error('Missing data or options in /draft body');
        }
    }
    catch(err) {
        return next(err);
    }
});

/**
 * Handle POST requests to /instantiate/:template
 * The body of the POST should contain the request data and any options.
 * The contract instance is created using the template and the data and saved in $CICERO_CONTRACTS path.
 * The call returns an object having the data, instatiator's name, author's signatures, party signatures and the states.
 *
 * Template
 * ----------
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - data
 *  - instantiator
 *  - options
 *
 * Response
 * ----------
 * An object containing the data, instatiator's name, author's signatures, party signatures and the states
 *
 */
app.post('/instantiate/:template', async function (req, httpResponse, next) {
    try {
        checkContractsPath();
        if(Object.prototype.hasOwnProperty.call(req.body,'instantiator') &&
           Object.prototype.hasOwnProperty.call(req.body,'data')) {
            const instance = await instantiateContract(req);
            const instanceBuffer = await instance.toArchive(instance.runtime);
            const instanceName = instance.getIdentifier();
            const file = `${process.env.CICERO_CONTRACTS}/${instanceName}.slc`;
            fs.writeFileSync(file, instanceBuffer);
            const responseInstance = {
                data: instance.data,
                instantiator: instance.instantiator,
                authorSignature: instance.authorSignature,
                contractSignatures: instance.contractSignatures,
                states: instance.states
            }
            httpResponse.send(responseInstance);
        } else {
            throw new Error('Missing data or instantiator name in /instantiate body');
        }
    }
    catch(err) {
        return next(err);
    }
});

/**
 * Handle POST requests to /sign/:contract
 * The body of the POST should contain the request data and any options.
 * The contract instance is signed using the contarct, p12File, passphrase and the signatory's name and the data and saved in $CICERO_CONTRACTS path.
 * The call returns the object with author's signature, party signatures and the states.
 *
 * Contract
 * ----------
 * The contract parameter is the name of a directory under CICERO_CONTRACT that contains
 * the contract to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - p12File
 *  - passphrase
 *  - signatory
 *
 * Response
 * ----------
 * An object containing the author's signature, party signatures and the states
 *
 */
app.post('/sign/:contract', async function (req, httpResponse, next) {
    try {
        checkContractsPath();
        if(Object.prototype.hasOwnProperty.call(req.body,'keystore') &&
           Object.prototype.hasOwnProperty.call(req.body,'passphrase') &&
           Object.prototype.hasOwnProperty.call(req.body,'signatory')) {
            const p12File = p12FileLoader(req.body.keystore);
            const instance = await loadInstance(req);
            const instanceBuffer = await instance.signContract(p12File, req.body.passphrase, req.body.signatory);
            const instanceName = instance.getIdentifier();
            const file = `${process.env.CICERO_CONTRACTS}/${instanceName}.slc`;
            fs.writeFileSync(file, instanceBuffer);
            const response = {
                authorSignature: instance.authorSignature,
                contractSignatures: instance.contractSignatures,
                states: instance.states
            }
            httpResponse.send(response);
        } else {
            throw new Error('Missing p12File encoded string or passphrase of keystore or signatory\'s name in /instantiate body');
        }
    }
    catch(err) {
        return next(err);
    }
});

/**
 * Helper function to initialise the template.
 * @param {req} req The request passed in from endpoint.
 * @returns {object} The template instance object.
 */
async function initTemplateInstance(req) {
    const template = await Template.fromDirectory(`${process.env.CICERO_DIR}/${req.params.template}`);
    return ClauseInstance.fromTemplate(template);
}

/**
 * Helper function to instantiate the contract instance.
 * @param {req} req The request passed in from endpoint.
 * @returns {object} The contract instance object.
 */
async function instantiateContract(req) {
    const template = await Template.fromDirectory(`${process.env.CICERO_DIR}/${req.params.template}`);
    return ContractInstance.fromTemplateWithData(template, req.body.data, req.body.instantiator);
}

/**
 * Helper function to load the contract instance.
 * @param {req} req The request passed in from endpoint.
 * @returns {object} The contract instance object.
 */
async function loadInstance(req) {
    const buffer = fs.readFileSync(`${process.env.CICERO_CONTRACTS}/${req.params.contract}.slc`);
    return ContractInstance.fromArchive(buffer);
}

/**
 * Helper function to load the encoded p12file.
 * @param {req} req The request passed in from endpoint.
 * @returns {string} The p12file encoded string.
 */
function p12FileLoader(keystore) {
    if(keystore.type === 'file') {
        if(!process.env.CICERO_KEYSTORES) {
            throw new Error('You must set the CICERO_KEYSTORE environment variable.');
        }
        return fs.readFileSync(`${process.env.CICERO_KEYSTORES}/${keystore.value}.p12`, { encoding: 'base64' });
    }else if(keystore.type === 'inline') {
        return keystore.value;
    }else {
        throw new Error('Missing or incorrect keystore type or value.');
    }
}

const server = app.listen(app.get('port'), function () {
    console.log('Server listening on port: ', app.get('port'));
});

module.exports = server;