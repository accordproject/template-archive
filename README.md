# Cicero

[![Documentation Status](https://readthedocs.org/projects/cicero-docs/badge/?version=latest)](http://cicero-docs.readthedocs.io/en/latest/?badge=latest)
[![Build Status](https://travis-ci.org/accordproject/cicero.svg?branch=master)](https://travis-ci.org/accordproject/cicero)
[![Coverage Status](https://coveralls.io/repos/github/accordproject/cicero/badge.svg?branch=master)](https://coveralls.io/github/accordproject/cicero?branch=master)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## Introduction

Cicero is an Open Source implementation of the [Accord Protocol, Template Specification](https://docs.google.com/document/d/1UacA_r2KGcBA2D4voDgGE8jqid-Uh4Dt09AE-shBKR0). It defines the structure of natural language templates, bound to a data model, that can be executed using request/response JSON messages.

## Smart Clause™

Using Cicero you can take any existing natural language text (typically a clause or a contract) and declaratively bind it to a data model. Cicero generates a parser (using the Earley parser algorithm) to parse and validate source text, extracting machine readable/computable data. The Cicero engine can then be used to execute a Smart Clause™ (an instance of a template) against a JSON payload. Smart Clause™ software can be used to add computable functionality to any document. Clauses are typically stateless (idempotent) functions. They receive an incoming request and the template data, and they produce a response.

## Get Involved!

We are an open community and welcome both lawyers and technologists to work on the specifications and code. If you would like to get involved please join the Accord #technology-wg Slack channel by signing up here: https://www.accordproject.org.

[Accord Technology Working Group weekly meeting](
https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MjZvYzIzZHVrYnI1aDVzbjZnMHJqYmtwaGlfMjAxNzExMTVUMjEwMDAwWiBkYW5AY2xhdXNlLmlv&tmsrc=dan%40clause.io)

## Structure of the Code Repository

Top level repository (cicero), with sub packages. Each sub-package is published as an independent npm module using `lerna`:
* cicero-core :  `Template` and `Clause` classes to manage the grammar, models and logic.
* cicero-engine :  A Node.js VM based execution engine
* cicero-cli : Command line utility for testing
* generator-cicero-template: Utility to generate a new template

## Installation

You need npm and node to use Cicero. You can download both from [here](https://nodejs.org).

These instructions were tested using:
* git version 2.13.6
* npm version 5.3.0
* node version 8.6.0

```
npm install -g cicero-cli
```

## Using an existing Template

### Download the Template

You can either [download the latest release archive](https://github.com/accordproject/cicero-template-library/releases) or if you have `git` installed simply `git clone` the repository:

```
git clone https://github.com/accordproject/cicero-template-library
```

### Parse
Use the `cicero parse` command to load a template from a directory on disk and then use it to parse input text, echoing the result of parsing. If the input text is valid the parsing result will be a JSON serialized instance of the Template Mode:

Sample template.tem:

```
Name of the person to greet: [{name}].
Thank you!
```

Sample.txt:

```
Name of the person to greet: "Dan".
Thank you!
```

```
cd cicero-template-library
cicero parse --template ./helloworld/ --dsl ./helloworld/sample.txt
Setting clause data: {"$class":"io.clause.helloworld.TemplateModel","name":"Dan"}
```

Or, attempting to parse invalid data will result in line and column information for the syntax error.

Sample.txt:

```
FUBAR Name of the person to greet: "Dan".
Thank you!
```

```
{ Error: invalid syntax at line 1 col 1:

  FUBAR  Name of the person to greet: "Dan".
  ^
Unexpected "F"
```

### Execute
Use the `cicero execute` command to load a template from a directory on disk, instantiate a clause based on input text, and then invoke the clause using an incoming JSON payload.

```
data.json:
{
   "$class": "io.clause.helloworld.Request",
   "input": "World"
}
```

```
cd cicero-template-library
cicero execute --template ./helloworld/ --dsl ./helloworld/sample.txt --data ./helloworld/data.json 
```

The results of execution (a JSON serialized object) are displayed. They include:
* Details of the clause executed (name, version, SHA256 hash of clause data)
* The incoming request object
* The output response object

```
{
   "clause":"helloworld@0.0.3-c8d9e40fe7c5a479d1a80bce2d2fdc3c8a240ceb44a031d38cbd619e9b795b60",
   "request":{
      "$class":"io.clause.helloworld.Request",
      "input":"World"
   },
   "response":{
      "$class":"io.clause.helloworld.Response",
      "output":"Hello Dan World",
      "transactionId":"cf1dabb5-d604-4ffa-8a87-8333e77a735a",
      "timestamp":"2017-10-31T10:47:42.055Z"
   }
}
```

Note that in the response data from the template has been combined with data from the request.

## Creating a New Template

Now that you have executed an existing template, let's create a new template. 

> If you would like to contribute your template back into the `cicero-template-library` please start by [forking](https://help.github.com/articles/fork-a-repo/) the `cicero-template-library` project on GitHub. This will make it easy for you to submit a pull request to get your new template added to the library.

Install the template generator:

```bash
npm install -g yo
npm install -g generator-cicero-template
```

Run the template generator:

> If you have forked the `cicero-template-library` cd into that directory first.

```bash
yo cicero-template
```

Give your generator a name (no spaces) and then supply a namespace for your template model (again, no spaces). The generator will then create the files and directories required for a basic template (based on the helloworld template).

### Edit the Template Grammar

Start by editing the template grammar in the `grammar/template.tem` file. You will want to replace the text with something suitable for your template, introducing variables as required. The variables are marked-up using `[{name}]`.

### Edit the Template Model

All of the variables referenced in your template grammar must exist in your template model. Edit the file 'models/model.cto' to include all your variables. The [Composer Modelling Language](https://hyperledger.github.io/composer/reference/cto_language.html) primitive data types are:
   * String
   * Long
   * Integer
   * DateTime
   * Double
   * Boolean

### Edit the Request and Response Transaction Types

Your template expects to receive data as input and will produce data as output. The structure of this request/response data is captured in `Request` and `Response` transaction types in your model namespace. Open up the file `models/model.cto` and edit the definition of the `Request` type to include all the data you expect to receive from the outside world and that will be used by the business logic of your template. Similarly edit the definition of the `Response` type to include all the data that the business logic for your template will compute and would like to return to the caller.

### Edit the Logic of the Template

Now edit the business logic of the template itself. At present this is expressed as ES 2015 JavaScript functions (other languages may be supported in the future). Open the file `lib/logic.js` and edit the `execute` method to perform the calculations your logic requires. Use the `context.request` and `context.data` properties to access the incoming request and the template data respectively, setting properties on `context.response` to be returned to the caller.

## Developing an Application

TBD.

© 2017 Clause, Inc.
