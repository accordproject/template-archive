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
          if(b) {
            return a.concat(b);
          } else {
              return a;
          }
      },
      []
    );
  };

const moo = require("moo");

const escapeNearley = (x) => {
    return x.replace(/\t/g, '\\t') // Replace tab due to Nearley bug #nearley/issues/413
        .replace(/\f/g, '\\f')
        .replace(/\r/g, '\\r');
}

// we use lexer states to distinguish between the tokens
// in the text and the tokens inside the variables
const lexer = moo.states({
    main: {
        // a chunk is everything up until '[{', even across newlines. We then trim off the '[{'
        // we also push the lexer into the 'var' state
        Chunk: {
            match: /[^]*?\[{/,
            lineBreaks: true,
            push: 'var',
            value: x => escapeNearley(x.slice(0, -2))
        },
        ExprChunk: {
            match: /[^]*?{{/,
            lineBreaks: true,
            push: 'expr',
            value: x => escapeNearley(x.slice(0, -2))
        },
        // we now need to consume everything up until the end of the buffer.
        // note that the order of these two rules is important!
        LastChunk : {
            match: /[^]+/,
            lineBreaks: true,
            value: x => escapeNearley(x)
        }
    },
    var: {
varend: {
            match: '}]',
            pop: true
        }, // pop back to main state
        varid: {
          match: /[a-zA-Z_][_a-zA-Z0-9]*/,
          type: moo.keywords({varas: 'as'})
        },
        varstring: /".*?"/,
        varcond: ':?',
        varspace: ' ',
        clauseidstart: {
            match: /#[a-zA-Z_][_a-zA-Z0-9]*/,
            value: x => x.slice(1)
        },
        clauseidend: {
            match: /\/[a-zA-Z_][_a-zA-Z0-9]*/,
            value: x => x.slice(1)
        },
        clauseclose: /\//
    },
    expr: {
exprend: {
            match: /[^]*?}}/,
            lineBreaks: true,
            pop: true
        },
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
    | %ExprChunk {% id %} 
    | VARIABLE {% id %}
    | CLAUSE_VARIABLE_INLINE {% id %}
    | CLAUSE_VARIABLE_EXTERNAL {% id %}
    | CLAUSE_EXPR {% id %}

# An expression
CLAUSE_EXPR -> %exprend
{% (data) => {
        return {
            type: 'Expr'
        }
    }
%}

# An item is either a chunk of text or an embedded variable
CLAUSE_ITEM -> 
      %Chunk {% id %} 
    | %ExprChunk {% id %} 
    | VARIABLE {% id %}
    | CLAUSE_EXPR {% id %}

CLAUSE_VARIABLE_INLINE -> %clauseidstart %varend CLAUSE_TEMPLATE %clauseidend %varend
{% (data,l,reject) => {
    // Check that opening and closing clause tags match
    // Note: this line makes the parser non-context-free
    if(data[0].value !== data[3].value) {
        return reject;
    } else {
        return {
            type: 'ClauseBinding',
            template: data[2],
            fieldName: data[0]
        }
    }
}
%}

# Binds the variable to a Clause in the template model. The type of the clause
# in the grammar is inferred from the type of the model element
CLAUSE_VARIABLE_EXTERNAL -> %clauseidstart %clauseclose %varend
{% (data) => {
    return {
        type: 'ClauseExternalBinding',
        fieldName: data[0]
    }
} 
%}

# A variable may be one of the sub-types below
VARIABLE -> 
      FORMATTED_BINDING {% id %}
    | BOOLEAN_BINDING  {% id %}
    | BINDING {% id %} 

# A Boolean binding set a boolean to true if a given optional string literal is present
# [{"optional text":? booleanFieldName}]
BOOLEAN_BINDING -> %varstring %varcond %varspace %varid %varend
{% (data) => {
        return {
            type: 'BooleanBinding',
            string: data[0],
            fieldName: data[3]
        };
    }
%}

# A Formatted binding specifies how a field is parsed inline. For example, for a DateTime field:
# [{fieldName as "YYYY-MM-DD HH:mm Z"}]
FORMATTED_BINDING -> %varid %varspace %varas %varspace %varstring %varend
{% (data) => {
        return {
            type: 'FormattedBinding',
            fieldName: data[0],
            format: data[4],
        };
    }
%}

# Binds the variable to a field in the template model. The type of the variable
# in the grammar is inferred from the type of the model element
# [{fieldName}]
BINDING -> %varid %varend
{% (data) => {
        return {
            type: 'Binding',
            fieldName: data[0]
        };
    }
%}