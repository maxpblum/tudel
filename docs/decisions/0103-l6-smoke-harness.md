# ADR 0103: Gate L6 runs through a hidden route in the production build

- **Status:** accepted
- **Date:** 2026-10-05
- **Workstream:** B (web app)

## Decision

- Gate L6 runs against `vite build` + `vite preview`: the same code and prebake that ship. The hidden route `#/__smoke` exposes `window.__smoke = {snippets, init(), run(id, {ms})}`.
- **Snippet list:** `smokeSnippets(bundle)` in `src/content/snippets.ts`. It covers each variant's canonical solution plus every `play` and `compare` snippet in lessons and prompts, including those inside bridges. The Playwright test imports the same function in Node to create **one test per snippet**, and it also asserts that the app's list matches.
- **Per snippet:** wait for silence (so release tails don't mask a silent snippet), play looped, sample the output tap every 40 ms for 3 s, then stop. A snippet passes if it caused no engine errors, no console errors and no page errors, and its max RMS is above `L6_RMS_THRESHOLD` (default 0.001, about −60 dBFS).
- Chromium is launched with `--autoplay-policy=no-user-gesture-required`. The test still clicks "Start engine" first, as the app does.
- **Offline:** `L6_OFFLINE=1` blocks every non-localhost request (Playwright routing) before the engine starts and skips snippets tagged `needsNetwork`. Online, the test also requires that every prebake loader succeeded.
- **E2E tests are content-agnostic:** they walk whatever bundle was built (the real one or the fixture), so they keep passing as content grows.

## Consequences

The full L6 run takes about 4 s per snippet, roughly 2 minutes for 30 snippets. It runs serially because there is one AudioContext.
