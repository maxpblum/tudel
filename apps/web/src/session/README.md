# session/

- `builder.ts`: `buildSession({content, srs, history, now, minutes})` returns the plan for Today. Due reviews come first: most overdue first, interleaved round-robin across units, and capped by the time budget. A skill rated Again twice in a row gets its lesson as a refresher first. Then comes one new skill whose prerequisites are introduced: its lesson, then 2–3 variants (3 when the session is at least 20 minutes long).
  - **Filling the length** (ADR 0100 amendment 1). Fill steps are added only while they fit in the chosen minutes, so fill never pushes the estimate past it.
    - First, extra practice (`practicePool`) on introduced, not-parked, not-due skills, least recently practised first, round-robin, each on a variant not yet planned. These are ordinary `review` steps before the new lesson; ratings are normal (early) FSRS reviews. They are listed in `practiceSkillIds`.
    - Only if no introduced skill has an unplanned variant left, more drills of the new skill's remaining variants.
    - Still one new skill per session. If content runs out, the estimate is honestly shorter.
  - **Focus.** `BuildInput.focusUnit` (from `replayFocus`, the latest `focus_changed`) restricts the new-skill pick and the practice pool to that unit. Due reviews still come first from every unit, unchanged. If the unit has nothing eligible, there is no new skill.
  - `unmetPrereqs` explains why a queued ("show again soon") skill isn't offered yet.
  - The plan is stored inside the `session_started` event, so resuming never depends on recomputing it.
- `rotation.ts`: variant rotation. Unseen variants come first, in authoring order; after that, the one seen longest ago. Variants already in the plan are avoided.
- `progress.ts`: `replaySessions(events)` gives the current step (the first step that is not rated, completed or skipped) and the per-step revealed state, so reopening the app continues at the exact step.
  - Retiring or marking a skill known drops that skill's not-yet-started steps from open sessions (`dropped`, counted as done). The step on screen stays, and `restore` doesn't bring dropped steps back.
  - `wasPractised` is false for a session where every step was skipped or dropped, so Today doesn't call it "finished".
  - It also provides the session-length setting and reveal times. `replayFocus(events)` gives the focused unit or null. `fluencyBySkill(events, variantToSkill)` gives per skill the chronological `{ts, ms}[]` and the median (the app maps a variant to `skills[0]`). Fluency is informational only. `fluencyElapsed` counts within one page lifetime: from the view's mount, or the first show if later. It returns null above `FLUENCY_MAX_MS` (30 min), and `revealTimes` ignores old over-cap values.
