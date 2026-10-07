---
id: snd.noise.lesson
title: Noise sources
skill: snd.noise
---

**Noise** is sound with no pitch: random values instead of a repeating wave. Strudel has three noise synths, chosen with `s` like a waveform: `"white"`, `"pink"` and `"brown"` {cite src="packages/superdough/helpers.mjs#L7-L7"} {cite src="packages/superdough/synth.mjs#L407-L421"}. They ignore `note`, but they use the same amplitude envelope and defaults as the waveforms, so `decay` and `sustain` turn them into hits {cite src="packages/superdough/synth.mjs#L411-L415"} {cite src="packages/superdough/synth.mjs#L435-L438"}.

The three differ in where their energy sits. White noise has equal power in every band of equal width in hertz, so most of it is high: a bright hiss. Pink noise falls by 3 dB per octave and brown by 6 dB per octave, so each is darker than the last ([Colors of noise](https://en.wikipedia.org/wiki/Colors_of_noise)). Strudel makes brown noise by summing (integrating) white noise, the textbook method {cite src="packages/superdough/noise.mjs#L19-L36"}. In this version the formulas also leave pink about 10 dB and brown about 20 dB quieter than white (as RMS level), so the demo evens out their levels with `gain`:

:::play{label="white, pink, brown, one bar each, levels matched"}
s("<white pink brown>").gain("<0.3 0.9 3>")
:::

The `noise` parameter is different: it mixes pink noise into a waveform synth, for breath on a pitched note {cite doc=noise} {cite src="packages/superdough/synth.mjs#L539-L542"} {cite src="packages/superdough/noise.mjs#L65-L67"}. The mix happens before the amplitude envelope, so the breath starts and stops with the note {cite src="packages/superdough/synth.mjs#L61-L68"} {cite src="packages/superdough/synth.mjs#L552-L553"}:

:::diagram
digraph noise {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  osc [label="waveform\ns(\"sine\")"];
  pink [label="pink noise\nlevel set by noise"];
  mix [label="mix"];
  env [label="amp envelope"];
  out [label="filters, output"];
  osc -> mix;
  pink -> mix;
  mix -> env -> out;
}
:::

Up to `noise(0.5)` the tone stays at full level and the noise's gain is twice the value: 0.1 gives the noise a gain of 0.2. Above 0.5 the tone fades, and `noise(1)` is noise alone {cite src="packages/superdough/helpers.mjs#L293-L307"}.

:::compare{diff="noise: none → 0.3"}
a:
  label: Pure sine
  code: note("g4 a4 b4 d5").s("sine")
b:
  label: noise 0.3
  code: note("g4 a4 b4 d5").s("sine").noise(0.3)
:::

:::bridge{title="Breath in the tone"}
A breathy choral tone lets air through with the pitch, and a flute always carries some breath. `noise` adds that air to a synth voice; a short burst of white noise is the consonant without the vowel, like a whispered "ts".
:::
