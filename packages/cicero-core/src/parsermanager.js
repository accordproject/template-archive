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


//TODO - Need to be able to setup the grammar - template parser so you can generate either a contract or clause.

'use strict';

const fsPath = require('path');

const TemplateException = require('./templateexception');

const RelationshipDeclaration = require('@accordproject/concerto-core').RelationshipDeclaration;

const Writer = require('@accordproject/concerto-core').Writer;

const Logger = require('@accordproject/concerto-core').Logger;

const nearley = require('nearley');

const compile = require('nearley/lib/compile');

const generate = require('nearley/lib/generate');

const nearleyGrammar = require('nearley/lib/nearley-language-bootstrapped');

const templateGrammar = require('./tdl.js');

const GrammarVisitor = require('./grammarvisitor');

const uuid = require('uuid');

const nunjucks = require('nunjucks');

const DateTimeFormatParser = require('./datetimeformatparser');

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer; // This required because only compiled nunjucks templates are supported browser-side
// https://mozilla.github.io/nunjucks/api.html#browser-usage
// We can't always import it in Cicero because precompiling is not supported server-side!
// https://github.com/mozilla/nunjucks/issues/1065

const _ = require('lodash');

if (process.browser) {
  require('./compiled_template');
}

/**
 * Generates and manages a Nearley parser for a template.
 * @class
 */
class ParserManager {
  /**
   * Create the ParserManager.
   * @param {object} template - the template instance
   */
  constructor(template) {
    this.template = template;
    this.grammar = null;
    this.grammarAst = null;
    this.templatizedGrammar = null;
    this.templateAst = null;
    this.variables = null;
    this.defaultData = null;
    this.defaultModel = null;
    this.defaultLogic = null;
    this.namespace = null;
    this.grammarName = null;
    this.grammarDisplayName = null;
    this.grammarType = null;
  }

  /**
   * Gets the generated variables for this template
   * @return {object} the variable JS obj for this template
   */
  getVariables() {
      if(!this.variables) {
        throw new Error("Must call parseVariablesFromGrammar before calling getVariables");
      }
      else return this.variables;
  }

  /**
   * Get default data for this template
   * @return {object} the object containing dummy data in the Accord format
   */
  getDefaultData() {
    if(!this.defaultData) {
      throw new Error("Must call packageDefaultData before calling getDefaultData");
    }
    else return this.defaultData;
  }

  /**
   * Get default model for this template
   * @return {String} the Accord format model string for the template's inferred variables
   */
  getDefaultModel() {
    if(!this.defaultModel) {
      throw new Error("Must call createCTOFromInferredVariables before calling getDefaultModel");
    }
    else return this.defaultModel;
  }

   /**
   * Get default logic for this template
   * @return {String} the Accord format logic string for the template's inferred variables
   */
  getDefaultLogic() {
    if(!this.defaultLogic) {
      throw new Error("Must call createModelsAndLogicFromInferred before calling getDefaultLogic");
    }
    else return this.defaultLogic;
  }

  /**
   * Gets a parser object for this template
   * @return {object} the parser for this template
   */
  getParser() {
    if (!this.grammarAst) {
      throw new Error('Must call setGrammar or buildGrammar before calling getParser');
    }

    return new nearley.Parser(nearley.Grammar.fromCompiled(this.grammarAst));
  }

  /**
   * Gets the AST for the template
   * @return {object} the AST for the template
   */
  getTemplateAst() {
    if (!this.grammarAst) {
      throw new Error('Must call setGrammar or buildGrammar before calling getTemplateAst');
    }

    return this.templateAst;
  }

  /**
   * Set the grammar for the template
   * @param {String} grammar  - the grammar for the template
   */
  setGrammar(grammar) {
    this.grammarAst = ParserManager.compileGrammar(grammar);
    this.grammar = grammar;
  }

  /**
   * Adjust the template for list blocks
   * @param {object} x - The current template AST node
   * @param {String} separator - The list separator
   * @return {object} the new template AST node
   */
  static adjustListBlock(x, separator) {
    if (x.data[0] && x.data[0].type === 'Chunk') {
      x.data[0].value = separator + x.data[0].value;
      return x;
    } else {
      throw new Error('List block in template should contain text');
    }
  }
  
   /**
   * Given a template grammar, extract all unique variables and build a json object
   * representing minimum model schema required to populate the template.
   * @param {String} namespace - the namespace of the desired resulting template we're generating
   * @param {String} name - the name of the contract
   * @param {String} type - whether this is a contract ("contract") or clause ("clause")
   * @param {String} templatizedGrammar  - the annotated template
   * using the markdown parser
   */
  inferVariablesFromGrammar(namespace, name, type, templatizedGrammar)
  {
    this.grammarDisplayName = name;
    this.grammarName = name.toLowerCase().replace(/\s/g, '');
    this.namespace = namespace;
    this.grammarType = type;

    if (!this.template || !this.templateAst) {
        // Roundtrip the grammar through the Commonmark parser
        templatizedGrammar = this.roundtripMarkdown(templatizedGrammar); // console.log(templatizedGrammar);
    
        Logger.debug('inferVariablesFromGrammar', templatizedGrammar);
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(templateGrammar));
        parser.feed(templatizedGrammar);
    
        if (parser.results.length !== 1) {
          throw new Error('Ambiguous parse!');
        } // parse the template grammar to generate a dynamic grammar
    
        const ast = parser.results[0];
        this.templateAst = ast;
    }
      
    this.variables = this.parseVariablesFromGrammar(this.grammarName, this.grammarType, this.templateAst.data);

  }

  /**
   * Recursive method to parse the nearley parse trees, extract all unique variables
   * and build a json representation of the minimum number of variable declaration required
   * to represent it.
   * @param {String} tree - the parse tree (or subtree) from the parser
   * @param {String} type  - indicates whether this level of the tree is a "contract", "concept" (obj) or "clause"
   * @param {parentName} parentName - name of the parse tree being parsed. E.g. if we're starting to parse
   * a parse tree from "Test Contract 1", the first level has name "Test Contract 1". Then, we might pop off object
   * parse trees referenced within Test Contract 1 and parse those using the same method as with type "concept" and name "TObject 1"
   * @return {Object []} - an array of the json objects representing this parse tree and all child parse trees. 
   */
  parseVariablesFromGrammar(parentName, type, tree){ //Ey Bobby

    //As we encounter obj references, we're going to pop them off the parse tree, 
    //replace their definition with a reference to a new concept name and will then 
    //recursively parse that child tree we popped off later before adding *it* to the 
    //finishedObjects []
    let finishedObjects = [];
    let thisObject = { $class: this.namespace + "." + parentName };
    
    // Array of first level of properties under root.
    let branches = Object.keys(tree).map(i => tree[i]);

    branches.forEach((element) => {

      if (!element.type.includes("Chunk")) { 

        let varName = element.fieldName.value;

        //Plain old bindings are just primitives. At the moment, these are always treated as strings.
        if(element.type === "Binding") {
          thisObject[varName] = "string";
        }

        //If and IfElse Bindings are booleans
        else if (element.type==="IfBinding" || element.type==="IfElseBinding") {
          thisObject[varName] = "boolean";
        }

        //Treat formatted bindings as String
        else if (element.type==="FormattedBinding") {
          thisObject[varName] = "string"; 
        }

        //Clause Bindings - are treated more or less like objects.
        else if (element.type==="ClauseBinding") {
          
          let clauseType = varName+"_clause";
          thisObject[varName] = {type: clauseType};
          
          //Recursive call to variable parser to parge all of the child chunks in the grammar.
          let newObj = this.parseVariablesFromGrammar(clauseType, "clause", element.template.data);  
          
          //Currently, if there's a collision and two clauses have the same variable name, merge
          //the properties for this instance of that concept name with the existing one... This handles cases 
          //where we might refer to only a subset of the properties of a concept in different references to it
          //accross the template. 
          if (finishedObjects.some(e => e.data.$class === this.namespace + "." + clauseType)) {
            let index = finishedObjects.findIndex(x => x.data.$class === this.namespace + "." + clauseType);
            finishedObjects[index] = _.merge(finishedObjects[index], newObj);
          } else {
            finishedObjects = finishedObjects.concat(newObj);
          } 

        }

        //Handle list - NOTE as of 11/19/19, lists must be lists of concepts (never primitives), which makes handling this
        //easier.
        else if (element.type==="OListBinding") {
          
          let objectType = varName+"_list_obj";
          thisObject[varName] = [{type:objectType}];
          
          //Recursive call to variable parser to parge all of the child chunks in the grammar.
          let newObj = this.parseVariablesFromGrammar(objectType, "concept", element.template.data);
          
          //Currently all lists must refer to concepts (objects). Check that the object name doesn't already exist. 
          //If it does, merge the properties for this instance of that concept name with the existing one...
          //This handles cases where we might refer to only a subset of the properties of a concept in different
          //references to it accross the template. 
          if (finishedObjects.length>0 && finishedObjects.some(e => e.data.$class === this.namespace + "." + objectType)) {
            let index = finishedObjects.findIndex(x => x.data.$class === this.namespace + "." + objectType);
            finishedObjects[index] = _.merge(finishedObjects[index], newObj);
          } else {
            finishedObjects = finishedObjects.concat(newObj);
          }

        }

        //Handle list - NOTE as of 11/19/19, lists must be lists of concepts, not primitives, which makes handling this
        //easier.
        else if (element.type==="UListBinding") {

          let objectType = varName+"_list_obj";
          thisObject[varName] = [{type:objectType}];
          
          //Recursive call to variable parser to parge all of the child chunks in the grammar.
          let newObj = this.parseVariablesFromGrammar(objectType, "concept", element.template.data);

          //Currently all lists must refer to concepts (objects). Check that the object name doesn't already exist. 
          //If it does, merge the properties for this instance of that concept name with the existing one...
          //This handles cases where we might refer to only a subset of the properties of a concept in different
          //references to it accross the template. 
          if (finishedObjects.some(e => e.data.$class === this.namespace + "." + objectType)) {
            let index = finishedObjects.findIndex(x => x.data.$class === this.namespace + "." + objectType);
            finishedObjects[index] = _.merge(finishedObjects[index], newObj);
          } else {
            finishedObjects = finishedObjects.concat(newObj);
          }

        }

        //Handle list - NOTE as of 11/19/19, lists must be lists of concepts, not primitives, which makes handling this
        //easier.
        else if (element.type==="JoinBinding") {  
          
          let objectType = varName+"_list_obj";
          thisObject[varName] = [{type:objectType}];
          
          //Recursive call to variable parser to parge all of the child chunks in the grammar.
          let newObj = this.parseVariablesFromGrammar(objectType, "concept", element.template.data);
          
          //Check that the object name doesn't already exist. If it does, merge the properties for this instance
          //of that concept name with the existing one... This handles cases where we might refer to only a subset
          //of the properties of a concept in different references to it accross the template. 
          if (finishedObjects.some(e => e.data.$class === this.namespace + "." + objectType)) {
            let index = finishedObjects.findIndex(x => x.data.$class === this.namespace + "." + objectType);
            finishedObjects[index] = _.merge(finishedObjects[index], newObj);
          } else {
            finishedObjects = finishedObjects.concat(newObj);
          }

        }

        //With binding must refer to an concept / object:
        else if (element.type==="WithBinding") {

          let objectType = varName+"_obj";
          thisObject[varName] = {type: objectType};

          //Recursive call to variable parser to parge all of the child chunks in the grammar.
          let newObj = this.parseVariablesFromGrammar(objectType, "concept", element.template.data);

          //Currently all lists must refer to concepts (objects). Check that the object name doesn't already exist. 
          //If it does, merge the properties for this instance of that concept name with the existing one...
          //This handles cases where we might refer to only a subset of the properties of a concept in different
          //references to it accross the template.
          if (finishedObjects.some(e => e.data.$class === this.namespace + "." + objectType)) {
            let index = finishedObjects.findIndex(x => x.data.$class === this.namespace + "." + objectType);
            finishedObjects[index] = _.merge(finishedObjects[index], newObj);
          } else {
            finishedObjects = finishedObjects.concat(newObj);
          }

        }

        //Other chunks are not currently supported. TODO - ensure we're not missing anything.
        else {
          console.log("Unrecognized parser chunk type:");
          console.log(element);
        }     
      }
    });
    finishedObjects.push({type, name: parentName, data:thisObject});
    return finishedObjects;
  }


  /**
   * Given a resulting JSON object from parseVariablesFromGrammar, generate corresponding CTO definition.
   * @param {Object} object - A json object representing a clause, concept or contract produced by the parser.
   * @return {String} - The resulting CTO definition of the given object.
   */
  convertToCTOFormat(object) {

    let currentDefinition = "";

    Object.keys(object.data).forEach((key) => {

      if (key==="$class") {
        console.log("Skipping $class key");
      }
      else if (typeof(object.data[key])==="string") {  
        //If variable type is boolean:
        if(object.data[key]==="boolean") {
          currentDefinition += `  o Boolean ${key}\n`;
        }
        //Otherwise, primitives all default to strings at the moment. 
        else {
          currentDefinition += `  o String ${key}\n`;
        }  
      }

      //If the variable type is an array, this means the parser originally found a list. Create appropriate model definition
      else if (Array.isArray(object.data[key])){
        currentDefinition += `  o ${object.data[key][0].type}[] ${key}\n`;
      }

      //Otherwise, if the variable type is an object, the variable is a concept / object and we need to refer to the object name
      //defined when we first parsed the variables, popped off the variable chunk tree, and created a name for it.
      else if (typeof(object.data[key]) === "object" && typeof(object.data[key]) !== null){
        currentDefinition += `  o ${object.data[key].type} ${key}\n`;
      }

      else {
        console.log(`ERROR - Unknown model structure when trying to parse CTO definitions from ${key}`);
      }

    });

    //Depending on the type of CTO definition we're building, wrap it up differently.
    switch(object.type) {
      case "clause":
        currentDefinition = `asset ${object.name} extends AccordClause {\n${currentDefinition}}`;
        break;
      case "contract":
        currentDefinition = `asset ${object.name} extends AccordContract {\n${currentDefinition}}`;
        break;
      case "concept":
        currentDefinition = `concept ${object.name} {\n${currentDefinition}}`;
        break;
      default:
        console.log("WARNING - Unknown model type.");
        break;
    }
    return currentDefinition;
  }

  /**
   * Build stringified package.json for a grammar parsed with this template. 
   * @return {String} - The stringified package.json for the cto to be generated from the parsed grammar. 
   */
  getDefaultMetadata() {
    
    return `
    {
      "name": "${this.grammarName}",
      "displayName": "${this.grammarDisplayName}",
      "version": "0.0.1",
      "description": "This is an autogenerated Accord template for a ${this.grammarType} grammar template named ${this.grammarDisplayName}.",
      "license": "Apache-2.0",
      "accordproject": {
        "template": "${this.grammarType}",
        "cicero": "^0.20.0",
        "runtime": "ergo"
      },
      "devDependencies": {
        "cucumber": "^5.1.0"
      },
      "scripts": {
        "test": "cucumber-js test -r .cucumber.js"
      },
      "keywords": [
        "autogenerated",
        "${this.grammarType}",
        "new",
        "fresh"
      ]
    }
    `;
  }

   /**
   * Build stringified request for the default request to include in the cto. 
   * @return {String} - The stringified request for the default request generated for the parsed grammar.
   */
  getDefaultRequest() {
    return `
    {
      "$class": "${this.namespace}.EmptyRequest"
    }
    `;
  }

   /**
   * For parsed templatizedGrammar, return default model.cto and logic.ergo in stringified form embedded in an object like:
   * {
   *    model: {model.cto contents}
   *    logic: {logic.ergo contents}
   * }
   * @return {Object} - An object containing the model and logic txt (bit strange to do it this way, admittedly, but there
   * seemed to be some benefits in reducing tree traversal)
   */
  createModelsAndLogicFromInferred() {

    let namespace = this.namespace;
    let variables = this.variables;
    let baseImports = `namespace ${namespace}\n\nimport org.accordproject.cicero.contract.* from https://models.accordproject.org/cicero/contract.cto\n\nimport org.accordproject.cicero.runtime.* from https://models.accordproject.org/cicero/runtime.cto\n`;
    let requests = `\n\n// Request \ntransaction EmptyRequest extends Request { }\n\n// Response \ntransaction EmptyResponse extends Response { }`;
    let logic="";

    variables.forEach((variable) => {
      
      baseImports += "\n" + this.convertToCTOFormat(variable);

      if(variable.type==="contract"){
        logic = `namespace ${namespace}\n\ncontract Empty over ${variable.name} {\n\tclause donothing(request : EmptyRequest) : EmptyResponse {\n\t\treturn EmptyResponse{}\n\t}\n}`;
      }

    });

    let modelCode = baseImports + requests;
    
    this.defaultModel = modelCode;
    this.defaultLogic = logic;

    return {model: modelCode, logic};
  }

  /**
   * Package up minimum default data necessary to fill in every variable in the template. 
   * Primitive are assumed to be Strings if they're not booleans. String values are set to "<<{variable name}}>>"
   * @return {Object} - an object containing minimum amount of sample data necessary to fill in parsed template.
   */
  packageDefaultData() {
    
    let variables = this.variables;
    let contract = {};
    let concepts = [];
    let data = {};

    let conts = variables.filter(function (el) {
      return el.type === "contract";
    });

    if (conts.length==1) {
      
      // console.log("Contracts is the right length.");
      contract = conts[0];

      //Need to have these definitions preloaded
      concepts = variables.filter(function (el) {
        return (el.type === "concept" || el.type === "clause");
      });

      // console.log("Generate default data for contract:");
      data = this.generateDefaultDataForObj(contract, concepts);

    }
    else {
      console.log("There can only be 1 contract definition!");
    }

    this.defaultData = data;

    return data;
  }


  /**
   * Given a single JSON object inferred via inferVariablesFromTemplate()
   * and an array of all the concepts (objs) referred to in the original template,
   * go through and build dummy data for the JSON object and any referenced concepts. 
   * @param {Object} object  - the JSON object of variables in the template from
   * inferVariablesFromTemplate()
   * @param {Object} concepts - an array of all the concept (obj) definitions which
   * we'll use to lookup data definitions of any objs referenced by the object and then
   * create dummy data for.
   */
  generateDefaultDataForObj(object, concepts) {
    let data = { $class:object.data.$class };
    
    //Depending on whether object desicrbes a contract (.type === "contract") or a clause (.type==="contract")
    //add a contractId or clauseId property to the resulting data and a uuid4.
    switch(object.type) {
      case "contract":
        data["contractId"] = uuid.v4();
        break;
      case "clause":
        data["clauseId"] = uuid.v4();
        break;
      default:
        console.log("Building data for unrecognized type (not contract or string)");
    }

    Object.keys(object.data).forEach((key) => {
      if (key !== "$class") {
        if (typeof(object.data[key])==="string") {
          if(object.data[key]==="boolean") {
            data[key] = true;
          }
          else {
            data[key] = `<<${key}>>`;
          } 
        }
        else if (Array.isArray(object.data[key])){ 
          let matchingObjects = concepts.filter(function (el) {
            return el.name === object.data[key][0].type;
          });
          if (matchingObjects.length == 1){
            data[key] = [this.generateDefaultDataForObj(matchingObjects[0], concepts)];
          }
        }
        else if (typeof(object.data[key]) === "object" && typeof(object.data[key]) !== null){
          let matchingObjects =concepts.filter(function (el) {
            return el.name === object.data[key].type;
          });
          if (matchingObjects.length == 1){
            data[key] = this.generateDefaultDataForObj(matchingObjects[0], concepts);
          }
        }
        else {
          console.log(`ERROR - Unknown model structure when trying to parse CTO definitions from ${key}`);
        }
      }
      else {
        console.log("Skipping $class");
      }
      
    });
    return data;
  }

  /**
  * Build a grammar from a template
  * @param {String} templatizedGrammar  - the annotated template
  * using the markdown parser
  */
  buildGrammar(templatizedGrammar) {
    // Set ergoExpression flag to false
    this.ergoExpression = false;

    // Roundtrip the grammar through the Commonmark parser
    templatizedGrammar = this.roundtripMarkdown(templatizedGrammar);
    // console.log(templatizedGrammar);

    Logger.debug('buildGrammar', templatizedGrammar);
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(templateGrammar));
    parser.feed(templatizedGrammar);
    if (parser.results.length !== 1) {
      throw new Error('Ambiguous parse!');
    }

    // parse the template grammar to generate a dynamic grammar
    const ast = parser.results[0];
    this.templateAst = ast;
    const parts = {
      textRules: [],
      modelRules: [],
      grammars : {}
    };
    parts.grammars.base = require('./grammars/base');
    this.buildGrammarRules(ast, this.template.getTemplateModel(), 'rule', parts);

    // generate the grammar for the model
    const parameters = {
      writer: new Writer(),
      rules : []
    };
    const gv = new GrammarVisitor();
    this.template.getModelManager().accept(gv, parameters);
    parts.modelRules.push(...parameters.rules);

    // combine the results
    nunjucks.configure(fsPath.resolve(__dirname), {
      tags: {
        blockStart: '<%',
        blockEnd: '%>'
      },
      autoescape: false  // Required to allow nearley syntax strings
    });
    const combined = nunjucks.render('template.ne', parts);
    Logger.debug('Generated template grammar' + combined);

    // console.log(combined);
    this.setGrammar(combined);
    this.templatizedGrammar = templatizedGrammar;
  }

  /**
   * Build grammar rules from a template
   * @param {object} ast  - the AST from which to build the grammar
   * @param {ClassDeclaration} templateModel  - the type of the parent class for this AST
   * @param {String} prefix - A unique prefix for the grammar rules
   * @param {Object} parts - Result object to acculumate rules and required sub-grammars
   */
  buildGrammarRules(ast, templateModel, prefix, parts) {
    // these are the rules for variables
    const rules = {}; // these are the rules for static text

    let textRules = {}; // generate all the rules for the static text

    textRules.prefix = prefix;
    textRules.symbols = [];
    ast.data.forEach((element, index) => {
      // ignore empty chunks (issue #1) and missing optional last chunks
      if (element && (element.type !== 'Chunk' || element.value.length > 0)) {
        Logger.debug("element ".concat(prefix).concat(index, " ").concat(JSON.stringify(element)));
        rules[prefix + index] = element;
        textRules.symbols.push(prefix + index);
      }
    }, this); // the result of parsing is an instance of the template model

    textRules.class = templateModel.getFullyQualifiedName();
    const identifier = templateModel.getIdentifierFieldName();

    if (identifier !== null) {
      textRules.identifier = "".concat(identifier, " : \"").concat(uuid.v4(), "\"");
    } // we then bind each variable in the template model
    // to the first occurence of the variable in the template grammar

    textRules.properties = [];
    templateModel.getProperties().forEach((property, index) => {
      const sep = index < templateModel.getProperties().length - 1 ? ',' : '';
      const bindingIndex = this.findFirstBinding(property.getName(), ast.data);

      if (bindingIndex !== -1) {
        // ignore things like transactionId
        textRules.properties.push("".concat(property.getName(), " : ").concat(prefix).concat(bindingIndex).concat(sep));
      }
    });
    parts.textRules.push(textRules); // Now create the child rules for each symbol in the root rule

    for (let rule in rules) {
      const element = rules[rule];

      switch (element.type) {
        case 'Chunk':
        case 'ExprChunk':
        case 'LastChunk':
          parts.modelRules.push({
            prefix: rule,
            symbols: [this.cleanChunk(element.value)]
          });
          break;

        case 'IfBinding':
          {
            const property = ParserManager.getProperty(templateModel, element);

            if (property.getType() !== 'Boolean') {
              ParserManager._throwTemplateExceptionForElement("An if block can only be used with a boolean property. Property ".concat(element.fieldName.value, " has type ").concat(property.getType()), element);
            }

            parts.modelRules.push({
              prefix: rule,
              symbols: ["\"".concat(element.stringIf.value, "\":? {% (d) => {return d[0] !== null;}%} # ").concat(element.fieldName.value)]
            });
          }
          break;

        case 'IfElseBinding':
          {
            const property = ParserManager.getProperty(templateModel, element);

            if (property.getType() !== 'Boolean') {
              ParserManager._throwTemplateExceptionForElement("An if block can only be used with a boolean property. Property ".concat(element.fieldName.value, " has type ").concat(property.getType()), element);
            }

            parts.modelRules.push({
              prefix: rule,
              symbols: ["(\"".concat(element.stringIf.value, "\"|\"").concat(element.stringElse.value, "\") {% (d) => {return d[0][0] === \"").concat(element.stringIf.value, "\";}%} # ").concat(element.fieldName.value)]
            });
          }
          break;

        case 'FormattedBinding':
        case 'Binding':
        case 'ClauseBinding':
        case 'WithBinding':
        case 'UListBinding':
        case 'OListBinding':
        case 'JoinBinding':
          this.handleBinding(templateModel, parts, rule, element);
          break;

        case 'Expr':
          parts.modelRules.push({
            prefix: rule,
            symbols: ['Any']
          });
          break;

        default:
          ParserManager._throwTemplateExceptionForElement("Unrecognized type ".concat(element.type), element);

      }
    }
  }
  /**
   * Throws an error if a template variable doesn't exist on the model.
   * @param {*} templateModel - the model for the template
   * @param {*} element - the current element in the AST
   * @returns {*} the property
   */


  static getProperty(templateModel, element) {
    const propertyName = element.fieldName.value;
    const property = templateModel.getProperty(propertyName);

    if (!property) {
      ParserManager._throwTemplateExceptionForElement("Template references a property '".concat(propertyName, "' that is not declared in the template model '").concat(templateModel.getFullyQualifiedName(), "'"), element);
    }

    return property;
  }
  /**
   * Throw a template exception for the element
   * @param {string} message - the error message
   * @param {object} element the AST
   * @throws {TemplateException}
   */


  static _throwTemplateExceptionForElement(message, element) {
    const fileName = 'text/grammar.tem.md';
    let column = element.fieldName.col;
    let line = element.fieldName.line;
    let token = element.value ? element.value : ' ';
    const endColumn = column + token.length;
    const fileLocation = {
      start: {
        line,
        column
      },
      end: {
        line,
        endColumn //XXX

      }
    };
    throw new TemplateException(message, fileLocation, fileName, null, 'cicero-core');
  }
  /**
   * Utility method to generate a grammar rule for a variable binding
   * @param {ClassDeclaration} templateModel - the current template model
   * @param {*} parts - the parts, where the rule will be added
   * @param {*} inputRule - the rule we are processing in the AST
   * @param {*} element - the current element in the AST
   */


  handleBinding(templateModel, parts, inputRule, element) {
    const propertyName = element.fieldName.value;
    const property = ParserManager.getProperty(templateModel, element);
    let action = null;
    let suffix = ':';
    let type = property.getType();
    let firstType = null; // if the type/action have not been set explicity, then we infer them

    if (!action) {
      action = '{% id %}';

      if (property.getType() === 'DateTime' || element.type === 'FormattedBinding') {
        if (property.getType() !== 'DateTime') {
          ParserManager._throwTemplateExceptionForElement('Formatted types are currently only supported for DateTime properties.', element);
        } // we only include the datetime grammar if custom formats are used


        if (!parts.grammars.dateTime) {
          parts.grammars.dateTime = require('./grammars/datetime');
          parts.grammars.dateTimeEn = require('./grammars/datetime-en');
        } // push the formatting rule, iff it has not been already declared


        const format = element.format ? element.format.value : '"MM/DD/YYYY"';
        const formatRule = DateTimeFormatParser.buildDateTimeFormatRule(format);
        type = formatRule.name;
        const ruleExists = parts.modelRules.some(rule => rule.prefix === formatRule.name);

        if (!ruleExists) {
          parts.modelRules.push({
            prefix: formatRule.name,
            symbols: ["".concat(formatRule.tokens, " ").concat(formatRule.action, " # ").concat(propertyName, " as ").concat(format)]
          });
        }
      } else if (element.type === 'ClauseBinding' || element.type === 'WithBinding') {
        const nestedTemplate = element.template;
        const nestedTemplateModel = this.template.getIntrospector().getClassDeclaration(property.getFullyQualifiedTypeName());
        this.buildGrammarRules(nestedTemplate, nestedTemplateModel, propertyName, parts);
        type = element.fieldName.value;
      } else if (element.type === 'UListBinding' || element.type === 'OListBinding') {
        const separator = element.type === 'UListBinding' ? '\n- ' : '\n1. ';
        const nestedTemplate = ParserManager.adjustListBlock(element.template, separator);
        const nestedTemplateModel = this.template.getIntrospector().getClassDeclaration(property.getFullyQualifiedTypeName());
        this.buildGrammarRules(nestedTemplate, nestedTemplateModel, propertyName, parts);
        type = element.fieldName.value;
      } else if (element.type === 'JoinBinding') {
        const nestedTemplateModel = this.template.getIntrospector().getClassDeclaration(property.getFullyQualifiedTypeName());
        const firstNestedTemplate = element.template;
        this.buildGrammarRules(firstNestedTemplate, nestedTemplateModel, propertyName + 'First', parts);
        firstType = element.fieldName.value + 'First';
        const separator = element.separator;
        const nestedTemplate = ParserManager.adjustListBlock(element.template, separator);
        this.buildGrammarRules(nestedTemplate, nestedTemplateModel, propertyName, parts);
        type = element.fieldName.value;
        action = "\n{%\n  ([ ".concat(propertyName + 'First', ", ").concat(propertyName, " ]) => {\n    return [").concat(propertyName + 'First', "].concat(").concat(propertyName, ");\n}\n%}");
      } else {
        // relationships need to be transformed into strings
        if (property instanceof RelationshipDeclaration) {
          type = 'String';
        }
      }
    }

    if (property.isArray()) {
      suffix += element.type === 'JoinBinding' ? '*' : '+';
    }

    if (property.isOptional()) {
      suffix += '?';
    }

    if (suffix === ':') {
      suffix = '';
    } // console.log(`${inputRule} => ${type}${suffix} ${action} # ${propertyName}`);


    if (element.type === 'JoinBinding') {
      parts.modelRules.push({
        prefix: inputRule,
        //symbols: [`"[{" ${type}${suffix} "}]" ${action} # ${propertyName}`],
        symbols: ["".concat(firstType, " ").concat(type).concat(suffix, " ").concat(action, " # ").concat(propertyName)]
      });
    } else {
      parts.modelRules.push({
        prefix: inputRule,
        //symbols: [`"[{" ${type}${suffix} "}]" ${action} # ${propertyName}`],
        symbols: ["".concat(type).concat(suffix, " ").concat(action, " # ").concat(propertyName)]
      });
    }
  }
  /**
   * Cleans a chunk of text to make it safe to include
   * as a grammar rule. We need to remove linefeeds and
   * escape any '"' characters.
   *
   * @param {string} input - the input text from the template
   * @return {string} cleaned text
   */


  cleanChunk(input) {
    // we replace all \n with \\n
    let text = input.replace(/\n/gm, '\\n'); // replace all " with \"

    text = text.replace(/"/gm, '\\"');
    return "\"".concat(text, "\"");
  }
  /**
   * Finds the first binding for the given property
   *
   * @param {string} propertyName the name of the property
   * @param {object[]} elements the result of parsing the template_txt.
   * @return {int} the index of the element or -1
   */


  findFirstBinding(propertyName, elements) {
    for (let n = 0; n < elements.length; n++) {
      const element = elements[n];

      if (element !== null && ['Binding', 'FormattedBinding', 'IfBinding', 'IfElseBinding', 'UListBinding', 'OListBinding', 'JoinBinding', 'ClauseBinding', 'WithBinding'].includes(element.type)) {
        if (element.fieldName.value === propertyName) {
          return n;
        }
      }
    }

    return -1;
  }
  /**
   * Get the (compiled) grammar for the template
   * @return {String} - the grammar for the template
   */


  getGrammar() {
    return this.grammar;
  }
  /**
   * Returns the templatized grammar
   * @return {String} the contents of the templatized grammar
   */


  getTemplatizedGrammar() {
    return this.templatizedGrammar;
  }
  /**
   * Compiles a Nearley grammar to its AST
   * @param {string} sourceCode  - the source text for the grammar
   * @return {object} the AST for the grammar
   */


  static compileGrammar(sourceCode) {
    try {
      // Parse the grammar source into an AST
      const grammarParser = new nearley.Parser(nearleyGrammar);
      grammarParser.feed(sourceCode);
      const grammarAst = grammarParser.results[0]; // TODO check for errors
      // Compile the AST into a set of rules

      const grammarInfoObject = compile(grammarAst, {}); // Generate JavaScript code from the rules

      const grammarJs = generate(grammarInfoObject, 'grammar'); // Pretend this is a CommonJS environment to catch exports from the grammar.

      const module = {
        exports: {}
      };
      eval(grammarJs);
      return module.exports;
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  }
  /**
   * Round-trip markdown
   * @param {string} text - the markdown text
   * @return {string} the result of parsing and printing back the text
   */


  roundtripMarkdown(text) {
    // Roundtrip the grammar through the Commonmark parser
    const commonMarkTransformer = new CommonMarkTransformer({
      noIndex: true
    });
    const concertoAst = commonMarkTransformer.fromMarkdown(text);
    return commonMarkTransformer.toMarkdown(concertoAst);
  }

}

module.exports = ParserManager;