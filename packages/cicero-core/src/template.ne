# Dynamically Generated
@{%
    function compact(v) {
        if (Array.isArray(v)) {
            return v.reduce((a, v) => (v === null || v === undefined || (v && v.length === 0) ) ? a : (a.push(v), a), []);
        } else {
            return v;
        }
    }

    function flatten(v) {
        let r;
        if (Array.isArray(v)) {
            r = v.reduce((a,v) => (a.push(...((v && Array.isArray(v)) ? flatten(v) : [v])), a), []);
        } else {
            r = v;
        }
        r = compact(r);
        return r;
        }
%}

<% for r in textRules %>
{{ r.prefix }} -> <% for s in r.symbols -%>{{ s }} <% endfor %>
{% ([ {{ r.symbols }} ]) => {
    return {
        <% if r.class %>$class: "{{ r.class }}",<% endif %>
        <% if r.identifier %>{{ r.identifier }},<% endif %>
        <%- for p in r.properties %>
        {{ p }}
        <%- endfor %>
    };
}
%}
<% endfor %>

<% for r in modelRules %>
{{ r.prefix }} -> <% for s in r.symbols -%>{{ s }} <% endfor %>
<% if r.properties %>
{% ( data ) => {
    return {
        $class: "{{ r.class }}",
        <%- for p in r.properties %>
        {{ p }}
        <%- endfor %>
    };
}
%}
<% endif %>
<% endfor %>

# Basic types
NUMBER -> [0-9] 
{% (d) => {return parseInt(d[0]);}%}

DOUBLE_NUMBER -> NUMBER NUMBER
{% (d) => {return '' + d[0] + d[1]}%}

MONTH -> DOUBLE_NUMBER
DAY -> DOUBLE_NUMBER
YEAR -> DOUBLE_NUMBER DOUBLE_NUMBER
{% (d) => {return '' + d[0] + d[1]}%}

DATE -> MONTH "/" DAY "/" YEAR
{% (d) => {return '' + d[4] + '-' + d[0] + '-' + d[2]}%}

Word -> [\S]:*
{% (d) => {return d[0].join('');}%}

BRACKET_PHRASE -> "[" Word (__ Word):* "]" {% ((d) => {return d[1] + ' ' + flatten(d[2]).join(" ");}) %}

String -> dqstring {% id %}
Double -> decimal {% id %}
Integer -> int {% id %}
Long -> int {% id %}
Boolean -> "true" {% id %} | "false" {% id %}
# DateTime -> DATE  {% id %}

# https://github.com/kach/nearley/blob/master/builtin/number.ne
unsigned_int -> [0-9]:+ {%
    function(d) {
        return parseInt(d[0].join(""));
    }
%}

int -> ("-"|"+"):? [0-9]:+ {%
    function(d) {
        if (d[0]) {
            return parseInt(d[0][0]+d[1].join(""));
        } else {
            return parseInt(d[1].join(""));
        }
    }
%}

unsigned_decimal -> [0-9]:+ ("." [0-9]:+):? {%
    function(d) {
        return parseFloat(
            d[0].join("") +
            (d[1] ? "."+d[1][1].join("") : "")
        );
    }
%}

decimal -> "-":? [0-9]:+ ("." [0-9]:+):? {%
    function(d) {
        return parseFloat(
            (d[0] || "") +
            d[1].join("") +
            (d[2] ? "."+d[2][1].join("") : "")
        );
    }
%}

percentage -> decimal "%" {%
    function(d) {
        return d[0]/100;
    }
%}

jsonfloat -> "-":? [0-9]:+ ("." [0-9]:+):? ([eE] [+-]:? [0-9]:+):? {%
    function(d) {
        return parseFloat(
            (d[0] || "") +
            d[1].join("") +
            (d[2] ? "."+d[2][1].join("") : "") +
            (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : "")
        );
    }
%}

# From https://github.com/kach/nearley/blob/master/builtin/string.ne
# Matches various kinds of string literals

# Double-quoted string
dqstring -> "\"" dstrchar:* "\"" {% function(d) {return d[1].join(""); } %}
sqstring -> "'"  sstrchar:* "'"  {% function(d) {return d[1].join(""); } %}
btstring -> "`"  [^`]:*    "`"  {% function(d) {return d[1].join(""); } %}

dstrchar -> [^\\"\n] {% id %}
    | "\\" strescape {%
    function(d) {
        return JSON.parse("\""+d.join("")+"\"");
    }
%}

sstrchar -> [^\\'\n] {% id %}
    | "\\" strescape
        {% function(d) { return JSON.parse("\""+d.join("")+"\""); } %}
    | "\\'"
        {% function(d) {return "'"; } %}

strescape -> ["\\/bfnrt] {% id %}
    | "u" [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] {%
    function(d) {
        return d.join("");
    }
%}

# From https://github.com/kach/nearley/blob/master/builtin/whitespace.ne
# Whitespace: `_` is optional, `__` is mandatory.
_  -> wschar:* {% function(d) {return null;} %}
__ -> wschar:+ {% function(d) {return null;} %}

wschar -> [ \t\n\v\f] {% id %}

##
## DATES AND TIME
##
##

@{%
function toNumber(d) {
	return parseInt('' + d[0] + d[1]);
}
%}

# day ordinal (1 to 31)
D -> [1-31]
{% (d) => {return parseInt(d[0])}%}

# day ordinal, with leading zero (00 to 31), disallow 00
DD -> [0-3] [0-9] {% (d, location, reject) => 
   {
	   const result = toNumber(d); 
	   if (result === 0 || result > 31) {
		   return reject;
	   }
	   else {
		   return result;
	   }
   } %} | 
      [3] [0-1] {% (d) => {return toNumber(d)}%}

# month ordinal (1 to 12)
M -> [1-12]
{% (d) => {return parseInt(d[0])}%}

# month ordinal, with leading zero (01 to 12)
MM -> [0] [1-9] {% (d) => {return toNumber(d)}%} |
      [1] [0-2] {% (d) => {return toNumber(d)}%}
	   
# short month name
MMM -> "Jan" {% (d) => {return 1;}%} | 
       "Feb" {% (d) => {return 2;}%} | 
	   "Mar" {% (d) => {return 3;}%} |
	   "Apr" {% (d) => {return 4;}%} | 
	   "May" {% (d) => {return 5;}%} |
	   "Jun" {% (d) => {return 6;}%} |
	   "Jul" {% (d) => {return 7;}%} |
	   "Aug" {% (d) => {return 8;}%} |
	   "Sep" {% (d) => {return 9;}%} |
	   "Oct" {% (d) => {return 10;}%} |
	   "Nov" {% (d) => {return 11;}%} |
	   "Dec" {% (d) => {return 12;}%}

# long month name
MMMM -> "January" {% (d) => {return 1;}%} | 
       "February" {% (d) => {return 2;}%} | 
	   "March" {% (d) => {return 3;}%} |
	   "April" {% (d) => {return 4;}%} | 
	   "May" {% (d) => {return 5;}%} |
	   "June" {% (d) => {return 6;}%} |
	   "July" {% (d) => {return 7;}%} |
	   "August" {% (d) => {return 8;}%} |
	   "September" {% (d) => {return 9;}%} |
	   "October" {% (d) => {return 10;}%} |
	   "November" {% (d) => {return 11;}%} |
	   "December" {% (d) => {return 12;}%}

# 24 hour (0 to 23)
H -> [0-9]
{% (d) => {return parseInt(d)}%}

# 24 hour, leading zero (00 to 23)
HH -> [0-1] [0-9] {% (d) => {return toNumber(d)}%} |
      [2] [0-3] {% (d) => {return toNumber(d)}%}

# minute, leading zero (00 to 59)
mm -> [0-5] [0-9] {% (d) => {return toNumber(d)}%}

# second, leading zero (00 to 59)
ss -> [0-5] [0-9] {% (d) => {return toNumber(d)}%}

# milliseconds, 3 digits (000 to 999)
SSS -> [0-9] [0-9] [0-9]
{% (d) => {return parseInt('' + d[0] + d[1] + d[2])}%}

# year, 4 digits (0000 to 9999)
YYYY ->[0-9] [0-9] [0-9] [0-9]
{% (d) => {return parseInt('' + d[0] + d[1] + d[2] + d[3])}%}

# Timezone Offset
TZ_OFFSET -> ("+"|"-") HH ":" mm
{% (d) => {return d[0] + d[1] + ":" + d[3]}%}

# UTC time
UTC -> "Z" {% id %}

# Timezone (either UTC or an offset)
TZ -> TZ_OFFSET {% id %} | 
      UTC {% id %}

# Date format
DateTime -> DD " " MMM " " YYYY " " HH ":" mm ":" ss " " SSS TZ
{% (d) => {
	return {
        "$class" : "ParsedDateTime",
		"year": d[4], 
		"month": d[2], 
		"day": d[0], 
		"hour": d[6], 
		"minute": d[8], 
		"second": d[10], 
		"millisecond": d[12], 
		"timezone": d[13]
	};}
%}