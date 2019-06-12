# Example
In the samples folder, or any other folder where the ergo smart contract will reside, define the minimum file structure:

<pre>
<code>
samples
	+ lib
	+ grammar
	+ models
</code>
</pre>

### In the samples/grammar folder, create a template file “template.tem” 

<pre>
<code>
Name of the person to greet: [{name}].
Thank you!
</code>
</pre>

### In the samples/lib folder, create the ergo file – “hello.ergo”
<pre>
<code>
namespace org.accordproject.helloworld

contract HelloWorld over HelloWorldClause {
clause helloworld(request : MyRequest) : MyResponse {
    return MyResponse{ output: "Hello " ++ contract.name ++ " " ++ request.input }
  }
}
</code>
</pre>

### In the samples/models folder, create the CTO file (Composer)

<pre>
<code>
namespace org.accordproject.helloworld
import org.accordproject.cicero.contract.* from https://models.accordproject.org/cicero/contract.cto
import org.accordproject.cicero.runtime.* from https://models.accordproject.org/cicero/runtime.cto

transaction MyRequest extends Request {
  o String input
}
transaction MyResponse extends Response {
  o String output
}
asset HelloWorldClause extends AccordClause {
  o String name
}
</code>
</pre>

### Now in the root (samples) folder, create four files, package.json, request.json, sample.txt and state.json. Normally for package.json, you would run npm init, but I cant get around this crazy syntax

<pre>
<code>
// *********** package.json ***********
{
    "name": "helloworld",
    "version": "0.10.1",
    "description": "This is the Hello World of Accord Project Templates. Executing the clause will simply echo back the text that occurs after the string `Hello` prepended to text that is passed in the request.",
    "license": "Apache-2.0",
    "accordproject": {
        "template": "clause",
        "ergo": "0.8.0",
        "cicero": "^0.12.0"
    },
    "keywords": ["hello", "world", "greet"]
}
</code>
</pre>

<pre>
<code>
// ************ request.json *************
{
    "$class": "org.accordproject.helloworld.MyRequest",
    "input": "Accord Project"
}
</code>
</pre>


<pre>
<code>
// ************* state.json **************
{
    "$class": "org.accordproject.cicero.contract.AccordContractState",
    "stateId": "org.accordproject.cicero.contract.AccordContractState#1"
}
</code>
</pre>

<pre>
<code>
// ************** sample.txt *************
Name of the person to greet: "Fred Blogs".
Thank you!
</code>
</pre>

Now, change over to this directory, cd [install dir]/samples

<pre>
<code>
$ node ../packages/cicero-cli/index.js parse --template . --dsl . --sample ./sample.txt
</code>
</pre>

### To execute it, create a data file - data.json in the samples folder.
<pre>
<code>
{
   "$class": "io.clause.helloworld.Request",
   "input": "World"
}
</code>
</pre>
<code>
$ node ../packages/cicero-cli/index.js execute --template . --dsl . --sample ./sample.txt --data ./data.json
</code>
