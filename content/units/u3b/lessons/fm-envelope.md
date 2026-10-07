---
id: snd.fm-envelope.lesson
title: FM envelopes
skill: snd.fm-envelope
---

With only `fmi` set, the modulation index stays the same for the whole note, so the brightness never changes. Real instruments rarely behave like that: a struck note is brightest at the strike, and a brass note gets brighter as it gets louder ([Chowning 1973](https://yamahasynth.com/wp-content/uploads/images/fm_synthesispaper-2.pdf)). An **FM envelope** moves the index over each note.

It has the same four stages as the amplitude envelope. `fmattack` is the time in seconds to reach the full `fmi` {cite doc=fmattack}, `fmdecay` the time to fall to the sustain level {cite doc=fmdecay}, and `fmsustain` that level, as a fraction of `fmi` from 0 to 1 {cite doc=fmsustain}. `fmrelease` sets the fall after the note ends {cite doc=fmrelease}. The envelope switches on as soon as you set any of the four, and it scales the index from 0 up to `fmi` and back {cite src="packages/superdough/helpers.mjs#L446-L466"}. Unset stages follow the amplitude envelope's rule: `fmdecay` alone gives a sustain of 0.001, and `fmattack` alone gives 1 {cite src="packages/superdough/helpers.mjs#L167-L178"}. Write `.fmsustain(0)` when you mean "fade to a pure sine".

Here is the index of a 0.5-second note with `.fmdecay(0.4).fmsustain(0)` and straight-line ramps (1 is the full `fmi`):

:::envelope
attack: 0.001
decay: 0.4
sustain: 0
release: 0.01
hold: 0.5
:::

`fmenv` chooses the ramp shape: `fmenv("lin")` for straight lines, or `fmenv("exp")`, the default {cite src="packages/superdough/helpers.mjs#L452-L464"}. Its reference entry warns that exp "might be a bit broken" {cite doc=fmenv}. An exp decay is curved: it falls from full to a tenth in the first third of `fmdecay`, then tapers. So exp sounds bright only at the very start, while lin stays bright longer and then drops away.

:::compare{diff="fmenv exp (default) → lin"}
a:
  label: exp (default)
  code: note("c4 e4 g4 c5").s("sine").fmi(6).fmdecay(0.4).fmsustain(0)
b:
  label: lin
  code: note("c4 e4 g4 c5").s("sine").fmi(6).fmdecay(0.4).fmsustain(0).fmenv("lin")
:::

:::bridge{title="The hammer and the crescendo"}
A piano note is brightest at the hammer strike and mellows as it fades: that is `fmdecay` with `fmsustain(0)`. A trombone crescendo gets brassier as it gets louder: that is `fmattack` set close to `attack`, so brightness grows with loudness.
:::
