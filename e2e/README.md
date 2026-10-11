# Browser End-to-End Tests

[Playwright](https://playwright.dev) tests that bundle `@accordproject/cicero-core` for the browser and call the public API in a real headless Chromium. These tests exist to catch packaging/bundling regressions that the Node unit tests miss — for example, accidentally relying on a Node-only module on a browser code path, or breaking the in-browser `node-forge` signing.

## Run

From the repository root:

```bash
npm install
npm run build
npm run test:e2e
```

`npm test` from the `e2e` directory runs `pretest` first, which installs the Chromium browser used by Playwright (cached after first run). Build the packages first, since the tests bundle `packages/cicero-core/lib/esm-browser`.

## What's covered

| Spec | Asserts |
|------|---------|
| `esm-browser.spec.ts` | esbuild resolves cicero-core through its `browser` export condition to `lib/esm-browser` and leaves Node polyfills out (except the `buffer` package); the bundle exposes the public API and `version`; a signed archive built in Node loads in the browser via `Template.fromArchive`; the author signature auto-verifies on reload; PKCS#12 signing rejects a wrong passphrase; the template hash matches the one computed in Node; the logo loads as a `Buffer`; and `toArchive` writes an archive in the browser that loads again — all running `node-forge` crypto inside the browser. |

A signed `.cta` archive is produced in Node (`Template.fromDirectory` + `toArchive` with a p12 keystore) in `beforeAll`, then exercised in-browser, since `fromDirectory` is Node-only (see the cicero-core README "Browser support").

## Adding a test

`beforeAll` bundles cicero-core with esbuild (`platform: 'browser'`, `format: 'iife'`), which exposes the exports on `window.ciceroCore`. Spec pattern:

```ts
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: bundle });

const result = await page.evaluate(async () => {
    const { Template } = (window as any).ciceroCore;
    // ... exercise the public API ...
});

expect(result).toBe(/* … */);
```
