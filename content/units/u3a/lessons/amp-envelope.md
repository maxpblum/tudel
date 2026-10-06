---
id: snd.amp-envelope.lesson
title: Articulation with an amplitude envelope
skill: snd.amp-envelope
---

The amplitude envelope is how a synth articulates. `attack` is the time in seconds to reach full level {cite doc=attack}. `decay` is the time to fall to the `sustain` level, a value from 0 to 1 {cite doc=decay} {cite doc=sustain}. `release` is the fade after the note ends {cite doc=release}. `adsr("a:d:s:r")` sets all four in one call {cite src="packages/core/controls.mjs#L2572-L2576"}. The synth envelope is linear {cite src="packages/superdough/synth.mjs#L65-L68"}.

:::envelope
attack: 0.001
decay: 0.2
sustain: 0
release: 0.01
hold: 0.5
:::

:::compare{diff="envelope: pluck (decay 0.2, sustain 0) → pad (attack 0.4, release 1)"}
a:
  label: Pluck
  code: note("c3 eb3 g3 bb3").s("sawtooth").decay(0.2).sustain(0).lpf(1500)
b:
  label: Pad
  code: note("c3 eb3 g3 bb3").s("sawtooth").attack(0.4).release(1).lpf(1500)
:::

The plot shows the pluck. In any envelope, the *sustain* phase lasts as long as the note: the envelope holds until the note's end, then releases {cite src="packages/superdough/synth.mjs#L63-L69"}. At the default tempo, a quarter note is half a second. If the attack is longer than the note, the note never reaches full level {cite src="packages/superdough/helpers.mjs#L80-L83"}.

Defaults change with what you set. With no envelope at all, the synths use attack 0.001, decay 0.05, sustain 0.6 and release 0.01 {cite src="packages/superdough/synth.mjs#L47-L51"}. Set any one stage and the unset times drop to almost zero. Sustain is inferred: it is 1 if you set only `attack`, but almost 0 if you set `decay` without `sustain` {cite src="packages/superdough/helpers.mjs#L167-L178"}. To make a pluck obvious to readers, write `.decay(0.2).sustain(0)`.

`gain` is the dynamic level. The default is 0.8 {cite src="packages/superdough/superdough.mjs#L180-L182"}. In the pinned version it multiplies the signal linearly, even though its doc entry says "exponential" {cite src="packages/superdough/superdough.mjs#L65-L69"} {cite src="packages/superdough/superdough.mjs#L606-L611"}. Patterned gain gives you accents:

:::play{label="Accent on each beat: gain 1, then 0.5"}
note("c3*8").s("sawtooth").decay(0.2).sustain(0).gain("[1 0.5]*4")
:::

:::bridge{title="Articulation you already know"}
A piano note is decay with no sustain: struck, then fading even with the key held. An organ pipe is close to a gate: a quick onset (with a little chiff), full sustain, a quick cut-off. A choir's *messa di voce* opens like a slow attack. Staccato versus legato is mostly note length, with release as the room's tail.
:::
