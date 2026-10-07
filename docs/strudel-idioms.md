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

---

## Rhythm idioms (U1)

Each entry below is the long form of a `rhy.*` skill's `idiom_note`. The code examples are reference snippets from the U1 lessons and variants, so their haps are in `packages/verify/__snapshots__/`.

## R1. The tempo as `setcpm(BPM / 4)`, on the first line

```js
setcpm(90 / 4)
note("c4 e4 g4 c5").s("triangle")
```

- **Why:** `setcpm` takes cycles per minute (doc.json `setcpm`), and Strudel divides it by 60 to get cycles per second (`packages/core/repl.mjs#L132-L135`). With one cycle per 4/4 bar (`docs/time-conventions.md`), writing the division shows both the BPM and the four beats. doc.json's own example is `setcpm(140/4) // =140 bpm in 4/4`.
- **Antipattern:** `setcpm(22.5)`. It sets the same tempo, but the reader has to work out the BPM.
- **Used in:** `rhy.cycles-tempo`, `mod.signal-speed.v04`.

## R2. Plain drum names, and the machine once with `bank`

```js
s("bd hh sd hh").bank("RolandTR909")
```

- **Why:** `bank` puts the bank name and an underscore in front of each sound name (doc.json `bank`; `website/src/pages/learn/samples.mdx#L91-L92`). The rhythm stays readable, and switching machines is one edit.
- **Antipattern:** `s("RolandTR909_bd RolandTR909_hh RolandTR909_sd RolandTR909_hh")`.
- **Used in:** `rhy.drums` and every U1 drum snippet.

## R3. `*n` for a repeated note, `[ ]` for different notes in one step

```js
note("e4 e4*2 e4*3 e4*4").s("square")
```

- **Why:** both make several events share one step: `[ ]` is a sub-cycle (`packages/mini/krill.pegjs#L113-L113`), and `*n` speeds the step up n times (`packages/mini/krill.pegjs#L153-L154`; doc.json `fast`). `e4*3` and `[e4 e4 e4]` give identical haps (`rhy.subdivide.v03` lists both), but `*n` says "n times" without making the reader count.
- **Used in:** `rhy.subdivide`.

## R4. Count units: `@` and `!` share out a fixed bar

```js
note("~ g4!3 eb4@4").s("sawtooth")
```

- **Why:** `@n` gives a step weight n and `!n` repeats it as n full steps (`packages/mini/krill.pegjs#L134-L145`); the cycle is then shared by the total weight (`packages/mini/mini.mjs#L124-L132`). Here 1 + 3 + 4 = 8 units, so each unit is an eighth. The bar never stretches.
- **Antipattern:** `g4*3` where three full steps are meant: `*` squeezes the three Gs into one step.
- **Used in:** `rhy.rests-lengths`.

## R5. Put `< >` around only the part that changes

```js
note("e4 g4 f4 <d4 c4>").s("triangle")
```

- **Why:** angle brackets play one entry per cycle (`packages/mini/krill.pegjs#L122-L125`, `packages/mini/mini.mjs#L95-L96`). Writing them around the last beat only keeps the shared beats in one place.
- **Antipattern:** `note("<[e4 g4 f4 d4] [e4 g4 f4 c4]>").s("triangle")`. Same haps (`rhy.alternate.v03` lists both), but the shared notes are written twice.
- **Used in:** `rhy.alternate`.

## R6. Comma, `stack` or `$:`, by what the layers share

```js
s("bd sd bd sd, hh*8").bank("RolandTR909")
stack(note("e5*3"), note("c4*2")).s("triangle")
```

- **Why:** a comma stacks sequences inside one string (`packages/mini/krill.pegjs#L178-L180`, `packages/mini/mini.mjs#L88-L89`), so they share every method after it. `stack` does the same for whole patterns (doc.json `stack`). Parts with their own sounds get one `$:` line each: each labelled line becomes its own part (`packages/transpiler/transpiler.mjs#L468-L470`) and the parts are stacked (`packages/core/repl.mjs#L238-L258`).
- **Used in:** `rhy.layers`.

## R7. `(k,n)` for evenly spread hits

```js
s("rim(5,16)").bank("RolandTR808")
```

- **Why:** `(k,n)` spreads k hits over n slots with the Bjorklund algorithm (`packages/mini/krill.pegjs#L147-L148`, `packages/mini/mini.mjs#L36-L42`, `packages/core/euclid.mjs#L43-L52`). A third number rotates the hits r slots **later** in this version (`packages/core/euclid.mjs#L130-L136`, `packages/core/util.mjs#L153-L153`).
- **Antipattern:** spelling out sixteen steps with `~` when the spread is even. Write the rests out only when it is not.
- **Used in:** `rhy.euclid`.

---

## Modulation idioms (U4)

Each entry below is the long form of a `mod.*` skill's `idiom_note`. They extend idiom 3.

## M1. Pick the signal for the downbeat you want

- On the downbeat `sine` is at its middle, `cosine` and `isaw` at the top, and `saw`, `tri` and `square` at the bottom (`packages/core/signal.mjs#L35-L35`, `#L56-L56`, `#L70-L80`, `#L91-L91`, `#L107-L107`, `#L124-L124`). All six run from 0 to 1 once per cycle (doc.json `sine`, `cosine`, `saw`, `isaw`, `tri`, `square`).
- **Used in:** `mod.signals`.

## M2. Sweep frequencies with `rangex`

```js
note("c3*8").s("sawtooth").lpf(saw.rangex(200, 3200).slow(4))
```

- **Why:** `rangex` applies `range` to the logarithms of its bounds and exponentiates (`packages/core/pattern.mjs#L1786-L1788`), so equal times give equal frequency ratios: here one octave per bar. A linear `range` (`packages/core/pattern.mjs#L1771-L1773`) rushes through the low octaves. Both bounds must be above 0.
- **Used in:** `mod.range`, `mod.perlin.v03`, `mod.phrase-sweeps.v03`, `mod.phrase-sweeps.v04`.

## M3. Give every wobble at least four notes

```js
note("c3*16").s("sawtooth").lpf(sine.range(400, 2400).fast(4))
```

- **Why:** each note reads the signal once, at its onset (idiom 3). With `fast(4)` and eighth notes, every reading of the sine falls on its midpoint, so all eight notes get 1400 Hz; sixteenths read 1400, 2400, 1400 and 400 Hz in every beat (harness snapshots of `mod.signal-speed.lesson`).
- **Used in:** `mod.signal-speed`.

## M4. Write `segment` last

```js
note("c3*8").s("sawtooth").lpf(saw.range(300, 3500).slow(4).segment(4))
```

- **Why:** `segment(n)` imposes n steps per cycle of whatever it follows (`packages/core/pattern.mjs#L2173-L2175`), and `slow` stretches everything before it (doc.json `slow`). So `saw.slow(4).segment(4)` steps every beat, while `saw.segment(4).slow(4)` steps only every bar.
- **Used in:** `mod.segment`, `mod.signal-melody.v03`.

## M5. `perlin` for drift, `rand` for scatter, and both repeat

- `perlin` glides between random values placed at whole cycles (`packages/core/signal.mjs#L626-L635`); `rand` gives a value from the exact time it is read (`packages/core/signal.mjs#L449-L449`). Both depend only on time (`packages/core/signal.mjs#L237-L264`), so the same code gives the same values on every playback from the start, and both are 0 at cycle 0.
- **Used in:** `mod.perlin`.

## M6. The contour as a signal, the pitches from `scale`

```js
n(tri.range(0, 8).segment(8)).scale("C4:major").s("triangle")
```

- **Why:** the signal gives the contour, `range` the span in degrees, `segment` the notes per bar, and `scale` the pitches (doc.json `scale`). A fractional degree is rounded up (`packages/tonal/tonal.mjs#L36-L37`), so check which values the steps sample.
- **Used in:** `mod.signal-melody`.

## M7. Slow the signal before you give it a patterned range

```js
note("c3*8").s("sawtooth").lpf(saw.slow(8).range(300, "<1500 4000>/8"))
```

- **Why:** `slow` stretches everything written before it (doc.json `slow`). With plain numbers the order of `slow` and `range` does not matter. With a patterned bound it does: `saw.range(300, "<1500 4000>/8").slow(8)` would also stretch the bound, so each value would last 64 bars instead of 8.
- **Used in:** `mod.phrase-sweeps`.

---

## Sound idioms, continued (U3b)

Each entry below is the long form of a U3b skill's `idiom_note`. The code examples are reference solutions from the U3b variants, so the verifier runs them. Source line ranges are against the pinned commit.

## S1. `lpf` is the floor, `lpenv` the depth in octaves

```js
note("a3*8").s("sawtooth").lpf(400).lpenv(3)
```

- **Why:** with a filter envelope, the cutoff moves between `lpf` and `lpf` × 2^`lpenv` on every note (`packages/superdough/helpers.mjs#L253-L263`), capped at 20 000 Hz (`#L260-L261`). Without `lpf` there is no low-pass, so `lpenv` does nothing (`packages/superdough/superdough.mjs#L660-L660`). The default stages are 0.005 s, 0.14 s, 0 and 0.1 s (`helpers.mjs#L250-L251`).
- **Antipattern:** a fast signal on `lpf` for movement inside each note. A signal is sampled once, at each note's onset (`packages/core/signal.mjs#L18-L21`), so it cannot move the cutoff during a note. Keep signals and patterns for change across bars.
- **Used in:** `snd.filter-envelope`.

## S2. One `bpf` when you mean "only this band"

```js
note("c4 eb4 g4 bb4").s("sawtooth").bpf(1000).bpq(2.5)
```

- **Why:** `bpf` is a biquad of type bandpass, placed after the high-pass in the chain (`packages/superdough/superdough.mjs#L696-L758`), with a default Q of 1 (`packages/superdough/helpers.mjs#L219-L227`). Its centre and its width (about the centre divided by `bpq`) name the band directly.
- **Antipattern:** `.lpf(1200).hpf(800)`. Two filters make the reader work out the band from two edges.
- **Used in:** `snd.bandpass`.

## S3. FM on a sine: `fmh` picks the spectrum, `fmi` the brightness

```js
note("c4 e4 g4 c5").s("sine").fmi(2).fmh(2)
```

- **Why:** the modulator runs at the note's frequency times `fmh`, default 1 (`packages/superdough/helpers.mjs#L408-L412`, `#L443-L443`), and `fmi` scales the depth (`#L471-L474`). On a sine, every partial you hear comes from the modulation. Whole-number ratios keep the partials harmonic; decimal and complex ratios sound metallic (doc.json `fmh`).
- **Antipattern:** `.fm(2)`. `fm` is only a synonym of `fmi` (doc.json `fmi`), and house style uses primary names.
- **Used in:** `snd.fm`.

## S4. Set only the FM stages you mean, and write `fmsustain(0)` for a struck sound

```js
note("a4 c5 e5 a5").s("sine").fmi(6).fmdecay(0.5).fmsustain(0)
```

- **Why:** the FM envelope switches on when any of `fmattack`, `fmdecay`, `fmsustain` or `fmrelease` is set (`packages/superdough/helpers.mjs#L446-L466`). Unset stages follow the amplitude envelope's rule (`#L167-L178`), so `fmdecay` alone already gives a sustain of 0.001; `.fmsustain(0)` says so to the reader. The ramps are exponential unless `fmenv("lin")` is set (`#L452-L464`), and doc.json `fmenv` warns that exp "might be a bit broken".
- **Used in:** `snd.fm-envelope`.

## S5. Noise colours are sound names; breath is a parameter

```js
note("g4 a4 b4 d5").s("triangle").noise(0.2)
```

- **Why:** `"white"`, `"pink"` and `"brown"` are registered as synths with the same amplitude envelope as the waveforms (`packages/superdough/helpers.mjs#L7-L7`, `packages/superdough/synth.mjs#L407-L421`). The `noise` parameter mixes pink noise into a waveform before the amplitude envelope (`synth.mjs#L539-L542`, `packages/superdough/noise.mjs#L65-L67`), and up to 0.5 the tone stays at full level (`helpers.mjs#L293-L307`).
- **Antipattern:** `note("c4").s("pink")`. The noise synths never read a frequency (`synth.mjs#L407-L421`), so the note does nothing.
- **Used in:** `snd.noise`.

## S6. Pattern `room`, but set `roomsize` once per part

```js
note("c4 e4 g4 c5").s("triangle").decay(0.1).sustain(0).room("<0 0.3 0.6 0.9>")
```

- **Why:** `room` is a send level; the dry sound stays at full level (`packages/superdough/superdough.mjs#L938-L955`). All parts on an orbit share one reverb, and a changed `roomsize` regenerates it (`packages/superdough/superdoughoutput.mjs#L69-L93`). doc.json `roomsize` says to change it only sparingly.
- **Used in:** `snd.room`.

## S7. Time echoes in cycles with `delaysync`, written as a division

```js
note("c5 g4")
  .s("triangle")
  .decay(0.1)
  .sustain(0)
  .delay(0.5)
  .delaysync(1 / 4)
  .delayfeedback(0.3)
```

- **Why:** `delaysync` is in cycles (doc.json `delaysync`), and superdough converts it to seconds with the current tempo (`packages/superdough/superdough.mjs#L503-L503`, `packages/superdough/util.mjs#L76-L78`), so the echoes stay on the grid when the tempo changes. `1 / 4` reads as a quarter note; the default, 3/16, is a dotted eighth (`superdough.mjs#L194-L194`). A `delayfeedback` of 0 switches the delay off (`#L930-L930`), and values above 0.98 are clamped (`superdoughoutput.mjs#L53-L58`).
- **Antipattern:** an echo time in seconds. It does not follow the tempo, and `delaytime` is not taught (ADR 0201 §3).
- **Used in:** `snd.delay`.
