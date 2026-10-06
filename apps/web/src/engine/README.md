# engine/

Hidden Strudel playback (R-PLAYBACK). No editor UI.

- `index.ts`: the facade the UI uses: `engine.play(code, {slow, loop, cycles, ownerId})`, `stop()`, `isPlaying`, `subscribe()`, `onError()`, `attachPianoroll(canvas)`, `measureRms(ms)`. It holds no Strudel code.
- `strudelEngine.ts`: the real engine. It is **browser-only** (risk K5: importing `@strudel/web` sets `window.initStrudel`) and is loaded with a dynamic `import()` on the first `play()`. That call happens inside a click, so the AudioContext is created during user activation.
- `prebake.ts`: a copy of strudel.cc's `website/src/repl/prebake.mjs` at the pin. The header comment lists every difference from the original.
- `code.ts`: pure helpers: `slowedCode` (appends `all(x => x.slow(f))`) and `rms`.
- `strudel-modules.d.ts`: minimal types for the untyped `@strudel/*` packages.

Key facts, checked against the pinned source and in a real Chromium (details in ADR 0102):

- `@strudel/web` is a self-contained bundle. `vite.config.ts` aliases `@strudel/core` and `@strudel/webaudio` to it, so `@strudel/draw` and `@strudel/soundfonts` share the same instance (one `soundMap`, one `Pattern`).
- Output tap: an `AnalyserNode` connected in parallel to `getSuperdoughAudioController().output.destinationGain`.
- Evaluation errors come from the repl's `onEvalError`. Scheduler errors (for example "sound X not found") arrive only as `strudel.log` DOM events, and the engine listens for both.
- Without loop, playback stops after `cycles / cps × slow` seconds. `cps` is read after evaluation, so `setcpm` in the code is honored.
