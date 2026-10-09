# M3 walkthrough: full curriculum (units U1–U12, genres, capstones, and zen)

*2026-10-09 · Strudel pinned at `f610965f` (`@strudel/core` 1.2.6, `@strudel/web` 1.3.0)*

Milestone M3 delivers the **complete curriculum** for tudel, expanding the foundation of M1 and M2 into an end-to-end journey from first Live Coding beats to full multi-section song production and idiomatic zen.

---

## How to run it

```sh
pnpm install
pnpm start        # verify → build → http://localhost:4173
```

Open the URL in any modern browser. Audio starts on your first click. Progress is tracked locally in your browser's IndexedDB.

---

## What's in it

### Complete Curriculum: 13 Units, 76 Skills, 76 Lessons, 286 Variants

| Unit | Title | Scope |
|---|---|---|
| **U1** | Time & rhythm | Cycles, tempo (`setcpm`), drums (`s`, `bank`), subdivision, rests, alternating, layers, Euclidean rhythms. |
| **U2** | Pitch, voices & harmony | Scale degrees (`n`, `scale`), modes, chords, parallel intervals, voicing, diatonic progressions. |
| **U3a** | Sound basics | Waveforms (`sine`, `sawtooth`, `triangle`, `square`), filters (`lpf`, `lpq`, `hpf`), envelopes, sweeps. |
| **U3b** | Sound design II | Filter envelopes (`lpenv`), bandpass (`bpf`), FM synthesis, noise colors, reverb (`room`), delay. |
| **U4** | Time & modulation | Continuous signals, range mapping, speed, sampling (`segment`), Perlin noise, phrase sweeps. |
| **U5** | Harmony & voicing | Extended chords (`add9`, `maj7`, `sus2`), slash chords & pedals, modal mixture, genre progressions. |
| **U6** | Pattern transforms | Polyrhythms with `ply`/`struct`, canons & imitations, inversion, speed & direction transforms (`rev`). |
| **U7** | Layering & buses | Multi-part mixing, send buses, room acoustics, stereo width (`pan`, `jux`), gain staging. |
| **U8** | Detune & wobble | Supersaws, detuning, pitch drift, vibrato (`vib`, `vibmod`), chorus textures. |
| **U9** | Chiptune genre track | Pulse waves & duty cycles (`pw`), fast arpeggios, NES-style noise percussion, grace notes, and **Chiptune Capstone Project**. |
| **U10** | Synth-pop genre track | Vintage drum machines, brass stabs, 80s sequenced basslines, bright hooks, and **Synth-pop Capstone Project**. |
| **U11** | Synthwave genre track | Gated drums, rolling eighth/sixteenth bass, analog warm pads, sidechain pumping, and **Synthwave Capstone Project**. |
| **U12** | Form, arc & zen | Sequential song arrangement (`arrange`), staggered entry cue sheets (`seqPLoop`), dramatic arcs & risers, score refactoring, and **The Zen of Strudel**. |

### Highlights of Milestone 3

1. **3 Capstone Song Projects:** Full creative projects (`type: project`) with multi-part rubrics for Chiptune, Synth-pop, and Synthwave.
2. **Form and Multi-Section Composition (U12):** Teaching `arrange` and `seqPLoop` to move beyond looping single patterns into structured, multi-section songs with dramatic arcs, risers, and key modulations.
3. **Zero Client Logic Modifications:** The existing client architecture cleanly handled all 286 variants and 13 units through pure data-driven bundle compilation.
4. **100% Verified Audio:** Every single playable lesson snippet and reference solution across all 13 units is evaluated and checked for audible playback in real headless Chromium (Gate L6).

---

## Release Checklist Results

| Section | Result | Evidence |
|---|---|---|
| **1. Automated gates** | ✅ PASS | `bash ci/run-all.sh` 100% green: 441 schema checks, 670 evaluations, 878 vocabulary checks, 362 snapshots, 47 notations, 30 equivalences, 670 style checks, and 1,590 prose claims. Unit tests: 243/243 passed with 100% line coverage on `session/`, `srs/`, and `store/`. E2E tests: 590/590 passed in Playwright including all audio snippets audible in Gate L6. |
| **2. Adversarial content review** | ✅ PASS | Adversarial style and accuracy reviews recorded in `docs/qa/reviews/M3-batch1-review-u5-u6.md`, `M3-batch1-review-u7-u8.md`, `M3-batch2-review-u9-u10-u11.md`, and `M3-batch3-review-u12.md`. All findings resolved. |
| **3. Exploratory verification** | ✅ PASS | All interactive capabilities (Skill DAG with all 76 nodes, multi-unit search, chord symbol glossary with 33 chords, session progression, audio playback) verified in local builds. |
| **4. Written walkthrough** | ✅ PASS | This document (`docs/qa/M3-walkthrough.md`). |
| **5. Publish** | Ready | Ready for deployment to GitHub Pages via `pnpm pages`. |
