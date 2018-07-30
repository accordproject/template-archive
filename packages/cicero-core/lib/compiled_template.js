(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["template.ne"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "# Dynamically Generated\n@{%\n    function compact(v) {\n        if (Array.isArray(v)) {\n            return v.reduce((a, v) => (v === null || v === undefined || (v && v.length === 0) ) ? a : (a.push(v), a), []);\n        } else {\n            return v;\n        }\n    }\n\n    function flatten(v) {\n        let r;\n        if (Array.isArray(v)) {\n            r = v.reduce((a,v) => (a.push(...((v && Array.isArray(v)) ? flatten(v) : [v])), a), []);\n        } else {\n            r = v;\n        }\n        r = compact(r);\n        return r;\n        }\n%}\n\n";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "textRules");
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("r", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n";
output += runtime.suppressValue(runtime.memberLookup((t_4),"prefix"), env.opts.autoescape);
output += " -> ";
frame = frame.push();
var t_7 = runtime.memberLookup((t_4),"symbols");
if(t_7) {t_7 = runtime.fromIterator(t_7);
var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("s", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += runtime.suppressValue(t_8, env.opts.autoescape);
output += " ";
;
}
}
frame = frame.pop();
output += "\n{% ([ ";
output += runtime.suppressValue(runtime.memberLookup((t_4),"symbols"), env.opts.autoescape);
output += " ]) => {\n    return {\n        ";
if(runtime.memberLookup((t_4),"class")) {
output += "$class: \"";
output += runtime.suppressValue(runtime.memberLookup((t_4),"class"), env.opts.autoescape);
output += "\",";
;
}
output += "\n        ";
if(runtime.memberLookup((t_4),"identifier")) {
output += runtime.suppressValue(runtime.memberLookup((t_4),"identifier"), env.opts.autoescape);
output += ",";
;
}
frame = frame.push();
var t_11 = runtime.memberLookup((t_4),"properties");
if(t_11) {t_11 = runtime.fromIterator(t_11);
var t_10 = t_11.length;
for(var t_9=0; t_9 < t_11.length; t_9++) {
var t_12 = t_11[t_9];
frame.set("p", t_12);
frame.set("loop.index", t_9 + 1);
frame.set("loop.index0", t_9);
frame.set("loop.revindex", t_10 - t_9);
frame.set("loop.revindex0", t_10 - t_9 - 1);
frame.set("loop.first", t_9 === 0);
frame.set("loop.last", t_9 === t_10 - 1);
frame.set("loop.length", t_10);
output += "\n        ";
output += runtime.suppressValue(t_12, env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "\n    };\n}\n%}\n";
;
}
}
frame = frame.pop();
output += "\n\n";
frame = frame.push();
var t_15 = runtime.contextOrFrameLookup(context, frame, "modelRules");
if(t_15) {t_15 = runtime.fromIterator(t_15);
var t_14 = t_15.length;
for(var t_13=0; t_13 < t_15.length; t_13++) {
var t_16 = t_15[t_13];
frame.set("r", t_16);
frame.set("loop.index", t_13 + 1);
frame.set("loop.index0", t_13);
frame.set("loop.revindex", t_14 - t_13);
frame.set("loop.revindex0", t_14 - t_13 - 1);
frame.set("loop.first", t_13 === 0);
frame.set("loop.last", t_13 === t_14 - 1);
frame.set("loop.length", t_14);
output += "\n";
output += runtime.suppressValue(runtime.memberLookup((t_16),"prefix"), env.opts.autoescape);
output += " -> ";
frame = frame.push();
var t_19 = runtime.memberLookup((t_16),"symbols");
if(t_19) {t_19 = runtime.fromIterator(t_19);
var t_18 = t_19.length;
for(var t_17=0; t_17 < t_19.length; t_17++) {
var t_20 = t_19[t_17];
frame.set("s", t_20);
frame.set("loop.index", t_17 + 1);
frame.set("loop.index0", t_17);
frame.set("loop.revindex", t_18 - t_17);
frame.set("loop.revindex0", t_18 - t_17 - 1);
frame.set("loop.first", t_17 === 0);
frame.set("loop.last", t_17 === t_18 - 1);
frame.set("loop.length", t_18);
output += runtime.suppressValue(t_20, env.opts.autoescape);
output += " ";
;
}
}
frame = frame.pop();
output += "\n";
if(runtime.memberLookup((t_16),"properties")) {
output += "\n{% ( data ) => {\n    return {\n        $class: \"";
output += runtime.suppressValue(runtime.memberLookup((t_16),"class"), env.opts.autoescape);
output += "\",";
frame = frame.push();
var t_23 = runtime.memberLookup((t_16),"properties");
if(t_23) {t_23 = runtime.fromIterator(t_23);
var t_22 = t_23.length;
for(var t_21=0; t_21 < t_23.length; t_21++) {
var t_24 = t_23[t_21];
frame.set("p", t_24);
frame.set("loop.index", t_21 + 1);
frame.set("loop.index0", t_21);
frame.set("loop.revindex", t_22 - t_21);
frame.set("loop.revindex0", t_22 - t_21 - 1);
frame.set("loop.first", t_21 === 0);
frame.set("loop.last", t_21 === t_22 - 1);
frame.set("loop.length", t_22);
output += "\n        ";
output += runtime.suppressValue(t_24, env.opts.autoescape);
;
}
}
frame = frame.pop();
output += "\n    };\n}\n%}\n";
;
}
output += "\n";
;
}
}
frame = frame.pop();
output += "\n\n# Basic types\nNUMBER -> [0-9] \n{% (d) => {return parseInt(d[0]);}%}\n\nDOUBLE_NUMBER -> NUMBER NUMBER\n{% (d) => {return '' + d[0] + d[1]}%}\n\nMONTH -> DOUBLE_NUMBER\nDAY -> DOUBLE_NUMBER\nYEAR -> DOUBLE_NUMBER DOUBLE_NUMBER\n{% (d) => {return '' + d[0] + d[1]}%}\n\nDATE -> MONTH \"/\" DAY \"/\" YEAR\n{% (d) => {return '' + d[4] + '-' + d[0] + '-' + d[2]}%}\n\nWord -> [\\S]:*\n{% (d) => {return d[0].join('');}%}\n\nBRACKET_PHRASE -> \"[\" Word (__ Word):* \"]\" {% ((d) => {return d[1] + ' ' + flatten(d[2]).join(\" \");}) %}\n\nString -> dqstring {% id %}\nDouble -> decimal {% id %}\nInteger -> int {% id %}\nLong -> int {% id %}\nBoolean -> \"true\" {% id %} | \"false\" {% id %}\nDateTime -> DATE  {% id %}\n\n# https://github.com/kach/nearley/blob/master/builtin/number.ne\nunsigned_int -> [0-9]:+ {%\n    function(d) {\n        return parseInt(d[0].join(\"\"));\n    }\n%}\n\nint -> (\"-\"|\"+\"):? [0-9]:+ {%\n    function(d) {\n        if (d[0]) {\n            return parseInt(d[0][0]+d[1].join(\"\"));\n        } else {\n            return parseInt(d[1].join(\"\"));\n        }\n    }\n%}\n\nunsigned_decimal -> [0-9]:+ (\".\" [0-9]:+):? {%\n    function(d) {\n        return parseFloat(\n            d[0].join(\"\") +\n            (d[1] ? \".\"+d[1][1].join(\"\") : \"\")\n        );\n    }\n%}\n\ndecimal -> \"-\":? [0-9]:+ (\".\" [0-9]:+):? {%\n    function(d) {\n        return parseFloat(\n            (d[0] || \"\") +\n            d[1].join(\"\") +\n            (d[2] ? \".\"+d[2][1].join(\"\") : \"\")\n        );\n    }\n%}\n\npercentage -> decimal \"%\" {%\n    function(d) {\n        return d[0]/100;\n    }\n%}\n\njsonfloat -> \"-\":? [0-9]:+ (\".\" [0-9]:+):? ([eE] [+-]:? [0-9]:+):? {%\n    function(d) {\n        return parseFloat(\n            (d[0] || \"\") +\n            d[1].join(\"\") +\n            (d[2] ? \".\"+d[2][1].join(\"\") : \"\") +\n            (d[3] ? \"e\" + (d[3][1] || \"+\") + d[3][2].join(\"\") : \"\")\n        );\n    }\n%}\n\n# From https://github.com/kach/nearley/blob/master/builtin/string.ne\n# Matches various kinds of string literals\n\n# Double-quoted string\ndqstring -> \"\\\"\" dstrchar:* \"\\\"\" {% function(d) {return d[1].join(\"\"); } %}\nsqstring -> \"'\"  sstrchar:* \"'\"  {% function(d) {return d[1].join(\"\"); } %}\nbtstring -> \"`\"  [^`]:*    \"`\"  {% function(d) {return d[1].join(\"\"); } %}\n\ndstrchar -> [^\\\\\"\\n] {% id %}\n    | \"\\\\\" strescape {%\n    function(d) {\n        return JSON.parse(\"\\\"\"+d.join(\"\")+\"\\\"\");\n    }\n%}\n\nsstrchar -> [^\\\\'\\n] {% id %}\n    | \"\\\\\" strescape\n        {% function(d) { return JSON.parse(\"\\\"\"+d.join(\"\")+\"\\\"\"); } %}\n    | \"\\\\'\"\n        {% function(d) {return \"'\"; } %}\n\nstrescape -> [\"\\\\/bfnrt] {% id %}\n    | \"u\" [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] {%\n    function(d) {\n        return d.join(\"\");\n    }\n%}\n\n# From https://github.com/kach/nearley/blob/master/builtin/whitespace.ne\n# Whitespace: `_` is optional, `__` is mandatory.\n_  -> wschar:* {% function(d) {return null;} %}\n__ -> wschar:+ {% function(d) {return null;} %}\n\nwschar -> [ \\t\\n\\v\\f] {% id %}";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
