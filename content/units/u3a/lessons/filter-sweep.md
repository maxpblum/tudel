---
id: snd.filter-sweep.lesson
title: Filter sweeps over bars
skill: snd.filter-sweep
---

Any parameter can take a pattern instead of a number. Here are two ways to move a cutoff over time.

**Terraced: one value per bar.** Angle brackets play one of their values per cycle, and this course counts one cycle as one bar:

:::play{label="Cutoff steps up every bar: 300, 600, 1200, 2400 Hz"}
note("c4*8").s("sawtooth").lpf("<300 600 1200 2400>")
:::

**Hairpin: a continuous signal.** A signal is a pattern that has a value at every moment instead of a list of steps. `sine` moves smoothly between 0 and 1, once per cycle {cite doc=sine} {cite src="packages/core/signal.mjs#L70-L80"}. `saw` ramps from 0 to 1, once per cycle {cite doc=saw} {cite src="packages/core/signal.mjs#L35-L35"}. `range(min, max)` rescales a signal to that range {cite doc=range}, and `slow(n)` stretches it over *n* cycles {cite doc=slow}. So `sine.range(400, 2000).slow(4)` swings between 400 and 2000 Hz once per four-bar phrase:

:::signal
shape: sine
min: 400
max: 2000
period: 4
cycles: 8
label: sine.range(400, 2000).slow(4)
:::

:::play{label="Sine sweep over a 4-bar phrase"}
note("c4*8").s("sawtooth").lpf(sine.range(400, 2000).slow(4))
:::

Where does a sweep start? `sine` begins at its midpoint (1200 Hz here) and rises first {cite src="packages/core/signal.mjs#L70-L80"}. `saw` starts at its minimum every period, climbs, then jumps back {cite src="packages/core/signal.mjs#L23-L35"}. For "open up across the phrase, then reset", use `saw`:

:::signal
shape: saw
min: 400
max: 2000
period: 4
cycles: 8
label: saw.range(400, 2000).slow(4)
:::

:::play{label="Saw sweep: opens over 4 bars, then resets"}
note("c4*8").s("sawtooth").lpf(saw.range(400, 2000).slow(4))
:::

Each note reads the signal once, at its onset {cite src="packages/core/signal.mjs#L18-L21"}, and keeps that cutoff for its whole length {cite src="packages/superdough/helpers.mjs#L241-L248"}. So the notes carry the sweep: `"c4*8"` gives 32 small steps over four bars, a near-smooth glide; one whole note per bar gives only four.

`range` is linear in hertz, but the ear hears octaves: a linear saw from 200 to 4000 Hz spends about half its time above 2000 Hz, the top octave. `rangex` follows an exponential curve {cite doc=rangex}, giving each octave equal time {cite src="packages/core/pattern.mjs#L1786-L1788"}; you will meet it later.

:::bridge{title="Terraced dynamics versus a hairpin"}
`"<...>"` works like terraced dynamics: each section enters at its own level. A signal works like a hairpin, shaped across the phrase; a sine is a chain of them, crescendo then diminuendo.
:::
