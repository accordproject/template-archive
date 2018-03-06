// Generated automatically by nearley, version 2.12.1
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
    {"name": "TEMPLATE$ebnf$1", "symbols": ["ITEM"]},
    {"name": "TEMPLATE$ebnf$1", "symbols": ["TEMPLATE$ebnf$1", "ITEM"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "TEMPLATE$ebnf$2", "symbols": [(lexer.has("LastChunk") ? {type: "LastChunk"} : LastChunk)], "postprocess": id},
    {"name": "TEMPLATE$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "TEMPLATE", "symbols": ["TEMPLATE$ebnf$1", "TEMPLATE$ebnf$2"], "postprocess":  (data) => {
            return {
                type: 'Template',
                data: flatten(data)
            };
        }
        },
    {"name": "ITEM", "symbols": [(lexer.has("Chunk") ? {type: "Chunk"} : Chunk)], "postprocess": id},
    {"name": "ITEM", "symbols": ["VARIABLE"], "postprocess": id},
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
