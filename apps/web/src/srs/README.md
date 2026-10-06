# srs/

FSRS scheduling of **skills** (not variants) with `ts-fsrs` 5.4.2. See ADR 0100.

- `replaySrs(events)` builds one card per skill from `rated` and `override` events. It is pure and deterministic: fuzz is off, and every timestamp comes from the events. Pass `now` to `isDue` and `describeDue`, and nothing reads the clock.
- A rating applies to the variant's **primary (first) skill**.
- Same-session repeats go through ts-fsrs's short-term learning steps (`1m`, `10m`).
- Early (not-yet-due) reviews from session fill are ordinary ratings. ts-fsrs gives them less stability gain (higher retrievability) and never pulls the due date earlier on a pass (ADR 0100 amendment 1; pinned in `srs.test.ts`).
- Overrides: `again_soon` makes a started skill due now, or puts an unstarted skill first in the queue for new skills (once its prerequisites are met; the overrides menu says so). `retire` and `mark_known` take the skill out of scheduling and count it as a met prerequisite. `restore` undoes them.
