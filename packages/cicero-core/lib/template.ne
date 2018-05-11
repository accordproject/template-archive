# Dynamically Generated
@builtin "number.ne"
@builtin "string.ne"
@builtin "whitespace.ne"
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

<% for r in templateTextRules %>
{{ r.prefix }} -> <% for s in r.symbols -%>{{ s }} <% endfor %>
{% ([ {{ r.symbols }} ]) => {
    return {
        $class: "{{ r.fqn }}",
        {{ r.identifier }}{{ "," if r.identifier }}
        <%- for p in r.properties %>
        {{ p }}
        <%- endfor %>
    };
}
%}
<% endfor %>

<% for r in templateModelRules %>
{{ r }}
<% endfor %>

{{ modelRules }}

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
DateTime -> DATE  {% id %}