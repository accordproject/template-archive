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
const bodyParser = require('body-parser');
const Template = require('@accordproject/cicero-core').Template;
const Clause = require('@accordproject/cicero-core').Clause;
const Engine = require('@accordproject/cicero-engine').Engine;

if(!process.env.CICERO_DIR) {
    throw new Error('You must set the CICERO_DIR environment variable.');
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
            const state = { '$class' : 'org.accordproject.cicero.contract.AccordContractState', 'stateId' : 'ehlo' };
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
 * Helper function to initialise the template.
 * @param {req} req The request passed in from endpoint.
 * @returns {object} The template instance object.
 */
async function initTemplateInstance(req) {
    const template = await Template.fromDirectory(`${process.env.CICERO_DIR}/${req.params.template}`);
    return new Clause(template);
}

const server = app.listen(app.get('port'), function () {
    console.log('Server listening on port: ', app.get('port'));
});

module.exports = server;