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
const Util = require('@accordproject/cicero-core/src/util');
const Export = require('@accordproject/cicero-transform').Export;

if(!process.env.CICERO_DIR) {
    throw new Error('You must set the CICERO_DIR environment variable.');
}

/**
 * Helper function to check if contract slc file is present.
 */
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
 * Handle POST requests to /trigger/:type/:path
 * The clause is created using the template and the data or the contract instance is created.
 *
 * Type
 * ----------
 * The type parameter is the type that specifies what is to be triggered, a clause or contract.
 *
 * Instance Name
 * ----------
 * The instanceName parameter is the name of a directory under CICERO_DIR or CICERO_CONTRACTS that contains
 * the template/contract to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - request
 *  - partyName
 *  - data
 *  - state (optional - for stateless execution)
 *  - output (optional - for saving updated contract instance in a new slc file under CICERO_CONTRACTS
 *
 * Response
 * ----------
 * JSON formated response object
 *
 */
app.post('/trigger/:type/:instanceName', async function (req, httpResponse, next) {
    try {
        const instance = req.params.type === 'clause' ? await initTemplateInstance(req) : req.params.type === 'contract' ? await loadInstance(req) : null;
        if(!instance) {
            throw new Error('The type specified is wrong. Please use either \'clause\' or \'contract\' type');
        }
        if(req.params.type === 'clause' && !Object.prototype.hasOwnProperty.call(req.body,'data')) {
            throw new Error('Missing data in /trigger body');
        }
        if(req.params.type === 'clause') {
            instance.setData(req.body.data);
        }
        if(req.params.type === 'contract' && !req.body.partyName) {
            throw new Error('Please enter the name of the party that is triggering the contract Instance');
        }

        const engine = new Engine();
        let result;
        if(Object.keys(req.body).length === 3 &&
           Object.prototype.hasOwnProperty.call(req.body,'request') &&
           Object.prototype.hasOwnProperty.call(req.body,'state')) {
            result = await engine.trigger(instance, req.body.request, req.body.state);
        } else if(Object.keys(req.body).length === 2 &&
           Object.prototype.hasOwnProperty.call(req.body,'request')) {
            const state = { '$class' : 'org.accordproject.runtime.State' };
            result = await engine.trigger(instance, req.body.request, state);
            delete result.state;
        } else {
            throw new Error('Missing request or state in /trigger body');
        }
        if(req.params.type === 'contract') {
            //Add state
            Util.addHistory(
                instance,
                req.body.partyName,
                'trigger',
                result,
                'Execution'
            );
            const archive = await instance.toArchive('ergo');
            const file = !req.body.output ? `${process.env.CICERO_CONTRACTS}/${req.params.instanceName}.slc` : `${process.env.CICERO_CONTRACTS}/${req.body.output}.slc`;
            fs.writeFileSync(file, archive);
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
 * Intance Name
 * ----------
 * The instanceName parameter is the name of a directory under CICERO_DIR that contains
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
app.post('/parse/:instanceName', async function (req, httpResponse, next) {
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
 * Instance Name
 * ----------
 * The InstanceName parameter is the name of a directory under CICERO_DIR that contains
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
app.post('/draft/:instanceName', async function (req, httpResponse, next) {
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
 * The contract instance is created using the template and the data and saved under $CICERO_CONTRACTS path.
 * The call returns an object having the data, instatiator's name, author's signatures, party signatures and the history.
 *
 * Instance Name
 * ----------
 * The instanceName parameter is the name of a directory under CICERO_CONTRACTS that contains
 * the contract to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - data
 *  - instantiator
 *  - output (optional - for saving updated contract instance in a new slc file under CICERO_CONTRACTS
 *  - options
 *
 * Response
 * ----------
 * An object containing the data, instatiator's name, author's signatures, party signatures and the history
 *
 */
app.post('/instantiate/:instanceName', async function (req, httpResponse, next) {
    try {
        checkContractsPath();
        if(Object.prototype.hasOwnProperty.call(req.body,'instantiator') &&
           Object.prototype.hasOwnProperty.call(req.body,'data')) {
            const instance = await instantiateContract(req);
            const instanceBuffer = await instance.toArchive(instance.runtime);
            const file = !req.body.output ? `${process.env.CICERO_CONTRACTS}/${req.params.instanceName}.slc` : `${process.env.CICERO_CONTRACTS}/${req.body.output}.slc`;
            fs.writeFileSync(file, instanceBuffer);
            const responseInstance = {
                data: instance.data,
                instantiator: instance.instantiator,
                authorSignature: instance.authorSignature,
                contractSignatures: instance.contractSignatures,
                history: instance.history
            };
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
 * The call returns the object with author's signature, party signatures and the history.
 *
 * Instance Name
 * ----------
 * The instanceName parameter is the name of a directory under CICERO_CONTRACTS that contains
 * the contract to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - p12File
 *  - passphrase
 *  - signatory
 *  - output (optional - for saving updated contract instance in a new slc file under CICERO_CONTRACTS
 *
 * Response
 * ----------
 * An object containing the author's signature, party signatures and the history
 *
 */
app.post('/sign/:instanceName', async function (req, httpResponse, next) {
    try {
        checkContractsPath();
        if(Object.prototype.hasOwnProperty.call(req.body,'keystore') &&
           Object.prototype.hasOwnProperty.call(req.body,'passphrase') &&
           Object.prototype.hasOwnProperty.call(req.body,'signatory')) {
            const p12File = p12FileLoader(req.body.keystore);
            const instance = await loadInstance(req);
            const instanceBuffer = await instance.signContract(p12File, req.body.passphrase, req.body.signatory);
            const file = !req.body.output ? `${process.env.CICERO_CONTRACTS}/${req.params.instanceName}.slc` : `${process.env.CICERO_CONTRACTS}/${req.body.output}.slc`;
            fs.writeFileSync(file, instanceBuffer);
            const response = {
                authorSignature: instance.authorSignature,
                contractSignatures: instance.contractSignatures,
                history: instance.history
            };
            httpResponse.send(response);
        } else {
            throw new Error('Missing p12File encoded string or passphrase of keystore or signatory\'s name in /sign body');
        }
    }
    catch(err) {
        return next(err);
    }
});

/**
 * Handle POST requests to /export/:instanceName
 * The body of the POST should contain the request data and any options.
 * The contract instance is exported either in a markdown or a pdf format, from the contracts stored under CICERO_CONTRACT.
 * The call returns the buffer string or the markdown file.
 *
 * Instance Name
 * ----------
 * The contract parameter is the name of a directory under CICERO_CONTRACT that contains
 * the contract to use.
 *
 * Request
 * ----------
 * The POST body contains three properties:
 *  - format
 *  - utcOffset
 *  - partyName
 *  - output (optional - for saving updated contract instance in a new slc file under CICERO_CONTRACTS
 *
 * Response
 * ----------
 * A string containing the pdf buffer or markdown file
 *
 */
app.post('/export/:instanceName', async function (req, httpResponse, next) {
    try {
        checkContractsPath();
        if(Object.prototype.hasOwnProperty.call(req.body,'format') &&
           Object.prototype.hasOwnProperty.call(req.body,'partyName') &&
           Object.prototype.hasOwnProperty.call(req.body,'utcOffset')) {
            const instance = await loadInstance(req);
            const result = await Export.toFormat(instance, req.body.format, req.body.utcOffset, req.body.options);
            const fileFormat = Export.formatDescriptor(req.body.format).fileFormat;
            const outputFile = fileFormat === 'json' ? JSON.stringify(result) : result;
            //Add state
            Util.addHistory(
                instance,
                req.body.partyName,
                'export',
                'Exported Successfully',
                'Execution'
            );
            const archive = await instance.toArchive('ergo');
            const file = !req.body.output ? `${process.env.CICERO_CONTRACTS}/${req.params.instanceName}.slc` : `${process.env.CICERO_CONTRACTS}/${req.body.output}.slc`;
            fs.writeFileSync(file, archive);
            httpResponse.send(outputFile);
        } else {
            throw new Error('Missing format or utcOffset or partyName in /export body');
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
    const template = await Template.fromDirectory(`${process.env.CICERO_DIR}/${req.params.instanceName}`);
    return ClauseInstance.fromTemplate(template);
}

/**
 * Helper function to instantiate the contract instance.
 * @param {req} req The request passed in from endpoint.
 * @returns {object} The contract instance object.
 */
async function instantiateContract(req) {
    const template = await Template.fromDirectory(`${process.env.CICERO_DIR}/${req.params.instanceName}`);
    return ContractInstance.fromTemplateWithData(template, req.body.data, req.body.instantiator);
}

/**
 * Helper function to load the contract instance.
 * @param {req} req The request passed in from endpoint.
 * @returns {object} The contract instance object.
 */
async function loadInstance(req) {
    const buffer = fs.readFileSync(`${process.env.CICERO_CONTRACTS}/${req.params.instanceName}.slc`);
    return ContractInstance.fromArchive(buffer);
}

/**
 * Helper function to load the encoded p12file.
 * @param {keystore} keystore object containing dtata about the keystore.
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