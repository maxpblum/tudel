---
id: mod.phrase-sweeps.lesson
title: Sweeps that follow the form
skill: mod.phrase-sweeps
---

A sweep can follow the form as well as the bar. `.slow(4)` stretches a one-cycle signal over a four-bar phrase, and `.slow(8)` over an eight-bar verse {cite doc=slow}. Signals read the cycle count {cite src="packages/core/signal.mjs#L18-L21"}, and playback starts it at 0, the first bar {cite src="packages/core/cyclist.mjs#L101-L104"}. So `saw.slow(8)` starts at its minimum on bars 1, 9, 17 and so on (cycle 8 is bar 9).

**The shape places the peak.** Driving `lpf`, `tri.slow(8)` starts dark in bar 1, reaches its top on the downbeat of bar 5, and is dark again at bar 9 {cite src="packages/core/signal.mjs#L124-L124"}. Use `saw` to build to the end of the verse and drop at the next one, and `isaw` to start open and close through the verse.

:::signal
shape: tri
min: 300
max: 3000
period: 8
cycles: 16
label: tri.range(300, 3000).slow(8), two eight-bar verses
:::

**Change the range per section.** The values given to `range` can be patterns too. In mini-notation, `"<1500 4000>/8"` holds each value for eight bars, so the second verse can open further than the first:

:::play{label="Two verses: the second opens to 4000 Hz instead of 1500 Hz (tick Loop to hear all 16 bars)"}
note("c3*8").s("sawtooth").lpf(saw.slow(8).range(300, "<1500 4000>/8"))
:::

**Slow the signal before you range it.** `slow` stretches everything written before it {cite doc=slow}. With plain numbers the order makes no difference: `saw.range(300, 3000).slow(8)` and `saw.slow(8).range(300, 3000)` give identical events. With a patterned range it does: `saw.range(300, "<1500 4000>/8").slow(8)` slows the range pattern by another factor of 8, so 1500 Hz holds for 64 bars and the second verse's 4000 Hz does not arrive until bar 65.

:::bridge{title="Verse by verse"}
A choir director shapes each verse of a hymn as one arc and saves the biggest sound for the last verse. Here the shape stays the same for every verse, and the range is what grows.
:::
