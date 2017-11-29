Tutorial 1 : Quick Start
===========================

Using an existing Template
---------------------------

Download the Template
^^^^^^^^^^^^^^^^^^^^^^

You can either `download the latest release archive`_ or if you have ``git``
installed simply ``git clone`` the repository::

    git clone https://github.com/accordproject/cicero-template-library

.. _`download the latest release archive`: https://github.com/accordproject/cicero-template-library/releases

Parse 
^^^^^^

Use the ``cicero parse`` command to load a template from a directory on disk and then use
it to parse input text, echoing the result of parsing. If the input text is valid the parsing
result will be a JSON serialized instance of the Template Mode:

Sample template.tem::

    Name of the person to greet: [{name}]. Thank you!

Sample.txt::

    Name of the person to greet: "Dan". Thank you!

Parsing using the command line::

    cd cicero-template-library cicero parse --template ./helloworld/ --dsl ./helloworld/sample.txt
    Setting clause data: {"$class":"io.clause.helloworld.TemplateModel","name":"Dan"}

Or, attempting to parse invalid data will result in line and column information for the syntax
error.

Sample.txt::

    FUBAR Name of the person to greet: "Dan". Thank you!

Output::

    { Error: invalid syntax at line 1 col 1:
    FUBAR  Name of the person to greet: "Dan". 
    ^ Unexpected "F"

Execute
^^^^^^^^

Use the ``cicero execute`` command to load a template from a directory on disk,
instantiate a clause based on input text, and then invoke the clause using an incoming JSON
payload.

data.json::

    {
        "$class": "io.clause.helloworld.Request", "input": "World"
    }


Commands::

    cd cicero-template-library 
    cicero execute --template ./helloworld/ --dsl ./helloworld/sample.txt --data ./helloworld/data.json

The results of execution (a JSON serialized object) are displayed. They include: 

* Details of the clause executed (name, version, SHA256 hash of clause data)
* The incoming request object 
* The output response object

Example::

    {
        "clause":"helloworld@0.0.3-c8d9e40fe7c5a479d1a80bce2d2fdc3c8a240ceb44a031d38cbd619e9b795b60",
        "request":{
            "$class":"io.clause.helloworld.Request", "input":"World"
        }, 
        "response":{
            "$class":"io.clause.helloworld.Response", "output":"Hello Dan World",
            "transactionId":"cf1dabb5-d604-4ffa-8a87-8333e77a735a",
            "timestamp":"2017-10-31T10:47:42.055Z"
        }
    }

Note that in the response data from the template has been combined with data from the request.

Creating a New Template
------------------------

Now that you have executed an existing template, let's create a new template. 

.. note:: If you would like to contribute your template back into the `cicero-template-library` please
          start by forking_ the ``cicero-template-library`` project on GitHub. This will make it easy 
          for you to submit a pull request to get your new template added to the library.

.. _forking: https://help.github.com/articles/fork-a-repo/

Install the template generator::

    npm install -g yo 
    npm install -g generator-cicero-template

Run the template generator::

    yo cicero-template

.. note:: If you have forked the ``cicero-template-library`` cd into that directory first.

Give your generator a name (no spaces) and then supply a namespace for your template model (again,
no spaces). The generator will then create the files and directories required for a basic template
(based on the helloworld template).

Edit the Template Grammar
--------------------------

Start by editing the template grammar in the ``grammar/template.tem`` file. You will want to replace
the text with something suitable for your template, introducing variables as required. The
variables are marked-up using ``[{name}]``.

Edit the Template Model
------------------------

All of the variables referenced in your template grammar must exist in your template model. Edit
the file ``models/model.cto`` to include all your variables. The `Hyperledger Composer Modeling Language`_ primitive data types
are:

- String 
- Long 
- Integer 
- DateTime 
- Double 
- Boolean

 .. _`Hyperledger Composer Modeling Language`: https://hyperledger.github.io/composer/reference/cto_language.html

Edit the Request and Response Transaction Types
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Your template expects to receive data as input and will produce data as output. The structure of
this request/response data is captured in ``Request`` and ``Response`` transaction types in your model
namespace. Open up the file ``models/model.cto`` and edit the definition of the ``Request`` type to
include all the data you expect to receive from the outside world and that will be used by the
business logic of your template. Similarly edit the definition of the ``Response`` type to include
all the data that the business logic for your template will compute and would like to return to the
caller.

Edit the Logic of the Template
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Now edit the business logic of the template itself. At present this is expressed as ES 2015
JavaScript functions (other languages may be supported in the future). Open the file ``lib/logic.js``
and edit the ``execute`` method to perform the calculations your logic requires. Use the
``context.request`` and ``context.data`` properties to access the incoming request and the template
data respectively, setting properties on ``context.response`` to be returned to the caller.