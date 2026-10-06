---
id: snd.waveforms.lesson
title: Four waveforms, four registrations
skill: snd.waveforms
---

`note` says *what* to play and `s` says *with what*: here, the basic synth sounds `"sawtooth"`, `"square"`, `"triangle"` and `"sine"`, plain Web Audio oscillators {cite src="packages/superdough/synth.mjs#L23-L29"} {cite src="packages/superdough/synth.mjs#L521-L525"}. Angle brackets `< >` play one entry per cycle, then start over; a cycle is one bar here (more below):

:::play{label="One bar on each: sawtooth, square, triangle, sine"}
note("c4 eb4 g4 bb4").s("<sawtooth square triangle sine>")
:::

Note names: c4 is middle C {cite src="packages/core/util.mjs#L31-L38"} and a4 is 440 Hz {cite doc=note}. A letter followed by `b` is flat (eb4), followed by `#` sharp (f#4). The octave number changes at C (the semitone below c4 is b3).

Quoted strings are mini-notation, a compact score. This lesson teaches only a few symbols, and later lessons cover the rest. Strudel's unit of time is the cycle, 2 seconds by default {cite src="packages/core/cyclist.mjs#L24-L24"}. Strudel has no bars; this course treats one cycle as one bar of 4/4. A string's steps (its space-separated entries) share one cycle equally unless marked otherwise: `"c4 e4 g4 c5"` is four quarter notes, `"c4 g4"` two half notes, and five steps a quintuplet. Extra spaces change nothing {cite src="packages/mini/krill.pegjs#L98-L98"}. Below, `[e4 g4]` squeezes two notes into one step, and `c5@2` makes a step two units long {cite src="packages/mini/krill.pegjs#L134-L135"}: 1 + 1 + 2 = 4 units, so c5 is a half note.

:::play{label="Mini-notation: a quarter, two eighths, a half note"}
note("c4 [e4 g4] c5@2").s("square")
:::

`e4*2` squeezes two e4s into one step {cite src="packages/mini/krill.pegjs#L153-L154"}; `e4!2` adds a second full-length step {cite src="packages/mini/krill.pegjs#L137-L145"}, so the second demo drops c5 to keep four beats:

:::play{label="e4*2: two eighths inside beat 2"}
note("c4 e4*2 g4 c5").s("square")
:::

:::play{label="e4!2: e4 on beats 2 and 3, all quarter notes"}
note("c4 e4!2 g4").s("square")
:::

Likewise, `"c4*8"` is eight notes in one cycle (one bar): eighth notes. A comma stacks notes into a chord: `"c4,e4,g4"`.

:::bridge{title="Four stops"}
Think of the four as stops, brightest to purest ([Fourier coefficients in the Web Audio spec](https://www.w3.org/TR/webaudio/#oscillator-coefficients)):

- **sawtooth**: every harmonic, the nth at 1/n strength. Buzzy, like brass.
- **square**: odd harmonics only (no 2nd, the octave above), also 1/n. Hollow, like [a clarinet's low notes](https://newt.phys.unsw.edu.au/jw/clarinetacoustics.html).
- **triangle**: odd harmonics falling off as 1/n², [soft and mellow](https://till.com/articles/wavepalette/), somewhat like a sung *oo*.
- **sine**: the fundamental alone, purer than almost any instrument.
:::

:::compare{diff="s sawtooth → square"}
a:
  label: Sawtooth
  code: note("c4 c5 bb4 g4").s("sawtooth")
b:
  label: Square
  code: note("c4 c5 bb4 g4").s("square")
:::
