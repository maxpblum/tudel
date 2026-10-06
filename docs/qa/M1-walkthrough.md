# M1 walkthrough: vertical slice, unit U3a "Sound basics"

*2026-10-05 · Strudel pinned at `f610965f` (`@strudel/core` 1.2.6, `@strudel/web` 1.3.0)*

M1 is built and has passed the release checklist (`docs/qa/release-checklist.md`). **It now waits for the learner's trial.** Per R-MILESTONES, no M2 work starts until the learner has used it for a few days and approved the feel.

## How to run it

```sh
pnpm install
pnpm start        # verify → build → http://localhost:4173
```

Open the URL in a desktop browser. Audio starts on the first click, and your progress stays in this browser profile. **Data → Export** saves a JSON backup.

## What's in it

**Content (U3a)** has 5 skills, 5 lessons, and 20 exercise variants.

| Skill | Prereqs | Variants |
|---|---|---|
| Choose a waveform (`note`, `s`) | none | spec-to-code, dictation (D major, square), match-by-ear, describe-to-code |
| Low-pass filter and resonance (`lpf`, `lpq`) | waveforms | spec-to-code, describe-to-code, match-by-ear |
| High-pass filter (`hpf`) | low-pass | spec-to-code, describe-to-code, sweep, match-by-ear |
| Amplitude envelope and gain (`attack`…`release`, `adsr`, `gain`) | waveforms, low-pass | spec-to-code, recall, describe-to-code, match-by-ear, dictation (3+3+2 pluck line) |
| Filter sweeps over bars (`sine`, `saw`, `range`, `slow`) | low-pass | 3 × sweep, match-by-ear |

Each lesson is about 200–250 words. Each has things to hear (play or compare buttons), a plot or diagram, and a classical bridge (organ registration, swell box and vowels, orchestrating the bass line, articulation, terraced dynamics versus hairpins). The timbre lexicon has 12 entries (bright, dark, warm, buzzy, hollow, …), each with cited sources, a status, and a confidence level.

**App:**
- **Today** proposes due reviews, then extra practice of introduced skills, then one new skill (its lesson plus drills), sized to your chosen length.
- **Exercise view** goes prompt, then notation or target audio (with loop and slow-down), then reveal: code with a copy button, accepted alternatives, a listen-for checklist, and live and static piano rolls. Then you rate Again / Hard / Good / Easy.
- **Overrides:** show again soon, retire, mark known / skip ahead, and restore.
- **Library:** units, then skills, then lessons and variants, all practicable out of session.
- **Data:** export and import.

Every action is saved to an event log before the screen changes. You can close the tab at any point and resume exactly.

## A narrated tour (first run)

1. **Today** says: 0 reviews due, new skill "Choose a waveform", lesson plus 4 drills, about 16 min. It tells you this is shorter than the 20-minute default because that's all the material available so far.
2. **Lesson "Four waveforms, four registrations."** Play each waveform, read the organ-stop bridge, and note the mini-notation primer, which the later dictation needs.
3. **Drills.** For example, the dictation shows a two-bar D-major phrase on a staff. You type it in your own Strudel, then reveal the reference, copy or play it, check the listen-for items, and rate.
4. **Next day.** Today schedules reviews by FSRS and introduces the low-pass skill, the only skill whose prerequisites are met. A *match-by-ear* exercise plays a ringing bass with its code hidden, and asks you to match cutoff and resonance by ear.

## Release checklist results

| Section | Result | Evidence |
|---|---|---|
| 1. Automated gates | ✅ `bash ci/run-all.sh` green **from a clean copy** (no `node_modules`, no clone, no bundle) in 3m13s. Typecheck is clean, and all of L0–L5, L7, and L8 pass. Unit tests: verify 138/138, web 64/64. E2E: 59/59, including **L6: all 35 snippets audible in real Chromium**. `doc.json --check` is up to date. **Drift:** latest npm equals the pin, so the reports are identical. Coverage on `srs`, `store`, and `session` is 100% of lines. | this document; `ci/` |
| 2. Adversarial content review | ✅ 28 findings (0 blockers, 4 majors, 8 minors, 16 nits). All are resolved: the majors fixed the signal-chain claim, an untaught mini-notation, a missing prerequisite, and the filter plot's Q being drawn in the wrong units. `pnpm verify` is green again afterwards. | `docs/qa/reviews/M1-content.md` (Findings plus Resolutions) |
| 3. Exploratory pass | ✅ All 9 items pass. 5 bugs were found and fixed, each with a regression test: invisible dark-mode code, a double-click race that duplicated events, audio that kept looping after navigating away, overlapping plot labels, and offline notation. Then 6 design gaps were fixed: the session-length fill, dropping a retired skill's remaining steps, feedback for "show again soon", one rating per library view, the all-skipped message, and fluency time across closed tabs. | `docs/qa/M1-exploratory.md`, `docs/qa/screenshots/M1/` |
| 4. Walkthrough | ✅ | this file |

## Known limitations (deliberately left for M2 or later)

- **Thin content:** only U3a exists, so sessions can't reach 20 minutes yet and interleaving across units can't be observed.
- **Not built yet (M2 scope):** search, the skill-map view, glossaries other than the timbre lexicon, focus on a unit, suspend a skill, and the fluency trend display. Fluency times are recorded but not shown.
- **Network sounds untested with real content:** no M1 snippet uses sample banks, so the per-snippet "needs network" path is exercised only by fixtures.
- **Lexicon rule enforced by a script, not a gate:** the rule "every qualitative word in a prompt maps to a lexicon entry" is enforced by the content author's checker, not yet by gate L8d. This is an M2 follow-up.
- **Small polish items:** notation appears without a placeholder; the live piano roll is an empty box until playback starts; Strudel logs noisy fetch errors to the console when offline.
- **Two deviations from PROPOSAL.md, both recorded in ADRs:**
  - `@strudel/soundfonts` is a direct dependency, because pnpm needs it for the prebake's dynamic import (ADR 0102).
  - The verifier runs as an esbuild bundle, not plain Node, because of a packaging issue in `@kabelsalat/web` (ADR 0002).
- **Broken image link in the proposal:** `PROPOSAL.md` §7 links an architecture image at a path on another machine. `ARCHITECTURE.md` has a self-contained diagram instead.

## What the learner should evaluate during the trial

1. **Pacing:** does Today feel like the right amount, and is the lesson-to-drill ratio right?
2. **Lessons:** are they at the right level (no beginner theory), and do the classical bridges help?
3. **Exercises:** are the prompts clear enough that you know when you've got it right? Does match-by-ear feel possible?
4. **Spaced repetition:** do reviews come back at sensible intervals over several days?
5. **Feel:** visual design, playback, and the copy-then-type flow with your own tool.

Record feedback anywhere convenient. It becomes the input to M2 planning.
