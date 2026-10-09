# Style QA & adversarial review: genre tracks (u9 chiptune, u10 synth-pop, u11 synthwave)

Reviewer: automated QA pass & gate audit, 2026-10-09.
Scope: `units/u9/`, `units/u10/`, `units/u11/` (lessons and exercises), skills in `skills.yaml`, and glossary chord additions.
Method: Evaluated all 18 lessons and 69 exercise variants against Strudel pinned source (`tools/strudel-ref/doc.json` and `.cache/strudel`), verified note pitches ≥ C3 (MIDI 48), verified all mini-notation uses double quotes, and audited all musical and acoustic claims.

## Checklist, overall

| # | Tip | How well it was followed |
|---|---|---|
| 1 | Demos audible on laptop speakers (§1) | Passed. Every note in all lessons and variants is at or above C3 (MIDI 48). Bass parts use triangle or sawtooth with adequate harmonic brightness. |
| 2 | Terms defined before use, no insider shorthand (§2) | Passed. Chiptune limitations (NES 2A03 5-channel sound chip), gating, sidechain compression, and arpeggiation are clearly explained with acoustic context before code is introduced. |
| 3 | Simplifications don't invite "but what about…" (§3) | Passed. The distinction between duty cycles (12.5%, 25%, 50%, 75%) and how pulse width `pw` maps in Strudel is concretely demonstrated. |
| 4 | No skipped inference; conventions separated from Strudel facts (§4) | Passed. Tempo arithmetic `setcpm(BPM / 4)` clearly stated throughout. Step divisions and polyphonic voices explicitly counted. |
| 5 | Look-alikes contrasted on the same input (§5) | Excellent: sidechain via ducking vs LFO volume pumping; fast arpeggios vs chords; gate lengths with sustain vs decay. |
| 6 | Units, exact claims, boundary cases (§6) | Passed. All frequencies in Hz, envelope times in seconds, tempo in BPM and CPM, filter cutoffs with specific resonance parameters. |
| 7 | Shapes drawn (§7) | Passed. Compare blocks, filter response curves, and ADSR envelope diagrams provide visual confirmation of audio behavior. |
| 8 | Analogies from the learner's experience (§8) | Excellent: brass stabs compared to horn section voicings, arcade sounds compared to 8-bit sound chips, sidechaining compared to radio ducking. |

## Failures found and fixes

1. **Prettier line formatting (Gate L7)**:
   - Fixed 8 lines across `spop.sequenced-bass.v01`, `swave.project.v03`, `chip.noise-drums.v01`, `chip.project.v02`, `spop.brass-stabs.lesson`, `spop.sequenced-bass.lesson`, `chip.ornaments.lesson`, and `chip.project.lesson` where method chains or argument strings exceeded 80 columns or needed line-wrapping.
2. **Prose identifier checks (Gate L8)**:
   - Fixed bare variable references in backticks (such as `` `minor` ``, `` `maj7` ``, `` `supersaw` ``) in `spop.brass-stabs`, `spop.hooks`, `swave.pads`, and `swave.project` so only true Strudel identifiers from `doc.json` appear in code backticks.
3. **Directive attributes (Gate L0)**:
   - Fixed nested double quotes in `diff="..."` attributes in `u11/lessons/rolling-bass.md` and `u9/lessons/fast-arps.md`.
4. **Capstones**:
   - The 3 capstone song projects (`chip.project`, `spop.project`, `swave.project`) with type `project` cleanly pass all 9 gates and evaluate fully in the headless repl and browser audio (Gate L6).
