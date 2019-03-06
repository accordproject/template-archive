#
# This grammar is dynamically generated
#

#
# Grammar rules from template text
#
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

#
# Grammar rules from the template data model
#
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

<% for name, grammar in grammars %>
#
# Grammar: {{ name }}
#
{{ grammar }}
<% endfor %>
