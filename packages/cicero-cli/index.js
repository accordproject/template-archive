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

const Logger = require('@accordproject/concerto-core').Logger;
const Commands = require('./lib/commands');

require('yargs')
    .scriptName('cicero')
    .usage('$0 <cmd> [args]')
    .demandCommand(1, '# Please specify a command')
    .recommendCommands()
    .strict()
    .command('parse', 'parse a contract text', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('sample', {
            describe: 'path to the contract text',
            type: 'string'
        });
        yargs.option('output', {
            describe: 'path to the output file',
            type: 'string'
        });
        yargs.option('currentTime', {
            describe: 'set current time',
            type: 'string',
            default: null
        });
        yargs.option('utcOffset', {
            describe: 'set UTC offset',
            type: 'number',
            default: null
        });
        yargs.option('offline', {
            describe: 'do not resolve external models',
            type: 'boolean',
            default: false
        });
        yargs.option('warnings', {
            describe: 'print warnings',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`parse sample ${argv.sample} for template ${argv.template}`);
        }

        try {
            argv = Commands.validateParseArgs(argv);
            const options = {
                offline: argv.offline,
                warnings: argv.warnings,
            };
            return Commands.parse(argv.template, argv.sample, argv.output, argv.currentTime, argv.utcOffset, options)
                .then((result) => {
                    if(result) {Logger.info(JSON.stringify(result));}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .command('draft', 'create contract text from data', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('data', {
            describe: 'path to the contract data',
            type: 'string'
        });
        yargs.option('output', {
            describe: 'path to the output file',
            type: 'string'
        });
        yargs.option('currentTime', {
            describe: 'set current time',
            type: 'string',
            default: null
        });
        yargs.option('utcOffset', {
            describe: 'set UTC offset',
            type: 'number',
            default: null
        });
        yargs.option('offline', {
            describe: 'do not resolve external models',
            type: 'boolean',
            default: false
        });
        yargs.option('format', {
            describe: 'target format',
            type: 'string'
        });
        yargs.option('unquoteVariables', {
            describe: 'remove variables quoting',
            type: 'boolean',
            default: false
        });
        yargs.option('warnings', {
            describe: 'print warnings',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`create contract from data ${argv.data} for template ${argv.template}`);
        }

        try {
            argv = Commands.validateDraftArgs(argv);
            const options = {
                offline: argv.offline,
                unquoteVariables: argv.unquoteVariables,
                warnings: argv.warnings,
                format: argv.format,
            };
            return Commands.draft(argv.template, argv.data, argv.output, argv.currentTime, argv.utcOffset, options)
                .then((result) => {
                    if(result) {Logger.info(result);}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .command('normalize', 'normalize markdown (parse & redraft)', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('sample', {
            describe: 'path to the contract text',
            type: 'string'
        });
        yargs.option('overwrite', {
            describe: 'overwrite the contract text',
            type: 'boolean',
            default: false
        });
        yargs.option('output', {
            describe: 'path to the output file',
            type: 'string'
        });
        yargs.option('currentTime', {
            describe: 'set current time',
            type: 'string',
            default: null
        });
        yargs.option('utcOffset', {
            describe: 'set UTC offset',
            type: 'number',
            default: null
        });
        yargs.option('offline', {
            describe: 'do not resolve external models',
            type: 'boolean',
            default: false
        });
        yargs.option('warnings', {
            describe: 'print warnings',
            type: 'boolean',
            default: false
        });
        yargs.option('format', {
            describe: 'target format',
            type: 'string'
        });
        yargs.option('unquoteVariables', {
            describe: 'remove variables quoting',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`parse sample and re-create sample ${argv.sample} for template ${argv.template}`);
        }

        try {
            argv = Commands.validateNormalizeArgs(argv);
            const options = {
                offline: argv.offline,
                unquoteVariables: argv.unquoteVariables,
                warnings: argv.warnings,
                format: argv.format,
            };
            return Commands.normalize(argv.template, argv.sample, argv.overwrite, argv.output, argv.currentTime, argv.utcOffset, options)
                .then((result) => {
                    if(result) {Logger.info(result);}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .command('trigger', 'send a request to the contract', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('sample', {
            describe: 'path to the contract text',
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
            describe: 'set current time',
            type: 'string',
            default: null
        });
        yargs.option('utcOffset', {
            describe: 'set UTC offset',
            type: 'number',
            default: null
        });
        yargs.option('offline', {
            describe: 'do not resolve external models',
            type: 'boolean',
            default: false
        });
        yargs.option('warnings', {
            describe: 'print warnings',
            type: 'boolean',
            default: false
        });
    }, (argv) => {

        try {
            argv = Commands.validateTriggerArgs(argv);
            const options = {
                offline: argv.offline,
                warnings: argv.warnings,
            };
            return Commands.trigger(argv.template, argv.sample, argv.request, argv.state, argv.currentTime, argv.utcOffset, options)
                .then((result) => {
                    if(result) {Logger.info(JSON.stringify(result));}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
        }
    })
    .command('invoke', 'invoke a clause of the contract', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('sample', {
            describe: 'path to the contract text',
            type: 'string'
        });
        yargs.option('clauseName', {
            describe: 'the name of the clause to invoke',
            type: 'string'
        });
        yargs.option('params', {
            describe: 'path to the parameters',
            type: 'string'
        });
        yargs.option('state', {
            describe: 'path to the JSON state',
            type: 'string'
        });
        yargs.option('currentTime', {
            describe: 'set current time',
            type: 'string',
            default: null
        });
        yargs.option('utcOffset', {
            describe: 'set UTC offset',
            type: 'number',
            default: null
        });
        yargs.option('offline', {
            describe: 'do not resolve external models',
            type: 'boolean',
            default: false
        });
        yargs.option('warnings', {
            describe: 'print warnings',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        try {
            argv = Commands.validateInvokeArgs(argv);
            const options = {
                offline: argv.offline,
                warnings: argv.warnings,
            };
            return Commands.invoke(argv.template, argv.sample, argv.clauseName, argv.params, argv.state, argv.currentTime, argv.utcOffset, options)
                .then((result) => {
                    if(result) {Logger.info(JSON.stringify(result));}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
        }
    })
    .command('initialize', 'initialize a clause', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('sample', {
            describe: 'path to the contract text',
            type: 'string'
        });
        yargs.option('params', {
            describe: 'path to the parameters',
            type: 'string'
        });
        yargs.option('currentTime', {
            describe: 'initialize with this current time',
            type: 'string',
            default: null
        });
        yargs.option('utcOffset', {
            describe: 'set UTC offset',
            type: 'number',
            default: null
        });
        yargs.option('offline', {
            describe: 'do not resolve external models',
            type: 'boolean',
            default: false
        });
        yargs.option('warnings', {
            describe: 'print warnings',
            type: 'boolean',
            default: false
        });
    }, (argv) => {

        try {
            argv = Commands.validateInitializeArgs(argv);
            const options = {
                offline: argv.offline,
                warnings: argv.warnings,
            };
            return Commands.initialize(argv.template, argv.sample, argv.params, argv.currentTime, argv.utcOffset, options)
                .then((result) => {
                    if(result) {Logger.info(JSON.stringify(result));}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
        }
    })
    .command('archive', 'create a template archive', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('target', {
            describe: 'the target language of the archive',
            type: 'string',
            default: 'ergo'
        });
        yargs.option('output', {
            describe: 'file name for new archive',
            type: 'string',
            default: null
        });
        yargs.option('warnings', {
            describe: 'print warnings',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`create an archive for ${argv.template}`);
        }

        try {
            argv = Commands.validateArchiveArgs(argv);
            const options = {
                warnings: argv.warnings,
            };
            return Commands.archive(argv.template, argv.target, argv.output, options)
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .command('compile', 'generate code for a target platform', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('target', {
            describe: 'target of the code generation',
            type: 'string',
            default: 'JSONSchema'
        });
        yargs.option('output', {
            describe: 'path to the output directory',
            type: 'string',
            default: './output/'
        });
        yargs.option('warnings', {
            describe: 'print warnings',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`compile template ${argv.template} for target ${argv.target}`);
        }

        try {
            argv = Commands.validateCompileArgs(argv);
            const options = {
                warnings: argv.warnings,
            };
            return Commands.compile(argv.template, argv.target, argv.output, options)
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
    .command('get', 'save local copies of external dependencies', (yargs) => {
        yargs.option('template', {
            describe: 'path to the template',
            type: 'string'
        });
        yargs.option('output', {
            describe: 'output directory path',
            type: 'string'
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`saving external models into directory: ${argv.output}`);
        }

        try {
            argv = Commands.validateGetArgs(argv);
            return Commands.get(argv.template, argv.output)
                .then((result) => {
                    Logger.info(result);
                })
                .catch((err) => {
                    Logger.error(err.message);
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
    .help()
    .argv;