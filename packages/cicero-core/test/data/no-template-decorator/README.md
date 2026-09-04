# No Template Decorator

A template whose model declares `concept SomethingData extends TemplateData`
and carries no `@template` decorator anywhere, used to check that
`getTemplateModel()` finds it as the model's one concrete subtype of
`TemplateData` rather than requiring the decorator.
