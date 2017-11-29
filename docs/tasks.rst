=============================
Load a Template
=============================

To create a Template instance in memory call the ``fromDirectory`` or ``fromArchive`` methods::

    const template = await Template.fromDirectory('./test/data/latedeliveryandpenalty');

These methods are asynchronous and return a ``Promise``, so you should use ``await`` to wait for 
the promise to be resolved.

=============================
Instantiate a Clause
=============================

Once a Template has been loaded, you can create a Clause based on the Template. You can either instantiate
the Clause using source DSL text (by calling ``parse``), or you can set an instance of the template model 
directly (by calling ``setData``)::

    // load the DSL text for the template
    const testLatePenaltyInput = fs.readFileSync(path.resolve(__dirname, 'data/', 'sample.txt'), 'utf8');

    const clause = new Clause(template);
    clause.parse(testLatePenaltyInput);

=============================
Create a Template
=============================

The easiest way to create a new template is to use the template generator::

        yo cicero-template

The template generator will create a basic template with the required files and structure.

Structure
---------

Layout:

package.json
    Metadata for the template (name, version, description etc)

README.md
    A markdown file that describes the purpose and correct usage for the template

data.json (optional)
    A sample valid request transaction for the template

sample.txt (optional)
    A sample of DSL text that is valid for the template

grammar/template.tem
    The default template grammar for the template

models/
    A collection of Hyperledger Composer model files for the template. They define the Template Model
    and the Request and Response transactions.

lib/
    A collection of ES 2015 JavaScript files that implement the business logic for the template

test/
    A collection of unit tests for the template

Grammar
-------

Please refer to the Concepts documentation.

Model
-----

Please refer to the Concepts documentation.

Logic
-----

Please refer to the Concepts documentation.

Unit Tests
----------

Templates should have unit tests that cover every line of code of their business logic. You may use any of the
popular unit testing frameworks to implement the tests (mocha, chai, sinon etc). Please refer to the
``acceptance-of-delivery`` template for an example template with unit tests.

=============================
Add a Template to a Library
=============================

The Cicero template library is stored in a GitHub repository: https://github.com/accordproject/cicero-template-library

To contribute new templates please fork the repository and then create a pull request. Note that templates
should have unit tests. See the ``acceptance-of-delivery`` template for an example unit test.

=============================
Executing a Clause
=============================

Clauses may be executed in a standalone Node.js process, invoked as RESTful services, or called 
directly from Hyperledger Fabric 1.1 Node.js chaincode.

Command Line Interface
-----------------------

Please see the CLI reference documentation for the ``cicero execute`` command.

Node.js
-------

To execute a Clause you create an instance of the ``Engine`` and then call ``execute`` on it, passing in the
clause and the transaction::

    // create the engine
    const engine = new Engine();
    const request = {'$class':'io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest','forceMajeure':false,'agreedDelivery':'2017-10-07T16:38:01.412Z','goodsValue':200,'transactionId':'402c8f50-9e61-433e-a7c1-afe61c06ef00','timestamp':'2017-11-12T17:38:01.412Z'};
    const result = await engine.execute(clause, request)

Hyperledger Composer
---------------------

TBD

Hyperledger Fabric 1.1
-----------------------

TBD