# Architecture

Strudel Tutor has three planes that never mix:

```
  content/ (Markdown + YAML)          packages/verify (Node only)                       apps/web (browser only)
 ┌──────────────────────────┐   ┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
 │ skills.yaml              │   │ L0 schema + skill graph               │   │ content/  load + validate bundle      │
 │ units/<u>/lessons/*.md   │──▶│ L1 evaluate (headless Strudel repl)   │   │ session/  Today builder, rotation     │
 │ units/<u>/exercises/*.yaml│  │ L2 vocabulary vs doc.json, sounds     │   │ srs/      ts-fsrs over skills         │
 │ glossary/*.yaml          │   │ L3 event snapshots   L4 ABC agreement │   │ store/    append-only IndexedDB log   │
 └──────────────────────────┘   │ L5 equivalence  L7 style  L8 prose    │   │ engine/   hidden @strudel/web player  │
                                │ compile: Shiki, Graphviz, piano rolls │   │ notation/ abcjs   ui/ React views     │
 tools/strudel-ref/             └──────────────────┬────────────────────┘   └───────────────────▲───────────────────┘
  pin.json, doc.json, sounds.json                  │ writes only if all gates pass             │ reads only this
  .cache/strudel (pinned clone)  ─────────────────▶│  apps/web/src/content/bundle.json ─────────┘
                                                   ▼
                        tests/e2e (Playwright): flows + gate L6 (real audio, RMS > threshold)
```

1. **Content** is plain text, written by humans or LLMs. It is never read by the app directly.
2. **Verification** (`packages/verify`) is the single gate content must pass. It evaluates every snippet with Strudel's real `repl()` from `@strudel/core` at the pinned version, headlessly in Node (bundled with esbuild; see ADR 0002). It checks names against Strudel's own generated `doc.json` and writes a deterministic JSON **bundle**.
3. **App** (`apps/web`) is a static Vite + React SPA that reads only the bundle. Its shape is defined by zod schemas in `packages/content-schema`, which both planes share.

## Key data flows

- **Content to app:** `pnpm verify` compiles Markdown directives into typed `Block`s (prose HTML, highlighted code, play buttons, staff notation, diagrams, plots, compares). It also attaches a static piano roll to each variant.
- **Learning state:** every user action appends an event (`session_started`, `variant_shown`, `revealed`, `rated`, `override`, …) to IndexedDB *before* the UI moves on. All state, including the FSRS cards per skill, the current session step, and variant history, is a pure replay of the log. That makes resuming after a closed tab exact and JSON export/import lossless (ADR 0101).
- **Scheduling:** FSRS schedules *skills*. A rating on a variant updates its first (primary) skill. Reviews rotate to an unseen or least-recently-seen variant (ADR 0100).
- **Playback:** `@strudel/web` is loaded lazily and initialized with a copy of strudel.cc's prebake, so sounds match the learner's own tool. Synths work offline, while sample banks come from the Strudel CDN (ADR 0102). An AnalyserNode tap lets gate L6 prove every reference is audible.

## Accuracy model

| Question | Answered by |
|---|---|
| Does the code run? | L1 (Node) and L6 (real browser audio) |
| Do the names exist at this Strudel version? | L2 (functions vs `doc.json`), L2b (sound names vs `sounds.json`), L8a (names in prose) |
| Does it produce the intended notes and parameters? | L3 snapshots (reviewed diffs), L4 notation vs events, L5 alternative solutions are identical |
| Are claims sourced? | L8b `{cite}` links to `doc.json` or pinned source lines; L8d lexicon sources and confidence |
| Is it good code to imitate? | L7 (Prettier, quotes, primary names) |
| Does the sound match a word like "warm"? | **No gate can prove this.** The cited timbre lexicon and the learner's ears cover it |
| Did a new Strudel release change behavior? | `ci/drift.sh` |

Plus a human or LLM **adversarial content review** per batch (`docs/qa/reviews/`).

## Repository map

See `PROPOSAL.md` §9. Each source folder has a README.md. Decisions are in `docs/decisions/`, numbered in blocks: 0001–0099 for verification and tooling, 0100–0199 for the app, 0200–0299 for content.
