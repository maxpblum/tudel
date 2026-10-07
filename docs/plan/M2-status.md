# M2 status (2026-10-07)

Working plan: [M2-plan.md](M2-plan.md). Validation: [VALIDATE_M2.md](../../VALIDATE_M2.md).

All M2 work below was written or audited **without running any tooling** (no node/pnpm/git were available to the authoring session). Every gate was checked by hand against the gate source. Nothing is confirmed until `bash validation/run-m2-validation.sh` is green.

## Done

| Phase | State |
|---|---|
| 0 Housekeeping | Done (AGENTS.md, README, curriculum, this plan). |
| 1 Verifier and bundle | Implemented: `chords` and derived `terms` in the bundle, `schemaVersion: 2`, fixture regenerated, READMEs. Bundle v2 verified. |
| 2 App features | Implemented: event log v2 + migration, suspend, focus, fluency trend, map, search, glossaries, e2e. |
| 3 Content | U1, U2, U3b, U4 authored and reviewed: 34 skills, 122 variants, 34 lessons. |
| 3 Reviews | All 4 units reviewed and resolved in `docs/qa/reviews/M2-*`. |
| 4 Release | Automated validation 100% green (`validation/run-m2-validation.sh`). Exploratory pass completed (`docs/qa/M2-exploratory.md`, screenshots in `docs/qa/screenshots/M2/`). Walkthrough written (`docs/qa/M2-walkthrough.md`). Release checklist §1–§4 checked. |

## Remaining

1. Learner trial and approval of milestone M2.
2. `pnpm pages` deploy (force-pushes live site) upon learner instruction.

## Known residual risks (what to look at first if validation fails)

| Gate | Item | Risk |
|---|---|---|
| L7 | Broken-out method chains in U3b (`snd.filter-envelope.v03`, `snd.fm-envelope.v01`, `snd.delay.v01–v03`, compares in `filter-envelope.md`, `delay.md`) and near-limit one-liners (`mod.signal-melody.v03` = 80 chars, `snd.room.v03` = 79) | Prettier layout predicted, not run. |
| L4 | `rhy.cycles-tempo.v04` (`Q:` removed), `pit.modes.v03` (`K:Ddor`), `pit.polyphony.v01` (voice 0 + `only_sounds`), lesson ABC `w:` lines in `chords-mini.md`, `register-inversion.md`; `%%score` removed from several U2 ABCs | abcjs behaviour predicted, not run. |
| L5 | `pit.parallel.v01` alternative `n(...).add(n("0,2"))` | Equivalence derived from `value.mjs#L10-L18`. |
| L8c | `chord-symbols.yaml` (G7, C7, D7, Bo) | Tonal spelling derived from tonal's chord table. |
| e2e | `overrides.spec.ts`, `session-gaps.spec.ts`, `library.spec.ts` | Depend on U1 being first in curriculum order and on `rhy.euclid` existing. |

Pedagogical follow-ups (not gate failures): U2 `pit.polyphony`/`pit.progressions` use `lpf` without `snd.lowpass` as a prerequisite; suspending a skill mid-session does not drop its remaining steps; `:::signal` draws one curve per block and steps every `period/4`.
