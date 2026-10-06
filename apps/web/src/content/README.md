# content/

- `bundle.json`: the verified bundle written by `pnpm verify` (packages/verify). It is generated and gitignored.
- `fixture.bundle.json`: a small bundle that conforms to the schema but is **not verified content**. Regenerate it with `pnpm --filter @tudel/web fixture` (`scripts/make-fixture.mjs`). Unit tests always use it. Dev and build use it only when `bundle.json` is missing, or when `TUDEL_FIXTURE=1` is set, and the app then shows a purple "FIXTURE CONTENT" banner.
- `index.ts`: loads the bundle through the Vite alias `@content-bundle` (see `vite.config.ts`) and validates it with the zod `Bundle` schema in dev and tests.
- `indexBundle.ts`: lookups (curriculum order, primary variants, lessons by skill).
- `snippets.ts`: pure helpers that list playable snippets. Gate L6 uses them both in the app (`#/__smoke`) and in Node (the Playwright test).
