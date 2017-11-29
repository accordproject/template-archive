=============================
cicero parse
=============================

Loads a template from a directory on disk and then parses input DSL text using the template.
If successful the template model is printed to console. If there are syntax errors in the DSL
text the line and column and error information are printed.

Options::

    cicero parse

    Options:
    --help         Show help                                             [boolean]
    --version      Show version number                                   [boolean]
    --template     path to the directory with the template
    --dsl          path to the clause text
    --verbose, -v                                                 [default: false]

=============================
cicero execute
=============================

Loads a template from a directory on disk and then attempts to create a clause from input
DSL text. The clause is then executed by the engine, passing in JSON data. If successful the
engine response is printed to the console.

Options::

    cicero execute

    Options:
    --help         Show help                                             [boolean]
    --version      Show version number                                   [boolean]
    --template     path to the directory with the template
    --dsl          path to the clause text
    --data         path to the request JSON data
    --verbose, -v                                                 [default: false]