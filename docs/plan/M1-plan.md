# M1 implementation plan: vertical slice (unit U3a "Sound basics")

This is the working plan for milestone M1 of [PROPOSAL.md](../../PROPOSAL.md). PROPOSAL.md is binding; this file turns it into workstreams with clear interfaces. Read PROPOSAL.md §2 (requirements), §9–§16, and Appendix A before working on anything here.

## 0. Already done (phase 0, de-risking spikes)

| Fact (verified 2026-10-05) | Consequence |
|---|---|
| The npm packages at the pinned versions map to Codeberg tags `@strudel/core@1.2.6` (commit `d198910a`) and `@strudel/web@1.3.0` (commit `f610965f`). `f610965f` descends from `d198910a`, and they differ only in version bumps. | Pin = `f610965f` (`tools/strudel-ref/pin.json`). npm's `gitHead` field is stale (2022); ignore it. |
| `doc.json` generates cleanly from the pinned clone (577 documented entries). | Committed at `tools/strudel-ref/doc.json` (paths normalized). Regenerate or check it with `bash tools/strudel-ref/generate-doc-json.sh [--check]`. The clone lives at `tools/strudel-ref/.cache/strudel` (gitignored) and is **the pinned source to cross-check facts against**. |
| Plain `node` can't import `@strudel/core`: its dependency `@kabelsalat/web` has a CJS `main` that breaks ESM named imports. vite-node fails for the same reason. **esbuild bundling with `mainFields: ['module','main']` works.** | The verifier is TypeScript bundled by esbuild before running (`packages/verify/scripts/run.mjs`). Vitest tests in `packages/verify` must cope with this, e.g. by testing the bundled output or configuring `server.deps.inline`. |
| `@strudel/core`'s `repl()` works headlessly with `autostart=false`: `$:` labels, `setcpm`, `adsr`, `scale` and others all evaluate. Unknown methods throw. | `packages/verify/src/harness/evaluate.ts` (done). This answers the "`$:` labels" open question in Appendix A.2: labeled multi-part code is allowed in content. |
| Strudel's default tempo is 0.5 cps (`setcpm(30)` is a no-op). | See `docs/time-conventions.md`. |
| abcjs `parseOnly()` and `tune.setUpAudio()` work in Node with no DOM. `setUpAudio().tracks[voice]` gives `{cmd:'note', pitch (MIDI, key signature and accidentals applied), start, duration}` in whole notes. Multi-voice (`V:`) and `clef=perc` parse. | Gate L4 uses `setUpAudio`. Whole note = 1 cycle (4/4). Risk K4's Node half is retired; drum *rendering* is unused in U3a. |
| Doc names: `s` (synonym `sound`), `lpf` (`cutoff`, `ctf`, `lp`), `lpq` (`resonance`), `hpf`, `attack`/`decay`/`sustain`/`release`, `adsr`, `gain`, `note`, `sine`, `range`, `slow`, and `setcpm` exist. `sawtooth`/`triangle` are sound names, not functions. `p` (the `$:` label method) is a repl-injected method that L2 must allow. | `docs/house-style.md` (written): primary names only, double quotes only. |
| Prettier (babel parser) accepts repeated `$:` labels. It normalizes `.1` to `0.1` and `'x'` to `"x"`. | Single quotes are banned in references because they change Strudel semantics. |
| pnpm 10.34.6 is installed at `~/.local/bin/pnpm`, and all workspace deps are installed. | Add deps with `pnpm add --filter <pkg> <dep>@<exact>`. If the lockfile is busy because another agent is installing, wait and retry. |

## 1. Workstreams and ownership

Three workstreams run in parallel, each in its own directories. **Don't edit files outside your ownership.** If you need a change in someone else's area (especially `packages/content-schema`), make the smallest possible additive change and say so in your final report.

| WS | Owner dirs | Summary |
|---|---|---|
| **A: Verify and bundle** | `packages/verify/**`, `tools/strudel-ref/**`, `ci/**`, `docs/verification.md`, `docs/decisions/0001–0099` | Gates L0–L5, L7, L8; the content compiler that writes the bundle; CLI; snapshots; drift job; portable CI |
| **B: Web app** | `apps/web/**`, `tests/e2e/**`, `docs/decisions/0100–0199` | Engine, persistence, SRS, session, UI, notation, export/import, Vitest, Playwright, gate L6 |
| **C: Content U3a** | `content/**`, `docs/curriculum.md`, `docs/content-authoring.md`, `docs/strudel-idioms.md`, `docs/decisions/0200–0299` | 5 skills × ≥3 variants, 5 lessons, timbre lexicon entries, authoring docs |
| Orchestrator | everything else (root docs, `docs/plan`, `docs/qa`, `house-style.md`, `time-conventions.md`, `packages/content-schema`) | Integration, adversarial review, QA, walkthrough |

## 2. Interfaces (the contracts between workstreams)

### 2.1 Content source format (C writes, A reads)

- `content/skills.yaml` holds `units:` and `skills:` (schema `SkillsFile` in `packages/content-schema/src/index.ts`).
- `content/units/<unit>/lessons/<name>.md`: YAML frontmatter `{id, title, skill}`, then a Markdown body with directives (§2.2).
- `content/units/<unit>/exercises/<variant-id>.yaml`: one variant per file (schema `Variant`). The file name equals the variant id.
- `content/glossary/timbre-lexicon.yaml` (schema `LexiconFile`).
- Variant ids are `<skill-id>.v01`, `.v02`, …, named after the variant's first skill.

### 2.2 Lesson and prompt directives (C writes, A compiles to `Block`s, B renders)

Directives are fenced blocks that start on a line `:::name{attrs}` and end on a line `:::`. They **don't nest**. The body is raw text, not Markdown, except for `bridge`. Attribute syntax is `key="value"` or a bare `flag`.

```
:::play{label="Sawtooth"}          # body = Strudel code. Renders a Play button + code (copy button).
note("c3").s("sawtooth")           #   attr `hidecode` → play button only (e.g. "what does this sound like?")
:::

:::code                            # body = Strudel code. Highlighted, copy button, no play.
note("c3")                         #   attr `antipattern` → still gated by L1/L2, exempt from L7
:::

:::abc                             # body = ABC notation → abcjs staff
X:1
...
:::

:::diagram                         # body = Graphviz DOT → SVG at build time (@viz-js/viz)
digraph { osc -> lpf -> out }
:::

:::envelope                        # body = YAML {attack, decay, sustain, release, hold?} → ADSR plot
:::filter                          # body = YAML {type: lowpass|highpass|bandpass, cutoff, q} → response plot
:::signal                          # body = YAML {shape, min, max, period, cycles, label?} → LFO-over-time plot

:::bridge{title="From the organ loft"}   # body = Markdown → classical-to-Strudel callout
...
:::

:::compare{diff="lpf 400 → 2000"}  # body = YAML {a: {label, code}, b: {label, code}}
:::                                #   two playable snippets differing in exactly one parameter
```

**Inline citations** for behavioral claims (gate L8b): `{cite doc=lpf}` (a doc.json entry) or `{cite src="packages/superdough/synth.mjs#L120-L130"}` (lines in the pinned clone). They render as small superscript references.

**Inline code spans** that look like a Strudel identifier or call (`` `lpf` ``, `` `.lpf(800)` ``, `` `s("sawtooth")` ``) are checked by L8a.

### 2.3 Bundle (A writes, B reads)

- **Path:** `apps/web/src/content/bundle.json` (gitignored, generated by `pnpm verify`). The schema is `Bundle` in `packages/content-schema`.
- **Blocks:** lessons and prompts are arrays of `Block` (an `html` block for prose, plus one block per directive). Code is pre-highlighted by Shiki (`CodeSnippet.html`), and each snippet carries `needsNetwork`.
- **Roll:** `BundleVariant.roll` holds the canonical solution's haps over `cycles`, for static piano rolls.
- B must not depend on content/ or the verifier. For unit tests and while A is unfinished, B uses its own fixture bundle that conforms to the schema.

### 2.4 Commands (single entry points; must run identically on any machine)

| Command | Does |
|---|---|
| `pnpm verify` | Runs gates L0–L5, L7, L8 over all content. Writes the bundle only if all pass. Non-zero exit on failure. |
| `pnpm verify --update` | Same, but rewrites L3 snapshot files (`packages/verify/__snapshots__/`) |
| `pnpm verify --explain <id>` | Per-gate pass/fail report with reasons for one variant or lesson |
| `pnpm test` | All Vitest suites (verify and web) |
| `pnpm e2e` | Builds the web app and runs Playwright, **including gate L6** (every reference and lesson snippet plays through the real engine with no console errors and RMS above a threshold) |
| `bash ci/run-all.sh` | `pnpm install --frozen-lockfile && pnpm verify && pnpm test && pnpm e2e` |
| `bash ci/drift.sh` | Runs L1–L5 and L8a against the latest npm Strudel release in a temp copy and prints a diff. Never fails the main build |

## 3. Definition of done for M1

1. `bash ci/run-all.sh` is green from a clean clone (except `tools/strudel-ref/.cache`, which tests that need it set up via `pnpm strudel-ref`).
2. **Content:** 5 skills in U3a, each with ≥3 variants. Across them: ≥1 each of `dictation`, `describe-to-code`, `match-by-ear`, `sweep`, plus at least one other type.
3. **App:** Today session (due reviews, then one new skill: lesson plus 2–3 variants); exercise view (prompt → notation/audio → play/stop/loop and slow-down for ear types → reveal: code + copy + listen-for + live piano roll → Again/Hard/Good/Easy); minimal library (units → skills → lesson + variants, open any); overrides (*show again soon*, *retire*, *skip ahead / mark known*); persistence via an append-only IndexedDB event log, replayed on load; resume after a closed tab; JSON export/import.
4. Unit tests at ≥90% line coverage on `apps/web/src/{srs,store,session}`. Playwright covers the session flow, close-and-resume, export/import round trip, overrides, library, copy buttons, and L6.
5. **Docs:** README, AGENTS.md, ARCHITECTURE.md, ATTRIBUTION.md, LICENSE (AGPL-3.0 text), `docs/*` per PROPOSAL §9, a README in each source folder, and ADRs.
6. The adversarial content review is done and recorded (`docs/qa/reviews/M1-content.md`).
7. The release checklist (`docs/qa/release-checklist.md`) has passed, with a written walkthrough (`docs/qa/M1-walkthrough.md`).
8. **Then stop:** the learner trials it for a few days and approves before any M2 work.

## 4. Sequencing

1. **Phase 1 (parallel):** A, B, C.
2. **Phase 2:** the orchestrator integrates the real content, bundle, and app, and makes `ci/run-all.sh` green.
3. **Phase 3:** adversarial content review by a fresh reviewer, plus a scripted exploratory QA pass. Fix the findings.
4. **Phase 4:** root docs, walkthrough, release checklist.
