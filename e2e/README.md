# Browser End-to-End Tests

[Playwright](https://playwright.dev) tests that load the `@accordproject/cicero-core` UMD bundle into a real headless Chromium and call the public API. These tests exist to catch packaging/bundling regressions that the Node unit tests miss — for example, accidentally relying on a Node-only module on a browser code path, or breaking the in-browser `node-forge` signing.

## Run

From the repository root:

```bash
npm install
npm run test:e2e
```

`npm test` from the `e2e` directory runs `pretest` first, which:
1. Builds the `cicero-core` TS package (`tsc`) and its UMD bundle (`webpack`) via `build:dist`.
2. Installs the Chromium browser used by Playwright (cached after first run).

## What's covered

| Spec | Asserts |
|------|---------|
| `cicero-core.spec.ts` | `Template` is exported on the global; a signed archive built in Node loads in the browser via `Template.fromArchive`; the author signature auto-verifies on reload; and PKCS#12 signing rejects a wrong passphrase — all running `node-forge` crypto inside the browser. |

A signed `.cta` archive is produced in Node (`Template.fromDirectory` + `toArchive` with a p12 keystore) in `beforeAll`, then exercised in-browser, since `fromDirectory` is Node-only (see the cicero-core README "Browser support").

## Adding a test

The UMD bundle exports its API onto `window['cicero-core']`. Spec pattern:

```ts
await page.goto('about:blank');
await page.addScriptTag({ path: path.resolve(__dirname, '../../packages/cicero-core/umd/cicero-core.js') });

const result = await page.evaluate(async () => {
    const { Template } = (window as any)['cicero-core'];
    // ... exercise the public API ...
});

expect(result).toBe(/* … */);
```
