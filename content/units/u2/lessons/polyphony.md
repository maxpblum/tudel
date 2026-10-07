---
id: pit.polyphony.lesson
title: Independent parts with stack
skill: pit.polyphony
---

`add` gives homophony: every copy shares the line's rhythm. For real counterpoint each part needs its own rhythm, contour and sound. `stack` takes whole patterns and plays them at the same time, each one unchanged {cite doc=stack} {cite src="packages/core/pattern.mjs#L1321-L1330"}. Every argument is a complete part, with its own notes, scale, `s` and filter.

Here are two bars of two-part counterpoint. The upper part moves in quarter and eighth notes on a triangle wave, and the bass moves in half notes on a filtered sawtooth an octave and more below:

:::play{label="Two independent parts: triangle melody over a sawtooth bass, two bars"}
stack(
  n("<[2 [3 4] 7 4] [5 7 6 8]>").scale("C4:major").s("triangle"),
  n("<[0 2] [3 4]>").scale("C3:major").s("sawtooth").lpf(800),
)
:::

:::abc
X:1
M:4/4
L:1/8
K:C
V:1
E2 F G c2 G2 | A2 c2 B2 d2 |
V:2 clef=bass
C,4 E,4 | F,4 G,4 |
:::

Each part has its own `<...>`, so each changes bar by bar on its own schedule. The two parts share only the cycle. Here both last two bars, so they line up.

Compare the two tools on the same line. `n("0 1 2 3".add("0,-2")).scale("C4:major")` moves both voices note against note. `stack(n("0 1 2 3").scale("C4:major"), n("-7 -4").scale("C4:major"))` puts the same line over a bass in half notes, C3 then F3. A comma inside one mini-notation string also stacks parts {cite src="packages/mini/krill.pegjs#L178-L180"}, but `stack` is clearer once the parts need different sounds or scales.

:::bridge{title="Scoring a two-part invention"}
A `stack` is a short score: one staff per argument. Write each part as you would for a two-part invention, with its own rhythm and contour. Then orchestrate it as you would for flute and bassoon, giving each part its own `s` and filter, so the ear can tell the lines apart.
:::
