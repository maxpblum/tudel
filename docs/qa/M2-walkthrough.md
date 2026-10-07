# M2 walkthrough: foundation (units U1, U2, U3b, U4 and app features)

*2026-10-07 · Strudel pinned at `f610965f` (`@strudel/core` 1.2.6, `@strudel/web` 1.3.0)*

Milestone M2 is built and has passed the complete release checklist (`docs/qa/release-checklist.md`) and the full validation suite (`validation/run-m2-validation.sh`). **It now waits for the learner's trial.** Per R-MILESTONES, no M3 work starts until the learner approves M2.

---

## How to run it

```sh
pnpm install
pnpm start        # verify → build → http://localhost:4173
```

Open the URL in any modern desktop or mobile browser. Audio starts on the first user interaction, and progress is stored locally in IndexedDB. **Data → Export** creates a JSON backup.

---

## What's in it

### Content: 5 Units, 34 Skills, 34 Lessons, 122 Variants

| Unit | Title | Skills | Key Topics |
|---|---|---|---|
| **U1** | Time & rhythm | 7 skills, 27 variants | Cycles, tempo (`setcpm`), drum samples (`s`, `bank`), subdivision (`[]`, `*`), rests and lengths (`~`, `@`, `!`), alternate (`<>`, `/`), layers (`,`, `stack`), Euclidean rhythms (`(k,n,r)`, `euclid`). |
| **U2** | Pitch, voices & harmony | 8 skills, 27 variants | Scale degrees (`n`, `scale`), modes & keys, chord voicings (`,` in `note`), parallel intervals (`add`), polyphonic parts, chord voicing (`voicing`), register inversion, diatonic progressions & chord symbols. |
| **U3a** | Sound basics | 5 skills, 20 variants | Waveforms (`sine`, `saw`, `tri`, `square`), lowpass filter & resonance (`lpf`, `lpq`), highpass filter (`hpf`), amplitude envelope (`attack`..`release`, `gain`), filter sweeps. |
| **U3b** | Sound design II | 7 skills, 21 variants | Filter envelopes (`lpenv`, `lpdecay`), bandpass filter (`bpf`, `bpq`), FM synthesis (`fmi`, `fmh`), FM envelopes (`fmenv`), noise colours (`white`, `pink`, `brown`), reverb (`room`, `roomsize`), delay (`delay`, `delayfeedback`). |
| **U4** | Time & modulation | 7 skills, 27 variants | Continuous signals as parameters, range mapping (`range`), signal speed (`slow`, `fast`), signal sampling (`segment`), Perlin and random drift (`perlin`, `rand`), signal melodies, phrase sweeps over bars. |

Every lesson is under 300 words with audio examples (`play`, `compare`), visual diagrams or plots, a musical bridge to traditional theory or acoustics, and strictly cited claims.

### App Features

1. **Skill DAG Map (`#/map`):** Interactive SVG dependency graph of all 34 skills with prerequisite arrows, color-coded mastery/schedule status, and direct navigation. Fully responsive and horizontally scrollable on mobile (390px).
2. **Search (`#/search/:q`):** Real-time multi-field search across skill titles, descriptions, vocabulary, lesson prose, exercises, and glossary terms.
3. **Glossaries (`#/glossary/*`):**
   - **Terms:** Derived catalog of all Strudel functions with 1-sentence summaries from official `doc.json`.
   - **Chords:** 15 diatonic and extended chord symbols mapped to pitch intervals and teaching skills.
   - **Lexicon:** Curated timbre lexicon (bright, dark, warm, nasal, breathy, etc.) with cited acoustic and pedagogical sources.
4. **Enhanced Overrides:**
   - **Suspend:** Park skills without retiring them permanently.
   - **Focus on Unit:** Constrain Today's new skills and practice sessions to a chosen unit while honoring due reviews from all units.
5. **Fluency Tracking:** Informational prompt-to-reveal response time tracking with sparkline trends and median metrics on each skill page.
6. **Robust Audio Engine & Prebake:** Real-time audio playback in Web Audio API with automatic fallback and offline handling.

---

## Release Checklist Results

| Section | Result | Evidence |
|---|---|---|
| **1. Automated gates** | ✅ PASS | `validation/run-m2-validation.sh` 100% green. Gates L0–L8 pass (193 items clean). Unit tests pass (verify 149/149, web 94/94, coverage ≥90%). E2E tests: 238/238 passed in real Chromium including **all 208 audio snippets verified audible (gate L6)**. `generate-doc-json.sh --check` passes. |
| **2. Adversarial content review** | ✅ PASS | Independent adversarial refutation completed for all units (`docs/qa/reviews/M2-{u1,u2,u3b,u4}-{content,prose-style}.md`). All findings resolved. |
| **3. Exploratory pass** | ✅ PASS | All 17 items in `docs/qa/release-checklist.md` §3 verified. Screenshots captured in `docs/qa/screenshots/M2/`. Full report in `docs/qa/M2-exploratory.md`. |
| **4. Written walkthrough** | ✅ PASS | This document. |

---

## Strudel Dependency Drift Report

Captured directly from `validation/out/logs/09-drift.log`:

```text
==> resolving the latest npm versions
  @strudel/core          pinned 1.2.6    latest 1.2.6
  @strudel/mini          pinned 1.2.6    latest 1.2.6
  @strudel/tonal         pinned 1.2.6    latest 1.2.6
  @strudel/transpiler    pinned 1.2.6    latest 1.2.6
  @strudel/webaudio      pinned 1.3.0    latest 1.3.0

==> gates L1-L5 and L8 at the pin (baseline)
PASS  L0    Schema and skill graph 193 checks passed, 0 failed (193/193 items clean)
PASS  L1    Evaluate               248 checks passed, 0 failed (156/156 items clean)
PASS  L2    Vocabulary             325 checks passed, 0 failed (191/191 items clean)
PASS  L2b   Sound names            248 checks passed, 0 failed (156/156 items clean)
PASS  L3    Snapshots              156 checks passed, 0 failed (156/156 items clean)
PASS  L4    Notation agreement     32 checks passed, 0 failed (32/32 items clean)
PASS  L5    Solution equivalence   21 checks passed, 0 failed (21/21 items clean)
PASS  L8    Prose claims           731 checks passed, 0 failed (158/158 items clean)

verify passed: all gates green

==> gates L1-L5 and L8 against the latest release
PASS  L0    Schema and skill graph 193 checks passed, 0 failed (193/193 items clean)
PASS  L1    Evaluate               248 checks passed, 0 failed (156/156 items clean)
PASS  L2    Vocabulary             325 checks passed, 0 failed (191/191 items clean)
PASS  L2b   Sound names            248 checks passed, 0 failed (156/156 items clean)
PASS  L3    Snapshots              156 checks passed, 0 failed (156/156 items clean)
PASS  L4    Notation agreement     32 checks passed, 0 failed (32/32 items clean)
PASS  L5    Solution equivalence   21 checks passed, 0 failed (21/21 items clean)
PASS  L8    Prose claims           731 checks passed, 0 failed (158/158 items clean)

verify passed: all gates green

==> report diff (pinned -> latest)
  (identical reports)

==> L3 snapshot diff (pinned -> latest)
  (no hap changes)

==> drift summary
  content passes against the latest Strudel release
```

---

## Known Limitations & Planned M3 Follow-ups

1. **Sampler offline experience:** U1 drum kits use Strudel's online sound banks and require internet on initial load. When offline, sample playback shows the explicit offline warning banner while synth-based units continue playing seamlessly.
2. **Orbits / multi-bus routing:** Advanced multi-track spatialization and independent reverb per part are deferred to M3.
3. **Lexicon linting in CI:** Gate L8d lexicon matching is maintained through authoring and review checklists; an automated compile-time lint will be formalized for M3.

---

## What the Learner Should Evaluate

1. **Interleaving & Multi-Unit Scheduling:** Now that units U1 through U4 are available, does Today interleave rhythm, pitch, and timbre comfortably?
2. **Pacing of Lessons:** Do the lessons feel concise and direct? Are the musical bridges helpful?
3. **Map and Search Usability:** Is the skill map clear and intuitive for discovering relationships between musical concepts?
