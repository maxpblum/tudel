---
id: mod.signal-melody.lesson
title: Signals as melody
skill: mod.signal-melody
---

`n(...).scale(...)` turns numbers into scale degrees, counting from 0 {cite doc=scale}. Feed it a stepped signal and the signal's shape becomes a melodic contour. `range` sets the span in degrees, and `segment` sets how many notes there are per bar.

`tri` samples at 0, ¼, ½, ¾, 1, ¾, ½ and ¼ when segmented into eight steps (each step takes the value at its start). `.range(0, 8)` multiplies those by 8, giving degrees 0, 2, 4, 6, 8, 6, 4, 2. `"C4:major"` puts degree 0 on c4; without the octave number the root would sit in octave 3 {cite doc=scale}. The result is an arch in thirds, up to d5 and back:

:::abc
X:1
M:4/4
L:1/8
K:C
C E G B d B G E |
:::

:::play{label="An arch from tri: c4 e4 g4 b4 d5 b4 g4 e4"}
n(tri.range(0, 8).segment(8)).scale("C4:major").s("triangle")
:::

The other shapes give other contours: `saw` climbs and resets, `isaw` falls and jumps back up, `square` alternates between two notes.

A degree that is not a whole number is rounded **up** to the next whole degree {cite src="packages/tonal/tonal.mjs#L36-L37"}. `sine.range(0, 7)` is 3.5 on the downbeat, so the melody starts on degree 4, g4. From there it rises to c5 on beat 2, falls to c4 on beat 4, and turns back up:

:::play{label="A wave from sine: starts in the middle, on g4"}
n(sine.range(0, 7).segment(8)).scale("C4:major").s("triangle")
:::

To get exactly the degrees you want, check which values the steps sample, as above.

:::bridge{title="Contour first"}
A composer can sketch the arch of a phrase before choosing its notes, the way a chant line rises to its peak and settles. The signal is that sketch, and `scale` is the mode it is sung in.
:::
