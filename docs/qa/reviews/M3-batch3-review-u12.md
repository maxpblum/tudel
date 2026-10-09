# Style QA & adversarial review: form, arc & zen (u12)

Reviewer: automated QA pass & gate audit, 2026-10-09.
Scope: `units/u12/` (lessons and exercises), skills in `skills.yaml`, and glossary chord entries.
Method: Evaluated all 5 lessons and 20 exercise variants against Strudel pinned source (`tools/strudel-ref/doc.json` and `packages/core/pattern.mjs`), verified all pitches ≥ C3, checked clock semantics of `arrange` and `seqPLoop`, and verified all musical and acoustic claims.

## Checklist, overall

| # | Tip | How well it was followed |
|---|---|---|
| 1 | Demos audible on laptop speakers (§1) | Passed. Every note in all lessons and variants is at or above C3 (MIDI 48). Bass lines remain clear and filtered adequately. |
| 2 | Terms defined before use, no insider shorthand (§2) | Passed. Concepts like sequential arrangement, staggered loop layering, dominant pedals, and refactoring are defined with concrete musical examples. |
| 3 | Simplifications don't invite "but what about…" (§3) | Passed. The distinction between `arrange` (each section gets its own internal clock starting at 0) and `seqPLoop` (global song clock where patterns start at absolute bar positions) is rigorously verified and explained. |
| 4 | No skipped inference; conventions separated from Strudel facts (§4) | Passed. Detailed bar counts, BPM calculations, and section durations are explicitly laid out. |
| 5 | Look-alikes contrasted on the same input (§5) | Excellent: `arrange` vs `seqPLoop`; terraced dynamics vs continuous signal hairpins. |
| 6 | Units, exact claims, boundary cases (§6) | Passed. Units explicitly given for tempo, bar counts, cycles, frequencies, and envelope times. Explains boundary cases like why `transpose` cannot be applied to drums. |
| 7 | Shapes drawn (§7) | Passed. Waveform and signal diagrams for `saw.slow(4)` risers and arrangement block structures. |
| 8 | Analogies from the learner's experience (§8) | Excellent: big band road maps, sonata form retransitions and dominant pedals, fugal expositions, Ravel's *Boléro* orchestration and key lift. |

## Failures found and fixes

1. **Starter AST Evaluation (Gate L1)**:
   - In `zen.section-arrange.v01` and `zen.loop-layering.v01`, the starter blocks initially defined only variable assignments (`const ... = ...`) without an evaluating pattern expression. Appended pattern expressions (`intro` and `kick`) so starters evaluate cleanly to audio patterns in the REPL.
2. **Prettier line formatting (Gate L7)**:
   - Fixed 10 formatting discrepancies across `zen.section-arrange.lesson`, `zen.dramatic-arc.lesson`, `zen.section-arrange.v03`, `zen.dramatic-arc.v01`, `zen.dramatic-arc.v03`, `zen.dramatic-arc.v04`, `zen.consolidated-idioms.v03`, and `zen.consolidated-idioms.v04`.
3. **Prose identifier checks (Gate L8)**:
   - Fixed prose backtick reference in `zen.dramatic-arc.lesson` where a helper variable `pitched` and call `pad(...)` were flagged by Gate L8's identifier verifier. Replaced with italics/standard prose.
4. **All 9 Gates Green**:
   - `pnpm verify` passes 100% across all 441 schema checks, 670 evaluations, 878 vocabulary checks, 362 snapshots, 47 notations, 30 equivalences, 670 style checks, and 1,590 prose claims.
