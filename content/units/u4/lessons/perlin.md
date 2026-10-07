---
id: mod.perlin.lesson
title: Drift with perlin, scatter with rand
skill: mod.perlin
---

Two signals add unpredictability. Both run between 0 and 1, so `range` and `rangex` work on them as usual.

**`perlin` drifts.** It is a smooth random curve {cite doc=perlin}. In this version it picks a random value at every whole cycle, so at every barline, and glides from one to the next along an S-shaped curve {cite src="packages/core/signal.mjs#L626-L635"}. On its own it heads for a new level every bar; `.slow(4)` gives it a new target every four bars.

:::signal
shape: perlin
min: 400
max: 2400
period: 4
cycles: 8
label: "perlin.range(400, 2400): a new level at each barline, no repeating period (values illustrative)"
:::

**`rand` scatters.** It gives a random number between 0 and 1 {cite doc=rand}, worked out from the exact moment it is read {cite src="packages/core/signal.mjs#L449-L449"}. Every note reads it at its own onset, so every note gets an unrelated value; notes that start together, such as the notes of a chord, share one.

:::compare{diff="perlin → rand"}
a:
  label: perlin, a smooth glide to a new level each bar
  code: note("c3*8").s("sawtooth").lpf(perlin.range(400, 2400))
b:
  label: rand, a new value on every note
  code: note("c3*8").s("sawtooth").lpf(rand.range(400, 2400))
:::

**Random, but repeatable.** Both are calculated from the position in time alone, with no hidden state {cite src="packages/core/signal.mjs#L237-L264"}, and playback starts counting from cycle 0 {cite src="packages/core/cyclist.mjs#L101-L104"}. So the same code gives the same values every time you play it from the start. The values differ from bar to bar and only repeat after 300 cycles {cite src="packages/core/signal.mjs#L237-L244"}. One quirk: on the very first downbeat (cycle 0) both are exactly 0 {cite src="packages/core/signal.mjs#L243-L248"}, so `perlin.range(400, 2400)` always starts at 400 Hz.

:::bridge{title="Ensemble and touch"}
`perlin` is a choir's tone over a long phrase: never still, but never jumping. `rand` is a pianist's touch, where no two keystrokes weigh quite the same.
:::
