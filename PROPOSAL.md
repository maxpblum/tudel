# Strudel Tutor — Proposal & Design

*Status: **direction approved by the learner**; ready to be expanded into a detailed implementation plan · 2026-10-05*

> [!NOTE]
> **How to read this document.** It is self-contained: you shouldn't need the conversation that produced it.
> - **Part 1:** the problem, the settled requirements, and the approved proposal.
> - **Part 2:** the detailed design.
> - **Part 3:** where each of the learner's original requirements is covered, and what is explicitly out of scope.
> - **Appendix:** the research findings (URLs, versions, licenses, verified source excerpts) that an implementation planner will need.
>
> This document is a proposal and design, **not** a step-by-step implementation plan. **"The learner"** means the single person this tutor is for. It is a personal tool, not a product for many users.

---

## Part 1 — Proposal

### 1. The problem

The learner is an advanced classical musician: a pianist, choral singer and conductor, and trombone and tuba player with strong Western music theory. They know a little jazz vocabulary (they're unsure, for example, what "sus" means). They have a working mental model of audio graphs from using the browser's Web Audio API: oscillators feed other nodes, signals modulate parameters, and so on.

They want to become **fluent in [Strudel](https://strudel.cc)**, the browser-based JavaScript port of the TidalCycles live-coding language for music. Fluent means being able to get a musical idea (a melody, harmony, a timbre heard in the head, a filter sweep, a song's dramatic arc) into idiomatic, readable Strudel code quickly, before forgetting it.

- **Target styles:** synthwave, synth-pop, and chiptune.
- **Sound sources:** only Strudel's built-in synths, effects, and standard sample banks. **No** external samples and **no** recordings of the learner's own.

The learner **already has their own Strudel editing and playback setup** and does not want a code editor in the tutor. They type answers in their own tool. What they need is a **tutor** that:

1. **Teaches by doing.** Short drills that the learner types themselves, to build muscle memory, with short lessons and visuals in between.
2. **Proactively offers what to work on next**, using spaced repetition, the way a good teacher would. The learner can always override it and can browse and re-learn anything.
3. **Is reliably correct.** Every code snippet, reference solution, and factual claim is checked by machine against a real, pinned Strudel version.
4. **Is maintainable by anyone.** It's documented and tested at every level, with no dependency on any company's infrastructure, so a human or an LLM can pick it up and extend it.
5. **Builds real taste.** It teaches the "zen of Strudel" (idioms versus antipatterns), readable high-level code structure, code whose shape shows a song's dramatic arc, and each genre from beginner to advanced.

### 2. Settled requirements

These were decided with the learner and are **binding** on any implementation plan.

| ID | Requirement |
|---|---|
| R-RUN | **A local static web app.** No backend server, no accounts. Progress is stored in the browser and can be exported and imported as a JSON file. |
| R-GRADE | **The learner grades their own work** by comparing it to a reference solution, by ear and by eye. The app **never** auto-grades. |
| R-SRS | **Spaced repetition:** after each exercise the learner rates it Again / Hard / Good / Easy, and the FSRS algorithm schedules the next review. The learner can always override: *show again soon*, *retire (mastered)*, *skip ahead*. |
| R-ACCURACY | **CI verifies every code snippet and reference solution by machine** against a pinned Strudel version: evaluation succeeds, every function used exists in that version, and the pattern's events match committed snapshots. Content is cross-checked against Strudel's own source, docs, and tests. |
| R-SESSION | **Opening the app proposes a "Today" session** of 15–30 minutes: due reviews plus one new micro-lesson and its drills. A skill map and library sit alongside for browsing and jumping anywhere. **Closing the tab mid-session must lose no progress.** |
| R-NO-EDITOR | **No code editor or REPL in the app.** Wherever code is shown, there is a **copy-to-clipboard** button. The default stance is that the learner types it themselves. |
| R-PLAYBACK | **The app plays reference solutions live**, through a hidden Strudel audio engine with no editor UI. It uses no pre-rendered audio files. |
| R-MILESTONES | **Three milestones, with hard gates between them.** M1 is a vertical slice; M2 is the foundation; M3 is the full curriculum. No work toward a milestone begins until the previous one is complete and approved by the learner. |
| R-NOTATION | **Dictation exercises show real staff notation**, rendered with abcjs from ABC text. CI checks that the notation and the reference solution agree. |
| R-SAMPLES | **The app loads Strudel's standard sample banks** (drum machines and similar) from the same public CDN strudel.cc uses, so the app sounds like the learner's own tool. Synth waveforms work offline either way. |
| R-SKILLS | **Spaced repetition schedules *skills*, not individual exercises.** Each skill has a pool of exercise *variants*, and reviews rotate to an unseen or least-recently-seen variant. |
| R-PIN | **Pin an exact Strudel version** for the app and CI, plus a separate **drift-check** CI job that runs all content against the latest Strudel release and reports differences. |
| R-PEDAGOGY | **Lessons build on the learner's classical background:** voice leading, inversions, figured-bass-style thinking, counterpoint, orchestration and timbre. They teach pop and jazz chord symbols, modes, and genre progressions as needed, and **skip beginner music theory**. |
| R-STACK | **Approved:** Proposal A (below), with **React** as the UI framework and unit **U3a "Sound basics"** as the M1 vertical slice. |
| R-AGNOSTIC | **Nothing may depend on Google or any other company's internal infrastructure** to build, run, test, or read the docs. |

### 3. Research summary

The full findings, with URLs, are in the Appendix.

- **Strudel's canonical repository is on Codeberg** (`codeberg.org/uzu/strudel`). Its packages are published on npm under AGPL-3.0-or-later.
- **Strudel code can be evaluated without a browser, in Node.** Strudel's own test suite does exactly this and snapshots the resulting musical events. The tutor's verifier copies that approach.
- **`@strudel/web` provides a hidden playback engine** that needs no editor.
- **strudel.cc loads its "built-in" sample banks from a CDN.** The app must reproduce that setup to sound the same.
- **Strudel's authoritative function list (`doc.json`) is not committed to the repo.** It has to be generated from a pinned clone of the source.
- **Libraries to reuse:** `ts-fsrs` (spaced repetition), `abcjs` (notation), `tonal` (music theory math), and `@strudel/draw` (live piano roll).
- **Content to adapt:** the official Strudel workshop, and *BreathOfStrudle* (CC BY 4.0).

### 4. Proposals considered

**Proposal A — a purpose-built static tutor app ✅ *approved*.**
A TypeScript single-page app (Vite + React). A build-time content pipeline compiles Markdown and YAML lessons and exercises into a verified JSON bundle. The app has a Today session, a skill map and library, and an exercise view with notation, a reveal button, copy, and self-rating. A hidden `@strudel/web` engine plays the references, `ts-fsrs` schedules, and an event log in browser storage makes sessions resumable. A Node verification package gates every content change.
*Pros:* fits every requirement, keeps all state and flow in one place, and is the simplest design for an LLM to extend. *Con:* the library and navigation UI must be built.

**Proposal B — a tutor built on Starlight**, the Astro documentation framework. Lessons become MDX pages, and Today and the exercises are interactive "islands." *Pros:* search, navigation, and copy buttons come free. *Cons:* every page change is a full navigation, which complicates resuming a session, and the design mixes two mental models (docs site and app). Not chosen.

**Proposal C — Anki as the shell, plus a lesson website.** *Pros:* scheduler, sync, and mobile apps come free. *Cons:* JavaScript and audio inside Anki cards are fragile, Anki schedules notes rather than skills (which violates R-SKILLS), and there is no combined session. Not chosen.

### 5. Approved direction

Build **Proposal A**, borrowing two ideas from Proposal B:

1. Code blocks highlighted with Shiki at build time.
2. Client-side full-text search over the content bundle.

Deliver it in three gated milestones: **M1** (vertical slice: unit U3a "Sound basics"), then **M2** (foundation), then **M3** (full curriculum).

---

## Part 2 — Detailed design

### 6. Terms used in this document

| Term | Meaning |
|---|---|
| **Cycle** | Strudel's basic unit of musical time. A pattern repeats each cycle. The project convention for how cycles map to bars and beats is fixed in `docs/time-conventions.md`, e.g. 1 cycle = 1 bar, with the tempo set by `setcpm`. |
| **Hap** | One event a Strudel pattern produces: a time span plus a value such as note, sound, or `lpf`. `pattern.queryArc(begin, end)` returns them. |
| **Mini-notation** | Strudel's compact rhythm and sequence syntax inside strings, e.g. `"c3 [e3 g3] <a3 b3>"`. |
| **Prebake** | Code that registers sounds (synths and sample banks) before playback. strudel.cc has its own prebake; the app copies it. |
| **Skill** | The unit that spaced repetition schedules (e.g. "shape a pluck with a filter envelope"). It has one lesson and a pool of variants. |
| **Variant** | One concrete exercise that practices one or more skills. |
| **Reference solution** | The canonical answer to a variant, plus optional accepted alternatives. Verified by machine; shown and playable on reveal. |
| **Gate / layer (L0–L8)** | One automated content check in the verification package (§11). |
| **FSRS** | Free Spaced Repetition Scheduler, a modern algorithm for scheduling reviews. The `ts-fsrs` library implements it. |
| **The learner's tool** | The learner's own existing Strudel editor and player, outside this app. |

### 7. Architecture

![Architecture](/usr/local/google/home/blampo/.gemini/jetski/brain/fc29f53a-b560-4133-a896-451194a82843/architecture.png)

There are three planes, and they never mix:

1. **Content** (`content/`) is plain Markdown and YAML, written by humans or LLMs.
2. **Verification** (`packages/verify/`) runs only in Node, plus a browser smoke test. It is the single gate content must pass to enter the bundle.
3. **App** (`apps/web/`) runs only in the browser and reads nothing but the verified bundle.

### 8. Reuse stack

| Need | Choice | License | Notes |
|---|---|---|---|
| Hidden playback | `@strudel/web` at an exact pinned version | AGPL-3.0+ | Initialized with a prebake that mirrors strudel.cc's `prebake.mjs` (Appendix A.4). Browsers block audio until the user interacts with the page, so the engine starts on the first click. |
| Headless evaluation | `@strudel/transpiler` + `@strudel/core` (+ `@strudel/mini`, `@strudel/tonal`, `@strudel/webaudio`) | AGPL-3.0+ | Mirrors Strudel's `test/runtime.mjs` (Appendix A.2). Only audio and visual side effects are mocked. |
| Authoritative function list | `doc.json` generated from the pinned Codeberg clone | AGPL-3.0+ | Lives under `tools/strudel-ref/` (Appendix A.5). |
| Spaced repetition | `ts-fsrs` 5.x | MIT | Card state is plain JSON. Runs in Node and the browser. |
| Notation | `abcjs` 6.x | MIT | Renders melodies, rhythms, drum staves, and 2–4 voices to SVG. Its parser output feeds gate L4. |
| Music theory math | `tonal` 6.x (unscoped package) | MIT | Pitch normalization and chord-spelling checks. **Not** the deprecated `@tonaljs/tonal`. |
| Live visuals | `@strudel/draw` | AGPL-3.0+ | Live piano roll during playback. Static piano rolls for the library are rendered from snapshots at build time. |
| Code display | Shiki, at build time | MIT | Copy button on every code block. |
| Diagrams and skill map | Graphviz, via `@viz-js/viz` (WASM) at build time | MIT | **Assumption to confirm in M1** (not researched; see Appendix A.9). |
| Seed content | Official Strudel workshop (AGPL-3.0+), *BreathOfStrudle* (CC BY 4.0) | — | Adapted with attribution. The unlicensed community song collections are **link-only**. |
| App shell and tests | Vite + TypeScript + React; Vitest; Playwright | MIT | |

> [!IMPORTANT]
> **Licensing.** Bundling `@strudel/*` makes the app AGPL-3.0. That's acceptable for personal use. The obligation is only to publish the source if the app is ever served to others over a network. The repo carries an AGPL `LICENSE` and an `ATTRIBUTION.md`.

### 9. Codebase layout

```
strudel-tutor/
├─ README.md                  # what it is, quickstart, where to look next
├─ AGENTS.md                  # orientation for LLM contributors: invariants, how to add content, how to run gates
├─ ARCHITECTURE.md            # the three planes, data flow, diagram
├─ ATTRIBUTION.md  LICENSE    # AGPL-3.0; CC BY credits
├─ docs/
│  ├─ curriculum.md           # skill graph (rendered Graphviz), unit goals
│  ├─ content-authoring.md    # schema, pedagogy rules, worked example of adding a skill end to end
│  ├─ verification.md         # gates L0–L8, how to update snapshots, drift handling
│  ├─ strudel-idioms.md       # "zen of Strudel": idioms and antipatterns, each cited
│  ├─ house-style.md          # code style every reference solution follows (enforced by L7)
│  ├─ time-conventions.md     # cycles ↔ bars/beats and tempo conventions used by all content
│  ├─ qa/release-checklist.md # per-milestone QA protocol
│  └─ decisions/NNNN-*.md     # architecture decision records (ADRs)
├─ content/
│  ├─ skills.yaml             # skill graph: ids, units, prerequisites
│  ├─ glossary/
│  │  ├─ strudel-terms.yaml   # general audio/music term (e.g. "LFO") → how Strudel expresses it (+ doc.json link)
│  │  ├─ timbre-lexicon.yaml  # qualitative words ("warm", "bright"…) → parameter tendencies, with sources and confidence
│  │  └─ chord-symbols.yaml   # pop/jazz chord symbols → spelled tones, plus classical analogue
│  ├─ genres/*.md             # cited style sheets: synth-pop, synthwave, chiptune
│  ├─ units/<unit-id>/{lessons/*.md, exercises/*.yaml}
│  └─ projects/<id>/*.yaml    # multi-session song projects
├─ packages/
│  ├─ content-schema/         # zod schemas + TypeScript types shared by verify and app
│  └─ verify/                 # Node harness, gate implementations, CLI; __snapshots__/ holds committed golden haps
├─ tools/strudel-ref/         # version pin (git commit + npm versions) and doc.json generator
├─ apps/web/src/{engine,srs,store,session,notation,ui,content}/   # README.md in each folder
├─ tests/e2e/                 # Playwright tests
└─ ci/                        # portable CI scripts + example workflow files for common hosted CI services
```

- **Workspaces:** pnpm, the same tool Strudel itself uses.
- **One command runs everything:** `pnpm verify && pnpm test && pnpm e2e`. It runs identically on a laptop or any CI host.

### 10. Content model

**Skill** (an entry in `skills.yaml`):
- `id`, `unit`, `title`, `prereqs[]`, `summary`
- `vocabulary[]`: the Strudel functions the skill teaches. Each must exist in `doc.json`.
- `lesson`: the id of its lesson.
- `idiom_note`: a one-line "zen of Strudel" takeaway shown with the lesson, so idioms are taught from the first unit onward, not only at the end.

**Lesson** (a Markdown file of at most about 300 words, with one or two visuals). Custom directives:

| Directive | What it renders |
|---|---|
| `:::play` | A button that plays a snippet through the hidden engine |
| `:::abc` | Staff notation |
| `:::code` | A highlighted code block with a copy button |
| `:::diagram` | A Graphviz signal-flow or structure diagram |
| `:::envelope`, `:::filter`, `:::signal` | Small plots generated from parameters: an ADSR shape, a filter response, an LFO over time |
| `:::bridge` | A callout mapping a classical concept to a Strudel or pop term |
| `:::compare` | Two playable snippets that differ in exactly one parameter, with the difference highlighted |

**Exercise variant** (YAML; illustrative):

```yaml
id: snd.warm-pad.v03
skills: [snd.filter-envelope, snd.timbre-warm]
type: describe-to-code       # one of the types in §11
difficulty: 2                # 1–5
prompt: "A warm, slowly blooming pad under a C minor triad…"   # Markdown
abc: null                    # ABC notation string, used by dictation types
starter: null                # given code, used by transform and refactor types
hide_reference_code_until_reveal: true   # e.g. match-by-ear plays the target without showing code
solutions:                   # ≥1; the first is canonical, the rest are accepted alternatives
  - code: |
      note("c3,eb3,g3").s("sawtooth").lpf(…)…
listen_for: ["Soft onset (slow attack)", "Dull, not buzzy (low cutoff)"]   # self-assessment checklist shown on reveal
rubric: null                 # creative types: constraints the learner checks themselves against
verify:
  cycles: 4                  # how many cycles L3/L4/L5 query
  snapshot: true             # L3 on/off
  abc_agreement: null        # L4 config, e.g. {voice: 0, compare: [pitch, onset, duration]}
  equivalent_solutions: true # L5: all solutions must produce identical haps
sources: [{strudel-doc: lpf}, {lexicon: warm}]   # provenance for L8
```

> [!NOTE]
> **All Strudel code in this document is illustrative** and has **not** been verified. Never copy it into content without running the gates. Every function name in the curriculum table (§12) is a *candidate* until gate L2 confirms it exists in the pinned `doc.json`.

### 11. Exercise types

Every type ends the same way: the learner writes code in their own tool, then reveals the reference solution (with copy and play buttons and a listening checklist or rubric), then rates the exercise.

| Type | What the learner gets | What it trains |
|---|---|---|
| `dictation` | Staff notation (abcjs) | Melody, rhythm, drum beats, homophony, polyphony |
| `ear-dictation` | Audio only, played by the hidden engine, with loop and slow-down controls | Writing down what they hear |
| `spec-to-code` | A technical spec (e.g. "saw lead, low-pass at 800 Hz with resonance, short pluck envelope") | Mechanics, so syntax doesn't slow them down |
| `describe-to-code` | A qualitative description (e.g. "warm, breathy pad that blooms") | Turning a described sound into code, using canonical meanings from the timbre lexicon |
| `match-by-ear` | A target sound played with its code hidden | Recreating a heard timbre. The core skill of "imagine a sound and make it happen" |
| `transform` | Starter code plus an operation | Transposing, inverting, reversing, doubling or halving speed, canon, changing register |
| `sweep` | A spec of change over time | Sweeps across a beat, bar, or verse at a chosen speed and direction, or slow oscillation |
| `recall` | A short prompt (e.g. "Make this half-time") | Quick syntax recall, flashcard-style |
| `read-the-code` | A finished piece | Predicting the sound and the arc, then playing it to check |
| `refactor` | Working but clumsy code | Spotting antipatterns and rewriting idiomatically |
| `creative` | An open brief plus a rubric | Creativity. The reference is just one example |
| `arrange` | Parts provided | Layering, buses (`orbit`), song form |
| `project` | A multi-session song brief with checkpoints | Longer songs with a dramatic arc (see Projects, §14) |

### 12. Curriculum

Units form a **skill graph** (a DAG of prerequisites), not a fixed sequence. The Today session picks the next new skill among those whose prerequisites are met.

| Milestone | Unit | Core content (Strudel names are candidates until verified by L2) |
|---|---|---|
| **M1** | **U3a Sound basics** | Waveforms (`sawtooth`, `square`, `triangle`, `sine` via `s(...)`), `note`, filters (`lpf`, `lpq`, `hpf`), ADSR envelope, `gain`. Must include at least one each of `dictation`, `describe-to-code`, `match-by-ear`, and `sweep`, so every widget and gate is exercised |
| M2 | U1 Time & rhythm | Cycles and the time conventions; mini-notation (`[]`, `<>`, `*`, `/`, `~`, `@`, `!`, `,`, Euclidean rhythms); `s`, `bank`, `stack`, `setcpm`; drum dictation |
| M2 | U2 Pitch, voices & harmony basics | `note` / `n` with `scale`. **Efficient homophony:** chords in mini-notation with `,`, and parallel voices derived from one line by adding an interval offset rather than writing two lines by hand. **Polyphony:** independent stacked parts. **Basics of `chord` symbols plus `voicing`:** simple inversions and register control, simple diatonic progressions |
| M2 | U3b Sound, continued | Filter envelopes, resonance, FM, noise, effects (`room`, `delay`), the timbre lexicon |
| M2 | U4 Time & modulation | Continuous signals (`sine`, `saw`, `perlin`), `.range`, `.slow`, `.segment`; sweeps tied to bars and verses |
| M3 | U5 Advanced harmony & voicing | Voicing dictionaries and controls, voice-leading constraints, slash chords, sus/add9/sevenths (sus means the third is *replaced* by the second or fourth), modal mixture, genre-typical progressions |
| M3 | U6 Pattern transforms | Transposition, melodic inversion (see risk K3), reversal, `fast` / `slow`, canons with `off` / `superimpose`, conditional variation with `every` and similar |
| M3 | U7 Layering & buses | `orbit`, shared effects, named parts, mixing |
| M3 | U8 Detune & wobble | Micro-detune as timbre versus audible detune; slow pitch drift; the detuned-synth style associated with the *Stranger Things* soundtrack (the sound, never the copyrighted theme) |
| M3 | U9–U11 Genres | Chiptune, synth-pop, and synthwave, each at beginner, intermediate, and advanced levels, built from the cited genre style sheets |
| M3 | U12 Form, arc & zen | `arrange` and section composition, code whose shape shows the arc, large-scale readability. Consolidates the idiom notes taught since U1 |

### 13. Content verification gates

All gates run on every content change, both in CI and locally via `pnpm verify`.

| Gate | What it checks |
|---|---|
| **L0 Schema** | zod validation; skill graph integrity (no cycles, no dangling prerequisites); at least 3 variants per skill |
| **L1 Evaluate** | Every snippet and solution evaluates without error in a Node scope that mirrors Strudel's `test/runtime.mjs`. Only audio and visual helpers are mocked, never anything being taught |
| **L2 Vocabulary** | Every function or method called in the code (found by walking its syntax tree) exists in the pinned `doc.json`, or is on a small allowlist where each entry is justified in an ADR. This catches names that L1's mocks would otherwise hide (Appendix A.2) |
| **L3 Snapshots** | The haps from `queryArc(0, cycles)`, formatted with `hap.show(true)` as Strudel's own tests do, match committed golden files. Any change appears as a reviewable diff |
| **L4 Notation agreement** | The ABC notation, parsed by abcjs with pitches normalized by `tonal`, matches the reference's haps in pitch, onset, and duration for the configured voice |
| **L5 Equivalence** | All accepted solutions produce identical haps |
| **L6 Browser audio smoke test** | Playwright with headless Chromium (autoplay allowed) plays every reference through the real engine and prebake. Requires no console errors and non-silent output (RMS level above a threshold). Tests that use sample banks are tagged, since they need the network |
| **L7 House style** | Reference code matches a fixed formatter configuration plus the lint rules in `house-style.md`. Reference solutions must *model* good code |
| **L8 Prose claims** | (a) Every inline code span in lessons, glossaries, and genre sheets that names a Strudel function exists in `doc.json`. (b) Every behavioral claim about a function, marked with a `{cite}` directive, points to a `doc.json` entry or a pinned source line. (c) Chord symbols in prose and in `chord-symbols.yaml` are spelled correctly according to `tonal`. (d) Every timbre-lexicon and genre-sheet entry has a source and a confidence level |
| **Drift job** (separate CI job) | Runs L1–L5 and L8a against the latest Strudel release and reports a diff. Bumping the pin is always a deliberate, reviewed change |
| **Adversarial content review** (a process, per content batch) | A separate reviewer, human or LLM, gets the batch plus the pinned Strudel source and is asked to *refute* every claim. Findings and their resolutions are recorded with the change |

> [!WARNING]
> **What these gates cannot prove.** They prove the code is valid, the musical structure is correct, and the parameters are present and audible. They **cannot** prove that a sound matches a qualitative word like "warm." The cited timbre lexicon and the learner's own ears cover that.

### 14. App behavior

- **Session builder.** Due reviews come first, capped and interleaved across units. Then one new skill: its lesson, then 2–3 of its variants. The default session is about 20 minutes and can be adjusted.
- **Overrides,** available at any time: *show again soon*, *retire (mastered)*, *skip ahead / mark as known*, *focus on a unit*, *suspend a skill*, *browse anything*.
- **Variant rotation.** When a skill comes up, show a variant the learner hasn't seen, or else the one seen longest ago.
- **Relearning.** If a skill is rated *Again* twice in a row, its next review re-shows the lesson as a refresher before the drill. Any lesson can be reopened from the exercise view.
- **Fluency tracking.** Time from prompt to reveal is recorded for each variant and shown as a per-skill trend. It is **informational only and never feeds FSRS.** The learner's goal is to express ideas quickly.
- **Projects.** Multi-session song projects sit **outside** the FSRS queue. Each has a brief, ordered checkpoints (e.g. groove, then harmony bed, then lead, then arc), a reference arrangement per checkpoint, and a self-review rubric. Today shows "continue project" as an optional block after reviews.
- **Library.** Every lesson, skill, and variant can be browsed and searched. It includes three glossaries (Strudel terms, timbre lexicon, chord symbols), all cross-linked to the skills that teach them, plus the skill map.
- **Persistence.** An append-only event log (`session_started`, `variant_shown`, `revealed`, `rated`, `override`, …) is written to IndexedDB on **every** action. All state, including FSRS cards, is derived by replaying the log. That makes resuming after a closed tab trivial and JSON export/import lossless. The format is versioned, with migrations.
- **Exercise view.** Prompt, then notation or audio, then Play / Stop (with loop, and slow-down for ear exercises), then Reveal (code with copy button, listening checklist or rubric, live piano roll), then Again / Hard / Good / Easy.

### 15. Testing and documentation

- **Unit tests (Vitest):** the session builder, the FSRS wrapper and overrides, variant rotation, relearning, event-log replay, and migrations. Target ≥90% line coverage on `srs/`, `store/`, and `session/`.
- **End-to-end tests (Playwright):** the full session flow, closing mid-session and resuming, overrides, library and search, copy buttons, projects, and gate L6.
- **Documentation:** a README in every folder; `ARCHITECTURE.md`; ADRs for significant decisions; an `AGENTS.md` for LLM contributors that refers to no company-internal tools; and authoring docs with a worked example. `pnpm verify --explain <variant-id>` prints why a given variant passed or failed each gate.

### 16. Milestones

**Release checklist.** No milestone is handed to the learner as ready to use until `docs/qa/release-checklist.md` passes:

1. All gates green.
2. Playwright suite green.
3. Adversarial content review done.
4. A scripted exploratory pass: fresh browser profile, closing mid-session and resuming, export/import round trip, offline behavior.
5. A written walkthrough.

| Milestone | Scope | Exit criteria |
|---|---|---|
| **M1 Vertical slice** | All plumbing; gates L0–L8; Today, exercise view, minimal library, persistence and resume, export/import; unit **U3a Sound basics** with about 5 skills × 3+ variants across at least 4 exercise types, including `match-by-ear` | Release checklist passes; the learner uses it for a few days and approves the feel. **No M2 work before this.** |
| **M2 Foundation** | Units U1, U2, U3b, U4; skill map; search; full overrides; relearning; fluency tracking; glossaries | Release checklist passes; learner approval. **No M3 work before this.** |
| **M3 Full curriculum** | Units U5–U12; genre tracks; projects, with at least 3 song projects (one per genre) | Release checklist passes; drift job clean |

### 17. Risks

| ID | Risk | Mitigation |
|---|---|---|
| K1 | Some Strudel functions appear neither in `doc.json` nor among the test mocks | Allowlist entries in L2 require an ADR; L6 confirms them in a real browser |
| K2 | Sample banks need the network (R-SAMPLES) | Tag sample-dependent content; show an offline banner; vendoring the samples locally is a possible future ADR |
| K3 | Strudel may have no single "melodic inversion" function | Teach inversion as an idiom the gates verify (e.g. scale degrees reflected around an axis). Never present it as a built-in unless `doc.json` shows one |
| K4 | abcjs drum notation, and abcjs parsing in Node, are unproven for this use | Prove both early in M1. Fallback: run L4 under jsdom or Playwright; document an ABC percussion mapping |
| K5 | `@strudel/web` assigns `window.initStrudel` when imported, so it can't be imported in plain Node | Keep the app engine (browser only) separate from the verify harness (Node), which imports the underlying packages directly (Appendix A.3) |
| K6 | AGPL obligations | Documented; they apply only if the app is ever hosted for others |

---

## Part 3 — Requirements traceability

This part lists every item on the learner's original wish list and shows where the design covers it. Section numbers refer to Part 2.

### Drills and exercise content

| # | Requirement | Where it's covered |
|---|---|---|
| 1 | Write melodies and play them back to check | `dictation`, `ear-dictation`, `spec-to-code` (§11). The learner plays their own attempt in their own tool; the app plays the reference, with loop and slow-down (§14) |
| 2 | Homophonic harmony, **using Strudel features to make it efficient** | U2 explicitly teaches mini-notation chords and parallel voices derived from one line (§12); `refactor` drills turn hand-duplicated voices into the idiomatic form (§11) |
| 3 | Polyphony: different pitches and rhythms per voice | U2 (stacked independent parts); multi-voice `dictation` |
| 4 | Chord progressions | Basics in U2 (M2, the foundation); genre progressions in U5 and U9–U11 (M3) |
| 5 | Using Strudel features to control voicing, inversion, and register | Basics in U2 (M2); advanced voicing controls and voice-leading constraints in U5 (M3) |
| 6 | Transforming an existing pattern: invert, transpose, double or half time, two voices a few beats and steps apart | U6 and `transform` (§11–12). Canon (time offset plus pitch offset) is an explicit family of variants. Inversion is handled carefully (risk K3) |
| 7 | Filters | U3a, U3b, `sweep`, the `:::filter` plot |
| 8 | **Combining waveforms, filters, envelopes, and resonance to make an imagined sound real** (flagged by the learner as especially important) | `match-by-ear` (hear a target, recreate it), `describe-to-code`, `spec-to-code`, `:::compare` lessons that isolate one parameter. `match-by-ear` is required in M1 |
| 9 | Timbre changing over a beat, bar, or verse at chosen speed and direction, or slow oscillation | U4, `sweep`, the `:::signal` plot, and `docs/time-conventions.md` so "a bar" and "a verse" mean the same thing everywhere |
| 10 | Detuning: subtle (timbre) vs. audible (*Stranger Things*-style) | U8 |
| 11 | Exercises that call for creativity | `creative`, with a self-check rubric; `project` |
| 12 | Dictation from sheet music: rhythm, drum beat, melody, multi-voice piece | `dictation` with abcjs, plus gate L4 for notation/solution agreement. Drum notation must be proven in M1 (risk K4) |
| 13 | Technical spec exercises ("a sawtooth melody with X, Y, Z and this envelope") | `spec-to-code` |
| 14 | Qualitative descriptions, learning canonical meanings of words like "warm" | `describe-to-code`, plus `timbre-lexicon.yaml` (sourced, with confidence, canonical vs. subjective marked) and gate L8d |
| 15 | Layering and buses for effects shared across voices | U7, `arrange` |
| 16 | Learning everything in Strudel's own vocabulary | Gate L2 (code), gate L8a (prose), and the `strudel-terms.yaml` glossary mapping general audio terms to Strudel's |
| 17 | Longer songs that use repetition, variation, and layering to build a readable dramatic arc | Projects (§14), U12, `read-the-code`, `arrange` |
| 18 | Beautifully readable code, at both small and large scale | `house-style.md` plus gate L7 (every reference models good style), `refactor`, U12 |
| 19 | Mental models, the "zen of Strudel," antipatterns | A per-skill `idiom_note` from U1 onward, `docs/strudel-idioms.md`, `refactor`, U12 |
| 20 | Canonical synth-pop, synthwave, and chiptune at beginner, intermediate, and advanced levels | U9–U11, built on cited genre style sheets (gate L8d) |

### Learning experience

| # | Requirement | Where it's covered |
|---|---|---|
| 21 | Spaced repetition, like Duolingo or a good teacher | FSRS on skills, with rotating variants (R-SRS, R-SKILLS) |
| 22 | Short lessons with visuals between exercises; learn by doing where possible | Lessons of ≤300 words with directives (§10) |
| 23 | The tutor proactively offers what's needed | The Today session (§14) |
| 24 | The learner can override what comes next and what needs repetition | Overrides (§14) |
| 25 | Browse, review, and re-learn | Library, search, glossaries, relearning (§14) |
| 26 | Fluency: expressing ideas fast enough not to lose them | Fluency tracking (§14), `recall` drills |

### Build, quality, and portability

| # | Requirement | Where it's covered |
|---|---|---|
| 27 | Reuse open-source kits where they fit | §8, from verified research (Appendix) |
| 28 | Build new things only where nothing suitable exists | Only the app shell, the verifier, and the content are custom |
| 29 | Extremely high confidence that content is accurate | Gates L0–L8, the drift job, adversarial review (§13) |
| 30 | Clear docs and tests at every level | §9, §15 |
| 31 | QA-tested before being handed over as complete | Release checklist per milestone (§16) |
| 32 | No dependence on Google infrastructure; any LLM can take over | R-AGNOSTIC; portable `ci/`; an `AGENTS.md` free of company-internal tools |

### Explicitly out of scope

| Item | Reason |
|---|---|
| Auto-grading of the learner's code | Declined by the learner (R-GRADE) |
| An in-app editor or REPL | The learner has their own tool (R-NO-EDITOR) |
| A "paste my attempt" button to play the learner's code next to the reference | Considered and declined by the learner. Comparison happens in the learner's own tool |
| Help comparing the learner's attempt against the reference by ear, beyond playing the reference | Out of scope by the learner's decision. The app plays the reference (with loop and slow-down); the learner plays their own attempt in their own tool |
| External samples or recordings of the learner's own | Out of scope per the original request |
| Mobile-first layout | Typing Strudel is a desktop activity. The layout only needs to be readable on a phone |
| MIDI keyboard input | Contradicts the "type it yourself" goal; possible future idea |
| An LLM coach for creative feedback | Deferred. Would conflict with self-grading (R-GRADE) |

---

## Appendix — Research and verification findings

These findings come from a multi-agent web research pass (two independent researchers, an adjudicator for disputed facts, a verify-and-merge pass, and a ranker), plus direct source checks of three Strudel files (A.2–A.4). **No new verification was done for this appendix.** Each fact carries its provenance:

- **[Direct]**: the source was read directly, and its content is quoted or summarized below.
- **[Adjudicated]**: researchers disagreed and an adjudicator settled it from primary sources (the npm registry JSON, repo files).
- **[Verified]**: confirmed in the verify-and-merge pass.
- **[Unverified]**: claimed by a researcher but not independently confirmed. Re-check before relying on it.

### A.1 Package versions and licenses (as of 2026-10-05)

| Package | Version | Published | License | Provenance | Source |
|---|---|---|---|---|---|
| `@strudel/core` | 1.2.6 | 2026-01-17 | AGPL-3.0-or-later | [Adjudicated] | https://registry.npmjs.org/@strudel/core |
| `@strudel/transpiler` | 1.2.6 | 2026-01-17 | AGPL-3.0-or-later | [Verified] | https://www.npmjs.com/package/@strudel/transpiler |
| `@strudel/mini` | 1.2.6 | 2026-01-17 | AGPL-3.0-or-later | [Verified] | https://www.npmjs.com/package/@strudel/mini |
| `@strudel/tonal` | 1.2.6 | 2026-01-17 | AGPL-3.0-or-later | [Verified] | https://www.npmjs.com/package/@strudel/tonal |
| `@strudel/draw` | 1.2.6 | 2026-01-17 | AGPL-3.0-or-later | [Verified] | https://www.npmjs.com/package/@strudel/draw |
| `@strudel/web` | 1.3.0 | 2026-01-18 | AGPL-3.0-or-later | [Verified] | https://www.npmjs.com/package/@strudel/web |
| `@strudel/webaudio` | 1.3.0 (stated by one researcher; the other said 1.2.3) | 2026-01 | AGPL-3.0-or-later | [Unverified] version | https://www.npmjs.com/package/@strudel/webaudio |
| `superdough` | 1.3.0 | 2026-01-18 | AGPL-3.0-or-later | [Adjudicated] | https://registry.npmjs.org/superdough |
| `@strudel/repl` | 1.3.0 | 2026-01-18 | AGPL-3.0-or-later | [Adjudicated] | https://registry.npmjs.org/@strudel/repl |
| `@strudel/codemirror` | 1.3.0 | 2026-01-18 | AGPL-3.0-or-later | [Adjudicated] | https://registry.npmjs.org/@strudel/codemirror |
| `@strudel/embed` | 1.1.2 | 2026-01-17 | AGPL-3.0-or-later | [Adjudicated] | https://registry.npmjs.org/@strudel/embed |
| `@strudel/soundfonts` | 1.3.0 | 2026-01-18 | AGPL-3.0-or-later | [Unverified] | https://www.npmjs.com/package/@strudel/soundfonts |
| `ts-fsrs` | 5.4.2 | 2026 (researchers disagreed on the month: Feb vs. Sept) | MIT | [Verified] version; date uncertain | https://github.com/open-spaced-repetition/ts-fsrs · docs https://open-spaced-repetition.github.io/ts-fsrs/ |
| `abcjs` | 6.7.1 | 2026-09-21 | MIT | [Adjudicated] | https://registry.npmjs.org/abcjs · https://github.com/paulrosen/abcjs · docs https://paulrosen.github.io/abcjs/ |
| `tonal` (unscoped) | 6.5.0 | 2026-09-28 | MIT | [Adjudicated] | https://registry.npmjs.org/tonal · https://github.com/tonaljs/tonal |
| `@tonaljs/tonal` | 4.10.0, **deprecated** | 2023-01-12 | MIT | [Adjudicated] | https://registry.npmjs.org/@tonaljs/tonal |
| `@astrojs/starlight` | 0.42.5 | 2026-10-01 | MIT | [Adjudicated] (not used; Proposal B only) | https://registry.npmjs.org/@astrojs/starlight |
| `vexflow` | 5.0.0 | 2025-03-05 | MIT | [Verified] (excluded) | https://github.com/vexflow/vexflow |
| `claviature` | 0.1.0 | — | ISC | [Verified] (optional: SVG piano keyboard by Strudel co-author Felix Roos) | https://github.com/felixroos/claviature |

**Other caveats:**
- `ts-fsrs` declares `engines: node >= 20` [Verified]. Bundles for the browser without problems.
- `@strudel/*` packages are pure ESM. `@strudel/core` depends on `fraction.js` for exact rational time arithmetic [Verified per researcher].
- The researchers named Felix Roos and Alex McLean (creator of TidalCycles) as Strudel's core authors.

### A.2 Headless evaluation in Node: Strudel's own test runtime [Direct]

**Source:** https://codeberg.org/uzu/strudel/raw/branch/main/test/runtime.mjs (read 2026-10-05). Related files: `test/tunes.test.mjs` and `test/examples.test.mjs` [Adjudicated: these evaluate tunes and JSDoc examples headlessly with Vitest and snapshot the haps, e.g. `queryCode(example, 4)`].

**What it imports:**
- `evaluate` from `@strudel/transpiler`
- `evalScope` and `* as strudel` from `@strudel/core`
- `* as webaudio` from `@strudel/webaudio`
- `{ mini, m }` from `@strudel/mini/mini.mjs`
- `* as tonalHelpers` from `@strudel/tonal`
- `* as edoHelpers` from `@strudel/edo`
- `@strudel/xen/xen.mjs`
- `../website/src/repl/piano` and `../packages/gamepad/index.mjs` (repo-relative; the tutor won't need these)

**What it mocks:**
- A `MockedNode` class whose `chain`, `connect`, `toDestination`, `set`, and `start` methods all return `this`. It's used for Tone.js-era helpers (`Synth`, `PolySynth`, `FeedbackDelay`, `Chorus`, `Freeverb`, `Gain`, `Reverb`, `lowpass`, `highpass`, …).
- These `Pattern.prototype` methods are replaced with identity functions (return `this`): `osc`, `csound`, `tone`, `webdirt`, `pianoroll`, `speak`, `wave`, `filter`, `adsr`, `webaudio`, `soundfont`, `tune`, `midi`, `_scope`, `_spiral`, `_pitchwheel`, `_pianoroll`, `_spectrum`, `markcss`, `p`, `dough`.
  - ⚠️ **Note:** `filter` and `adsr` are among the mocked names. The tutor's harness should mock only what it must, and gate L2 must not trust that a name evaluated successfully.
- Stubs: `getAudioContext` (returns `{currentTime: 1}`), `getDrawContext` (returns a fake canvas context), `loadSoundfont`, `loadCsound`, `getDuration`, `midin`, `midikeys`, `sysex`, `setcps` and `setcpm` (identity), `initDough`, `Clock: {}`.

**The core query function:**
```js
export const queryCode = async (code, cycles = 1) => {
  const { pattern } = await evaluate(code);
  const haps = pattern.sortHapsByPart().queryArc(0, cycles);
  return haps.map((h) => h.show(true));
};
```
A comment in the file says: "TBD: use transpiler to support labeled statements". In other words, multi-part code using `$:` labels may not evaluate to a single `pattern` in this harness. The tutor's harness must handle that, or the house style must define how multi-part references are written.

### A.3 `@strudel/web` API [Direct]

**Source:** https://codeberg.org/uzu/strudel/raw/branch/main/packages/web/web.mjs (read 2026-10-05).

- **Re-exports:** `@strudel/core`, `@strudel/webaudio`, `@strudel/transpiler`, `@strudel/mini`, `@strudel/edo`, and `@strudel/tonal`. `@strudel/soundfonts` is commented out.
- **`defaultPrebake()`:** calls `evalScope(...)` over core, mini, edo, tonal, webaudio, and `{hush, evaluate}`, plus `registerSynthSounds()`. **It loads no samples and no soundfonts.**
- **`initStrudel(options)`:**
  - calls `initAudioOnFirstClick()`;
  - enables `miniAllStrings()` unless `options.miniAllStrings === false`;
  - creates `webaudioRepl({...replOptions, transpiler})`;
  - runs `defaultPrebake()` and then `options.prebake?.()`;
  - calls `setTime(() => repl.scheduler.now())`;
  - returns a promise that resolves to the repl.
- **Module-level side effect:** `window.initStrudel = initStrudel`. This makes the module **browser-only** (risk K5).
- **`Pattern.prototype.play()`:** calls `repl.setPattern(this, true)` once initialization is done, and throws if `initStrudel` hasn't been called.
- **`hush()`:** calls `repl.stop()`.
- **`evaluate(code, autoplay = true)`:** calls `repl.evaluate(code, autoplay)`.
- **Implication:** the app should call `initStrudel({ prebake: <a copy of strudel.cc's prebake> })`, then `evaluate(referenceCode)` to play and `hush()` to stop.

### A.4 strudel.cc's prebake: what "built-in sounds" actually means [Direct]

**Source:** https://codeberg.org/uzu/strudel/raw/branch/main/website/src/repl/prebake.mjs (read 2026-10-05). The CDN base is `https://strudel.b-cdn.net`. It loads, in parallel:

- `registerSynthSounds()` and `registerZZFXSounds()` (from `@strudel/webaudio`)
- `registerSamplesFromDB()` (website-only: user samples stored in IndexedDB; **not needed** by the tutor)
- `registerSoundfonts()`, from a dynamic `import('@strudel/soundfonts')` (a comment notes a static import fails on the server with "window is not defined")
- `samples(`${baseCDN}/piano.json`, `${baseCDN}/piano/`, {prebake: true})` (Salamander Grand Piano, CC-BY 3.0)
- `samples(`${baseCDN}/vcsl.json`, `${baseCDN}/VCSL/`, …)` (VCSL, CC0)
- `samples(`${baseCDN}/tidal-drum-machines.json`, `${baseCDN}/tidal-drum-machines/machines/`, {tag: 'drum-machines'})`
- `samples(`${baseCDN}/uzu-drumkit.json`, `${baseCDN}/uzu-drumkit/`, …)`
- `samples(`${baseCDN}/uzu-wavetables.json`, `${baseCDN}/uzu-wavetables/`, …)`
- `samples(`${baseCDN}/mridangam.json`, `${baseCDN}/mrid/`, …)`
- An inline map of Dirt-Samples subsets (`casio`, `crow`, `insect`, `wind`, `jazz`, `metal`, `east`, `space`, `numbers`, `num`) under `${baseCDN}/Dirt-Samples/`

After those it calls `aliasBank(`${baseCDN}/tidal-drum-machines-alias.json`)` (bank-name aliases). The file also defines a website-only `Pattern.prototype.piano` helper (clip, `s('piano')`, release 0.1, pan by pitch). If the tutor teaches `.piano()`, it must copy this helper or avoid it.

**Implications:**
- **The tutor's prebake must copy this list minus `registerSamplesFromDB`.**
- **Synths** (registered by `registerSynthSounds` / `registerZZFXSounds`) work offline. **Everything loaded with `samples(...)` and the soundfonts needs the network.** The verify-and-merge pass [Unverified] named the synth sounds as including `sawtooth`/`saw`, `square`/`sqr`, `triangle`/`tri`, `sine`/`sin`, `supersaw`, `bytebeat`, ZZFX sounds, and `sbd`. Confirm against `registerSynthSounds` in `packages/superdough` / `packages/webaudio` at the pinned commit.

### A.5 Authoritative function reference (`doc.json`) [Adjudicated]

- Strudel's root `package.json` defines `"jsdoc-json": "jsdoc packages/ --template ./node_modules/jsdoc-json --destination doc.json -c jsdoc/jsdoc.config.json"`. It runs automatically on `pretest`, `prebuild`, and `prestart`.
- `doc.json` is **gitignored** (reported at `.gitignore` line 43) and is **not** available at `https://codeberg.org/uzu/strudel/raw/branch/main/doc.json` (404).
- **Implication:** `tools/strudel-ref/` must clone `https://codeberg.org/uzu/strudel.git` at the pinned commit, install, and run `pnpm run jsdoc-json` (or extract `doc.json` from a website build). It powers strudel.cc's reference pages (https://strudel.cc/reference/).
- **Pinning caveat:** the npm packages (1.2.6 / 1.3.0) and the git repo at a given commit must correspond. The pin file should record both, with the git tag or commit matching the npm release.

### A.6 Repository and hosting facts

- **Canonical repo:** https://codeberg.org/uzu/strudel [Adjudicated]. The old GitHub repo `tidalcycles/strudel` is archived (one researcher said June 2025 [Unverified date]).
- **Legacy npm namespace:** `@strudel.cycles/*` is deprecated in favor of `@strudel/*` [Verified per researcher]. `@strudel/eval` is deprecated in favor of `@strudel/transpiler` [Verified per researcher].
- **Two embed components exist:**
  - `<strudel-editor>` from `@strudel/repl`: an in-page CodeMirror editor plus audio.
  - `<strudel-repl>` from `@strudel/embed`: an iframe pointing at strudel.cc.
  - Both are **out of scope** (R-NO-EDITOR) [Adjudicated].
- **Docs:**
  - Workshop: https://strudel.cc/workshop/ (source under `website/src/pages/workshop` per one researcher; another said `website/src/content/docs/workshop` [Unverified path])
  - Technical docs: https://strudel.cc/technical/
  - Function reference: https://strudel.cc/reference/
  - Embedding: https://strudel.cc/technical/embedding/ [Unverified URL]
- **License:** the whole monorepo, including the website and docs, is AGPL-3.0-or-later (https://codeberg.org/uzu/strudel/src/branch/main/LICENSE) [Verified].

### A.7 Content sources

| Source | License | Use | Provenance |
|---|---|---|---|
| Official Strudel workshop (https://strudel.cc/workshop/) | AGPL-3.0-or-later | Authoritative teaching order and examples. Adapt with attribution | [Verified] |
| *BreathOfStrudle* (https://github.com/vakofmaya/BreathOfStrudle; note the repo name misspells "Strudle") | CC BY 4.0 (LICENSE and README) | A community curriculum built on four pillars (Tools, Music Theory, Sound Design, Track Structure). Adapt with attribution; it leans toward techno and minimal, so genre material needs re-targeting | [Adjudicated] |
| `terryds/awesome-strudel` (https://github.com/terryds/awesome-strudel) | **No license** | Link-only inspiration; do not copy | [Adjudicated] |
| `eefano/strudel-songs-collection` (https://github.com/eefano/strudel-songs-collection) | **No license** | Link-only. Reportedly includes community covers in the target genres (a *Stranger Things* theme, *Blue Monday*, *Super Mario Bros.* chiptune), which are themselves covers of copyrighted works | [Adjudicated] existence and license; contents [Unverified] |

### A.8 Considered and excluded

| Item | Reason excluded |
|---|---|
| `@strudel/repl`, `@strudel/embed`, `@strudel/codemirror` | Editor or REPL components (R-NO-EDITOR) |
| TutorialKit (StackBlitz) | Built around WebContainers, which need COOP/COEP headers that interfere with loading audio assets. Heavy, and assumes an editor |
| meyda (audio feature extraction) | Its only role would be auto-grading timbre (R-GRADE) |
| OpenSheetMusicDisplay | MusicXML-centric and heavy; reportedly bundles an old VexFlow |
| Verovio | C++ compiled to WebAssembly, very large (around 27 MB unpacked); overkill for short exercises |
| VexFlow 5 | Capable but verbose imperative API. abcjs is better for concise, authored notation. Fallback if abcjs falls short |
| Tone.js | Its scheduling clock would compete with Strudel's |
| Original TidalCycles (Haskell) | Needs GHC, SuperCollider, and SuperDirt; can't run in a static browser app |
| `@strudel/soundfonts` as a *separate* dependency | Not needed separately: the strudel.cc prebake loads it dynamically, and the tutor copies that prebake |
| Ebisu / SM-2 schedulers | Superseded by FSRS |
| strudel.nvim, apfelstrudel | Desktop or editor tools, not embeddable |

### A.9 Assumptions not researched (confirm while planning M1)

- `@viz-js/viz` (Graphviz compiled to WASM) for build-time diagram rendering: availability and license.
- Shiki for build-time highlighting: the current major version, and whether a custom Strudel/JS grammar is needed. Plain JavaScript highlighting is probably enough.
- abcjs `parseOnly` (or equivalent) working in Node without a DOM (risk K4).
- abcjs percussion and drum-staff conventions (risk K4).
- Headless Chromium producing measurable Web Audio output for gate L6, with `--autoplay-policy=no-user-gesture-required` and an `AnalyserNode` tapped from the output.
- How `$:` labeled multi-part code behaves under the transpiler's `evaluate` in Node (Appendix A.2 comment).
