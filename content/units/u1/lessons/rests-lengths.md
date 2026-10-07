---
id: rhy.rests-lengths.lesson
title: "Rests, lengths and repeats: ~ @ !"
skill: rhy.rests-lengths
---

Three symbols change what a step does without changing the length of the bar.

- `~` is a rest: a step that is silent {cite src="packages/mini/mini.mjs#L157-L158"}. A dash, `-`, means the same.
- `@n` gives a step n units of time instead of 1 {cite src="packages/mini/krill.pegjs#L134-L135"}. The bar is shared out by the total number of units {cite src="packages/mini/mini.mjs#L124-L132"}. `"c4@3 e4"` has 3 + 1 = 4 units, so c4 is a dotted half note and e4 a quarter.
- `!n` repeats a step as n full steps {cite src="packages/mini/krill.pegjs#L137-L145"}: `"c4!3 e4"` is four quarter notes.

Count units, not beats. `"c4@3 e4 g4"` has five units, so each unit is a fifth of the bar and c4 is not a dotted half.

`"c4@2 e4 g4"` and `"c4 ~ e4 g4"` start their notes at the same moments, but c4 lasts twice as long in the first. On a synth you hear the difference:

:::compare{diff="c4@2 → c4 ~"}
a:
  label: c4@2, a half note
  code: note("c4@2 e4 g4").s("triangle")
b:
  label: c4 ~, a quarter note and a quarter rest
  code: note("c4 ~ e4 g4").s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
C2 E G | C z E G |
:::

A synth note sounds for the length of its step, then releases {cite src="packages/superdough/synth.mjs#L63-L70"}. A drum sample rings to its own end either way {cite src="packages/superdough/sampler.mjs#L313-L317"}, so for drums the two versions sound alike.

`!` and `*` look alike. `"c4!2 e4 g4"` has four steps: four quarter notes, C, C, E, G. `"c4*2 e4 g4"` has only three steps, so each takes a third of the bar and the two Cs share the first third.

:::bridge{title="No fermata"}
A fermata stops the clock. Strudel never does: every cycle lasts the same time, so `@` can only lengthen a note by taking time from the others in the bar. A rest with `~` is a measured rest, never a breath pause. A step can also last several bars; another lesson shows how.
:::
