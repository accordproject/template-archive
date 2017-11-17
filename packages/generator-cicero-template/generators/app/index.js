'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
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
        default: 'mytemplate'
      },
      {
        type: 'input',
        name: 'modelNamespace',
        message: 'What is the namespace for your model?',
        default: 'org.example.mytemplate'
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    console.log(JSON.stringify(this.props));
    this.fs.copyTpl(
      this.templatePath('.'),
      this.destinationPath(this.props.templateName),
      { data: this.props }
    );
  }

  install() {}
};
