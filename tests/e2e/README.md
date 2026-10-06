# End-to-end tests (Playwright)

Run with `pnpm e2e` from the repo root. The config lives in `apps/web/playwright.config.ts`; it builds the app, serves it with `vite preview`, and runs these specs in Chromium.

| Spec | Covers |
|---|---|
| `session.spec.ts` | Today flow: lesson, drills, reveal, rating, completion |
| `resume.spec.ts` | Closing the tab mid-session and resuming at the exact step |
| `session-gaps.spec.ts` | Session length fill, dropping a retired skill's steps mid-session, all-skipped sessions, one rating per library view, "show again soon" feedback, fluency time across a closed tab |
| `overrides.spec.ts` | Show again soon, retire, mark known / skip ahead, restore |
| `library.spec.ts` | Library navigation, every lesson renders, offline banner |
| `copy.spec.ts` | Every code display has a copy button that copies the exact code |
| `data.spec.ts` | Export → import round trip into a fresh profile |
| `l6-audio.spec.ts` | **Gate L6**: every reference and lesson snippet plays through the real engine with no errors and RMS above the threshold |

Environment variables: `L6_OFFLINE=1` (skip network-needing snippets and block the network), `L6_RMS_THRESHOLD`, `TUTOR_FIXTURE=1` (run against the fixture bundle). `pw/` is a small re-export shim so the specs resolve `@playwright/test` (ADR 0104).
