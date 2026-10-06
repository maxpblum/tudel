# ADR 0002: Bundle the verifier with esbuild

- **Status:** accepted
- **Date:** 2026-10-05
- **Workstream:** A (verification)

## Context

The verifier must evaluate Strudel code in Node with the real `@strudel/core` (R-ACCURACY, gate L1). Plain Node can't import `@strudel/core` at the pinned version: its dependency `@kabelsalat/web` ships a CommonJS `main`, and Node's ESM resolution picks it, which breaks named imports. vite-node (and so Vitest's default module loading) fails the same way. The old `@tonaljs/*` packages that `@strudel/tonal` depends on also have a `main` entry that points at a file they don't ship. esbuild with `mainFields: ['module', 'main']` resolves all of them correctly.

## Decision

- The verifier is TypeScript, bundled by esbuild before it runs. `packages/verify/scripts/run.mjs <entry>` bundles `src/bin/<entry>.ts` to `.cache/<entry>.mjs` and runs it. `pnpm verify` goes through it.
- Packages that load native or WASM assets at runtime (`shiki`, `@viz-js/viz`, `prettier`) stay external and load from `node_modules`.
- All Strudel imports go through **one module**, `src/harness/strudel-deps.ts`. That keeps a single `@strudel/core` instance (the repl, mini-notation and tonal must share it). It also gives the tests a single seam: `vitest.config.ts` bundles that module with esbuild when the config loads and aliases it to the bundle. The rest of the verifier is tested from source.

## Consequences

- Nothing is mocked to make Strudel load. Tests exercise the same Strudel code as `pnpm verify`.
- Adding a new Strudel import means adding it to `strudel-deps.ts`, never importing `@strudel/*` elsewhere.
- If a future Strudel release fixes its packaging, the bundling step can stay. It's cheap (well under a second).
