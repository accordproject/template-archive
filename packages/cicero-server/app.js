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

const PORT = process.env.CICERO_PORT || 6001;

// to automatically decode JSON POST
app.use(bodyParser.json());

// set the port for Express
app.set('port', PORT);

/** @template [T=object] */
class MissingArgumentError extends Error {
    /** @param {T} message Error message */
    constructor(message) {
        super(message);
        this.name = 'MissingArgumentError';
    }
}

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
 * Handle POST requests to /invoke/:template
 * The body of the POST should contain the params, data and state.
 * The clause is created using the template and the data.
 * The call returns the output of requested clause.
 *
 * Template
 * ----------
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * Request
 * ----------
 * The POST body contains six properties:
 *  - sample or data
 *  - parameters
 *  - clause name
 *  - state
 *  - currentTime
 *  - utcOffset
 *
 * Response
 * ----------
 * Output of the given clause from contract
 *
 */
app.post('/invoke/:template', async function(req, httpResponse, next) {

    try {
        const options = req.body.options ?? {};
        const currentTime = req.body.currentTime ?? new Date().toISOString();
        const utcOffset = req.body.utcOffset ?? new Date().getTimezoneOffset();

        const engine = new Engine();
        const clause = await initTemplateInstance(req, options);
        let clauseName;
        let params;
        let state;

        if (req.body.clauseName) {
            clauseName = req.body.clauseName.toString();
        } else  {
            throw new MissingArgumentError('Missing `clauseName` in /invoke body');
        }

        if (req.body.params) {
            params = req.body.params;
        } else {
            throw new MissingArgumentError('Missing `params` in /invoke body');
        }

        if (req.body.sample) {
            clause.parse(req.body.sample.toString(), currentTime, utcOffset);
        } else if (req.body.data) {
            clause.setData(req.body.data);
        } else {
            throw new MissingArgumentError('Missing `sample` or `data` in /invoke body');
        }

        if(req.body.state) {
            state = req.body.state;
        } else {
            const initResult = await engine.init(clause, currentTime, utcOffset);
            state = initResult.state;
        }

        const result = await engine.invoke(clause, clauseName, params, state, currentTime, utcOffset);
        httpResponse.status(200).send(result);
    } catch(err) {
        if (err.name === 'MissingArgumentError') {
            httpResponse.status(422).send({error: err.message});
        } else {
            httpResponse.status(500).send({error: err.message});
        }
    }
});

/**
 * Handle POST requests to /normalize/:template
 * The body of the POST should contain the sample text.
 * The clause is created using the template and the sample.
 * The call returns the re-drafted text of template
 *
 * Template
 * ----------
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * Request
 * ----------
 * The POST body contains four properties:
 *  - sample
 *  - clause name
 *  - currentTime (optional)
 *  - utcOffset (optional)
 *
 * Response
 * ----------
 * Re-drafted text of the template
 *
 */
app.post('/normalize/:template', async function(req, httpResponse, next) {

    try {
        const options = req.body.options ?? {};
        const currentTime = req.body.currentTime ?? new Date().toISOString();
        const utcOffset = req.body.utcOffset ?? new Date().getTimezoneOffset();

        const clause = await initTemplateInstance(req, options);

        if (req.body.sample) {
            clause.parse(req.body.sample, currentTime, utcOffset);
            httpResponse.status(200).send({result: clause.draft()});
        } else {
            throw new MissingArgumentError('Missing `sample` in /normalize body');
        }
    } catch (err) {
        if (err.name === 'MissingArgumentError') {
            httpResponse.status(422).send({error: err.message});
        } else {
            httpResponse.status(500).send({error: err.message});
        }
    }
});

/**
 * Handle POST requests to /initialize/:template
 *
 * Template
 * ----------
 * The template parameter is the name of a directory under CICERO_DIR that contains
 * the template to use.
 *
 * Request
 * ----------
 * The POST body contains six properties:
 *  - data or sample
 *  - params (optional)
 *  - options (optional)
 *  - current time (optional)
 *  - utc offset (optional)
 *
 * Response
 * ----------
 * Initialized state information of template
 *
 */
app.post('/initialize/:template', async function(req, httpResponse, next) {
    try {
        const options = req.body.options ?? {};
        const currentTime = req.body.currentTime ?? new Date().toISOString();
        const utcOffset = req.body.utcOffset ?? new Date().getTimezoneOffset();
        const params = req.body.params ?? {};

        const engine = new Engine();
        const clause = await initTemplateInstance(req, options);

        if (req.body.sample) {
            clause.parse(req.body.sample.toString(), currentTime, utcOffset);
        } else if (req.body.data) {
            clause.setData(req.body.data);
        } else {
            throw new MissingArgumentError('Missing `sample` or `data` in /invoke body');
        }

        const result = await engine.init(clause, currentTime, utcOffset, params);
        httpResponse.status(200).send(result);
    } catch(err) {
        if (err.name === 'MissingArgumentError') {
            httpResponse.status(422).send({error: err.message});
        } else {
            httpResponse.status(500).send({error: err.message});
        }
    }
});

/**
 * Helper function to determine whether the template is archived or not
 * @param {string} templateName Name of the template
 * @returns {boolean} True if the given template is a .cta file
 */
function isTemplateArchive(templateName) {
    try {
        fs.lstatSync(`${process.env.CICERO_DIR}/${templateName}.cta`).isFile();
        return true;
    } catch(err) {
        return false;
    }
}

/**
 * Helper function to load a template from disk
 * @param {string} templateName Name of the template
 * @param {object} options an optional set of options
 * @returns {object} The template instance object.
 */
async function loadTemplate(templateName, options) {
    if (process.env.CICERO_URL) {
        return await Template.fromUrl(`${process.env.CICERO_URL}/${templateName}.cta`, options);
    } else if (isTemplateArchive(templateName)) {
        const buffer = fs.readFileSync(`${process.env.CICERO_DIR}/${templateName}.cta`);
        return await Template.fromArchive(buffer, options);
    } else {
        return await Template.fromDirectory(`${process.env.CICERO_DIR}/${templateName}`, options);
    }
}

/**
 * Helper function to initialise the template.
 * @param {req} req The request passed in from endpoint.
 * @param {object} options an optional set of options
 * @returns {object} The clause instance object.
 */
async function initTemplateInstance(req, options) {
    const template = await loadTemplate(req.params.template, options);
    return new Clause(template);
}

const server = app.listen(app.get('port'), function () {
    console.log('Server listening on port: ', app.get('port'));
});

module.exports = server;
