---
id: det.supersaw.lesson
title: "Supersaw: one note, several saws slightly apart"
skill: det.supersaw
---

Tune two trombones to the same A and listen while one slide creeps in. While they are apart you hear a slow *wah-wah*, a swelling and fading of loudness. As they close in, it slows down, and at a perfect unison it stops. Those swells are called **beats**. Two tones that are close in frequency add up to one tone whose loudness rises and falls as many times per second as their frequencies differ: 440 Hz against 442 Hz beats twice per second ([Beat (acoustics)](https://en.wikipedia.org/wiki/Beat_(acoustics))).

Small tuning differences are measured in **cents**: 100 cents make one equal-tempered semitone, so 1200 make an octave. A cent is a ratio, not a fixed number of hertz, so the same distance in cents beats faster in a higher register. Two worked examples at A4 = 440 Hz:

| Two tones apart by | Upper tone | Beats per second |
|---|---|---|
| 10 cents | 440 × 2^(10/1200) ≈ 442.55 Hz | ≈ 2.5 |
| 2 cents | 440 × 2^(2/1200) ≈ 440.51 Hz | ≈ 0.5 |

An octave higher, at A5 = 880 Hz, the same 10 cents beat about 5 times per second.

**A synth that plays every note several times, slightly apart.** The sound `"supersaw"` is a bank of sawtooth oscillators that all play the same note, each tuned a little differently {cite src="packages/superdough/synth.mjs#L153-L178"}. Each of those oscillators is a **unison voice**. `unison` sets how many there are {cite doc=unison}: 5 unless you set it {cite src="packages/superdough/synth.mjs#L157-L157"}. With `unison(1)` you get a single plain sawtooth.

:::compare{diff="unison 1 → 5"}
a:
  label: unison(1), one sawtooth
  code: note("c4 eb4 g4 bb4").s("supersaw").unison(1).detune(0.2)
b:
  label: unison(5), five sawtooths 20 cents apart from top to bottom
  code: note("c4 eb4 g4 bb4").s("supersaw").unison(5).detune(0.2)
:::

More voices do not make it much louder. Strudel scales the level by 1 / √voices {cite src="packages/superdough/synth.mjs#L187-L194"}, so each of five voices plays at about 0.45 times the level a lone voice would have, and together they sound about as loud as one sawtooth.

**`detune` is the total spread, in semitones.** `detune` sets the distance from the lowest voice to the highest {cite doc=detune}, and the voices sit evenly between them {cite src="packages/superdough/worklets.mjs#L38-L49"} {cite src="packages/superdough/worklets.mjs#L550-L556"}. If you don't set it, it is 0.18 semitones, which is 18 cents {cite src="packages/superdough/synth.mjs#L158-L158"}. With 5 voices and a spread of D semitones:

:::diagram
digraph supersaw {
  rankdir=LR;
  node [shape=record, fontname="Helvetica", fontsize=12];
  v [label="{voice|1|2|3|4|5}|{offset, any detune D|-D/2|-D/4|0|+D/4|+D/2}|{offset, detune(0.18)|-9 cents|-4.5 cents|0 cents|+4.5 cents|+9 cents}|{offset, detune(0.5)|-25 cents|-12.5 cents|0 cents|+12.5 cents|+25 cents}"];
}
:::

The voices sit symmetrically around the written note, so the note you hear is in tune on average. With an odd number of voices the middle one is exactly on the written note; with an even number, such as `unison(2)`, none is, and the two middle voices straddle it.

**Why it shimmers.** Every pair of voices beats at its own rate. At C4 (261.63 Hz) with the default 0.18, neighbouring voices are 4.5 cents apart and beat about 0.7 times per second, and the outermost pair, 18 cents apart, about 2.7 times per second. Those rates are for the fundamentals. A sawtooth is rich in partials, as a brass tone is, and each partial beats faster in proportion: the second partial twice as fast, the tenth ten times as fast. With ten pairs beating at different slow rates, no single *wah-wah* stands out. The loudness of each harmonic wavers all the time, and the ear hears that as a moving, shimmering tone rather than as beats.

**Timbre or out of tune?** Small spreads fuse into one richer note. Large spreads stop fusing: you hear several pitches, and the chord sounds sour.

:::compare{diff="detune 0.1 → 0.5"}
a:
  label: detune(0.1), 10 cents top to bottom (±5 cents)
  code: note("c4 eb4 g4 bb4").s("supersaw").detune(0.1)
b:
  label: detune(0.5), 50 cents top to bottom (±25 cents)
  code: note("c4 eb4 g4 bb4").s("supersaw").detune(0.5)
:::

At 0.1, the outer pair at C4 is 10 cents apart and beats 1.5 times per second, a slow shimmer. At 0.5, the outer voices are a quarter tone apart (50 cents) and beat about 7.7 times per second at C4: the edges of the note become audible as separate, sour pitches. Nothing caps the value, so `detune(12)` spreads five voices over a whole octave, 3 semitones apart: the "note" is a diminished seventh chord.

**Two things that look as if they should work, but don't:**

- `detune` only changes oscillators that have several voices {cite doc=detune}. A plain `"sawtooth"` is one Web Audio oscillator whose pitch comes from the note alone {cite src="packages/superdough/synth.mjs#L521-L536"}, so `note("c4").s("sawtooth").detune(0.2)` sounds exactly like no detune. The next lessons show how to thicken a plain sawtooth by layering copies.
- If `detune` is unset, `"supersaw"` uses the `n` value as its detune {cite src="packages/superdough/synth.mjs#L157-L158"}. `n("0 2 4").scale("C4:minor")` is safe, because `scale` turns the degrees into notes. A bare `n("0 1 2").s("supersaw")` changes the spread by 0, 1 and 2 semitones instead of the pitch. Write pitches with `note` (or `n` with `scale`), and always set `detune` explicitly.

:::bridge{title="A choir section"}
Eight altos on one note are never exactly in tune: each sits a few cents from the others, and each moves a little. You don't hear eight pitches; you hear one note, fuller than any solo voice and with a less sharply focused pitch. That ensemble sound is what `"supersaw"` imitates. A spread of 10 to 20 cents (`detune` 0.1 to 0.2) is a well-blended section; 50 cents is a section that hasn't found the pitch.
:::
