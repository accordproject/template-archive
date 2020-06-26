This is text
{{#if booleanProperty}}This is optional text{{/if}}
This is mode text
{{#ulist addresses}}
This is an address: {{city}}, {{country}}
{{/ulist}}

relationshipProperty:
{{#with relationshipProperty}}
  Signed by {{name}} ({{email}})
  At: {{#with address}}{{city}}, {{country}}{{/with}}
  Of Gender: {{gender}}{{/with}}