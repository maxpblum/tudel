---
id: fx.tone.lesson
title: Tones on a synth
skill: fx.tone
---

`note` says what to play and `s` says which sound plays it {cite doc=note}. The four basic
waveforms are `"sawtooth"`, `"square"`, `"triangle"` and `"sine"`.

:::play{label="Sawtooth"}
note("c3 e3 g3").s("sawtooth")
:::

:::play{hidecode}
note("c3").s("square")
:::

:::code
note("c3 e3").s("triangle")
:::

:::code{antipattern}
note('c3').sound("saw")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
C D E G|
:::

:::diagram
digraph { osc -> out }
:::

:::bridge{title="From the organ loft"}
A stop is a *timbre*; `s` picks the stop {cite src="packages/core/demo.mjs#L2-L4"}.
:::
