# M1 scripted exploratory pass (release checklist §3)

- **Date:** 2026-10-05
- **Build:** production build (`vite build`), served by `vite preview --port 4317`
- **Browser:** Playwright Chromium 1.63, a fresh context (empty profile) per scenario, with `--autoplay-policy=no-user-gesture-required` for audio
- **Viewports:** 1280×900 desktop and 390×844 phone, each in light and dark (`colorScheme: 'dark'`)
- **Audio:** measured by wrapping `AudioNode.prototype.connect` in an init script, so every node connected to the destination is also tapped by an `AnalyserNode` (max RMS over a window).
- **Time:** the app reads "now" from `Date.now` (`AppProvider` `clock` default, `EventLog` clock, and `useNow`), so time travel uses Playwright's `page.clock` (`install`, `setSystemTime`, `fastForward`).
- **Scripts:** throwaway Playwright scripts. Every bug fixed here has a permanent regression test in `tests/e2e/qa-regressions.spec.ts` or `apps/web/src/ui/plotMath.test.ts`.

After the fixes: `pnpm --filter @tudel/web test` (52 tests), `pnpm --filter @tudel/web typecheck`, and `pnpm e2e` (53 tests, including L6) are green.

## Summary

| # | Item | Result |
|---|---|---|
| 1 | First run | **Pass** |
| 2 | Lesson | **Pass** (after fixes B1 and B4) |
| 3 | Exercises | **Pass** (after fixes B2 and B3) |
| 4 | Close mid-session | **Pass** |
| 5 | Overrides | **Pass** (see UX notes U3 and U4) |
| 6 | Library | **Pass** |
| 7 | Export, clear, import | **Pass** |
| 8 | Offline | **Pass** (after fix B5) |
| 9 | Time travel | **Pass** (interleaving across units is not testable: M1 has one unit) |
| — | Extra checks: no editor/REPL, console errors, double-clicks, Play/Stop spam, back/forward, copy | **Pass** (after fix B2) |

## 1. First run

**Steps.** Open `#/` in a fresh profile.

**Observed.** Today shows "0 reviews due · New skill: Choose a waveform (lesson + 3 drills) · About 13 min". `snd.waveforms` is the only skill with no prerequisites. The skills table lists all five as "not started". No console errors.

**Result.** Pass. Evidence: `screenshots/M1/01-first-run-today.png`, `screenshots/M1/07-phone-390-today.png`.

## 2. Lesson

**Steps.**
- Start the session and go through the lesson step.
- Open all five lessons from the library.
- Click Play on lesson snippets while measuring output RMS.
- Click every copy button in every lesson and in every revealed exercise. Compare the clipboard with the bundle's `snippet.code` (exact string) and with the displayed text.

**Observed.**
- **Block types render:** html with citation links, play, compare, bridge, idiom ("Zen of Strudel"), filter plot, envelope plot, signal plot, and diagram. ABC notation renders in exercise prompts.
- **Play:** sounds on the first click (RMS ≈ 0.09–0.17). Stop silences the output within one note length.
- **Copy:** 46 of 46 copy buttons put the exact bundle code on the clipboard.
- **Envelope plot:** the "0.5 s" release marker label overlapped the "0.51 s" end label (fixed as **B4**). The end label was also clipped at the right edge.
- **Dark mode:** syntax-highlighted code was nearly unreadable (fixed as **B1**).

**Result.** Pass after fixes. Evidence: `screenshots/M1/02-session-lesson.png`, `screenshots/M1/09-envelope-plot-after-fix.png`.

## 3. Exercises

**Steps.**
- Run a full session: lesson, then 3 drills.
- Use the library to open all 20 variants, covering every type present: `spec-to-code`, `dictation`, `match-by-ear`, `describe-to-code`, `sweep`, `recall`.
- Check each variant before reveal, after reveal, and while rating.

**Observed.**
- **Reveal gating:** no variant shows any solution code before reveal. `match-by-ear` shows only "Target sound" with Play, Loop and Speed.
- **Ear types:** only `match-by-ear` has a target player and a speed selector before reveal, which is correct. Slow-down works: a 1-cycle target plays for 2.3 s at 1× and 4.3 s at 0.5×.
- **After reveal:** reference code with Copy, Play reference, live piano roll, static roll, "Also accepted" alternatives, the "Listen for" checklist, and the Again/Hard/Good/Easy buttons.
- **Live piano roll:** it animates. Canvas frames differ while playing and the active note is outlined. It is static after auto-stop.
- **Dictation:** staff notation renders via a lazily loaded abcjs (~0.5 s with no placeholder; see U1).
- **Bugs found:**
  - Double-dispatched clicks logged duplicate events (**B2**).
  - Lesson audio kept playing into the drills (**B3**).

**Result.** Pass after fixes. Evidence: `screenshots/M1/03-match-by-ear-before-reveal.png`, `screenshots/M1/04-match-by-ear-revealed.png`.

## 4. Close mid-session and resume

**Steps.** Close the tab (close the page; reopen in the same profile) at these points:
- A: mid-lesson.
- B: exercise shown, before reveal.
- C: after reveal, before rating.
- D: between drills.
- E: immediately after clicking Reveal, without waiting.
- F: immediately after clicking a rating.

Then reopen `#/` (and `#/session` directly).

**Observed.**
- **Today offers to continue:** in every case Today shows "You have a session in progress: step N of M" with *Continue session* and *Start a fresh session instead*.
- **Same step, same state:** the resumed step and variant were always identical, and the revealed state was preserved (C, E).
- **No duplicates or losses:** no duplicate `variant_shown` events on resume, and no lost reveal or rating even when closing right after the click (E, F).

**Result.** Pass.

## 5. Overrides

**Steps.** Use the library skill page and the in-exercise footer, with time travel.

**Observed.**
- **Mark known (waveforms):** status "marked known". Today's new skill switches to Low-pass, because a known prerequisite counts as met.
- **Show again soon:**
  - On a not-started skill whose prerequisites are met (high-pass, after low-pass was marked known), it becomes the next new skill ahead of curriculum order.
  - On a started skill (waveforms, 1 min after its session), status becomes "due now" and Today shows "1 review due".
  - On a skill whose prerequisites are unmet, it has no visible effect until they are met (U3).
- **Retire (low-pass):** not proposed even 40 days later; status "retired". Restore makes it "due now" (overdue) at once.
- **Retire inside a session:** the menu updates ("Overrides · retired"), but the current drill stays on screen (U4).

**Result.** Pass.

## 6. Library

**Steps.** Library → unit → each skill → lesson and every variant link, then reveal and rate out of session.

**Observed.**
- 1 unit, 5 skills, 5 lessons, and 20 of 20 variants are reachable.
- Out-of-session exercises say "Practising outside a session. Your rating still updates the skill's schedule".
- Unknown routes and ids show friendly "not found" messages.
- No console errors.

**Result.** Pass.

## 7. Export, clear storage, import

**Steps.**
1. Build history over 3 simulated days: two sessions (Good, then Hard), session length set to 25, a session left revealed and unrated, and high-pass retired.
2. Freeze the clock.
3. Record Today's full text and the raw IndexedDB events.
4. Export from `#/data`.
5. Delete the `strudel-tutor` database and reload, giving a fresh Today.
6. Import the file.
7. Compare, then reload and compare again.

**Observed.**
- **Equality:** the 31 events are byte-identical (`JSON.stringify`). Today's text is identical straight after import and after a reload.
- **Resume after import:** the half-done session resumes at the same step, still revealed.
- **File name:** `tudel-progress-2026-10-07.json`.
- **Confirm dialog:** states the event counts.
- **Bad file:** rejected with "Not a tudel progress file" and the data is untouched.

**Result.** Pass.

## 8. Offline after first load

**Steps.**
1. Load the app online and let the idle preload run.
2. Go offline: `context.setOffline(true)` and, separately, block all non-localhost requests.
3. Play target, reference, and lesson snippets while measuring RMS.
4. Open a dictation.

**Observed.**
- **Banner:** appears on going offline.
- **Synth playback:** works (RMS ≈ 0.10–0.17, about 100 ms to start).
- **CDN sample maps:** these fail, and Strudel's prebake logs `TypeError: Failed to fetch` to the console. This is expected noise, offline only.
- **Notation before the fix:** a dictation opened offline, when no dictation had been viewed before, showed "Could not render notation: Failed to fetch dynamically imported module …abcjs….js" (**B5**). Fixed by preloading abcjs at idle.
- **No network-tagged content:** no M1 snippet is tagged `needsNetwork`, so the per-snippet "Needs network" note can't be exercised with real content. Blocking only the CDN (still "online") correctly shows no banner.

**Result.** Pass after fix. Evidence: `screenshots/M1/08-offline-banner-playing.png`.

## 9. Time travel

**Steps.** `page.clock.install` at 2026-10-05 09:00, then:
- One new-skill session per day for 4 days, all rated Good.
- Jump +30 days, rating waveforms Again and everything else Good.
- Jump +30 days again.
- Jump +1 day.

**Observed.**
- **Days 0–3:** one new skill per day, lesson plus 3 drills, in prerequisite order: waveforms → low-pass → high-pass → amp-envelope.
- **+30 days, cap and order:** "2 reviews due (+2 more held for next time) · New skill: Filter sweeps over bars · About 18 min". Reviews come first, then the new lesson and drills. The cap is driven by the 20-minute budget while a new skill is pending.
- **+30 days, rotation:** waveforms review served **v04**, the only variant not yet seen. The low-pass review served **v01**, the least recently seen once all were seen.
- **+60 days:** "4 reviews due · No new skill", ordered most overdue first. The waveforms review rotated to v01, the least recent.
- **+61 days:** after two consecutive Agains, waveforms comes back with a **Refresher lesson** before the drill, which served v02 (rotation continues).
- **Interleaving:** interleaving across units can't be observed because M1 has a single unit. It is covered by unit tests in `session.test.ts`.

**Result.** Pass.

## Extra adversarial checks

- **No editor or REPL anywhere.**
  - What I checked: every route (Today, library, skill, lesson, variant, data, session, not-found).
  - Found: no `textarea`, `contenteditable`, text `input`, CodeMirror, or Monaco. Only checkboxes, `select`s, and a hidden file input. Every code display has a Copy button.
- **Console errors.**
  - Found: none across all online runs.
  - Offline only: Strudel prebake logs fetch failures for CDN sample maps (expected).
- **Rapid double-clicks.**
  - Real double-clicks (`dblclick()`): no duplicates.
  - Two clicks dispatched in the same task (`el.click(); el.click()`): this produced two `session_started` events (an orphan session), duplicate `lesson_completed` and `revealed`, and **two `rated` events for one step**, both fed into FSRS. "Again" followed by "Easy" in one task recorded both.
  - Fixed as **B2**.
- **Play/Stop spam.**
  - 21 and 41 fast real clicks, plus 10 same-task clicks: the button state and engine state always agree, and nothing layers (the RMS of a looped snippet is unchanged).
  - Starting snippet B while A plays switches A's button back to Play.
- **Browser back/forward during a session.**
  - Back from a revealed exercise goes to Today, which offers Continue. Forward returns to the same step, still revealed.
  - Back and forward after rating or after completion behave sensibly ("Session complete").
  - Session steps are not history entries, so Back leaves the session rather than stepping back (by design).
- **Leaving a page while audio loops.**
  - Looping audio kept playing after navigating away, and the new page had no Stop button. Going back showed "Stop" again.
  - Fixed as **B3**.
- **Skip step.**
  - Skipping all 4 steps completes the session ("0 exercises rated, 4 skipped"). The skill stays new and is proposed again.

## Bugs

| ID | Severity | Status | Bug | Fix | Regression test |
|---|---|---|---|---|---|
| B1 | **High** (dark mode; affects every code display) | Fixed | With `prefers-color-scheme: dark`, Shiki tokens kept their light-theme colours (e.g. strings `#032F62` on `#1a1c20`), so code was almost invisible. The HTML ships `--shiki-dark` variables, but no CSS applied them. | `apps/web/src/ui/styles.css`: in dark mode, `.code-html .shiki span { color: var(--shiki-dark) !important }` | `qa-regressions.spec.ts` › dark mode › token contrast > 4.5:1 |
| B2 | Medium (corrupts the log and FSRS when it happens; needs same-task double dispatch, e.g. ghost clicks, assistive tech, or automation) | Fixed | Start, Continue, Reveal, Rate and Skip relied only on `busy` state. Two clicks before React re-rendered both ran, duplicating `session_started` (orphan session) and `lesson_completed`, and adding **two FSRS ratings for one step**. | New `apps/web/src/ui/useGuard.ts`: a ref-based one-at-a-time guard, used in `TodayPage`, `SessionPage` (skip, lesson continue) and `ExerciseView` (reveal, rate) | `qa-regressions.spec.ts` › same-task double clicks … |
| B3 | Medium | Fixed | Playback outlived the controls that started it. A looping lesson snippet kept sounding after navigating to another page, or after "Continue to the drills", with no Stop button on screen. | `apps/web/src/ui/components.tsx` `PlayControls`: on unmount, stop the engine if this control owns the playback | `qa-regressions.spec.ts` › looping playback stops when its page is left; › a lesson snippet stops when the session moves on (both measure output RMS) |
| B4 | Low (cosmetic) | Fixed | Envelope plot: with a short release, the "release start" and "end" tick labels overlapped ("0.5 s" over "0.51 s"), and the right-most label was clipped. | `plotMath.ts` `thinTicks()` drops crowded ticks, keeping first and last; edge labels are anchored `end` in `plots.tsx` | `plotMath.test.ts` › thins crowded axis ticks |
| B5 | Medium (offline promise) | Fixed | Offline after first load, a dictation's staff notation failed to render if no dictation had been opened before going offline, because the abcjs chunk is lazy-loaded. | `notation/Abc.tsx` `preloadNotation()`, called with `engine.preload()` at idle in `main.tsx` | `qa-regressions.spec.ts` › offline after first load: dictation staff notation still renders |

**Open bugs:** none confirmed.

## UX observations and design questions (not fixed)

- **U1. Notation pops in.** abcjs loads lazily, so the dictation staff appears after ~0.5 s, with a layout shift and no placeholder. At 390 px the staff scales down to a small size (key signature readable but tight).
- **U2. Sessions run short with no reviews.** A session with only a new skill is estimated at about 13 minutes, below R-SESSION's 15–30-minute band and the 20-minute default. The builder never adds extra drills or a second new skill to fill the budget. That is defensible for a first-run slice, but the learner should know.
- **U3. "Show again soon" can look like it did nothing.** On a skill whose prerequisites aren't met, it sets a hidden "prioritized" flag with no visible feedback (status stays "not started"). Also, several prioritized skills resolve in curriculum order, and the flag clears only when the skill is rated. Consider a hint like "will come next once *X* is introduced".
- **U4. Retiring or marking known mid-session keeps the drill.** The current session's planned steps for that skill stay in the session. Possibly intended; worth deciding.
- **U5. Fluency timing counts closed-tab time.** It is measured from the first `variant_shown`, so if the learner closes the tab before revealing and comes back the next day, the recorded prompt-to-reveal time includes the gap. This is informational only and never feeds FSRS (PROPOSAL §14), but it will skew the per-skill trend.
- **U6. Repeated out-of-session ratings.** In library practice the rating buttons stay active after rating, so the learner can rate the same view again, adding another FSRS review. Consider locking after one rating (as in sessions) or labelling it explicitly.
- **U7. Skipped-only sessions read as finished.** "You finished a session today" also appears after a session where every step was skipped.
- **U8. Empty live piano roll.** It is an empty box until something plays, and it shows only pitch, so timbre drills (filter, envelope) get little from it. The static roll is more useful there. Fine for M1.
- **U9. Offline console noise.** Strudel's prebake logs `TypeError: Failed to fetch` for every CDN sample map. The app handles it (failed loaders are tracked), but the console is noisy.
- **U10. Back leaves the session.** Browser Back from a session step leaves the session rather than going to the previous step. That is reasonable, and resume makes it lossless.

## Follow-up (2026-10-05)

U2 to U7 are addressed in ADR 0100 amendment 1:

- **U2:** session fill toward the chosen length.
- **U3:** a "queued" note for show-again-soon.
- **U4:** a retired or known skill's unstarted steps are dropped.
- **U5:** fluency is timed within one page lifetime and capped at 30 min.
- **U6:** one rating per library view, plus "Practise again".
- **U7:** an all-skipped session reads "Session ended".

Unit tests: `session.test.ts` and `srs.test.ts`. E2E: `tests/e2e/session-gaps.spec.ts`.
