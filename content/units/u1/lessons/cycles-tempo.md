---
id: rhy.cycles-tempo.lesson
title: One bar, one cycle
skill: rhy.cycles-tempo
---

Strudel measures time in **cycles**. Unless you set a tempo, a cycle lasts 2 seconds: Strudel's clock starts at 0.5 cycles per second {cite src="packages/core/cyclist.mjs#L24-L24"}. Strudel has no bars or time signatures. This course's convention is that one cycle is one bar of 4/4, so one beat is a quarter of a cycle.

In the examples, `note` gives the pitches {cite doc=note} and `s` picks the sound {cite doc=s}, here a triangle-wave synth. The steps of a quoted string (its space-separated entries) share the cycle equally {cite src="packages/mini/mini.mjs#L138-L141"}. Four steps make four quarter notes. Three steps make three half-note triplets, because each step gets a third of the bar.

:::play{label="Four steps: quarter notes"}
note("c4 e4 g4 c5").s("triangle")
:::

:::play{label="Three steps: half-note triplets"}
note("c4 e4 g4").s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
C E G c | (3C2E2G2 |
:::

**Tempo.** `setcpm` sets the tempo in cycles per minute {cite doc=setcpm}, and Strudel divides that by 60 to get cycles per second {cite src="packages/core/repl.mjs#L132-L135"}. A cycle holds four beats here, so cycles per minute are beats per minute divided by 4. Write it as `setcpm(BPM / 4)`, the form Strudel's own documentation uses {cite doc=setcpm}, on the first line:

:::play{label="90 BPM: a beat lasts 0.67 s, a bar 2.67 s"}
setcpm(90 / 4)
note("c4 e4 g4 c5").s("triangle")
:::

At 90 BPM a beat lasts 60 / 90 ≈ 0.67 seconds, so a four-beat bar lasts about 2.67 seconds. The default, 0.5 cycles per second, is 30 cycles per minute, which is 120 BPM: `setcpm(120 / 4)` changes nothing.

:::bridge{title="The bar is the conductor's beat pattern"}
One cycle is one full beat pattern of the baton, and `setcpm(BPM / 4)` is the metronome mark written as bars per minute. The baton never waits: put five notes in a string and you get a quintuplet inside the same bar, not a bar of 5/4.
:::
