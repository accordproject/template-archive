# Accord Protocol
Version: 1.0
Date: 2017-10-27

## Goals
Accord Protocol binds legally enforceable natural language templates to executable business logic. It provides the foundational technology for legal professionals to formalise a set of legally enforceable executable clauses (smart clauses).

The Accord Protocol defines the structure of executable templates. The templates can be quickly created from existing legal contracts by legal professionals, and then made executable by programmers using general purpose programming languages, or legal technologists or programmers using domain specific languages.

## Example
Let's start by looking at the _Late Delivery And Penalty_ clause. It is a common clause in a legal contract related to the delivery of good or services, and in some circumstances may be amenable to automation.

The Late Delivery And Penalty clause in the typical legal contract looks like this:

> Late Delivery and Penalty. In case of delayed delivery **except for Force Majeure cases**, the Seller shall pay to the Buyer for every **2 weeks** of delay penalty amounting to **10.5%** of total value of the Equipment whose delivery has been delayed. Any fractional part of **a week** is to be considered **a full week**. The total amount of penalty shall not, however, exceed **55%** of the total value of the Equipment involved in late delivery. If the delay is more than **10 weeks**, the Buyer is entitled to terminate this Contract.  

The parameters to the clause have been highlighted in bold. We are now going to convert this clause into a reusable fragment (a template), that can be executed by a suitable runtime.

> Terminology: a Clause is an instance of a Template.  

### Template Model

The first step in converting this clause to use Accord Protocol is to identify the data elements that are captured by the clause (aka variables). These are:
* Whether the clause includes a force majeure provision
* Temporal duration for the penalty provision
* Percentage fro the penalty provision
* Maximum penalty percentage (cap)
* Temporal duration after which the buyer may terminate the contract

These data elements comprise the _Template Model_ for the clause. They are captured formally using the Hyperleger Composer modelling language (CML). CML is a lightweight schema language that defines namespaces, types and relationships between types.

In CML  format the Template Model looks like this:

```
/**
 * Defines the data model for the LateDeliveryAndPenalty template.
 * This defines the structure of the abstract syntax tree that the parser for the template
 * must generate from input source text.
 */
@AccordTemplate("latedeliveryandpenalty")
concept TemplateModel {
  /**
   * Does the clause include a force majeure provision?
   */
  o Boolean forceMajeure

  /**
   * For every penaltyDuration that the goods are late
   */
  o Duration penaltyDuration

  /**
   * Seller pays the buyer penaltyPercentage % of the value of the goods
   */
  o Double penaltyPercentage

  /**
   * Up to capPercentage % of the value of the goods
   */
  o Double capPercentage

  /**
   * If the goods are >= termination late then the buyer may terminate the contract
   */
  o Duration termination
}
```

The template model for the clause captures unambiguously the data types defined by the clause. The `Duration` data type is imported from an Accord namespace, which defines a library of useful reusable basic types for contracts.

Note that the `@AccordTemplate` decorators (aka annotation) is used to bind the CML concept to the clause.

> Terminology: a Template has a Template Model  

## Template Grammar
The next step in making the clause executable is to relate the template model to the natural language text that describes the legally enforceable clause. This is accomplished by taking the natural language for the clause and inserting bindings to the template model, using the Accord Protocol markup language. We call this the “grammar” for the template (or template grammar) as it determines what a syntactically valid clause can look like.

Here is the marked-up template:

```
Late Delivery and Penalty. In case of delayed delivery [{"except for Force Majeure cases,":? -> forceMajeure}] the Seller shall pay to the Buyer for every [{-> penaltyDuration}] of delay penalty amounting to [{-> penaltyPercentage}] of the total value of the Equipment whose delivery has been delayed. Any fractional part of a [{org.accord.base.TemporalUnit t}] is to be considered a full [{t}]. The total amount of penalty shall not however, exceed [{-> capPercentage}] of the total value of the Equipment involved in late delivery. If the delay is more than [{-> termination}], the Buyer is entitled to terminate this Contract.
```

The marked-up template contains variables. Each variable starts with `[{` and ends with `}]`. Let’s take a look at each variable in turn.
* **[{"except for Force Majeure cases,":? -> forceMajeure}]** : this variable definition is called a Boolean Assignment. It states that if the optional text “except for Force Majeure cases,” is present in the clause, then then Boolean forceMajeure property on the template model should be set to true. Otherwise the property will be set to false.
* **[{-> penaltyDuration}]**  : this variable definition is a binding. It states that the variable is bound to the `penaltyDuration` property in the template model. Implicitly it also states that the variable is of type `Duration` because that is the type of `penaltyDuration` in the model.
* **[{-> penaltyPercentage}]** : another variable binding, this time to the `penaltyPercentage` property in the model.
* **[{org.accord.base.TemporalUnit t}]** : this is an assignment. Assignments allow variables to be bound that are not declared in the model. Here the variable is named `t` and is defined as a `TemporalUnit`.
* **[{t}]** : the is a reference. References refer to previous assignments. In this case a constraint is introduced that the assignment and the reference have the same value.
* **[{-> capPercentage}]** : this is a binding, setting the `capPercentage `property on the template model.
* **[{-> termination}]** : this is a binding, setting the `termination` property on the template model.

To recap, there are currently 4 types of variable:
1. Boolean Binding: sets a boolean property in the model based on the presence of text in the clause
2. Binding: set a property in the model based on a value supplied in the clause
3. Assignment : set a clause scoped variable that is not stored in the model. These variables are only used during parsing of the template to enforce constraints.
4. Reference: refers to a previous assignment, and is used to enforce a constraint that one variable be equal to another

> Terminology: a Template Grammar is a marked-up template that declares variables. Variables are bound to the Template Model. The Template Grammar and the Template Model are used to generate a parser for the template, allowing syntactically valid instances (clauses) to be created.  

## Interfacing the Template with the Outside World
Given the template grammar and the template model above we can now edit (parameterise) the template to create a clause (an instance of the template).

What we want to do next however is to ground the template to events that are happening in the real-world: packages are getting shipped, delivered, signed-for etc. We want those transactions to be routed to the template, so that it is aware of them and can take appropriate action. In this case the action is simply to calculate the penalty amount and signal whether the buyer may terminate the contract.

## Template Request and Response
The Accord Protocol programming model specifies that each template may be invoked as a stateless request/response function. The template’s interface to the outside world is therefore through a request type and a response type.

### Request
First we define the structure of the data that the template requires from the outside world. Again, this is specified using CML:

```
/**
 * Defines the input data required by the template
 */
transaction LateDeliveryAndPenaltyRequest {

  /**
   * Are we in a force majeure situation? 
   */
  o Boolean forceMajeure

  /**
   * What was the agreed delivery date for the goods?
   */
  o DateTime agreedDelivery

  /**
   * If the goods have been delivered, when where they delivered?
   */
  o DateTime deliveredAt optional

  /**
   * What is the value of the goods?
   */
  o Double goodsValue
}
```

Given an instance of `LateDeliveryAndPenaltyRequest` the clause can calculate the current penalty amount and whether the buyer may terminate.

### Response
We then capture the structure of the template’s response, again using CML:

```
/**
 * Defines the output data for the template
 */
transaction LateDeliveryAndPenaltyResponse {
  /**
   * The penalty to be paid by the seller
   */
  o Double penalty

  /**
   * Whether the buyer may terminate the contract 
   */
  o Boolean buyerMayTerminate
}
```

Here we are simply stating that execution this template will produce an instance of  `LateDeliveryAndPenaltyResponse`.

### Summary
Using the ability to convert CML models to UML we can even visualise the three types (model, request, response) we have modelled graphically:

![](&&&SFLOCALFILEPATH&&&Screen%20Shot%202017-10-27%20at%2011.05.26.png)

In computer science terms we can consider the clause as a function with the signature:

```
LateDeliveryAndPenaltyResponse myClause(LateDeliveryAndPenaltyRequest)
```

The implementation of `myClause` is parameterised by an instance of `TemplateModel`

> Terminology: the Template Request transaction defines the data that the template needs to receive from the outside world. The Template Response transaction defines the data that the template will return when it receives a Template Request.  

## Template Logic
The last part of the puzzle for the template is to capture the logic of the template in a form that a computer can execute. No, computers cannot (yet) execute the natural language text, with all its interesting legal ambiguities!

Accord Protocol is extensible and supports pluggable mechanisms to capture the template logic. The `accord-engine` package acts as a shim, bootstrapping a kernel for a given template logic language. Accord Protocol ships with the ability to execute template logic expressed using the JavaScript programming language, however it is expected that the Accord community will develop higher-level declarative template logic languages and their associated kernels.

> Note: the details of the extensibility mechanism are TBD and the subject of discussion with the Accord technology working group.  

### Example
The example below illustrates using a JavaScript function to implement the template logic. The standard `@param` and `@return` annotations are used to bind the function to the incoming request and response types, while the `@clause` annotation indicates to the engine this function is a request processor.

```
**
 * Execute the smart clause
 * @param {object} data - the template model data for the clause
 * @param {io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest} request - the incoming request
 * @param {io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse} response - result of execution
 * @return {io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse} result of execution
 * @clause
 */
function execute(data, request, response) {

    log('data: ' + JSON.stringify(data));
    var now = moment(request.timestamp);
    var agreed = moment(request.agreedDelivery);

    response.buyerMayTerminate = false;
    response.penalty = 0;

    if (request.forceMajeure) {
        log('forceMajeure');
        response.buyerMayTerminate = true;
    }

    if (!request.forceMajeure && now.isAfter(agreed)) {
        log('late');
        log('period: ' + data.penaltyPeriod[0]);
        // the delivery is late
        var diff = now.diff(agreed, data.penaltyPeriod[0]);
        log('diff:' + diff);

        var penalty = (diff / data.penaltyUnit) * data.penaltyPercentage * request.goodsValue;

        // cap the maximum penalty
        if (penalty > data.cap.capPercentage * request.goodsValue) {
            log('capped.');
            penalty = data.cap.capPercentage * request.goodsValue;
        }

        response.penalty = penalty;

        // can we terminate?
        if (diff > data.termination.delay) {
            log('buyerMayTerminate.');
            response.buyerMayTerminate = true;
        }
    }

    return response;
}
```

## Packaging
The artefacts that define a template are:
* Metadata, such as name and version
* CML models, which define the template model, request, response and any required types
* Template grammar for each supported locale
* A sample instance, used to bootstrap editing, for each supported locale
* Executable business logic

Templates are typically packaged and distributed as zip archives, however they may also be ready from: a directory, a GitHub repository, the npm package manager. Each of these distribution mechanisms support slightly different use cases:
* Directory: useful during testing, allows changes to the template to be quickly tested with no need to re-package
* GitHub: allows templates to be distributed and versioned as publicly or privately accessible libraries
* npm: allows dependencies on templates to be easily declared for Node.js and browser based applications. Integrates with CI/CD tools.

### Metadata
The metadata for a Smart Clause is stored in the  `/metadata.json` text file in JSON format.

```
{
   "name" : "com.example.MySmartClause",
   "version" : "0.0.1"
}
```
_metadata.json_

The name property must consist of [a-z][A-Z][.]. It is strongly recommended that the name be prefixed with the domain name of the author of the smart clause, to minimise naming collisions. The version property must be a semantic version of the form major.minor.micro [0-9].[0-9].[0.9].

Note that additional properties such as `locales` and `jurisdictions` may be added as future needs arise.

### Template Grammar
The grammar files for the domain specific language used by the Smart Clause are stored under sub folders of the  `/grammar/` folder. 

Grammars are organised by locale, hence a grammar for the English locale should be placed in `/grammar/en` while a grammar file for the French locale should be placed in `/grammar/fr`.

The locale folder must contain a `config.json` folder that describes the Smart Clause in the given locale.

```
{
   "description" : "This is a smart clause for the en locale"
}
```
grammar_en_config.json/

## Data Model
The data model for a smart clause is stored in a set of files under the `/model` folder. The data model files must be in the format defined by [Modeling Language | Hyperledger Composer](https://hyperledger.github.io/composer/unstable/reference/cto_language.html)

## Execution Logic
The execution logic for a smart clause is stored under the `/logic` folder.

The folder must also contain a file `config.json` that specifies the language and options used to express execution logic.

```
{
   "format" : "js"
}
```
logic_config.json_

The only currently supported format is `js` (other formats may be added in the future). The file may also contain other options specific to the execution of logic.

## Parser Generation
The `accord-core` package contains code that generates a parser from a template definition. It merges the Template Grammar with type information from the Template Model to generate a parser that can validate natural language for a clause created from the template.

## Execution
The `accord-engine` package contains code that invokes the logic for a template, given the template data, a request transaction and returns the response transaction.