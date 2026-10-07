---
id: pit.scale-degrees.lesson
title: Scale degrees with n and scale
skill: pit.scale-degrees
---

So far every pitch has been a note name. `n` with `scale` writes a pitch as a **scale degree** instead: `n` gives a number, and `.scale("C4:major")` turns that number into a note of C major {cite doc=scale}. A scale name is a tonic, a colon and a scale type, with no spaces {cite doc=scale}.

Strudel counts degrees **from 0**. In a major scale, 0 is the tonic (scale degree 1), 2 the mediant (degree 3) and 4 the dominant (degree 5). Past the top of the scale the count carries on into the next octave: in a seven-note scale, 7 is the upper tonic and 9 the third above it. Negative numbers count down from the tonic, so `-1` is the leading tone below it {cite src="packages/tonal/tonal.mjs#L36-L45"} {cite doc=scale}.

:::abc
X:1
M:4/4
L:1/8
K:C
C E G c G E C B, |
:::

:::play{label="The bar above: degrees 0 2 4 7 4 2 0 -1 in C major, from C4"}
n("0 2 4 7 4 2 0 -1").scale("C4:major").s("triangle")
:::

The octave number on the tonic sets the register: C4 is middle C. Leave the octave out and Strudel uses octave 3, so `.scale("C:major")` starts on C3, an octave lower {cite doc=scale} {cite src="packages/tonal/tonal.mjs#L40-L40"}.

The numbers carry the tune and the scale carries the key. Change the scale name and the same numbers sound in the new key, with every interval adjusted to it:

:::compare{diff="scale C4:major → Eb4:major"}
a:
  label: C major
  code: n("0 2 4 7 4 2 0 -1").scale("C4:major").s("triangle")
b:
  label: E flat major
  code: n("0 2 4 7 4 2 0 -1").scale("Eb4:major").s("triangle")
:::

:::bridge{title="Movable do, counted from zero"}
`n` works like movable-do solfège: do, re, mi are 0, 1, 2 in whatever key `scale` names, just as a choir sings the same syllables after the key changes. The one trap is the count. Degree numbers, interval names and figured-bass figures all start at 1, but Strudel starts at 0. Subtract one: the fifth degree is 4, and an octave above the tonic is 7.
:::
