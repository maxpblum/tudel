# Release checklist (per milestone)

No milestone is handed to the learner as ready to use until every box below is checked and the results are recorded in `docs/qa/<milestone>-walkthrough.md`. This implements PROPOSAL.md §16.

## 1. Automated gates

- [x] `bash ci/run-all.sh` from a fresh clone is green. This runs `pnpm install --frozen-lockfile`, `pnpm verify` (L0–L5, L7, L8), `pnpm test`, and `pnpm e2e` (Playwright, including L6).
- [x] `bash tools/strudel-ref/generate-doc-json.sh --check` reports that `doc.json` is up to date with the pin.
- [x] `bash ci/drift.sh` has been run, and its report is attached to the walkthrough. It is informational and never fails the build.
- [x] Coverage is ≥90% lines on `apps/web/src/{srs,store,session}`. This is enforced by the Vitest threshold.

## 2. Adversarial content review

- [x] A reviewer (human or LLM) who did not write the content gets the content batch plus the pinned Strudel source (`tools/strudel-ref/.cache/strudel`), and tries to **refute** every factual claim, snippet, ABC transcription, lexicon citation, and pedagogical statement.
- [x] Findings and their resolutions are recorded in `docs/qa/reviews/<milestone>-content.md`. Each finding is fixed or explicitly justified.
- [x] `pnpm verify` has been re-run green after all fixes.

## 3. Scripted exploratory pass (fresh browser profile)

Run against the production build (`pnpm build && pnpm --filter @tudel/web preview`) and record observations:

1. [x] **First run.** A fresh profile opens to Today, which proposes due reviews (none) plus one new skill whose prerequisites are met.
2. [x] **Lesson.** It renders all block types. Play buttons sound after the first click, and copy buttons copy exactly the shown code.
3. [x] **Exercises.** Prompt, then notation or audio, then reveal, then rate. Check `match-by-ear` hides the code until reveal, slow-down works on ear types, and the live piano roll animates.
4. [x] **Close mid-session** (after a reveal, before rating) and reopen. The session resumes at the same step with nothing lost.
5. [x] **Overrides.** *Show again soon*, *retire*, and *skip ahead* each change what Today proposes in the expected way.
6. [x] **Library.** It reaches every unit, skill, lesson, and variant, and items can be opened out of session.
7. [x] **Export, clear storage, import.** The state is identical: same Today and same history.
8. [x] **Offline** (DevTools offline, after the first load). Synth-only content still plays, and the offline banner appears for network-needing content.
9. [x] **Time travel.** Advance the clock (or edit the log timestamps in a copy) and confirm due reviews appear.

From M2 on:

10. [x] **Skill map** (`#/map`). Every skill appears once, lines run from each prerequisite to the skill that builds on it, node colours match the statuses in the legend, and every node opens its skill page. At a 390 px width the map scrolls sideways and the page itself doesn't.
11. [x] **Search** (`#/search/<words>`, or the box in the Library). A skill title word, a vocabulary name, a lesson word and a glossary term each find the expected item, and every result opens its page. A nonsense query shows 0 results.
12. [x] **Suspend.** Suspending Today's new skill takes it out of Today (a different new skill, or none, is offered), its status reads "suspended" and only *Restore* is offered. *Restore* brings it back as before.
13. [x] **Focus.** *Focus on this unit* in the Library makes Today's new skill and extra practice come from that unit, while due reviews from other units still appear. The focus chip shows on Today, survives a reload, and *Clear focus* restores the default.
14. [x] **Fluency trend.** After revealing a few exercises of one skill, its skill page shows the sparkline with last and median times, labelled as informational and not used for scheduling. A skill with no reveals shows no trend.
15. [x] **Glossaries** (`#/glossary/terms`, `lexicon`, `chords`). Each list renders. Terms show a synopsis and link to their skills, and a skill's vocabulary links to its term. Lexicon entries show sources and link to skills whose text uses the word. Chord symbols show their tones and skills.
16. [x] **Drums offline.** With the network off after the first load, U1 drum snippets (sample banks) show the offline banner instead of failing silently, and synth-only snippets still play. Back online, the drums play.
17. [x] **Old progress file.** Importing an M1-era export (format version 1) succeeds with "migrated from format version 1", and Today and the skill statuses match what that profile showed before.

## 4. Written walkthrough

- [x] `docs/qa/<milestone>-walkthrough.md` covers what was built, how to run it, a narrated tour, the results of sections 1–3, known limitations, and what the learner should evaluate during the trial.

## 5. Publish

- [ ] `README.md` status, commands, and live link are accurate.
- [ ] `pnpm pages` run from the release commit; https://maxpblum.github.io/tudel/ loads, navigates, and plays audio.
