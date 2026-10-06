# Strudel Tutor

A personal tutor for becoming fluent in [Strudel](https://strudel.cc), the browser live-coding language for music. It's aimed at synthwave, synth-pop, and chiptune.

You type every answer in **your own** Strudel setup. The tutor proposes a short daily session (spaced-repetition reviews plus one new micro-lesson with drills), plays reference solutions through a hidden Strudel engine, and lets you grade yourself by ear and by eye. Every code snippet and factual claim is machine-checked against a pinned Strudel version.

- **Status:** milestone **M1** (vertical slice: unit U3a "Sound basics"). See `docs/qa/M1-walkthrough.md`.
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
| `pnpm test` | Unit tests (verifier and app) |
| `pnpm e2e` | Playwright end-to-end tests, including gate L6 (every reference audibly plays in real Chromium) |
| `pnpm typecheck` | TypeScript across the workspace |
| `bash ci/run-all.sh` | Everything above, exactly as CI runs it |
| `bash ci/drift.sh` | Checks the content against the *latest* Strudel release. Report only |

On a fresh machine, run `pnpm --filter @tutor/web exec playwright install chromium` once before `pnpm e2e`. Gate L8b needs the pinned Strudel source clone; `ci/run-all.sh` sets it up automatically, or run `bash tools/strudel-ref/generate-doc-json.sh --setup-only`.

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

AGPL-3.0-or-later, because the app bundles Strudel. See `LICENSE` and `ATTRIBUTION.md`.
