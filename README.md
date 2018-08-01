# Cicero

[![Build Status](https://travis-ci.org/accordproject/cicero.svg?branch=master)](https://travis-ci.org/accordproject/cicero)
[![Coverage Status](https://coveralls.io/repos/github/accordproject/cicero/badge.svg?branch=master)](https://coveralls.io/github/accordproject/cicero?branch=master)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## Introduction

Cicero allows you to define natural language contract and clause templates that can be executed by a computer. These could be relatively simple things like `if the goods are more than [{DAYS}] late, then notify the supplier of the goods, with the message [{MESSAGE}].` or more elaborate natural language and logic such as computing interest on a loan, or calculating penalties based on IoT sensor readings.

You can browse the library of Open Source Cicero contract and clause templates at: https://templates.accordproject.org.

Cicero is an Open Source implementation of the [Accord Project Template Specification](https://docs.google.com/document/d/1UacA_r2KGcBA2D4voDgGE8jqid-Uh4Dt09AE-shBKR0). It defines the structure of natural language templates, bound to a data model, that can be executed using request/response JSON messages.

You can read the latest user documentation here: http://docs.accordproject.org.

## Smart Clause™

Using Cicero you can take any existing natural language text (typically a clause or a contract) and declaratively bind it to a data model. Cicero generates a parser (using the Earley parser algorithm) to parse and validate source text, extracting machine readable/computable data. The Cicero engine can then be used to execute a Smart Clause™ (an instance of a template) against a JSON payload. Smart Clause™ software can be used to add computable functionality to any document. Clauses are typically stateless (idempotent) functions. They receive an incoming request and the template data, and they produce a response.

## Get Involved!

We are an open community and welcome both lawyers and technologists to work on the specifications and code. If you would like to get involved please join the Accord #technology-wg Slack channel by signing up here: https://www.accordproject.org.

[Accord Project Technology Working Group weekly meeting](
https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MjZvYzIzZHVrYnI1aDVzbjZnMHJqYmtwaGlfMjAxNzExMTVUMjEwMDAwWiBkYW5AY2xhdXNlLmlv&tmsrc=dan%40clause.io)

## Structure of the Code Repository

Top level repository (cicero), with sub packages. Each sub-package is published as an independent npm module using `lerna`:
* cicero-core :  `Template` and `Clause` classes to manage the grammar, models and logic.
* cicero-engine :  A Node.js VM based execution engine
* cicero-cli : Command line utility for testing
* generator-cicero-template: Utility to generate a new template

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2018 Clause, Inc.
