---
id: snd.filter-envelope.lesson
title: Filter envelopes and resonance
skill: snd.filter-envelope
---

The amplitude envelope shapes each note's loudness. A **filter envelope** shapes its brightness: it moves the low-pass cutoff on every note. `lpf` sets the cutoff the movement starts from and returns to, and `lpenv` sets how far it opens, in octaves above that {cite src="packages/superdough/helpers.mjs#L253-L263"}. With `.lpf(300).lpenv(4)` the cutoff rises four octaves, from 300 Hz to 4800 Hz (300 × 2 × 2 × 2 × 2), then falls back. The top is capped at 20 000 Hz {cite src="packages/superdough/helpers.mjs#L260-L261"}. Without `lpf` there is no low-pass to move, so `lpenv` does nothing {cite src="packages/superdough/superdough.mjs#L660-L660"}.

:::play{label="lpenv 0, 2, 4, 6 octaves above lpf 300 Hz, one bar each"}
note("a3 a3 c4 a3 e4 a3 g4 a4").s("sawtooth").lpf(300).lpenv("<0 2 4 6>")
:::

Four stages shape the movement: `lpattack` (seconds to open fully), `lpdecay` (seconds to fall to the sustain level), `lpsustain` (0 to 1) and `lprelease` (seconds to close after the note ends) {cite doc=lpattack} {cite doc=lpdecay} {cite doc=lpsustain} {cite doc=lprelease}. Set only `lpenv`, and they are 0.005 s, 0.14 s, 0 and 0.1 s: a quick flash of brightness on each note {cite src="packages/superdough/helpers.mjs#L250-L251"}. Set any stage, and the unset ones follow the amplitude envelope's rule; `lpdecay` alone gives sustain 0.001 {cite src="packages/superdough/helpers.mjs#L167-L178"}. Set a stage but no `lpenv`, and the depth is 1 octave {cite src="packages/superdough/helpers.mjs#L256-L256"}.

The cutoff moves evenly in octaves {cite src="packages/superdough/helpers.mjs#L58-L98"}. Below, 0 is the `lpf` cutoff and 1 is the top, for the default stages on a 0.25-second eighth note:

:::envelope
attack: 0.005
decay: 0.14
sustain: 0
release: 0.1
hold: 0.25
:::

`lpsustain` is measured in hertz, not octaves: 0.5 between 300 and 4800 Hz holds at 2550 Hz, about three octaves up {cite src="packages/superdough/helpers.mjs#L63-L64"}.

Add **resonance** and it squelches. `lpq` raises a peak at the same moving cutoff {cite src="packages/superdough/helpers.mjs#L245-L263"}, so every note sweeps a ringing, vowel-like peak down the spectrum:

:::compare{diff="lpq 1 dB (default) → 20 dB"}
a:
  label: Default resonance
  code: note("a3 a3 c4 a3 e4 a3 g4 a4").s("sawtooth").lpf(300).lpenv(4).gain(0.5)
b:
  label: lpq 20 dB
  code: |
    note("a3 a3 c4 a3 e4 a3 g4 a4")
      .s("sawtooth")
      .lpf(300)
      .lpq(20)
      .lpenv(4)
      .gain(0.5)
:::

:::bridge{title="A diphthong on every note"}
Sing "wah": the vowel opens from a dark, rounded "w" into a bright "ah". A filter envelope gives every note that opening and then closes it again. Resonance is a strong formant riding along, so each note says "wow".
:::
