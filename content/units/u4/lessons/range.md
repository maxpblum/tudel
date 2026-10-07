---
id: mod.range.lesson
title: "Even steps or even ratios: range and rangex"
skill: mod.range
---

`range(min, max)` maps a signal's 0 to 1 onto your values in a straight line: min + (max − min) × signal {cite src="packages/core/pattern.mjs#L1771-L1773"}. With the min larger than the max the result is turned upside down, so `saw.range(2000, 400)` falls.

The ear does not hear hertz in a straight line. It hears ratios: each doubling of frequency is one octave. Take a sawtooth cutoff sweep from 200 to 3200 Hz over four bars, which is four octaves. Here is the cutoff on each downbeat:

| Downbeat of bar | 1 | 2 | 3 | 4 | (approached at the end of bar 4) |
|---|---|---|---|---|---|
| `saw.range(200, 3200).slow(4)` | 200 Hz | 950 Hz | 1700 Hz | 2450 Hz | 3200 Hz |
| `saw.rangex(200, 3200).slow(4)` | 200 Hz | 400 Hz | 800 Hz | 1600 Hz | 3200 Hz |

With `range`, bar 1 covers more than two octaves (200 to 950 Hz) and bar 4 less than half an octave (2450 to 3200 Hz): the sweep rushes through the dark end and lingers at the bright end. `rangex` follows an exponential curve {cite doc=rangex}: it applies `range` to the logarithms of min and max, then exponentiates {cite src="packages/core/pattern.mjs#L1786-L1788"}. Equal times give equal ratios, so here it rises exactly one octave per bar.

:::compare{diff="range → rangex"}
a:
  label: range, linear in hertz
  code: note("c3*8").s("sawtooth").lpf(saw.range(200, 3200).slow(4))
b:
  label: rangex, one octave per bar
  code: note("c3*8").s("sawtooth").lpf(saw.rangex(200, 3200).slow(4))
:::

Use `rangex` whenever the parameter is a frequency, such as `lpf` or `hpf`. Both of its values must be above 0, because the logarithm of 0 is undefined: `rangex(0, 4000)` gives no valid cutoff at all.

:::bridge{title="Slide positions"}
The seven trombone positions are not evenly spaced: each lowers the pitch by a semitone, and the lower ones lie farther apart. Equal musical steps need equal ratios of tube length, not equal distances. `range` moves the cutoff by equal distances in hertz; `rangex` moves it by equal ratios, the way the slide positions are laid out.
:::
