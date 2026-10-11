# Migrating to cicero-core 3.0

Version 3.0 changes how `@accordproject/cicero-core` is published. It now ships ES module builds selected through an `exports` map, and the prebuilt UMD browser bundle is gone. The aim is smaller browser bundles: a bundler now takes cicero-core's browser build and shares one copy of every dependency with the rest of the application, where the UMD bundle carried its own copy of Concerto, the markdown packages and the Node polyfills.

**Who is affected:** if you import cicero-core by name, from Node or through a modern bundler, probably nobody:

```js
// CommonJS — unchanged
const { Template } = require('@accordproject/cicero-core');

// ES modules — unchanged
import { Template } from '@accordproject/cicero-core';
```

You are affected if you:

- load the UMD bundle (`umd/cicero-core.js`) with a `<script>` tag, or read `window['cicero-core']`;
- import a file inside the package, such as `@accordproject/cicero-core/lib/...`;
- build with a tool that does not read the `exports` field (webpack 4, browserify, Parcel 1);
- load cicero-core with both `import` and `require()` in one Node process.

These commands find the first two:

```bash
grep -rnE "@accordproject/cicero-core/(lib|umd|types)/" --include=*.js --include=*.ts --include=*.mjs --include=*.html .
grep -rnE "window\[['\"]cicero-core['\"]\]" .
```

## Breaking changes

### The UMD bundle is removed

`@accordproject/cicero-core` no longer publishes `umd/cicero-core.js`, and the top-level `browser` field that pointed at it is gone.

- **Bundler users** (webpack 5, Vite, Rollup, esbuild): no change is needed. These bundlers read the `browser` condition of the `exports` map, which selects `lib/esm-browser`. That build already replaces Node builtins (`fs`, `path`, `util`) with empty modules and computes hashes without Node's `crypto`, so the `resolve.fallback` entries and `crypto-browserify`, `stream-browserify` and `process` polyfills that the UMD era called for are no longer required by cicero-core. It imports `Buffer` from the `buffer` package, now a dependency of cicero-core, so no `Buffer` global is needed either.
- **`<script>` tag users:** add a bundler to your build and import the package normally. `lib/esm-browser` is a module graph, not a single file, and it imports its dependencies by package name (`@accordproject/concerto-core`, the markdown packages, `jszip`, `node-forge`, ...). Some of those are CommonJS, so an import map alone cannot load the graph in a browser.
- **Tools that do not read `exports`** (webpack 4, browserify, Parcel 1): with the `browser` field gone, these fall back to `main`, the CommonJS build for Node, which needs Node polyfills. Upgrade to a bundler that supports `exports`.

### Deep imports no longer resolve

The package now declares an `exports` map exposing only the package root and `./package.json`. Importing a file inside the package, for example `@accordproject/cicero-core/lib/templateloader`, fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` in Node and an equivalent error in bundlers. Import from the package root instead: `Clause`, `Template`, `TemplateLoader`, `TemplateLibrary`, `Script` and `version` are all exported there. If something you need is not exported from the root, please open an issue.

### `import` and `require()` load different files

`require()` still loads the CommonJS build in `lib/`, but Node's `import` now loads the ES module build in `lib/esm/`. A process that reaches cicero-core both ways holds two copies of it, and an `instanceof` check fails on an object created by the other copy. Use one module system for cicero-core in a process. If something fails in a way that looks impossible, run `npm ls @accordproject/cicero-core` and check that it is installed once.

## Not breaking

- Imports from the package root, with `require()` or `import`.
- TypeScript types: `types` still points at `lib/index.d.ts`.
- Template hashes, template identifiers and archive signatures. Hashes are now computed with a pure JavaScript SHA-256 (`@noble/hashes`) instead of Node's `crypto` module, and are identical.
- `Template.toArchive()` still returns a `Buffer`, and `Metadata.getLogo()` still returns a `Buffer`, in Node and in the browser.

## What you get

Bundling `{ Template }` for the browser with esbuild (`--bundle --minify`), Concerto and the markdown packages included:

| | Minified | Gzipped |
|---|---:|---:|
| 2.2.0, through the UMD bundle | 3,414 KB | 1,023 KB |
| 3.0, through `lib/esm-browser` | 1,152 KB | 327 KB |
