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

const Logger = require('@accordproject/ergo-compiler').Logger;
const Commands = require('./lib/commands');

require('yargs')
    .command('parse', 'parse sample text using a template', (yargs) => {
        yargs.option('template', {
            describe: 'path to the directory with the template',
            type: 'string'
        });
        yargs.option('sample', {
            describe: 'path to the clause text',
            type: 'string'
        });
        yargs.option('out', {
            describe: 'path to the output file',
            type: 'string'
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`parse sample ${argv.sample} using a template ${argv.template}`);
        }

        try {
            argv = Commands.validateParseArgs(argv);
            return Commands.parse(argv.template, argv.sample, argv.out)
                .then((result) => {
                    Logger.info(JSON.stringify(result));
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .command('archive', 'archive a template directory', (yargs) => {
        yargs.option('target', {
            describe: 'the target language of the archive',
            type: 'string',
            default: 'ergo'
        });
        yargs.option('template', {
            describe: 'path to the directory with the template',
            type: 'string'
        });
        yargs.option('archiveFile', {
            describe: 'file name for the archive',
            type: 'string'
        });
        yargs.option('omitLogic', {
            describe: 'omit the logic in the archive',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`archive the template in the directory ${argv.template} into the file ${argv.archiveFile}`);
        }

        try {
            argv = Commands.validateArchiveArgs(argv);
            return Commands.archive(argv.target, argv.template, argv.archiveFile, argv.omitLogic)
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .command('execute', 'execute a clause with JSON request', (yargs) => {
        yargs.option('template', {
            describe: 'path to the directory with the template',
            type: 'string'
        });
        yargs.option('sample', {
            describe: 'path to the clause text',
            type: 'string'
        });
        yargs.option('request', {
            describe: 'path to the JSON request',
            type: 'string'
        }).array('request');
        yargs.option('state', {
            describe: 'path to the JSON state',
            type: 'string'
        });
        yargs.option('currentTime', {
            describe: 'execute with this current time',
            type: 'string',
            default: null
        });
    }, (argv) => {

        try {
            argv = Commands.validateExecuteArgs(argv);
            return Commands.execute(argv.template, argv.sample, argv.request, argv.state, argv.currentTime)
                .then((result) => {
                    Logger.info(JSON.stringify(result));
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
        }
    })
    .command('init', 'initialize a clause', (yargs) => {
        yargs.option('template', {
            describe: 'path to the directory with the template',
            type: 'string'
        });
        yargs.option('sample', {
            describe: 'path to the clause text',
            type: 'string'
        });
        yargs.option('currentTime', {
            describe: 'initialize with this current time',
            type: 'string',
            default: null
        });
    }, (argv) => {

        try {
            argv = Commands.validateInitArgs(argv);
            return Commands.init(argv.template, argv.sample, argv.currentTime)
                .then((result) => {
                    Logger.info(JSON.stringify(result));
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
        }
    })
    .command('generate', 'generate code from the template model', (yargs) => {
        yargs.option('template', {
            describe: 'path to the directory with the template',
            type: 'string',
            default: '.'
        });
        yargs.option('format', {
            describe: 'format of the code to generate',
            type: 'string',
            default: 'JSONSchema'
        });
        yargs.option('outputDirectory', {
            describe: 'output directory path',
            type: 'string',
            default: './output/'
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`generate code in format ${argv.format} from the model for template ${argv.template} into directory ${argv.outputDirectory}`);
        }

        try {
            argv = Commands.validateExecuteArgs(argv);
            return Commands.generate(argv.format, argv.template, argv.outputDirectory)
                .then((result) => {
                    Logger.info('Completed.');
                })
                .catch((err) => {
                    Logger.error(err.message + ' ' + JSON.stringify(err));
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .argv;