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

const fs = require('fs');
const app = require('express')();
const bodyParser = require('body-parser');
const Template = require('@accordproject/cicero-core').Template;
const Clause = require('@accordproject/cicero-core').Clause;
const Engine = require('@accordproject/cicero-engine').Engine;

if(!process.env.CICERO_DIR) {
    throw new Error('You must set the CICERO_DIR environment variable.');
}

if(!process.env.CICERO_DATA) {
    throw new Error('You must set the CICERO_DATA environment variable.');
}

const PORT = process.env.PORT | 6001;

// to automatically decode JSON POST
app.use(bodyParser.json());

// set the port for Express
app.set('port', PORT);

/**
 * Handle POST requests to /trigger/:template/:data
 * The body of the POST should contain the request data.
 * The clause is created using the template and the data. If
 * the data ends with .json then setData is called on the Clause,
 * otherwise the contents of the file is parsed.
 *
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * The data parameter is either a JSON data file or a TXT file that is used to create
 * the clause from the Template.
 *
 * Stateless execution
 * --------------------
 * The HTTP POST body is the request used for execution of the clause.
 *
 * Stateful execution
 * --------------------
 * If the body contains an object with two properties 'request' and 'state',
 * then 'request' is used as the execution request,
 * 'state' is used as the contract state.
 */
app.post('/trigger/:template/:data', async function (req, httpResponse, next) {
    console.log('CICERO_DIR: ' + process.env.CICERO_DIR);
    console.log('CICERO_DATA: ' + process.env.CICERO_DATA);
    console.log('Template: ' + req.params.template);
    console.log('Clause: ' + req.params.data);
    try {
        const clause = await initClauseInstance(req);
        const engine = new Engine();
        let result;
        if(Object.keys(req.body).length === 2 &&
           Object.prototype.hasOwnProperty.call(req.body,'request') &&
           Object.prototype.hasOwnProperty.call(req.body,'state')) {
            result = await engine.trigger(clause, req.body.request, req.body.state);
        } else {
            // Add empty state in input, remove it on output
            const state = { '$class' : 'org.accordproject.cicero.contract.AccordContractState', 'stateId' : 'ehlo' };
            result = await engine.trigger(clause, req.body, state);
            delete result.state;
        }
        httpResponse.send(result);
    }
    catch(err) {
        return next(err);
    }
});

/**
 * Handle POST requests to /parse/:template/:data
 * The body of the POST should contain the request data.
 * The clause is created using the template and the data. If
 * the data ends with .json then setData is called on the Clause,
 * otherwise the contents of the file is parsed.
 *
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * The data parameter is either a JSON data file or a TXT file that is used to create
 * the clause from the Template.
 *
 * Stateless execution
 * --------------------
 * The HTTP POST body is the request used for execution of the clause.
 *
 * Response
 * ----------
 * A data string containing the parsed output
 *
 */
app.post('/parse/:template/:data', async function (req, httpResponse, next) {
    console.log('CICERO_DIR: ' + process.env.CICERO_DIR);
    console.log('CICERO_DATA: ' + process.env.CICERO_DATA);
    console.log('Template: ' + req.params.template);
    console.log('Clause: ' + req.params.data);
    try {
        const clause = await initClauseInstance(req);
        httpResponse.send(clause.data);
    }
    catch(err) {
        return next(err);
    }
});

/**
 * Handle POST requests to /parse/:template/:data
 * The body of the POST should contain the request data.
 * The clause is created using the template and the data. If
 * the data ends with .json then setData is called on the Clause,
 * otherwise the contents of the file is parsed.
 *
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * The data parameter is either a JSON data file or a TXT file that is used to create
 * the clause from the Template.
 *
 * Stateless execution
 * --------------------
 * The HTTP POST body is the request used for execution of the clause.
 *
 * Response
 * ----------
 * A data string containing the draft output
 *
 */
app.post('/draft/:template/:data', async function (req, httpResponse, next) {
    console.log('CICERO_DIR: ' + process.env.CICERO_DIR);
    console.log('CICERO_DATA: ' + process.env.CICERO_DATA);
    console.log('Template: ' + req.params.template);
    console.log('Clause: ' + req.params.data);
    try {

        const clause = await initClauseInstance(req);
        clause.draft().then((result) => {
            httpResponse.send(result);
        });
    }
    catch(err) {
        return next(err);
    }
});

/**
 * Helper function to initialise Clause template.
 * @param {req} req The request object passed in from endpoint.
 * @returns {clause} An initialised instance of a clause template.
 */
async function initClauseInstance(req) {

    const template = await Template.fromDirectory(`${process.env.CICERO_DIR}/${req.params.template}`);
    const data = fs.readFileSync(`${process.env.CICERO_DATA}/${req.params.template}/${req.params.data}`);
    const clause = new Clause(template);

    if(req.params.data.endsWith('.json')) {
        clause.setData(JSON.parse(data.toString()));
    }
    else {
        clause.parse(data.toString());
    }
    return clause;
}

const server = app.listen(app.get('port'), function () {
    console.log('Server listening on port: ', app.get('port'));
});

module.exports = server;