---
id: rhy.layers.lesson
title: "Layers: the comma and stack"
skill: rhy.layers
---

A comma inside a string splits it into sequences that play **at the same time** {cite src="packages/mini/krill.pegjs#L178-L180"} {cite src="packages/mini/mini.mjs#L88-L89"}. Each sequence shares out the whole bar on its own. A basic beat is a kick-and-snare line plus a hi-hat line:

:::play{label="Kick and snare in quarters, hi-hat in eighths (needs network)"}
s("bd sd bd sd, hh*8").bank("RolandTR909")
:::

Because each layer divides the bar independently, two layers with different step counts make a polyrhythm. Three against two:

:::play{label="Three against two: e5 in thirds of the bar, c4 in halves"}
note("e5*3, c4*2").s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
V:1
(3e2e2e2 |
V:2
C2 C2 |
:::

The two layers meet only on the downbeat.

`stack` does the same with whole patterns: it plays them at the same time {cite doc=stack}. A method written after `stack(...)` applies to everything inside it, so this gives exactly the same events as the comma version:

:::code
stack(note("e5*3"), note("c4*2")).s("triangle")
:::

Use the comma when the layers share one sound setup (one `s`, one `bank`). Use `stack` to combine patterns that are written separately but share the methods after them. For independent parts with their own sounds, write one `$:` line per part: each labelled line becomes its own part {cite src="packages/transpiler/transpiler.mjs#L468-L470"}, and Strudel stacks all the parts {cite src="packages/core/repl.mjs#L238-L258"}.

:::code
$: s("bd sd bd sd").bank("RolandTR909")
$: note("c4*2").s("triangle")
:::

:::bridge{title="Hemiola, and one barline for all staves"}
`"e5*3, c4*2"` is three against two, the ratio of a hemiola, sounding in two layers at once rather than one bar after another. Each layer is a staff in the score: it divides its own bar however it likes, and the barline lines all of them up.
:::
