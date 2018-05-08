#!/usr/bin/env node
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

const PORT = process.env.PORT | 6001;

// to automatically decode JSON POST
app.use(bodyParser.json());

// set the port for Express
app.set('port', PORT);

/**
 * Handle POST requests to /execute/:template/:data
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
app.post('/execute/:template/:data', async function (req, httpResponse, next) {
    console.log('Template: ' + req.params.template);
    console.log('Clause: ' + req.params.data);
    try {
        const template = await Template.fromDirectory(`${process.env.CICERO_DIR}/${req.params.template}`);
        const data = fs.readFileSync(`${process.env.CICERO_DIR}/${req.params.template}/${req.params.data}`);
        const clause = new Clause(template);
        if(req.params.data.endsWith('.json')) {
            clause.setData(JSON.parse(data.toString()));
        }
        else {
            clause.parse(data.toString());
        }
        const engine = new Engine();
        let result;
        if(Object.keys(req.body).length === 2 &&
        req.body.hasOwnProperty('request') &&
        req.body.hasOwnProperty('state')) {
            result = await engine.execute(clause, req.body.request, req.body.state);
        } else {
            result = await engine.execute(clause, req.body);
        }
        httpResponse.send(result);
    }
    catch(err) {
        return next(err);
    }
});

const server = app.listen(app.get('port'), function () {
    console.log('Server listening on port: ', app.get('port'));
});

module.exports = server;