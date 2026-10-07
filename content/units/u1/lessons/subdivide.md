---
id: rhy.subdivide.lesson
title: "Divide a step: [ ] and *"
skill: rhy.subdivide
---

Square brackets make a group that takes the time of one step {cite src="packages/mini/krill.pegjs#L113-L113"}. Inside the group, its own steps share that step equally, exactly as the steps of a whole string share the bar {cite src="packages/mini/mini.mjs#L138-L141"}. In a four-step bar (four quarter notes):

- `[e4 g4]` is two eighth notes in one beat.
- `[f4 e4 d4]` is three notes in one beat: an eighth-note triplet.
- Groups nest: `[c4 [d4 c4]]` is an eighth note, then two sixteenths.

`*n` plays a step n times inside its own slot {cite src="packages/mini/krill.pegjs#L153-L154"}, by speeding it up n times {cite doc=fast}. So `e4*3` and `[e4 e4 e4]` give the same three triplet eighths. Here beat 1 has one note, beat 2 two, beat 3 three and beat 4 four:

:::play{label="One, two, three, then four notes per beat"}
note("e4 e4*2 e4*3 e4*4").s("square")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
E E/2E/2 (3E/2E/2E/2 E/4E/4E/4E/4 |
:::

`*` works on groups too: `[c4 e4]*2` plays the pair twice in one step. And it works on drums, where a fast hi-hat is the usual case:

:::play{label="Kick, two hi-hats, snare, a triplet of hi-hats (needs network)"}
s("bd hh*2 sd hh*3").bank("RolandTR909")
:::

A bracket never adds time to the bar. `"c4 [d4 e4 f4 g4 a4] c5 c5"` still lasts one bar: the five-note group is a quintuplet that fills beat 2.

:::bridge{title="Tuplets without the arithmetic"}
A score needs a bracket and a "3" to fit three eighths into the time of two. Strudel needs only `[ ]`: whatever is inside fills exactly one step, so three notes make a triplet and five a quintuplet. `c4*3` is the triple-tonguing figure: three equal notes in one beat.
:::
