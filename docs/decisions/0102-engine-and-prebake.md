# ADR 0102: Hidden playback engine, prebake copy, and output tap

- **Status:** accepted
- **Date:** 2026-10-05
- **Workstream:** B (web app)

## Context

R-PLAYBACK and R-SAMPLES: references play live through Strudel with no editor, and they should sound the same as on strudel.cc. PROPOSAL Appendix A.3/A.4 and risk K5. Gate L6 needs a way to measure the output level. Everything below was checked against the pinned clone (`f610965f`) and in headless Chromium through Playwright.

## Decision

1. **`@strudel/web@1.3.0` `initStrudel({prebake, onEvalError})`**, loaded with a dynamic `import()` on the first Play click (risk K5, lazy loading), so the AudioContext is created inside user activation. `initStrudel` registers `initAudioOnFirstClick`, which listens for `mousedown` that has already happened by then, so the engine calls `initAudio()` itself. That loads the worklets and resumes the context. Playback uses `repl.evaluate(code)` and `repl.stop()`.
2. **One Strudel instance.** `@strudel/web`'s dist is a self-contained bundle (core, webaudio, superdough). `@strudel/draw` and `@strudel/soundfonts` import `@strudel/core` and `@strudel/webaudio` directly, which would load a second copy with its own `soundMap`, so soundfonts would register into an instance the player never reads. `vite.config.ts` aliases `^@strudel/(core|webaudio)$` to the `@strudel/web` bundle. That bundle exports every name those packages import (checked). The build contains one copy of Strudel.
3. **The prebake (`src/engine/prebake.ts`)** is copied from `website/src/repl/prebake.mjs` at the pin, with attribution. Same loaders, same CDN (`https://strudel.b-cdn.net`), the same inline Dirt-Samples map, `aliasBank`, and the `Pattern.prototype.piano` helper. Deviations:
   - `registerSamplesFromDB` is dropped (strudel.cc user samples).
   - `files.mjs` (Tauri) is dropped.
   - `piano.mjs` is dropped, because the prebake's own later definition of `piano` overrides it.
   - `Promise.all` became `Promise.allSettled`, and the failed loaders are reported. Offline, synths must still play, and the app shows an offline note on snippets that need the network instead of failing to initialize.
   - The un-awaited `aliasBank(...)` gets a `.catch`, so offline use doesn't raise an unhandled rejection.
   - `@strudel/soundfonts@1.3.0` is a direct dependency, loaded with the same dynamic import as upstream. This supersedes PROPOSAL A.8's "not needed separately" note: under pnpm the app must declare it to import it.
4. **Slow-down** (ear exercises) appends `\nall(x => x.slow(f))` to the code. `all` is injected by the pinned repl (`packages/core/repl.mjs`), and every `all` transform is applied to the final stacked pattern, including `$:` parts. Speeds offered: 1×, 0.75× (f = 4/3), and 0.5× (f = 2). Pitch is unchanged.
5. **Loop vs. once.** Strudel patterns repeat forever. "Once" stops after `cycles × f / cps` seconds, reading `scheduler.cps` after evaluation so `setcpm` in the code is honored. "Loop" plays until Stop.
6. **Live piano roll:** `@strudel/draw`'s `Drawer` (synced to `repl.scheduler`) plus `drawPianoroll({ctx, time, haps, drawTime: [-2, 2], autorange: 1})`. These are the same primitives the strudel.cc REPL uses.
7. **Output tap for L6:** superdough mixes every orbit into `SuperdoughOutput.destinationGain`, which feeds `ctx.destination`. The engine connects an `AnalyserNode` (fftSize 2048) in parallel to `getSuperdoughAudioController().output.destinationGain`. That node is only replaced by `resetGlobalEffects()`, which the pin calls only from `renderPatternAudio` (offline export, unused here). The engine re-checks the node before every play anyway.
8. **Errors:** evaluation errors come from `onEvalError`. Scheduler and superdough errors (for example "sound X not found! Is it loaded?") are only `logger()` calls, which dispatch `strudel.log` DOM events, so the engine listens for those as well. Both reach the UI and the L6 harness.

## Verified in Chromium (Playwright, `--autoplay-policy=no-user-gesture-required`)

`note("c3 e3 g3").s("sawtooth").lpf(800)` had a max RMS of about 0.10 at the tap and exactly 0 after stop. CDN drums `s("bd sd")` had a max RMS of about 0.40. An unknown sound and an unknown method each produced an engine error. The slowed variant evaluated, and the live roll drew while playing.

## Consequences

- Bumping `@strudel/web` requires re-checking: the exported names used by draw and soundfonts, the `destinationGain` tap, `all`, and the prebake diff.
- Sample-bank snippets need the network. L6 can run offline (`L6_OFFLINE=1`) and then skips them.
