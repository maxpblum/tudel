---
id: snd.amp-envelope.lesson
title: Articulation with an amplitude envelope
skill: snd.amp-envelope
---

The amplitude envelope, a synth's articulation, shapes each note's loudness from onset to silence. `attack` is the time in seconds to reach full level {cite doc=attack}. `decay` is the time in seconds to fall to the `sustain` level, a fraction of full level from 0 to 1 {cite doc=decay} {cite doc=sustain}. `release` is the fade, in seconds, after the note ends {cite doc=release}. `adsr("0.01:0.2:0.5:0.3")` sets all four, in that order {cite src="packages/core/controls.mjs#L2572-L2576"}. The ramps are straight lines {cite src="packages/superdough/synth.mjs#L65-L68"}.

A *pluck* is struck and dies away; a *pad* swells and lingers. The pluck, on a 0.5-second note:

:::envelope
attack: 0.001
decay: 0.2
sustain: 0
release: 0.01
hold: 0.5
:::

The pad:

:::envelope
attack: 0.4
decay: 0.001
sustain: 1
release: 1
hold: 0.5
:::

:::compare{diff="envelope: pluck (decay 0.2 s, sustain 0) → pad (attack 0.4 s, release 1 s)"}
a:
  label: Pluck
  code: note("c4 eb4 g4 bb4").s("sawtooth").decay(0.2).sustain(0).lpf(1500)
b:
  label: Pad
  code: note("c4 eb4 g4 bb4").s("sawtooth").attack(0.4).release(1).lpf(1500)
:::

The sustain level holds until the note ends, then the release begins {cite src="packages/superdough/synth.mjs#L63-L69"}. At the default 0.5 cycles per second {cite src="packages/core/cyclist.mjs#L24-L24"}, a cycle lasts 2 seconds; four notes share it, so each lasts 0.5 seconds and the pad's 0.4-second attack just fits. An attack longer than the note never reaches full level {cite src="packages/superdough/helpers.mjs#L80-L83"}.

Decay falls while the note is held; release falls after it ends:

:::compare{diff="envelope: decay 0.3 s with sustain 0 → release 0.3 s"}
a:
  label: Decay 0.3 s, sustain 0
  code: note("c4 eb4 g4 bb4").s("sawtooth").decay(0.3).sustain(0).lpf(1500)
b:
  label: Release 0.3 s
  code: note("c4 eb4 g4 bb4").s("sawtooth").release(0.3).lpf(1500)
:::

With no envelope set, the synths use attack 0.001 s, decay 0.05 s, sustain 0.6 and release 0.01 s {cite src="packages/superdough/synth.mjs#L47-L51"}. Set any of the four and the unset ones become attack and decay 0.001 s, release 0.01 s and sustain 1, except that `decay` without `sustain` gives sustain 0.001 {cite src="packages/superdough/helpers.mjs#L167-L178"}.

`gain` is the dynamic level, default 0.8 {cite src="packages/superdough/superdough.mjs#L180-L182"}. Despite its reference entry ("exponential"), it is a plain multiplier: 0.5 halves the amplitude (about −6 dB) {cite src="packages/superdough/superdough.mjs#L65-L69"} {cite src="packages/superdough/superdough.mjs#L606-L611"}. `"[1 0.5]*4"` plays the pair 1, 0.5 four times per cycle (one bar), accenting each beat's first eighth:

:::play{label="Accent on each beat: gain 1, then 0.5"}
note("c4*8").s("sawtooth").decay(0.2).sustain(0).gain("[1 0.5]*4")
:::

:::bridge{title="Articulation you already know"}
A piano note is decay with no sustain: struck, then fading even with the key held. A tongued brass note on steady breath is full sustain: quick attack, even level, quick stop. A short release is the damper stopping the string as the key comes up; a long one is like a touch of pedal.
:::
