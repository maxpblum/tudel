---
id: chip.noise-drums.lesson
title: "Chip drums from noise and pitch drops"
skill: chip.noise-drums
---

A console with no drum samples still had drums. Its composers built them from two ingredients this course already has: **noise**, cut into short bursts by an envelope, and a **pitched note whose pitch falls very fast**. This lesson makes a hi-hat, a snare and a kick from those two, with no samples at all.

**Hi-hat: a very short burst of bright noise.** White noise has its energy spread up to the top of the hearing range, so it already sounds like a cymbal's hiss. To turn it into a closed hi-hat, make it very short and remove its low part. `decay(0.03).sustain(0)` lets each hit fall to silence 0.03 seconds (30 ms) after it starts, and `hpf(7000)` removes everything below about 7000 Hz {cite doc=decay} {cite doc=hpf}:

:::envelope
attack: 0.001
decay: 0.03
sustain: 0
release: 0.01
hold: 0.25
:::

:::play{label="Closed hi-hat: white noise, 30 ms decay, high-passed at 7000 Hz"}
s("white*8").decay(0.03).sustain(0).hpf(7000).gain(0.3)
:::

**Snare: a longer burst with more body.** Lengthen the decay to 0.12 to 0.2 seconds and keep more of the low and middle range, and the same noise becomes a snare. A lower `hpf` (or none) gives it body:

:::compare{diff="decay 0.03, hpf 7000 → decay 0.15, hpf 1500"}
a:
  label: Hi-hat
  code: s("~ white ~ white").decay(0.03).sustain(0).hpf(7000).gain(0.4)
b:
  label: Snare
  code: s("~ white ~ white").decay(0.15).sustain(0).hpf(1500).gain(0.4)
:::

Noise has no pitch, so it ignores `note` {cite src="packages/superdough/synth.mjs#L407-L421"}. Its colour comes only from the envelope and the filters.

**Kick: a pitch that falls.** A real bass drum's head starts at a higher pitch when it's struck hard and settles lower within a fraction of a second. A chip kick exaggerates this: a triangle note that starts several octaves high and drops to its written pitch almost instantly. That drop is a **pitch envelope**. `penv` sets its size in semitones and `pdecay` how many seconds the fall takes {cite doc=penv} {cite doc=pdecay} {cite src="packages/superdough/helpers.mjs#L326-L344"}. With only those two set, the note starts `penv` semitones above the written pitch and falls to it over `pdecay` seconds, because the envelope's sustain is left at 0 {cite src="packages/superdough/helpers.mjs#L167-L178"}.

`note("c3").penv(36).pdecay(0.05)` starts 36 semitones (three octaves) above C3, at C6, and lands on C3 after 0.05 seconds (50 ms). Add a short amplitude decay so the note stops like a drum:

:::play{label="Chip kick: triangle from C6 down to C3 in 50 ms, then a 150 ms decay"}
note("c3*4").s("triangle").penv(36).pdecay(0.05).decay(0.15).sustain(0)
:::

:::compare{diff="pdecay: 0.05 → 0.3"}
a:
  label: pdecay 0.05, a thump
  code: note("c3*4").s("triangle").penv(36).pdecay(0.05).decay(0.3).sustain(0)
b:
  label: pdecay 0.3, a laser zap
  code: note("c3*4").s("triangle").penv(36).pdecay(0.3).decay(0.3).sustain(0)
:::

At 50 ms the fall is too fast to hear as a glide: it is heard as a punch at the start of the note. At 300 ms you hear the pitch slide, the "pew" of a game's laser. The same tool also makes toms: `penv(12)` with `pdecay(0.1)` on written pitches G3, E3, C3 gives a falling tom fill.

Always set `pdecay` when you use `penv`. With `penv` alone, the envelope takes its other default shape and the pitch *rises* to the note over 0.2 seconds instead {cite src="packages/superdough/helpers.mjs#L334-L339"}.

**One noise channel or several?** On the NES the hi-hat and the snare shared the one noise channel, so they could never sound at the same moment. The kick usually borrowed the triangle channel for a split second, cutting off the bass note, or used the sample channel. You can write that constraint directly: one line of noise whose decay and filter change per step.

:::play{label="Hi-hat and snare on one noise channel: the snare steps get a longer decay and a lower high-pass"}
s("white*8")
  .decay("0.03 0.03 0.15 0.03 0.03 0.03 0.15 0.03")
  .sustain(0)
  .hpf("7000 7000 1500 7000 7000 7000 1500 7000")
  .gain(0.35)
:::

Or give each drum its own line, which is easier to read and lets hat and snare overlap. Either way, here is a full kit at 150 BPM:

:::play{label="Chip drum kit: kick, snare and hats, 150 BPM"}
setcpm(150 / 4)
$: note("c3 ~ ~ c3 ~ ~ c3 ~")
  .s("triangle")
  .penv(36)
  .pdecay(0.05)
  .decay(0.15)
  .sustain(0)
$: s("~ white ~ white").decay(0.15).sustain(0).hpf(1500).gain(0.35)
$: s("white*8").decay(0.03).sustain(0).hpf(7000).gain("0.3 0.15")
:::

The hats alternate between gain 0.3 and 0.15: an accent on each beat and a lighter offbeat, the only dynamics a machine drummer has.

:::bridge{title="Consonants without vowels"}
A choir's drum section is its consonants. A whispered "ts" is a hi-hat: noise, short, high. A "ch" held a little longer is a snare. The kick is the plosive "b" or "d": a fast change of pitch and pressure at the onset that is over before the vowel begins. Chip drums are built the same way, from the length and colour of a burst of breath-like noise and from the speed of a pitch fall.
:::
