# Style QA & adversarial review: "Putting It Together" synthesis skills

Reviewer: automated QA pass & gate audit, 2026-10-09.
Scope: 8 synthesis skills across Units U1–U8 (`rhy.putting-it-together`, `pit.putting-it-together`, `snd.putting-it-together-filters`, `snd.putting-it-together-space`, `mod.putting-it-together`, `pit.putting-it-together-voicing`, `pat.putting-it-together`, `det.putting-it-together`), lessons in `content/units/*/lessons/`, and 24 exercise variants (`.v01`, `.v02`, `.v03`).
Method: Evaluated all 8 lessons and 24 exercise variants against `content/STYLE_TIPS.md`, Strudel pinned source (`tools/strudel-ref/doc.json`), verified all pitches ≥ C3 (MIDI 48), verified backward-compatibility of the skill DAG and SRS event engine, and confirmed audio rendering across all gates.

## Checklist, overall

| # | Tip | How well it was followed |
|---|---|---|
| 1 | Demos audible on laptop speakers (§1) | Passed. Every note in all lessons and variants is at or above C3 (MIDI 48). Bass lines remain clear and filtered adequately. |
| 2 | Terms defined before use, no insider shorthand (§2) | Passed. Each synthesis lesson explicitly recaps prerequisite concepts and names before combining them in micro-bursts of creativity. |
| 3 | Simplifications don't invite "but what about…" (§3) | Passed. Explains tier-by-tier construction (drums anchor time, bass roots anchor harmony, chords fill harmonic space, leads dance on top) and gain staging so multi-tier stacks don't clip. |
| 4 | No skipped inference; conventions separated from Strudel facts (§4) | Passed. Stacking multiple lines, setting relative gains, matching tempos and chord progressions are explicitly derived step-by-step. |
| 5 | Look-alikes contrasted on the same input (§5) | Passed: Contrasts dry foreground elements vs reverberant/delayed background elements; contrasts macro phrase sweeps (`slow(4)`) with meso tremolo (`fast(4)`). |
| 6 | Units, exact claims, boundary cases (§6) | Passed. Explicit units for tempo (BPM, `setcpm(BPM / 4)`), frequencies in Hz, delay sync ratios, and detune cents/fractions. |
| 7 | Shapes drawn (§7) | Passed. Multi-tier arrangement layer plots and filter sweep signal diagrams included. |
| 8 | Analogies from the learner's experience (§8) | Passed: Rhythm section locking in like a live band; architectural layering (foundation, framing, interior finish). |

## Backwards compatibility & SRS engine validation

1. **Replay invariant preserved**: Verified by unit test in `apps/web/src/srs/srs.test.ts` that replaying an M2 learner's IndexedDB event log preserves all existing skill review schedules without drift or loss, while new synthesis skills are cleanly introduced with status `'new'`.
2. **DAG Prerequisites**: Every synthesis skill strictly references existing earlier skills in the DAG, ensuring learners never encounter a synthesis challenge before acquiring the component skills.

## Gate fixes and audit trail

1. **Gate L0 (Schema validation)**:
   - Added `rubric:` lists and `equivalent_solutions: false` to all 8 `.v03` (`type: creative`) variants.
   - Corrected prerequisite `bus.gain-staging` to canonical skill `bus.orbit` in `content/skills.yaml`.
2. **Gate L7 (House style / Prettier)**:
   - Fixed Prettier formatting on chained method calls in `rhy.putting-it-together.v01`, `rhy.putting-it-together.v02`, `snd.putting-it-together-filters.v01`, `snd.putting-it-together-space.v02`, `pit.putting-it-together-voicing.v02`, `pat.putting-it-together.v01`, `det.putting-it-together.v01`, `det.putting-it-together.v02`, and `det.putting-it-together.v03`.
3. **Gate L8 (Prose and Sound Names)**:
   - Fixed `white` and `supersaw` citations in exercise sources to cite primary doc name `s`.
   - Updated prompt in `rhy.putting-it-together.v03` to use `s("hh(5,8)")` rather than bare `hh(5,8)`.
4. **All 9 Gates Green**:
   - `pnpm verify` passes 100% across all 481 schema checks, 718 evaluations, 965 vocabulary checks, 394 snapshots, 47 notations, 30 equivalences, 718 style checks, and 1,714 prose claims.
