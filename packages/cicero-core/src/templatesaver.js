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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}

function _asyncToGenerator(fn) {
    return function() {
        var self = this,
            args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(
                    gen,
                    resolve,
                    reject,
                    _next,
                    _throw,
                    'next',
                    value
                );
            }
            function _throw(err) {
                asyncGeneratorStep(
                    gen,
                    resolve,
                    reject,
                    _next,
                    _throw,
                    'throw',
                    err
                );
            }
            _next(undefined);
        });
    };
}

const fsPath = require('path');

const JSZip = require('jszip');

/**
 * A utility to persist templates to data sources.
 * @class
 * @abstract
 * @private
 */

class TemplateSaver {
    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {Template} template - the template to persist
     * @param {string} [language] - target language for the archive (should be 'ergo')
     * @param {Object} [options] - JSZip options
     * @return {Promise<Buffer>} the zlib buffer
     */
    static toArchive(template, language, options) {
        return _asyncToGenerator(function*() {
            if (!language || typeof language !== 'string') {
                throw new Error('language is required and must be a string');
            }

            const metadata = template
                .getMetadata()
                .createTargetMetadata(language);
            let zip = new JSZip();
            let packageFileContents = JSON.stringify(metadata.getPackageJson());
            zip.file('package.json', packageFileContents, options); // save the grammar

            zip.file(
                'text/',
                null,
                Object.assign({}, options, {
                    dir: true
                })
            );

            if (template.getParserManager().getTemplatizedGrammar()) {
                zip.file(
                    'text/grammar.tem.md',
                    template.getParserManager().getTemplatizedGrammar(),
                    options
                );
            } // save the README.md if present

            if (metadata.getREADME()) {
                zip.file('README.md', metadata.getREADME(), options);
            } // Save the sample files

            const sampleFiles = metadata.getSamples();

            if (sampleFiles) {
                Object.keys(sampleFiles).forEach(function(locale) {
                    let fileName;

                    if (locale === 'default') {
                        fileName = 'text/sample.md';
                    } else {
                        fileName = 'text/sample_'.concat(locale, '.md');
                    }

                    zip.file(fileName, sampleFiles[locale], options);
                });
            } // save the request.json if present & not text-only

            if (metadata.getRequest()) {
                let requestFileContents = JSON.stringify(metadata.getRequest());
                zip.file('request.json', requestFileContents, options);
            }

            let modelFiles = template.getModelManager().getModels();
            zip.file(
                'model/',
                null,
                Object.assign({}, options, {
                    dir: true
                })
            );
            modelFiles.forEach(function(file) {
                zip.file('model/' + file.name, file.content, options);
            });
            zip.file(
                'logic/',
                null,
                Object.assign({}, options, {
                    dir: true
                })
            );
            const scriptFiles = template
                .getScriptManager()
                .getScriptsForTarget(language);
            scriptFiles.forEach(function(file) {
                let fileIdentifier = file.getIdentifier();
                let fileName = fsPath.basename(fileIdentifier);
                zip.file('logic/' + fileName, file.contents, options);
            });
            return zip
                .generateAsync({
                    type: 'nodebuffer'
                })
                .then(something => {
                    return Promise.resolve(something).then(result => {
                        return result;
                    });
                });
        })();
    }

    /**
     * Given autogenerated contents of a .CTO, create an .cto archive
     * @param {String} modelTxt  - the text of the model.cto file required for the template
     * @param {String} data - just stringified version of sample data [Can drop this].
     * @param {String} packageStringified - the package.json stringified
     * @param {String} logic - the text of the ergo.logic file
     * @param {String} templatizedGrammar - the templatized grammar we used to generate all of the related files.
     * @param {String} readme - readme file to include
     * @param {String} sample - sample grammar to include with pre-filled data
     * @param {Object} [options] - JSZip options
     * @return {Promise<Buffer>} - zlib buffered
     */
    static grammarToCTO(
        modelTxt,
        requestStringified,
        data,
        packageStringified,
        logic,
        grammar,
        readme,
        sample,
        options
    ) {
        return _asyncToGenerator(function*() {
            let zip = new JSZip();
            zip.file('package.json', packageStringified, options); // save the grammar

            zip.file(
                'text/',
                null,
                Object.assign({}, options, {
                    dir: true
                })
            );

            if (grammar) {
                zip.file('text/grammar.tem.md', grammar, options);
            } // save the README.md if present

            if (readme) {
                zip.file('README.md', readme, options);
            }

            // Save the sample files
            zip.file('text/sample.md', sample, options);

            // save the request.json if present & not text-only
            if (requestStringified) {
                zip.file('request.json', requestStringified, options);
            }

            //The first three seem to be universal and it's easier for testing purposes to hardcode them.
            let modelFiles = [
                {
                    name: '@models.accordproject.org.cicero.contract.cto',
                    content:
                        '/*\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nnamespace org.accordproject.cicero.contract\n\n/**\n * Contract Data\n * -- Describes the structure of contracts and clauses\n */\n\n/* A contract state is an asset -- The runtime state of the contract */\nasset AccordContractState identified by stateId {\n  o String stateId\n}\n\n/* A party to a contract */\nparticipant AccordParty identified by partyId {\n  o String partyId\n}\n\n/* A contract is a asset -- This contains the contract data */\nabstract asset AccordContract identified by contractId {\n  o String contractId\n  --> AccordParty[] parties optional\n}\n\n/* A clause is an asset -- This contains the clause data */\nabstract asset AccordClause identified by clauseId {\n  o String clauseId\n}\n'
                },
                {
                    name: '@models.accordproject.org.cicero.runtime.cto',
                    content:
                        '/*\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nnamespace org.accordproject.cicero.runtime\n\nimport org.accordproject.cicero.contract.AccordContract from https://models.accordproject.org/cicero/contract.cto\nimport org.accordproject.cicero.contract.AccordContractState from https://models.accordproject.org/cicero/contract.cto\nimport org.accordproject.money.MonetaryAmount from https://models.accordproject.org/money.cto\n\n/**\n * Contract API\n * -- Describes input and output of calls to a contract\'s clause\n */\n\n/* A request is a transaction */\ntransaction Request {}\n\n/* A response is a transaction */\ntransaction Response {}\n\n/* An Error is a transaction */\nabstract transaction ErrorResponse {}\n\n/* An event that represents an obligation that needs to be fulfilled */\nabstract event Obligation {\n  /* A back reference to the governing contract that emitted this obligation */\n  --> AccordContract contract\n\n  /* The party that is obligated */\n  --> Participant promisor optional // TODO make this mandatory once proper party support is in place\n\n  /* The party that receives the performance */\n  --> Participant promisee optional // TODO make this mandatory once proper party support is in place\n\n  /* The time before which the obligation is fulfilled */\n  o DateTime deadline optional\n}\n\nevent PaymentObligation extends Obligation{\n  o MonetaryAmount amount\n  o String description\n}\n\nevent NotificationObligation extends Obligation {\n  o String title\n  o String message\n}\n\n/* A payload has contract data, a request and a state */\nconcept Payload {\n  o AccordContract contract  // the contract data\n  o Request request\n  o AccordContractState state optional\n}\n\n/* If the call to a contract\'s clause succeeds, it returns a response, a list of events and a new state */\nconcept Success {\n  o Response response\n  o AccordContractState state\n  o Event[] emit\n}\n/* If the call to a contract\'s clause fails, it returns and error */ \nconcept Failure {\n  o ErrorResponse error\n}\n\n/**\n * The functional signature for a contract call is as follows:\n * clausecall : String contractName -> String clauseName -> Payload payload -> Success | Failure\n */\n'
                },
                {
                    name: '@models.accordproject.org.money.cto',
                    content:
                        '/*\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nnamespace org.accordproject.money\n\n/**\n * Represents an amount of Cryptocurrency\n */\nconcept CryptoMonetaryAmount {\n  o Double doubleValue\n  o CryptoCurrencyCode cryptoCurrencyCode\n}\n\n/**\n * Cyptocurrency codes. From https://en.wikipedia.org/wiki/List_of_cryptocurrencies\n */\nenum CryptoCurrencyCode {\n  o ADA\n  o BCH\n  o BTC\n  o DASH\n  o EOS\n  o ETC\n  o ETH\n  o LTC\n  o NEO\n  o XLM\n  o XMR\n  o XRP\n  o ZEC\n}\n\n/**\n * Represents an amount of money\n */\nconcept MonetaryAmount {\n  o Double doubleValue // convert to fixed-point?\n  o CurrencyCode currencyCode\n}\n\n/**\n * ISO 4217 codes. From https://en.wikipedia.org/wiki/ISO_4217\n * https://www.currency-iso.org/en/home/tables/table-a1.html\n */\nenum CurrencyCode {\no AED\no AFN\no ALL\no AMD\no ANG\no AOA\no ARS\no AUD\no AWG\no AZN\no BAM\no BBD\no BDT\no BGN\no BHD\no BIF\no BMD\no BND\no BOB\no BOV\no BRL\no BSD\no BTN\no BWP\no BYN\no BZD\no CAD\no CDF\no CHE\no CHF\no CHW\no CLF\no CLP\no CNY\no COP\no COU\no CRC\no CUC\no CUP\no CVE\no CZK\no DJF\no DKK\no DOP\no DZD\no EGP\no ERN\no ETB\no EUR\no FJD\no FKP\no GBP\no GEL\no GHS\no GIP\no GMD\no GNF\no GTQ\no GYD\no HKD\no HNL\no HRK\no HTG\no HUF\no IDR\no ILS\no INR\no IQD\no IRR\no ISK\no JMD\no JOD\no JPY\no KES\no KGS\no KHR\no KMF\no KPW\no KRW\no KWD\no KYD\no KZT\no LAK\no LBP\no LKR\no LRD\no LSL\no LYD\no MAD\no MDL\no MGA\no MKD\no MMK\no MNT\no MOP\no MRU\no MUR\no MVR\no MWK\no MXN\no MXV\no MYR\no MZN\no NAD\no NGN\no NIO\no NOK\no NPR\no NZD\no OMR\no PAB\no PEN\no PGK\no PHP\no PKR\no PLN\no PYG\no QAR\no RON\no RSD\no RUB\no RWF\no SAR\no SBD\no SCR\no SDG\no SEK\no SGD\no SHP\no SLL\no SOS\no SRD\no SSP\no STN\no SVC\no SYP\no SZL\no THB\no TJS\no TMT\no TND\no TOP\no TRY\no TTD\no TWD\no TZS\no UAH\no UGX\no USD\no USN\no UYI\no UYU\no UZS\no VEF\no VND\no VUV\no WST\no XAF\no XAG\no XAU\no XBA\no XBB\no XBC\no XBD\no XCD\no XDR\no XOF\no XPD\no XPF\no XPT\no XSU\no XTS\no XUA\no XXX\no YER\no ZAR\no ZMW\no ZWL\n}\n'
                },
                {
                    name: 'model.cto',
                    content: modelTxt
                }
            ];

            //Save the model files
            zip.file(
                'model/',
                null,
                Object.assign({}, options, {
                    dir: true
                })
            );
            modelFiles.forEach(function(file) {
                zip.file('model/' + file.name, file.content, options);
            });
            zip.file(
                'logic/',
                null,
                Object.assign({}, options, {
                    dir: true
                })
            );

            //For auto-generation purposes, we'll just generate a single ergo file
            zip.file('logic/logic.ergo', logic, options);

            return zip
                .generateAsync({
                    type: 'nodebuffer'
                })
                .then(something => {
                    return Promise.resolve(something).then(result => {
                        return result;
                    });
                });
        })();
    }
}

module.exports = TemplateSaver;
