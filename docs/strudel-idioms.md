# The zen of Strudel: idioms and antipatterns

A growing list of idioms, each with the antipattern it replaces and a citation. A citation points to the pinned `doc.json` (`tools/strudel-ref/doc.json`), to a line range in the pinned source clone (`tools/strudel-ref/.cache/strudel`, commit in `tools/strudel-ref/pin.json`), or to the official workshop (`website/src/pages/workshop/` in the same clone). Each skill's `idiom_note` in `content/skills.yaml` is a one-line version of one of these entries.

Every code example here was run through the verify harness. Antipatterns are marked as such. They evaluate, but they are not the style the tutor models. Code formatting follows `docs/house-style.md`.

This list starts with the idioms U3a uses. Later units add to it, and U12 consolidates it.

---

## 1. Say what, then with what

Lead with the notes, then choose the sound, then shape it:

```js
note("c3 eb3 g3 bb3").s("sawtooth").lpf(800)
```

- **Why:** it reads like a score with a registration marked on it. It is also the shape of every example in the official docs and workshop: `note(...)` then `.sound(...)`/`.s(...)` (doc.json `adsr`, `lpenv`; `website/src/pages/workshop/first-effects.mdx#L19-L22`).
- **Antipattern:** leaving out `s` and relying on the default sound. Without `s`, superdough plays a triangle (`packages/superdough/superdough.mjs#L180-L181`; the docs say the same in `website/src/pages/learn/synths.mdx#L24`). It works, but a reader has to know the default. Write `.s("triangle")`.
- **Used in:** `snd.waveforms`.

## 2. A parameter can be a pattern

Anything that takes a number also takes a mini-notation string or a signal. Put the change *inside* the parameter:

```js
note("c2*8").s("sawtooth").lpf("<300 600 1200 2400>")
```

- **Why:** the line shows the musical idea once, plus how it varies. Copying the whole line once per bar hides the idea. The doc.json examples for `lpf`, `lpq`, `hpf` and `attack` all pattern the parameter itself, e.g. `.lpf("<4000 2000 1000 500 200 100>")` (doc.json `lpf`). The workshop's "pattern the filter" step does the same (`website/src/pages/workshop/first-effects.mdx#L34-L46`).
- **Same for sound names:** `s("<sawtooth square triangle sine>")` changes the waveform each bar (verified with the harness: one hap per cycle with `s:sawtooth`, `s:square`, …).
- **Antipattern:** four near-identical lines, or `$:` parts, that differ in one number.
- **Used in:** `snd.waveforms`, `snd.filter-sweep`, `snd.highpass.v03`.

## 3. Steps per bar with `<...>`, glides with a signal

- `"<a b c d>"` gives one value per cycle (one bar in this course; `docs/time-conventions.md`). It is terraced, like Baroque dynamics.
- `sine.range(lo, hi).slow(n)` glides over *n* bars. `sine` and `saw` run from 0 to 1 (doc.json `sine`, `saw`). `range` rescales them (doc.json `range`), and `slow` stretches them in time (doc.json `slow`). The workshop teaches exactly this chain (`website/src/pages/workshop/first-effects.mdx#L270-L290`).

```js
note("c2*8").s("sawtooth").lpf(sine.range(400, 2000).slow(4))
```

- **Pick the shape for the start you want:** `sine` starts at its *midpoint* and rises first (`packages/core/signal.mjs#L70-L80`). `saw` starts at its minimum and ramps up, then resets (`packages/core/signal.mjs#L23-L35`).
- **A signal needs events to carry it.** Each note reads the signal once, at its onset (`packages/core/signal.mjs#L18-L21`; verified with the harness). The note's filter cutoff is then fixed for its whole length (`packages/superdough/helpers.mjs#L241-L248`). So a sweep under one whole note per bar moves in bar-sized steps. Use eighths or sixteenths for a smooth glide.
- **Errata to watch for:** the workshop's text after `.lpf(sine.range(100, 2000).slow(4))` says "The whole modulation will now take 8 cycles to repeat" (`website/src/pages/workshop/first-effects.mdx#L284-L293`). In the pinned version it takes 4: `sine` has a period of 1 cycle (`packages/core/signal.mjs#L70`), and the harness shows the cutoff values repeating every 4 cycles. The tutor's content uses the verified behaviour.
- **Used in:** `snd.filter-sweep`.

## 4. Subtract from a rich source

Start with `"sawtooth"` or `"square"` and filter down, rather than trying to brighten a `"sine"`.

- **Why:** `lpf` and `hpf` are Web Audio biquad filters (`packages/superdough/helpers.mjs#L241-L248`). A filter can only attenuate partials that exist, and a sine has none above its fundamental.
- **Used in:** `snd.lowpass`, `snd.highpass`.

## 5. One fixed method order, for readers

Write the note, then `s`, then the envelope, then the filters, then `gain` and effects (house style). For example: `note(...).s(...).adsr(...).lpf(...).hpf(...).gain(...)`.

- **Why it's only a convention:** superdough's per-note chain is fixed. It runs oscillator → amp envelope (`packages/superdough/synth.mjs#L63-L68`) → gain → low-pass → high-pass (`packages/superdough/superdough.mjs#L651-L721`). Method-call order does **not** change it, because each control just sets a key on the same event, as the haps show. The convention follows that chain except for `gain`, which goes last by convention. Gain and the filters are both linear, so the position of `gain` doesn't change the sound either. Writing the same order everywhere makes code easy to scan.
- **Used in:** `snd.highpass`, and every reference that combines an envelope with a filter (`snd.amp-envelope.v03` and the amp-envelope lesson).

## 6. Set only the envelope stages you mean, and make "pluck" explicit

```js
note("c4 e4 g4 e4").s("square").decay(0.15).sustain(0)
```

- **Why:** with no envelope parameters, the synths use attack 0.001, decay 0.05, sustain 0.6 and release 0.01 (`packages/superdough/synth.mjs#L47-L51`). Once you set any stage, the unset times drop to their minimums and sustain is *inferred*. It is 1 if you set only `attack` (or neither attack nor decay), and 0.001 if you set `decay` without `sustain` (`packages/superdough/helpers.mjs#L167-L178`). `.decay(0.15)` alone already gives a pluck, but `.sustain(0)` says so to the reader. The official synth docs write it the same way: `.decay(.04).sustain(0)` (`website/src/pages/learn/synths.mdx#L35-L39`).
- **Pads:** `.attack(0.6).release(1.5)` is enough. Sustain is inferred as 1 (same source lines).
- **Antipattern:** `.adsr("0:0.15:0:0")` for a pluck. It sets a 0 release (clamped to 0.01) and a 0 attack (clamped to 0.001) explicitly, which is noise in the code.
- **Used in:** `snd.amp-envelope`.

## 7. `adsr("a:d:s:r")` when you set all four, separate calls when you pattern one

`adsr` takes the four values in one mini-notation string and sets exactly `attack`, `decay`, `sustain` and `release` (`packages/core/controls.mjs#L2572-L2576`; doc.json `adsr`; workshop "adsr short notation", `website/src/pages/workshop/first-effects.mdx#L129-L137`). The harness confirms that `.adsr("0.05:0.1:0.7:0.5")` and the four separate calls produce identical haps. Use the separate calls when only one stage changes over time, such as `.attack("<0 0.1 0.5>")` (doc.json `attack`).

- **Used in:** `snd.amp-envelope.v02`.

## 8. `gain` is the dynamic marking, and it is linear here

`gain` defaults to 0.8 (`packages/superdough/superdough.mjs#L180-L182`). In the pinned version it multiplies the signal linearly, because the gain curve is the identity unless `setGainCurve` is called (`packages/superdough/superdough.mjs#L65-L69`, `#L606-L611`). doc.json's description says "exponential amount" (doc.json `gain`), which does not match this source. Pattern it for accents: `.gain("[1 0.5]*4")`.

- **Used in:** `snd.amp-envelope`.

## 9. Prefer the named form over packed shorthands, unless the shorthand is the point

`lpf("600:8")` sets cutoff and resonance together (doc.json `lpf`: "you can also optionally add the 'lpq' parameter, separated by ':'"; `packages/core/controls.mjs#L1190-L1204`). It produces the same haps as `.lpf(600).lpq(8)`, but the named form is clearer to a reader. The tutor accepts both and models the named form. `adsr` (idiom 7) is the exception, because its four fields are universally known.

- **Used in:** `snd.lowpass.v01`.
