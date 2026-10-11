# Cicero Core

Core classes to manage the grammar, models and logic of Accord Project legal templates.

## Documentation

http://docs.accordproject.org

## Installation

```
npm install @accordproject/cicero-core --save
```

## Usage

`cicero-core` is a native TypeScript package, typed via `lib/index.d.ts`. Its `exports` map
selects one of three builds:

- `require()` loads the CommonJS build in `lib/`;
- Node's `import` loads the ES module build in `lib/esm/`;
- a bundler targeting the web (webpack 5, Vite, Rollup, esbuild) loads the browser ES module
  build in `lib/esm-browser/`.

```js
import { Template, Clause, TemplateLoader, TemplateLibrary } from '@accordproject/cicero-core';
```

There is no prebuilt browser bundle; import the package from a bundled application. See
[MIGRATION.md](../../MIGRATION.md) if you used the UMD bundle of earlier versions.

## Browser support

The browser build replaces Node built-ins (`fs`, `path`, `util`) with empty modules. APIs that read from the filesystem or the network are therefore
**not available in the browser** and will throw if called. Browser usage is intended for
in-memory archives (e.g. an archive fetched as an `ArrayBuffer`).

**Not available in the browser (Node-only):**

- `Template.fromDirectory()` — reads a template directory from disk.
- `Template.fromUrl()` and the archive loaders — `DefaultArchiveLoader`,
  `HTTPArchiveLoader`, `GitHubArchiveLoader`, `CompositeArchiveLoader`, `APArchiveLoader`
  (filesystem / URL backed loading).
- `TemplateLibrary` operations that read remote indices or use the on-disk cache.
- Any disk-writing helper in the template saver (e.g. extracting an archive to a directory).

**Available in the browser:**

- `Template.fromArchive(buffer)` — load a (`.cta`) archive from an `ArrayBuffer`/`Uint8Array`.
- `template.toArchive(language, options)` — including PKCS#12 signing/verification
  (the cryptography uses the pure-JS `node-forge` and runs in the browser).
- `getMetadata()`, `getModelManager()`, `getTemplate()`, `getLogicManager()` and the
  draft/trigger logic.

These are exercised by the Playwright end-to-end tests in the repository's `e2e/` workspace,
which bundle `lib/esm-browser` and run it in a headless Chromium.

## Development

`cicero-core` is written in TypeScript (`src/`) and compiled to `lib/` with `tsc`. Requires
Node.js >= 22.

```bash
npm run build         # tsc: src -> lib (+ .d.ts), then esbuild: lib/esm and lib/esm-browser
npm run test:esm      # smoke test of the ES module builds (after build)
npm run lint          # eslint + license header check
npm test              # lint + build + jest unit tests
npm run test:cov      # the above, with coverage
```

Browser end-to-end (Playwright) tests live in the repo's `e2e/` workspace; run them from the
repository root with `npm run test:e2e`.

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
