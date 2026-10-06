# ADR 0104: How tests/e2e resolves @playwright/test

- **Status:** accepted
- **Date:** 2026-10-05
- **Workstream:** B (web app)

## Context

The proposal puts the Playwright tests in `tests/e2e/`, outside any workspace package. pnpm doesn't hoist dependencies, so `import '@playwright/test'` from `tests/e2e` can't be resolved, and adding a workspace package there would mean editing `pnpm-workspace.yaml`.

## Decision

- The Playwright config lives in `apps/web/playwright.config.ts` (`testDir: ../../tests/e2e`), and `pnpm e2e` runs it.
- `tests/e2e/tsconfig.json` maps `@playwright/test` to `tests/e2e/pw/index.js` through `paths`. Playwright's loader honors tsconfig `paths`.
- `pw/index.js` re-exports `apps/web/node_modules/@playwright/test/index.mjs`. Node resolves that symlink to the same real file the runner loads, so there is a single instance, which matters because Playwright refuses to run with two copies.
- `pw/index.d.ts` provides the types for `tsc -p tests/e2e`, part of `pnpm --filter @tudel/web typecheck`. It points at `node_modules/.pnpm/node_modules/playwright/test` (pnpm's internal hoist directory), so that TypeScript sees the real `playwright-core` paths.

## Consequences

- There are no root config changes.
- The type shim relies on pnpm's default hidden hoisting. If that changes, only the typecheck of the e2e tests breaks; running them does not.
- If `tests/e2e` ever becomes its own workspace package, delete `pw/` and the `paths` entry.
