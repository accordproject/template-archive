# Legacy Runtime Cicero 2

A template that targets cicero 2.x (`accordproject.cicero` is `^2.0.0`) but
whose model still imports `org.accordproject.runtime@0.2.0` for its request,
response, state and obligation types, as most templates in
cicero-template-library do. cicero-core reports these legacy runtime types
alongside the 1.0 ones, so the template keeps working.
