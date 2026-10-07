# tudel

<img src="apps/web/public/avatar.jpeg" alt="tudel avatar" width="480">

**tudel** (**tu**tor + stru**del**) is a personal tutor for becoming fluent in [Strudel](https://strudel.cc), the browser live-coding language for music. It's aimed at synthwave, synth-pop, and chiptune.

**Try it:** https://maxpblum.github.io/tudel/ (a fully static site; progress stays in your browser)

You type every answer in **your own** Strudel setup. tudel proposes a short daily session (spaced-repetition reviews plus one new micro-lesson with drills), plays reference solutions through a hidden Strudel engine, and lets you grade yourself by ear and by eye. Every code snippet and factual claim is machine-checked against a pinned Strudel version.

- **Status:** milestone **M1** was approved by the learner on 2026-10-06 (`docs/qa/M1-walkthrough.md`). **M2** (foundation: units U1, U2, U3b, U4 and the skill map, search, overrides, fluency and glossaries) is completed, validated 100% green across all gates, unit tests, and Playwright e2e with L6 audio, and is ready for learner trial (see `docs/qa/M2-walkthrough.md`, `docs/qa/M2-exploratory.md`, and `docs/plan/M2-status.md`).
- **Design:** `PROPOSAL.md` (binding requirements) and `ARCHITECTURE.md`.

## Quickstart

Requires Node ≥ 22, pnpm 10, and git.

```sh
pnpm install
pnpm start            # verify content → build the app → serve it at http://localhost:4173
```

Open the URL in a desktop browser. Audio starts on your first click. Progress lives in your browser (IndexedDB). Use **Data → Export** to back it up as JSON.

## Everyday commands

| Command | What it does |
|---|---|
| `pnpm verify` | Runs all content gates (L0–L5, L7, L8) and writes the verified bundle the app reads |
| `pnpm verify --explain <id>` | Explains, gate by gate, why one variant or lesson passed or failed |
| `pnpm verify --update` | Re-records event snapshots (gate L3) after an intended content change. Review the diff |
| `pnpm dev` | Verifies, then runs the app dev server |
| `pnpm test` | Fast parallel unit tests across the workspace |
| `pnpm test:coverage` | Unit tests with coverage check (enforces ≥90% line coverage on web store/session/srs) |
| `pnpm e2e` | Playwright end-to-end tests, including gate L6 (every reference audibly plays in real Chromium) |
| `pnpm typecheck` | TypeScript across the workspace |
| `bash ci/run-all.sh` | Everything above, exactly as CI runs it |
| `pnpm pages` | Builds from a clean tree and force-pushes the static site to the `gh-pages` branch (see Deploying) |
| `bash ci/drift.sh` | Checks the content against the *latest* Strudel release. Report only |

On a fresh machine, run `pnpm --filter @tudel/web exec playwright install chromium` once before `pnpm e2e`. Gate L8b needs the pinned Strudel source clone; `ci/run-all.sh` sets it up automatically, or run `bash tools/strudel-ref/generate-doc-json.sh --setup-only`.

## Deploying

The app is plain static files (Vite build, hash routing, IndexedDB storage), hosted on GitHub Pages from the `gh-pages` branch. To update the live site, commit your changes and run:

```sh
pnpm pages
```

This runs `tools/deploy-pages.sh`, which builds with verified content and pushes `apps/web/dist` as a single commit (`Deploy <sha>`) to `gh-pages`. One-time setup: in the repo's Settings → Pages, set the source to the `gh-pages` branch, `/ (root)`.

## Where to look next

| You want to… | Read |
|---|---|
| understand the system | `ARCHITECTURE.md` |
| contribute as an LLM agent | `AGENTS.md` |
| add or change lessons and exercises | `docs/content-authoring.md`, `docs/house-style.md`, `docs/time-conventions.md` |
| understand the accuracy gates | `docs/verification.md` |
| see the curriculum | `docs/curriculum.md`, `docs/strudel-idioms.md` |
| see why things are the way they are | `docs/decisions/` (ADRs) |
| release a milestone | `docs/qa/release-checklist.md` |

## License

AGPL-3.0-or-later, because the app bundles Strudel. The hosted app links back to this source. See `LICENSE` and `ATTRIBUTION.md`.
