---
id: mod.signal-speed.lesson
title: "Signal speed: slow, fast, and the notes that carry them"
skill: mod.signal-speed
---

A basic signal repeats once per cycle. `slow(n)` stretches it over *n* cycles {cite doc=slow}, and `fast(n)` squeezes *n* repetitions into one cycle {cite doc=fast}. With this course's convention of one cycle per bar in 4/4, `.slow(8)` is one sweep per eight-bar verse and `.fast(4)` is one wobble (one full repetition of the signal) per beat.

Signals count cycles, not seconds, so the tempo decides how long a sweep lasts. `setcpm(90 / 4)` sets 22.5 cycles per minute {cite doc=setcpm}, which with one bar of four beats per cycle is 90 beats per minute. One bar then lasts 60 ÷ 22.5 = 2.67 seconds, so a `.slow(4)` sweep takes 4 × 2.67 = 10.7 seconds.

Here is one wobble per beat:

:::signal
shape: sine
min: 400
max: 2400
period: 0.25
cycles: 1
label: sine.range(400, 2400).fast(4), one bar
:::

**A fast signal needs enough notes.** Each note reads the signal once, at its onset {cite src="packages/core/signal.mjs#L18-L21"}, and keeps that cutoff for its whole length {cite src="packages/superdough/helpers.mjs#L241-L248"}. Eighth notes give each wobble two readings, at its start and at its middle. A sine is at its midpoint at both places, so all eight notes get 1400 Hz and the wobble disappears. Sixteenths read four points per wobble: 1400, 2400, 1400 and 400 Hz, once per beat.

:::compare{diff="note c3*8 → c3*16"}
a:
  label: Eighths, no wobble (every cutoff is 1400 Hz)
  code: note("c3*8").s("sawtooth").lpf(sine.range(400, 2400).fast(4))
b:
  label: Sixteenths, one wobble per beat
  code: note("c3*16").s("sawtooth").lpf(sine.range(400, 2400).fast(4))
:::

So give each wobble at least four notes. A slow sweep has no such problem: under eighth notes, a `.slow(4)` sweep gets 32 readings.

:::bridge{title="The piano's hammer"}
A pianist fixes each note's loudness at the strike and cannot swell it afterwards. A crescendo exists only across successive notes. A quick swell on every beat therefore needs several notes per beat, and so does a fast signal.
:::
