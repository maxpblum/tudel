# Release checklist (per milestone)

No milestone is handed to the learner as ready to use until every box below is checked and the results are recorded in `docs/qa/<milestone>-walkthrough.md`. This implements PROPOSAL.md §16.

## 1. Automated gates

- [ ] `bash ci/run-all.sh` from a fresh clone is green. This runs `pnpm install --frozen-lockfile`, `pnpm verify` (L0–L5, L7, L8), `pnpm test`, and `pnpm e2e` (Playwright, including L6).
- [ ] `bash tools/strudel-ref/generate-doc-json.sh --check` reports that `doc.json` is up to date with the pin.
- [ ] `bash ci/drift.sh` has been run, and its report is attached to the walkthrough. It is informational and never fails the build.
- [ ] Coverage is ≥90% lines on `apps/web/src/{srs,store,session}`. This is enforced by the Vitest threshold.

## 2. Adversarial content review

- [ ] A reviewer (human or LLM) who did not write the content gets the content batch plus the pinned Strudel source (`tools/strudel-ref/.cache/strudel`), and tries to **refute** every factual claim, snippet, ABC transcription, lexicon citation, and pedagogical statement.
- [ ] Findings and their resolutions are recorded in `docs/qa/reviews/<milestone>-content.md`. Each finding is fixed or explicitly justified.
- [ ] `pnpm verify` has been re-run green after all fixes.

## 3. Scripted exploratory pass (fresh browser profile)

Run against the production build (`pnpm build && pnpm --filter @tutor/web preview`) and record observations:

1. [ ] **First run.** A fresh profile opens to Today, which proposes due reviews (none) plus one new skill whose prerequisites are met.
2. [ ] **Lesson.** It renders all block types. Play buttons sound after the first click, and copy buttons copy exactly the shown code.
3. [ ] **Exercises.** Prompt, then notation or audio, then reveal, then rate. Check `match-by-ear` hides the code until reveal, slow-down works on ear types, and the live piano roll animates.
4. [ ] **Close mid-session** (after a reveal, before rating) and reopen. The session resumes at the same step with nothing lost.
5. [ ] **Overrides.** *Show again soon*, *retire*, and *skip ahead* each change what Today proposes in the expected way.
6. [ ] **Library.** It reaches every unit, skill, lesson, and variant, and items can be opened out of session.
7. [ ] **Export, clear storage, import.** The state is identical: same Today and same history.
8. [ ] **Offline** (DevTools offline, after the first load). Synth-only content still plays, and the offline banner appears for network-needing content.
9. [ ] **Time travel.** Advance the clock (or edit the log timestamps in a copy) and confirm due reviews appear.

## 4. Written walkthrough

- [ ] `docs/qa/<milestone>-walkthrough.md` covers what was built, how to run it, a narrated tour, the results of sections 1–3, known limitations, and what the learner should evaluate during the trial.
