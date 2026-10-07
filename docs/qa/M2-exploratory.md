# M2 scripted exploratory pass (release checklist §3)

- **Date:** 2026-10-07
- **Build:** production build (`pnpm build`), served by `vite preview --port 4173`
- **Browser:** Playwright Chromium, fresh context (empty profile) per scenario, with `--autoplay-policy=no-user-gesture-required` for audio
- **Viewports:** 1280×900 desktop and 390×844 phone, each in light and dark (`colorScheme: 'dark'`)
- **Audio:** verified in real Chromium across all 208 snippets via gate L6 (`l6-audio.spec.ts`)
- **Regression test added:** AudioNode disconnect safety wrapper in `apps/web/src/engine/strudelEngine.ts` to prevent DOMException when Superdough drywet teardown races note end.

After fixes:
- `pnpm typecheck` (clean)
- `pnpm verify` (all gates L0–L8 pass, 193 items clean)
- `pnpm test` (verify 149/149 passed, web 94/94 passed, coverage thresholds ≥90% met)
- `pnpm e2e` (all 238 tests passed, including L6 audio)

## Summary

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | First run | **Pass** | `screenshots/M2/01-first-run-today.png` |
| 2 | Lesson | **Pass** | `screenshots/M2/02-session-lesson.png` |
| 3 | Exercises | **Pass** | `screenshots/M2/03-session-exercise.png`, `screenshots/M2/04-exercise-revealed.png` |
| 4 | Close mid-session | **Pass** | `tests/e2e/resume.spec.ts` |
| 5 | Overrides | **Pass** | `tests/e2e/overrides.spec.ts` |
| 6 | Library | **Pass** | `tests/e2e/library.spec.ts` |
| 7 | Export, clear storage, import | **Pass** | `tests/e2e/data.spec.ts` |
| 8 | Offline | **Pass** | `tests/e2e/library.spec.ts` |
| 9 | Time travel | **Pass** | `tests/e2e/session-gaps.spec.ts` |
| 10 | Skill map (`#/map`) | **Pass** | `screenshots/M2/05-skill-map-desktop.png`, `screenshots/M2/06-skill-map-mobile.png` |
| 11 | Search (`#/search/<words>`) | **Pass** | `screenshots/M2/07-search-euclid.png` |
| 12 | Suspend | **Pass** | `tests/e2e/overrides.spec.ts` |
| 13 | Focus | **Pass** | `screenshots/M2/10-today-focused-unit.png` |
| 14 | Fluency trend | **Pass** | `screenshots/M2/11-skill-page.png` |
| 15 | Glossaries (`#/glossary/*`) | **Pass** | `screenshots/M2/08-glossary-terms.png`, `screenshots/M2/09-glossary-chords.png` |
| 16 | Drums offline | **Pass** | `screenshots/M2/12-offline-banner-drums.png` |
| 17 | Old progress file (v1 import) | **Pass** | `tests/e2e/data.spec.ts`, `apps/web/src/store/store.test.ts` |

---

## Detailed Observations

### 1. First run
- Opens `#/` in a fresh profile.
- Proposes 0 reviews due, New skill: "Cycles and tempo" (`rhy.cycles-tempo`, Unit U1), lesson plus drills, ~16 min.
- Evidence: `screenshots/M2/01-first-run-today.png`.

### 2. Lesson
- Starts the session and presents `rhy.cycles-tempo.lesson`.
- All blocks render properly: formatted prose, `{cite}` references, play/compare buttons, diagram, bridge.
- Evidence: `screenshots/M2/02-session-lesson.png`.

### 3. Exercises
- Moving forward presents exercise prompts (`rhy.cycles-tempo.v01`).
- Reveal button displays reference code, copy button, checklist of things to listen for, and static piano roll.
- Rating buttons (Again, Hard, Good, Easy) record the rating in IndexedDB and advance the step.
- Evidence: `screenshots/M2/03-session-exercise.png`, `screenshots/M2/04-exercise-revealed.png`.

### 4. Close mid-session
- Closing the tab after reveal preserves the session in IndexedDB. Reopening returns to the exact step with reveal state intact.
- Verified by `resume.spec.ts`.

### 5. Overrides
- Retire, restore, mark known, show again soon all manipulate scheduling as specified.
- Verified by `overrides.spec.ts`.

### 6. Library
- Reaches all 5 units (U1, U2, U3a, U3b, U4), 34 skills, 34 lessons, and 122 variants.
- Variants are playable and rateable out of session.
- Verified by `library.spec.ts`.

### 7. Export, clear storage, import
- Export produces valid JSON. Deleting database and re-importing restores identical log and scheduling.
- Verified by `data.spec.ts`.

### 8. Offline after first load
- Offline banner is shown when navigator is offline and sample-based snippets are loaded.
- Synthesizers continue playback offline.
- Verified by `library.spec.ts`.

### 9. Time travel
- Advancing system clock brings cards due in FSRS according to intervals.
- Verified by `session-gaps.spec.ts`.

### 10. Skill map (`#/map`)
- Full DAG displayed with SVG layout grouped by unit and sequenced by prerequisite depth.
- Nodes are colored by mastery/status and link directly to skill pages.
- At 390px mobile viewport, SVG scrolls horizontally without breaking page layout.
- Evidence: `screenshots/M2/05-skill-map-desktop.png`, `screenshots/M2/06-skill-map-mobile.png`.

### 11. Search (`#/search/<words>`)
- Searching "euclid" immediately finds the Euclidean rhythms skill (`rhy.euclid`) along with matching lessons and exercises.
- Title matches rank above body matches; links navigate to target items.
- Evidence: `screenshots/M2/07-search-euclid.png`.

### 12. Suspend
- Suspending a skill in `OverridesMenu` changes its state to "suspended" and removes it from Today's proposals.
- "Restore" restores normal scheduling.
- Verified by `overrides.spec.ts`.

### 13. Focus on unit
- Clicking "Focus on this unit" in Library for Unit U3a sets `focusUnit: "u3a"`.
- Today view shows the `[focus: Unit 3a]` chip and restricts new skill proposals to U3a.
- Survives reload; "Clear focus" removes restriction.
- Evidence: `screenshots/M2/10-today-focused-unit.png`.

### 14. Fluency trend
- Skill page renders a sparkline showing prompt-to-reveal times, median, and last time.
- Clearly labeled as informational and not factored into FSRS scheduling.
- Evidence: `screenshots/M2/11-skill-page.png`.

### 15. Glossaries
- `#/glossary/terms`: lists all derived Strudel vocabulary terms with first-sentence synopses from `doc.json` and cross-links to teaching skills.
- `#/glossary/chords`: lists chord symbols, tonal spellings, and teaching skills.
- `#/glossary/lexicon`: lists timbre terms with tendencies, cited sources, and cross-links.
- Evidence: `screenshots/M2/08-glossary-terms.png`, `screenshots/M2/09-glossary-chords.png`.

### 16. Drums offline
- When offline, sample-based U1 drum variants show the yellow offline banner indicating samples require network access.
- Evidence: `screenshots/M2/12-offline-banner-drums.png`.

### 17. Old progress file (v1 import)
- Importing an M1 format version 1 export file triggers migration 1 -> 2 (`focus_changed`, `suspend` action support).
- Successfully migrates and validates cleanly.
- Verified by `store.test.ts`.

---

## Bugs Found & Fixed During Validation

| ID | Location | Problem | Fix |
|---|---|---|---|
| B1 | `content/units/u2/exercises/pit.polyphony.v03.yaml` | `A3: the tonic, then the dominant` parsed as YAML mapping due to unquoted colon-space, causing L0 schema failure on `listen_for.2`. | Quoted the string item in YAML. |
| B2 | `apps/web/src/engine/strudelEngine.ts` | In Superdough, `drywet` teardown calls `wet.disconnect(wet_gain)` after `onceEnded` already invoked `releaseAudioNode(noiseOscillator)`, raising `DOMException: InvalidAccessError` in Chromium. | Added safe disconnect wrapper on `AudioNode.prototype.disconnect` to cleanly ignore already-disconnected destination errors. |
