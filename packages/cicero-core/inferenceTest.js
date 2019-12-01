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

// Relies on Babel to run:
// CD to cicero-core dir and start with:  npx -p @babel/core -p @babel/node babel-node --presets @babel/preset-env inferenceTest.js

'use strict';

const Clause = require('./lib/clause');
const ParserManager = require('./lib/parsermanager');
const Template = require('./lib/template');
const TemplateSaver = require('./lib/templatesaver');

const fs = require('fs');

require('@babel/core');
require('@babel/polyfill');

const defaultlog = {
    text: 'success',
    model: 'success',
    logic: 'success',
    meta: 'success',
    execute: 'success',
    loading: 'success'
};

let templatizedGrammar = `
#### Discount.

The Discount is determined according to the following table:

Unordered List:
{{#ulist rates}}{{volumeAbove}}$ million <= Volume < {{volumeUpTo}}$ million : {{rate}}%{{/ulist}}

Ordered List:
{{#olist rates}}{{volumeAbove}}$ million <= Volume < {{volumeUpTo}}$ million : {{rate}}%{{/olist}}

{{#join rates ","}}{{volumeUpTo}}{{/join}}

{{#clause payment}}As consideration in full for the rights granted herein, Licensee shall pay Licensor a one-time
fee in the amount of {{amountText}} ({{amount}}) upon execution of this Agreement, payable as
follows: {{paymentProcedure}}.{{/clause}}

{{#with author}}{{firstName}} {{lastName}}{{/with}}

{{#if isActive}}I'm active{{else}}I'm not active{{/if}}

`;

let grammarName = 'Test Contract 1';

let parser = new ParserManager();

parser.inferVariablesFromGrammar(
    'org.accord.auto',
    grammarName,
    'contract',
    templatizedGrammar
);
parser.createModelsAndLogicFromInferred();
parser.packageDefaultData();

let modelTxt = parser.getDefaultModel();
let logicTxt = parser.getDefaultLogic();
let defaultData = parser.getDefaultData();
let defaultMetadata = parser.getDefaultMetadata();
let defaultRequest = parser.getDefaultRequest();

function textLog(log, msg) {
    return {
        text: msg,
        model: log.model,
        logic: log.logic,
        meta: log.meta,
        execute: log.execute,
        loading: log.loading
    };
}

async function draft(clause, data, log) {
    const changes = {};
    try {
        const dataContent = JSON.parse(data);
        clause.setData(dataContent);
        const options = {
            wrapVariables: false
        };
        // clear engine script cache before re-generating text
        clause.getEngine().clearCacheJsScript();
        const text = await clause.draft(options);
        //console.log('>>> DRAFT text' + JSON.stringify(text));
        changes.text = text;
        changes.data = data;
        if (updateTemplateSample(clause, text)) {
            changes.status = 'changed';
        }
        changes.log = textLog(log, 'GenerateText successful!');
    } catch (error) {
        changes.data = data;
        changes.log = textLog(log, `[Instantiate Contract] ${error.message}`);
    }
    return changes;
}

function updateTemplateSample(clause, sample) {
    const template = clause.getTemplate();
    const samples = template.getMetadata().getSamples();
    if (samples.default !== sample) {
        samples.default = sample;
        template.setSamples(samples);
        return true;
    }
    return false;
}

//Create a clause object to create the sample
let promisedTemplate;
try {
    promisedTemplate = Template.fromGrammar(
        modelTxt,
        JSON.parse(defaultRequest),
        defaultData,
        JSON.parse(defaultMetadata),
        logicTxt,
        templatizedGrammar,
        'READ THIS!'
    );
    console.log('Template successfully created');
} catch (error) {
    console.log(`LOAD FAILED! ${error.message}`); // Error!
}

promisedTemplate.then(
    template => {
        //now, create a Clause object... then... need to run Utils.draft with clause object and default data... this will produce a sample.
        let clause = new Clause(template);
        console.log('\n\n##################################\nCreated clause');
        draft(clause, JSON.stringify(defaultData, null, 2), {
            defaultlog,
            text: 'Building sample automatically'
        })
            .then(changes => {
                console.log(changes);
                if (changes.log.text.indexOf('successful') === -1) {
                    throw new Error(
                        'Error generating text from this new grammar'
                    );
                }

                let zip = TemplateSaver.grammarToCTO(
                    modelTxt,
                    defaultRequest,
                    defaultData,
                    defaultMetadata,
                    logicTxt,
                    templatizedGrammar,
                    'READ THIS!',
                    changes.text
                );
                zip.then(cta => {
                    fs.writeFile('test.cto', cta, function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Success!');
                        }
                    });
                });
            })
            .catch(error => {
                throw error;
            });
        return true;
    },
    reason => {
        console.log(`LOAD FAILED! ${reason.message}`); // Error!
        return false;
    }
);
