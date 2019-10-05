<p align="center">
  <a href="./cicero.png">
    <img src="./cicero.png" alt="Cicero logo">
  </a>
</p>


<p align="center">
  <a href="https://travis-ci.org/accordproject/cicero"><img src="https://travis-ci.org/accordproject/cicero.svg?branch=master" alt="Build Status"></a>
  <a href="https://coveralls.io/github/accordproject/cicero?branch=master"><img src="https://coveralls.io/repos/github/accordproject/cicero/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/accordproject/cicero?color=bright-green" alt="GitHub license"></a>
  <a href="https://www.npmjs.com/package/@accordproject/cicero-cli"><img src="https://img.shields.io/npm/dm/@accordproject/cicero-cli" alt="downloads"></a>
  <a href="https://badge.fury.io/js/%40accordproject%2Fcicero-cli"><img src="https://badge.fury.io/js/%40accordproject%2Fcicero-cli.svg" alt="npm version"></a>
  <a href="https://accord-project-slack-signup.herokuapp.com/"><img src="https://img.shields.io/badge/Slack-Join%20Slack-blue" alt="join slack"></a>
  <a href="https://lernajs.io/"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="lerna"></a>
</p>

## Introduction

Cicero allows you to define natural language contract and clause templates that can be executed by a computer. These could be relatively simple things like `if the goods are more than [{DAYS}] late, then notify the supplier of the goods, with the message [{MESSAGE}].` or more elaborate natural language and logic such as computing interest on a loan, or calculating penalties based on IoT sensor readings.

You can browse the library of Open Source Cicero contract and clause templates at: https://templates.accordproject.org.

Cicero is an Open Source implementation of the [Accord Project Template Specification][apspec]. It defines the structure of natural language templates, bound to a data model, that can be executed using request/response JSON messages.

You can read the latest user documentation here: http://docs.accordproject.org.

## Smart Clause

Using Cicero you can take any existing natural language text (typically a clause or a contract) and declaratively bind it to a data model. Cicero generates a parser (using the Earley parser algorithm) to parse and validate source text, extracting machine readable/computable data. The Cicero engine can then be used to execute a Smart Clause (an instance of a template) against a JSON payload. Smart Clause software can be used to add computable functionality to any document. Clauses are typically stateless (idempotent) functions. They receive an incoming request and the template data, and they produce a response.

## Get Involved!

We are an open community and welcome both lawyers and technologists to work on the specifications and code. If you would like to get involved please join the Accord #technology-wg Slack channel by signing up here: https://www.accordproject.org.

[Accord Technology Working Group weekly meeting][apworkgroup]

## Structure of the Code Repository

Top level repository (cicero), with sub packages. Each sub-package is published as an independent npm module using `lerna`:
* [cicero-cli](https://github.com/accordproject/cicero/tree/master/packages/cicero-cli) : Command line interface (for parsing, execution, creating archives) for Accord Project legal templates
* [cicero-core](https://github.com/accordproject/cicero/tree/master/packages/cicero-core) : Core classes to manage the grammar, models and logic of Accord Project legal templates
* [cicero-engine](https://github.com/accordproject/cicero/tree/master/packages/cicero-engine) : A Node.js VM based execution engine for Accord Project legal templates
* [cicero-server](https://github.com/accordproject/cicero/tree/master/packages/cicero-server): Exposes the Cicero Engine as a RESTful service
* [cicero-test](https://github.com/accordproject/cicero/tree/master/packages/cicero-test) : Cucumber based testing for Accord Project legal templates
* [cicero-tools](https://github.com/accordproject/cicero/tree/master/packages/cicero-tools) : Tools for generating code (UML, Java, etc.) from Accord Project legal templates
* [generator-cicero-template](https://github.com/accordproject/cicero/tree/master/packages/generator-cicero-template): Utility to create a self-contained directory for a new Accord Project legal template

---

<p align="center">
  <a href="https://www.accordproject.org/">
    <img src="assets/APLogo.png" alt="Accord Project Logo" width="400" />
  </a>
</p>

Accord Project is an open source, non-profit, initiative working to transform contract management and contract automation by digitizing contracts. Accord Project operates under the umbrella of the [Linux Foundation][linuxfound]. The technical charter for the Accord Project can be found [here][charter].

## Learn More About Accord Project

### Overview
* [Accord Project][apmain]
* [Accord Project News][apnews]
* [Accord Project Blog][apblog]
* [Accord Project Slack][apslack]
* [Accord Project Technical Documentation][apdoc]
* [Accord Project GitHub][apgit]


### Documentation
* [Getting Started with Accord Project][docwelcome]
* [Concepts and High-level Architecture][dochighlevel]
* [How to use the Cicero Templating System][doccicero]
* [How to Author Accord Project Templates][docstudio]
* [Ergo Language Guide][docergo]

## Contributing

The Accord Project technology is being developed as open source. All the software packages are being actively maintained on GitHub and we encourage organizations and individuals to contribute requirements, documentation, issues, new templates, and code.

Find out what’s coming on our [blog][apblog].

Join the Accord Project Technology Working Group [Slack channel][apslack] to get involved!

For code contributions, read our [CONTRIBUTING guide][contributing] and information for [DEVELOPERS][developers].

## License <a name="license"></a>

Accord Project source code files are made available under the [Apache License, Version 2.0][apache].
Accord Project documentation files are made available under the [Creative Commons Attribution 4.0 International License][creativecommons] (CC-BY-4.0).

Copyright 2018-2019 Clause, Inc. All trademarks are the property of their respective owners. See [LF Projects Trademark Policy](https://lfprojects.org/policies/trademark-policy/).

[linuxfound]: https://www.linuxfoundation.org
[charter]: https://github.com/accordproject/cicero/blob/master/CHARTER.md
[apmain]: https://accordproject.org/ 
[apworkgroup]: https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MjZvYzIzZHVrYnI1aDVzbjZnMHJqYmtwaGlfMjAxNzExMTVUMjEwMDAwWiBkYW5AY2xhdXNlLmlv&tmsrc=dan%40clause.io
[apblog]: https://medium.com/@accordhq
[apnews]: https://www.accordproject.org/news/
[apgit]:  https://github.com/accordproject/
[apdoc]: https://docs.accordproject.org/
[apslack]: https://accord-project-slack-signup.herokuapp.com

[docspec]: https://docs.accordproject.org/docs/spec-overview.html
[docwelcome]: https://docs.accordproject.org/docs/accordproject.html
[dochighlevel]: https://docs.accordproject.org/docs/spec-concepts.html
[docergo]: https://docs.accordproject.org/docs/logic-ergo.html
[docstart]: https://docs.accordproject.org/docs/accordproject.html
[doccicero]: https://docs.accordproject.org/docs/basic-use.html
[docstudio]: https://docs.accordproject.org/docs/advanced-latedelivery.html

[contributing]: https://github.com/accordproject/cicero/blob/master/CONTRIBUTING.md
[developers]: https://github.com/accordproject/cicero/blob/master/DEVELOPERS.md

[apache]: https://github.com/accordproject/template-studio-v2/blob/master/LICENSE
[creativecommons]: http://creativecommons.org/licenses/by/4.0/
