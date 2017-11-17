# Cicero

[![Build Status](https://travis-ci.org/accordproject/cicero.svg?branch=master)](https://travis-ci.org/accordproject/cicero)

## Introduction

Cicero is an Open Source implementation of the Accord Protocol, Template Specification. It defines the structure of natural language templates, bound to a data model, that can be executed using request/response JSON messages.

Using Cicero you can take any existing natural language text (typically a clause or a contract) and declaratively bind it to a data model. Cicero generates a parser (using the Earley parser algorithm) to parse and validate source text, extracting machine readable/computable data. The Cicero engine can then be used to execute a clause (an instance of a template) against a JSON payload.

## Get Involved!

We are an open community and welcome both lawyers and technologists to work on both specifications and code. If you would like to get involved please join the #technology-wg Slack channel by signing up here: https://www.accordproject.org.

[Accord Technology Working Group weekly meeting](
https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MjZvYzIzZHVrYnI1aDVzbjZnMHJqYmtwaGlfMjAxNzExMTVUMjEwMDAwWiBkYW5AY2xhdXNlLmlv&tmsrc=dan%40clause.io)

## Structure of the Code Repository

Top level repository (cicero), with sub packages. Each sub-package is published as an independent npm module using `lerna`:
* cicero-core :  `Template` and `Clause` classes to manage the grammar, models and logic.
* cicero-engine :  A Node.js VM based execution engine
* cicero-cli : Command line utility for testing

## Installation

You need npm and node to use Cicero. You can download both from [here](https://nodejs.org).

These instructions were tested using:
* npm version 5.3.0
* node version 8.6.0

```
npm install cicero-cli --save
```

## Using an existing Template

### Parse
Use the `cicero parse` command to load a template from a directory on disk and then use it to parse input text, echoing the result of parsing. If the input text is valid the parsing result will be a JSON serialized instance of the Template Mode:

template.tem:

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
cicero parse --template ~/dev/template-library/helloworld/ --dsl ~/dev/template-library/helloworld/sample.txt
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
cicero execute --template ~/dev/template-library/helloworld/ --dsl ~/dev/cicero-template-library/helloworld/sample.txt --data ~/dev/cicero-template-library/helloworld/data.json 
```

The results of execution (a JSON serialized object) are displayed. They include:
Details of the clause executed (name, version, SHA256 hash of clause data)
The incoming request object
The output response object

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

## Developing an Application

TBD.


© 2017 Clause, Inc.
