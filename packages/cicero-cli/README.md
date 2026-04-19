# Cicero CLI

Command line interface (for parsing, execution, creating archives, etc.) for Accord Project legal templates

## Documentation

http://docs.accordproject.org

## Installation

```
npm install -g @accordproject/cicero-cli
```

## Usage

Run `cicero --help` for usage instructions.

### Commands

| Command | Purpose |
|---------|---------|
| `cicero archive` | Create a `.cta` template archive from a template directory |
| `cicero compile` | Generate code for a target platform from a template's model |
| `cicero get` | Save local copies of a template's external model dependencies |
| `cicero validate` | Validate a template directory without producing output artifacts |
| `cicero verify` | Verify the signature of a signed template archive |

### `cicero validate`

Fast, side-effect-free check that a template directory is well-formed. Runs
layered structural checks (package.json, grammar, model) followed by a full
coherence check via `Template.fromDirectory`. Emits a per-check `✓`/`✗`
summary and exits with code `1` on any failure — suitable for CI pipelines.

```bash
cicero validate --template <path> [--warnings]
```

Options:
- `--template <path>` — path to the template directory (defaults to `.`)
- `--warnings` — surface non-fatal warnings (e.g. orphan `logic/` directory,
  since Ergo is no longer executed by `cicero-core`)

Example (valid template):

```
$ cicero validate --template ./my-template
✓ package.json valid
✓ text/grammar.tem.md found
✓ model/ found 2 .cto file(s)
✓ Template coherence grammar parsed, model validated, template variables match the model

Template is valid.
```

Example (broken template):

```
$ cicero validate --template ./my-template
✓ package.json valid
✓ text/grammar.tem.md found
✓ model/ found 1 .cto file(s)
✗ model/ — Undeclared type "PaymentAmount" in "property ...TemplateModel.amount"

Validation failed. 1 error found.
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
