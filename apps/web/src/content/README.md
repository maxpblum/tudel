# content/

- `bundle.json`: the verified bundle written by `pnpm verify` (packages/verify). It is generated and gitignored.
- `fixture.bundle.json`: a small bundle that conforms to the schema but is **not verified content**. Regenerate it with `pnpm --filter @tudel/web fixture` (`scripts/make-fixture.mjs`). Unit tests always use it. Dev and build use it only when `bundle.json` is missing, or when `TUDEL_FIXTURE=1` is set, and the app then shows a purple "FIXTURE CONTENT" banner.
- `index.ts`: loads the bundle through the Vite alias `@content-bundle` (see `vite.config.ts`) and validates it with the zod `Bundle` schema in dev and tests.
- `indexBundle.ts`: lookups (curriculum order, primary variants, lessons by skill).
- `indexBundle.ts` also exposes `lexicon()`, `chords()` and `terms()` (schema v2).
- `lexiconLinks.ts`: pure `lexiconLinks(bundle)` maps each lexicon term to the skills whose lesson text, variant prompts (prose) or `listenFor` mention the term, or a synonym from its `notes` (`Synonyms: a, b` or `Also "a" and "b"`), as whole words, case-insensitively.
- `search.ts`: pure `buildSearchIndex(bundle)` and `search(index, query)`. Case-insensitive AND-matching of tokens over skills (title, id, summary, vocabulary), lessons, variants, glossary terms, lexicon terms and chords. Results are `{kind, id, title, snippet}`, title matches first. No dependencies. `text.ts` holds the HTML/block-to-text helpers.
- `snippets.ts`: pure helpers that list playable snippets. Gate L6 uses them both in the app (`#/__smoke`) and in Node (the Playwright test).
