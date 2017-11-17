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

const Commands = require('./lib/commands');

require('yargs')
    .command('parse', 'parse dsl text using a template', (yargs) => {
        yargs.option('template', {
            describe: 'path to the directory with the template'
        });
        yargs.option('dsl', {
            describe: 'path to the clause text'
        });
    }, (argv) => {
        if (argv.verbose) {
            console.info(`parse dsl ${argv.dsl} using a template ${argv.template}`);
        }

        return Commands.parse(argv.template, argv.dsl)
            .then((result) => {
                console.log(JSON.stringify(result));
            })
            .catch((err) => {
                console.log(err.message + ' ' + JSON.stringify(err));
            });
    })
    .command('execute', 'execute a clause with JSON data', (yargs) => {
        yargs.option('template', {
            describe: 'path to the directory with the template'
        });
        yargs.option('dsl', {
            describe: 'path to the clause text'
        });
        yargs.option('data', {
            describe: 'path to the request JSON data'
        });
    }, (argv) => {
        if (argv.verbose) {
            console.info(`execute dsl ${argv.dsl} using a template ${argv.template} with data ${argv.data}`);
        }

        return Commands.execute(argv.template, argv.dsl, argv.data)
            .then((result) => {
                console.log(JSON.stringify(result));
            })
            .catch((err) => {
                console.log(err.message + ' ' + JSON.stringify(err));
            });
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .argv;