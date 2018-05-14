#
# Grammar for templates with embedded variables
#
# This grammar is used to parse a template and to generate a grammar that
# can parse instances of the template, automatically data binding to a template model.
#
# The grammar generation pipeline operates at 3 distinct levels: meta-meta (template definition language),
# meta (a template), an instance (a clause, a valid instance of a template).
#
# 1. Load this grammar
# 2. Parse the Template Grammar file (tgm) using this grammar, outputs AST1
# 3. Convert AST1 to a Nearley grammar (adding grammar rules from template model) 
#    that can parse instances of the template, outputs AST2
# 4. Parse instance of a template (a clause) using AST2, outputs the TemplateModel instance of the clause
# 5. Execute clause
#
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
  const flatten = d => {
    return d.reduce(
      (a, b) => {
        return a.concat(b);
      },
      []
    );
  };

const moo = require("moo");

// we use lexer states to distinguish between the tokens
// in the text and the tokens inside the variables
const lexer = moo.states({
    main: {
        // a chunk is everything up until '{{', even across newlines. We then trim off the '{{'
        // we also push the lexer into the 'var' state
        Chunk: {
            match: /[^]*?\{{/,
            lineBreaks: true,
            push: 'var',
            value: x => x.slice(0, -2)
        },
        // we now need to consume everything up until the end of the buffer.
        // note that the order of these two rules is important!
        LastChunk : {
            match: /[^]+/,
            lineBreaks: true,
        }
    },
    var: {
        varend: {
            match: '}}',
            pop: true
        }, // pop back to main state
        clause: /clause/,
        end:  /end/,
        external: /external/,
        varid: /[a-zA-Z_][_a-zA-Z0-9]*/,
        varstring: /".*?"/,
        varcond: /:\?/,
        varspace: / /,
    },
});
%}

@lexer lexer

TEMPLATE -> 
    # Only allow contract templates for now until we get to milestone 2
    #  CLAUSE_TEMPLATE {% id %}
    #|
    CONTRACT_TEMPLATE {% id %}

CONTRACT_TEMPLATE -> CONTRACT_ITEM:* %LastChunk:?
{% (data) => {
        return {
            type: 'ContractTemplate',
            data: flatten(data)
        };
    }
%}

# A Clause is one or more items, followed by an optional LastChunk
CLAUSE_TEMPLATE -> CLAUSE_ITEM:* %LastChunk:?
{% (data) => {
        return {
            type: 'ClauseTemplate',
            data: flatten(data)
        };
    }
%}

CONTRACT_ITEM -> 
      %Chunk {% id %} 
    | VARIABLE {% id %}
    | CLAUSE_VARIABLE_INLINE {% id %}
    | CLAUSE_VARIABLE_EXTERNAL {% id %}

# An item is either a chunk of text or an embedded variable
CLAUSE_ITEM -> 
      %Chunk {% id %} 
    | VARIABLE {% id %}

CLAUSE_VARIABLE_INLINE -> %clause %varspace %varid %varend CLAUSE_TEMPLATE %end %varspace %clause %varend
{% (data) => {
    return {
        type: 'ClauseBinding',
        template: data[4],
        fieldName: data[2]
    }
}
%}

# Binds the variable to a Clause in the template model. The type of the clause
# in the grammar is inferred from the type of the model element
CLAUSE_VARIABLE_EXTERNAL -> %external %varspace %clause %varspace %varid %varend
{% (data) => {
    return {
        type: 'ClauseExternalBinding',
        fieldName: data[4]
    }
} 
%}

# A variable may be one of the sub-types below
VARIABLE -> 
      BOOLEAN_BINDING  {% id %}
    | BINDING {% id %} 

# A Boolean binding set a boolean to true if a given optional string literal is present
# {{"optional text":? booleanFieldName}}
BOOLEAN_BINDING -> %varstring %varcond %varspace %varid %varend
{% (data) => {
        return {
            type: 'BooleanBinding',
            string: data[0],
            fieldName: data[3]
        };
    }
%}

# Binds the variable to a field in the template model. The type of the variable
# in the grammar is inferred from the type of the model element
# {{fieldName}}
BINDING -> %varid %varend
{% (data) => {
        return {
            type: 'Binding',
            fieldName: data[0]
        };
    }
%}