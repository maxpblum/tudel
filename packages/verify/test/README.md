# Verifier tests

`pnpm --filter @tutor/verify test` (Vitest). Strudel and tonal load through esbuild bundles that `vitest.config.ts` builds first (see ADR 0002). Nothing is mocked.

- `fixtures/good/`: a small content tree (2 skills, 2 lessons, 6 variants) that passes every gate and uses every directive. `fixtures/good-snapshots/` holds its L3 snapshots. Regenerate them with `node scripts/run.mjs verify --content test/fixtures/good --snapshots test/fixtures/good-snapshots --src-root test/fixtures/fake-strudel --no-bundle --update`.
- `fixtures/fake-strudel/`: a stand-in for the pinned clone, so L8b tests don't need it.
- `helpers.ts`: `workspace()` copies the good fixture to a temp dir, so each test breaks **one** thing and asserts that the right gate fails with the right message. That proves the gates catch their failure class, not just that good content passes.
- One `*.test.ts` per gate, plus `directives`, `compile` (bundle shape, determinism, citations, rolls) and `cli` (the bundled CLI end to end: exit codes, report, `--explain`).

The tests use the real `tools/strudel-ref/doc.json` and `sounds.json`.
