# Cicero Core

Core classes to manage the grammar, models and logic of Accord Project legal templates.

## Documentation

http://docs.accordproject.org

## Installation

```
npm install @accordproject/cicero-core --save
```

## Usage

`cicero-core` is a native TypeScript package. The Node.js entry point is `lib/index.js`
(typed via `lib/index.d.ts`); a pre-built UMD browser bundle is published at
`umd/cicero-core.js` and exposes the public API on the `cicero-core` global.

```js
// Node / bundlers
import { Template, Clause, TemplateLoader, TemplateLibrary } from '@accordproject/cicero-core';
```

```html
<!-- Browser (UMD) -->
<script src="https://unpkg.com/@accordproject/cicero-core/umd/cicero-core.js"></script>
<script>
  const { Template } = window['cicero-core'];
</script>
```

## Browser support

The browser bundle deliberately stubs out Node built-ins (`fs`, `path`, `http`/`https`,
`os`, `tls`, `net`). APIs that read from the filesystem or the network are therefore
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
which load `umd/cicero-core.js` into a headless Chromium.

## Development

`cicero-core` is written in TypeScript (`src/`) and compiled to `lib/` with `tsc`. Requires
Node.js >= 22.

```bash
npm run build         # tsc: src -> lib (+ .d.ts)
npm run webpack       # build the UMD browser bundle -> umd/cicero-core.js
npm run build:dist    # build + webpack (run before publishing)
npm run lint          # eslint + license header check
npm test              # lint + build + jest unit tests
npm run test:cov      # the above, with coverage
```

Browser end-to-end (Playwright) tests live in the repo's `e2e/` workspace; run them from the
repository root with `npm run test:e2e`.

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
