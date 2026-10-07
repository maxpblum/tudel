# End-to-end tests (Playwright)

Run with `pnpm e2e` from the repo root. The config lives in `apps/web/playwright.config.ts`; it builds the app, serves it with `vite preview`, and runs these specs in Chromium.

| Spec | Covers |
|---|---|
| `session.spec.ts` | Today flow: lesson, drills, reveal, rating, completion |
| `resume.spec.ts` | Closing the tab mid-session and resuming at the exact step |
| `session-gaps.spec.ts` | Session length fill, dropping a retired skill's steps mid-session, all-skipped sessions, one rating per library view, "show again soon" feedback, fluency time across a closed tab, and the fluency trend on the skill page |
| `overrides.spec.ts` | Show again soon, retire, mark known / skip ahead, restore, suspend then restore, unit focus and the Today focus chip |
| `library.spec.ts` | Library navigation, every lesson renders, offline banner, skill map nodes (also at 390px), search ("lowpass" finds `snd.lowpass`, "euclid" finds `rhy.euclid`), glossary pages and their skill links |
| `copy.spec.ts` | Every code display has a copy button that copies the exact code |
| `data.spec.ts` | Export → import round trip into a fresh profile |
| `l6-audio.spec.ts` | **Gate L6**: every reference and lesson snippet plays through the real engine with no errors and RMS above the threshold |

Most specs are content-generic: they take "the first new skill" from Today rather than naming it, because curriculum order (U1 before U3a) decides which skill that is. Named ids: `snd.waveforms`, `snd.lowpass` and unit `u3a` (U3a), and `rhy.euclid` (U1, search). The real `bundle.json` must be schema v2 (`pnpm verify`; to build one from a clean checkout of the committed content: `git archive HEAD content | tar -x -C <empty dir>`, then `pnpm verify --content <dir>/content --out apps/web/src/content/bundle.json`).

Environment variables: `L6_OFFLINE=1` (skip network-needing snippets and block the network), `L6_RMS_THRESHOLD`, `TUDEL_FIXTURE=1` (run against the fixture bundle). `pw/` is a small re-export shim so the specs resolve `@playwright/test` (ADR 0104).
