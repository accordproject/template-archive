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
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const packageJson = require('../../package.json');
const helper = require('./promptingHelpers');

module.exports = class extends Generator {

    /**
    * Promts for the user
    * @return {Promise} a promise to the user prompts
    */
    prompting() {
    // Have Yeoman greet the user.
        this.log(
            yosay('Welcome to the ' + chalk.red('generator-cicero-template') + ' generator!')
        );

        const prompts = [
            {
                type: 'input',
                name: 'templateName',
                message: 'What is the name of your template?',
                default: 'mytemplate',
                validate: helper.validateTemplateName
            },
            {
                type: 'input',
                name: 'author',
                message: 'Who is the author?',
                default: null
            },
            {
                type: 'input',
                name: 'modelNamespace',
                message: 'What is the namespace for your model?',
                default: 'org.example.mytemplate'
            }
        ];

        return this.prompt(prompts).then(props => {
            props.engineVersion= packageJson.version;
            // To access props later use this.props.someAnswer;
            this.props = props;
        });
    }

    /**
    * Write data to disk
    */
    writing() {
        this.fs.copyTpl(
            this.templatePath('.'),
            this.destinationPath(this.props.templateName),
            { data: this.props }
        );
        this.fs.copy(
            this.templatePath('./.*'),
            this.destinationPath(this.props.templateName),
            { data: this.props }
        );
    }

    /**
    * Install phase
    */
    install() {}
};
