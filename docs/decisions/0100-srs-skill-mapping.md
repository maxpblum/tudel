# ADR 0100: How variant ratings schedule skills (FSRS)

- **Status:** accepted
- **Date:** 2026-10-05
- **Workstream:** B (web app)

## Context

R-SKILLS: spaced repetition schedules *skills*, while the learner rates *variants*. A variant may list several skills. A Today session introduces a new skill with 2–3 drills rated minutes apart. The learner can override scheduling at any time (R-SRS). All state must be derivable by replaying the event log (ADR 0101), so the scheduler must be deterministic.

## Decision

1. **One FSRS card per skill** (`ts-fsrs` 5.4.2). The card is created at the skill's first rating, not when its lesson is viewed.
2. **A rating applies only to the variant's primary skill**, the first entry in `skills`. The `rated` event records the `skillId` it applied to, so replay doesn't depend on the current content. Secondary skills are context. Spreading one self-rating across several cards would multiply the evidence from a single attempt, and a low rating would be blamed on skills that may not have caused it. Authors who want a variant to count for a skill put that skill first (this matches the content convention that variant ids are named after their first skill).
3. **Same-session repeats go through FSRS's short-term learning steps.** Parameters are `enable_short_term: true`, `learning_steps: ['1m', '10m']`, `relearning_steps: ['10m']`, `request_retention: 0.9`, `enable_fuzz: false`. Every rating is passed to `scheduler.next(card, ratingTime, rating)`. Three Goods a few minutes apart move a new card through the learning steps, and Easy graduates it immediately. Nothing special-cases sessions.
4. **Determinism:** fuzz is off and the only time input is each event's `ts`. Functions that need "now" (`isDue`, `describeDue`, the session builder) take it as a parameter, so the UI injects the clock.
5. **Ratings outside a session** (from the library) update the card too. Browsing and practising is real practice.
6. **Overrides** are `override` events:
   - `again_soon`: a started skill gets `due = ts`, so it is due now. An unstarted skill becomes `prioritized` and is offered as the next new skill once its prerequisites are met.
   - `retire` (mastered) and `mark_known` (skip ahead): the skill is *parked*. It is never due and never offered as new. Ratings still update its card.
   - `restore`: unparks the skill.
7. **Prerequisites are met** when the prerequisite skill has been *introduced*: it has a card (rated at least once) or is parked as retired or known. Waiting for FSRS state `Review` would hold back new material for days after a successful first session.
8. **Relearning (PROPOSAL §14)** is implemented cheaply: if a skill's last two ratings are Again, the session builder puts its lesson in as a refresher before the review drill.

## Consequences

- One self-rating moves exactly one card, which is simple to explain and to test.
- A variant practising a secondary skill doesn't refresh that skill's schedule. If this turns out to matter, a later ADR can add weighted secondary updates with a log migration.
- Changing FSRS parameters reschedules everything on the next replay (cards are derived, not stored). That is intended, but it should be a deliberate, reviewed change.

## Amendment 1 (2026-10-05): filling the session length, overrides mid-session, fluency timing

Prompted by the M1 exploratory QA pass (`docs/qa/M1-exploratory.md`, U2–U7). R-SESSION asks for a 15–30 minute session (default 20, adjustable); with no reviews due the builder planned only one new skill (about 13 min).

1. **Fill toward the chosen length, never past it.** After due reviews and the one new skill, `buildSession` adds steps only while they fit in `minutes`:
   - **Extra practice** from skills already introduced (they have a card), not parked, and *not due* (due skills, including ones held back by the review cap, are excluded). Least recently practised (last rating) first, round-robin. Each round uses a variant not yet in the plan, chosen by the normal rotation, so a skill recurs only with a different variant. These are ordinary `review` steps placed after the due reviews and before the new lesson. No event-format change: the plan lists them separately as `practiceSkillIds` for the Today summary.
   - **Only when no introduced skill has an unplanned variant left**, more drills of the new skill's remaining variants.
   - **Still one new skill per session** (PROPOSAL §14). If the content runs out, the estimate is shorter than the setting, and Today says so ("that is all the material available right now").
2. **Early reviews are normal FSRS reviews.** ts-fsrs 5.4.2 computes elapsed days from `last_review` to the rating time. Retrievability is higher for an early review, so the stability gain is smaller; a same-day review (0 elapsed days) uses the short-term formula, where Good never lowers stability. Measured with our parameters: a card with stability 8.3 d (first rating Easy, due in 8 d) reaches stability 38.9 d when reviewed Good on time, 13.5 d when reviewed Good a day after the first rating (next due day 14, later than the original day 8), and stays at 8.3 d for a same-day Good. An early Again is a real lapse (relearning, due in 10 min). So extra practice can't inflate a schedule or pull a review earlier, and `srs.test.ts` pins this behaviour.
3. **Retire or mark known mid-session** drops that skill's not-yet-started steps (never shown, not done) from every open session. `replaySessions` derives this from the `override` event, so resuming shows exactly the same remaining steps. The step on screen stays (it was already shown), so the learner can rate or skip it. `restore` doesn't bring dropped steps back. `again_soon` doesn't change the session.
4. **"Show again soon" on a skill whose prerequisites aren't met** keeps its meaning (queue it as the next new skill once it becomes eligible). We chose this over bypassing prerequisites so that prerequisites stay a single, consistent rule. The overrides menu now shows a persistent note, derived from replay: "Queued: this will come up as a new skill once its prerequisites are met (X)". When eligible it says "this is the next new skill", or, when several skills are queued, "after other queued skills".
5. **Library practice: one rating per view.** After rating, the buttons are replaced by "Rated: Good" and a *Practise again* button. That button starts a new view, logging a new `variant_shown`, which can be rated once.
6. **Fluency time** (prompt to reveal, informational only) counts within one page lifetime. The clock starts when the exercise view mounts in this page, or at the first `variant_shown` if that is later. Time with the tab closed, or spent elsewhere in the app, never counts. Time in other browser tabs does count, because the learner types in their own Strudel setup. A resumed view therefore undercounts rather than overcounts. Measurements over 30 minutes (`FLUENCY_MAX_MS`, e.g. the computer slept) are recorded as `null`, and older logged values over the cap are ignored by `revealTimes`. No event-format change.
7. **"You finished a session today"** appears only if a session completed today had at least one exercise rated or lesson completed (`wasPractised`). An all-skipped session reads "Session ended: all steps skipped".
