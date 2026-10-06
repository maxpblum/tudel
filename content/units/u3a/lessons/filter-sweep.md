---
id: snd.filter-sweep.lesson
title: Filter sweeps over bars
skill: snd.filter-sweep
---

Any parameter can take a pattern instead of a number. There are two ways to move a cutoff over time.

**Terraced: one value per bar.** Angle brackets step through their values once per cycle, which in this course is one bar:

:::play{label="Cutoff steps up every bar: 300, 600, 1200, 2400"}
note("c2*8").s("sawtooth").lpf("<300 600 1200 2400>")
:::

**Hairpin: a continuous signal.** `sine` is a signal that moves smoothly between 0 and 1 {cite doc=sine}. `saw` ramps from 0 to 1 {cite doc=saw}. `range(min, max)` rescales a signal {cite doc=range}, and `slow(n)` stretches it over *n* cycles {cite doc=slow}. So `sine.range(400, 2000).slow(4)` rises and falls once per four-bar phrase:

:::signal
shape: sine
min: 400
max: 2000
period: 4
cycles: 8
label: sine.range(400, 2000).slow(4)
:::

:::play{label="Sine sweep over a 4-bar phrase"}
note("c2*8").s("sawtooth").lpf(sine.range(400, 2000).slow(4))
:::

Two details matter for where the sweep starts. `sine` begins at its midpoint and rises first {cite src="packages/core/signal.mjs#L70-L80"}. `saw` starts at its minimum every period and climbs {cite src="packages/core/signal.mjs#L23-L35"}. For "open up across the phrase, then reset", use `saw`.

Also, each note reads the signal once, at its onset {cite src="packages/core/signal.mjs#L18-L21"}, and its filter cutoff then stays put for the whole note {cite src="packages/superdough/helpers.mjs#L241-L248"}. A sweep only sounds smooth when there are notes to carry it. Eighths or sixteenths give a near-smooth glide. One whole note per bar gives one step per bar.

`range` is linear in hertz, and the ear hears pitch in octaves. So a wide sweep such as 200 to 4000 Hz seems to rush at the bottom and crawl at the top. `rangex` follows an exponential curve instead {cite doc=rangex}. You will use it in U4.

:::bridge{title="Terraced dynamics versus a hairpin"}
`"<...>"` works like terraced dynamics: each section enters at its own level. A signal works like a hairpin, shaped across the phrase. A sine is a pair of them, crescendo then diminuendo. You will often use both: steps to mark sections, a sweep to shape the phrase inside one.
:::
