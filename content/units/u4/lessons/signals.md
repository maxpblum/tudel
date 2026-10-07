---
id: mod.signals.lesson
title: Six signal shapes
skill: mod.signals
---

You have swept a filter with `sine` and `saw`. They belong to a family of six basic signals. Each runs between 0 and 1 and repeats once per cycle {cite doc=sine} {cite doc=cosine} {cite doc=saw} {cite doc=isaw} {cite doc=tri} {cite doc=square}, which is one bar in this course. They differ in two things you can hear: the value on the downbeat, and how it moves through the bar.

| Signal | On the downbeat | Through one bar |
|---|---|---|
| `sine` | 0.5 | smooth: up to 1 on beat 2, down to 0 on beat 4, back to 0.5 {cite src="packages/core/signal.mjs#L70-L80"} |
| `cosine` | 1 | the same curve a quarter of a bar earlier: down first {cite src="packages/core/signal.mjs#L91-L91"} |
| `saw` | 0 | up at an even rate, then drops to 0 at the barline {cite src="packages/core/signal.mjs#L35-L35"} |
| `isaw` | 1 | down at an even rate, then jumps to 1 at the barline {cite src="packages/core/signal.mjs#L56-L56"} |
| `tri` | 0 | straight up to 1 at mid-bar (beat 3), straight back down {cite src="packages/core/signal.mjs#L124-L124"} |
| `square` | 0 | 0 for the first half of the bar, 1 for the second {cite src="packages/core/signal.mjs#L107-L107"} |

`tri` is `saw` squeezed into the first half of the bar, then `isaw` in the second {cite src="packages/core/signal.mjs#L124-L124"}:

:::signal
shape: tri
min: 0
max: 1
period: 1
cycles: 2
label: tri, two bars
:::

`saw` and `isaw` are mirror images, here on the same line and range:

:::compare{diff="saw → isaw"}
a:
  label: saw, opens through each bar
  code: note("a3*16").s("sawtooth").lpf(saw.range(400, 4000))
b:
  label: isaw, closes through each bar
  code: note("a3*16").s("sawtooth").lpf(isaw.range(400, 4000))
:::

As before, each note reads the signal once, at its onset {cite src="packages/core/signal.mjs#L18-L21"}. Every parameter, `gain` as much as `lpf`, accepts a pattern in the same way {cite src="packages/core/controls.mjs#L41-L49"}, so a signal can drive any of them.

:::bridge{title="Six dynamic shapes"}
Read the shapes as dynamics. `tri` is a *messa di voce*: swell, then fade. `sine` is the same arc entered halfway up, and `cosine` enters at the peak. `saw` is a crescendo that ends *subito piano*. `isaw` starts *forte* and makes a steady diminuendo. `square` is terraced dynamics: two levels, half a bar each.
:::
