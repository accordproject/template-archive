// Generated automatically by nearley, version 2.13.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
        // a chunk is everything up until '[{', even across newlines. We then trim off the '[{'
        // we also push the lexer into the 'var' state
        Chunk: {
            match: /[^]*?\[{/,
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
            match: '}]',
            pop: true
        }, // pop back to main state
        varid: /[a-zA-Z_][_a-zA-Z0-9]*/,
        varstring: /".*?"/,
        varcond: /:\?/,
        varspace: / /,
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
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "sqstring$ebnf$1", "symbols": []},
    {"name": "sqstring$ebnf$1", "symbols": ["sqstring$ebnf$1", "sstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "sqstring", "symbols": [{"literal":"'"}, "sqstring$ebnf$1", {"literal":"'"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "btstring$ebnf$1", "symbols": []},
    {"name": "btstring$ebnf$1", "symbols": ["btstring$ebnf$1", /[^`]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "btstring", "symbols": [{"literal":"`"}, "btstring$ebnf$1", {"literal":"`"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "dstrchar", "symbols": [/[^\\"\n]/], "postprocess": id},
    {"name": "dstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": 
        function(d) {
            return JSON.parse("\""+d.join("")+"\"");
        }
        },
    {"name": "sstrchar", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "sstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": function(d) { return JSON.parse("\""+d.join("")+"\""); }},
    {"name": "sstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "sstrchar", "symbols": ["sstrchar$string$1"], "postprocess": function(d) {return "'"; }},
    {"name": "strescape", "symbols": [/["\\\/bfnrt]/], "postprocess": id},
    {"name": "strescape", "symbols": [{"literal":"u"}, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/], "postprocess": 
        function(d) {
            return d.join("");
        }
        },
    {"name": "TEMPLATE", "symbols": ["CONTRACT_TEMPLATE"], "postprocess": id},
    {"name": "CONTRACT_TEMPLATE$ebnf$1", "symbols": []},
    {"name": "CONTRACT_TEMPLATE$ebnf$1", "symbols": ["CONTRACT_TEMPLATE$ebnf$1", "CONTRACT_ITEM"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "CONTRACT_TEMPLATE$ebnf$2", "symbols": [(lexer.has("LastChunk") ? {type: "LastChunk"} : LastChunk)], "postprocess": id},
    {"name": "CONTRACT_TEMPLATE$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "CONTRACT_TEMPLATE", "symbols": ["CONTRACT_TEMPLATE$ebnf$1", "CONTRACT_TEMPLATE$ebnf$2"], "postprocess":  (data) => {
            return {
                type: 'ContractTemplate',
                data: flatten(data)
            };
        }
        },
    {"name": "CLAUSE_TEMPLATE$ebnf$1", "symbols": []},
    {"name": "CLAUSE_TEMPLATE$ebnf$1", "symbols": ["CLAUSE_TEMPLATE$ebnf$1", "CLAUSE_ITEM"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "CLAUSE_TEMPLATE$ebnf$2", "symbols": [(lexer.has("LastChunk") ? {type: "LastChunk"} : LastChunk)], "postprocess": id},
    {"name": "CLAUSE_TEMPLATE$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "CLAUSE_TEMPLATE", "symbols": ["CLAUSE_TEMPLATE$ebnf$1", "CLAUSE_TEMPLATE$ebnf$2"], "postprocess":  (data) => {
            return {
                type: 'ClauseTemplate',
                data: flatten(data)
            };
        }
        },
    {"name": "CONTRACT_ITEM", "symbols": [(lexer.has("Chunk") ? {type: "Chunk"} : Chunk)], "postprocess": id},
    {"name": "CONTRACT_ITEM", "symbols": ["VARIABLE"], "postprocess": id},
    {"name": "CONTRACT_ITEM", "symbols": ["CLAUSE_VARIABLE_INLINE"], "postprocess": id},
    {"name": "CONTRACT_ITEM", "symbols": ["CLAUSE_VARIABLE_EXTERNAL"], "postprocess": id},
    {"name": "CLAUSE_ITEM", "symbols": [(lexer.has("Chunk") ? {type: "Chunk"} : Chunk)], "postprocess": id},
    {"name": "CLAUSE_ITEM", "symbols": ["VARIABLE"], "postprocess": id},
    {"name": "CLAUSE_VARIABLE_INLINE", "symbols": [(lexer.has("clauseidstart") ? {type: "clauseidstart"} : clauseidstart), (lexer.has("varend") ? {type: "varend"} : varend), "CLAUSE_TEMPLATE", (lexer.has("clauseidend") ? {type: "clauseidend"} : clauseidend), (lexer.has("varend") ? {type: "varend"} : varend)], "postprocess":  (data,l,reject) => {
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
        },
    {"name": "CLAUSE_VARIABLE_EXTERNAL", "symbols": [(lexer.has("clauseidstart") ? {type: "clauseidstart"} : clauseidstart), (lexer.has("clauseclose") ? {type: "clauseclose"} : clauseclose), (lexer.has("varend") ? {type: "varend"} : varend)], "postprocess":  (data) => {
            return {
                type: 'ClauseExternalBinding',
                fieldName: data[0]
            }
        } 
        },
    {"name": "VARIABLE", "symbols": ["BOOLEAN_BINDING"], "postprocess": id},
    {"name": "VARIABLE", "symbols": ["BINDING"], "postprocess": id},
    {"name": "BOOLEAN_BINDING", "symbols": [(lexer.has("varstring") ? {type: "varstring"} : varstring), (lexer.has("varcond") ? {type: "varcond"} : varcond), (lexer.has("varspace") ? {type: "varspace"} : varspace), (lexer.has("varid") ? {type: "varid"} : varid), (lexer.has("varend") ? {type: "varend"} : varend)], "postprocess":  (data) => {
            return {
                type: 'BooleanBinding',
                string: data[0],
                fieldName: data[3]
            };
        }
        },
    {"name": "BINDING", "symbols": [(lexer.has("varid") ? {type: "varid"} : varid), (lexer.has("varend") ? {type: "varend"} : varend)], "postprocess":  (data) => {
            return {
                type: 'Binding',
                fieldName: data[0]
            };
        }
        }
]
  , ParserStart: "TEMPLATE"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
