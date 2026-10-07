---
id: pit.chords-mini.lesson
title: Chords in mini-notation
skill: pit.chords-mini
---

A comma inside square brackets stacks notes into one step, so they start and stop together: a block chord {cite src="packages/mini/krill.pegjs#L178-L180"} {cite src="packages/mini/krill.pegjs#L113-L113"}. `"[c4,e4,g4] [f4,a4,c5]"` is two chords, each one step long. Two steps share the bar, so each chord is a half note. The demo below has four steps, so each chord is a quarter note.

The same works with scale degrees, and there it pays off. A triad is a degree plus the degrees two and four above it: `[0,2,4]` is the tonic triad, `[3,5,7]` the triad on the fourth degree, `[4,6,8]` the dominant. The scale decides each chord's quality, so in C major `[1,3,5]` is D minor without your having to spell it:

:::play{label="I IV V I in C major, root position, one chord per beat"}
n("[0,2,4] [3,5,7] [4,6,8] [0,2,4]").scale("C4:major").s("triangle")
:::

Inversions are octave moves. Add 7 to a degree (one octave in a seven-note scale) or take 7 away, and the chord tone changes register. `[2,4,7]` is the tonic triad in first inversion: E in the bass, C moved up an octave. That lets you hold common tones the way a keyboard player does:

:::compare{diff="n: root positions → inversions holding common tones"}
a:
  label: All root position
  code: n("[0,2,4] [3,5,7] [4,6,8] [0,2,4]").scale("C4:major").s("triangle")
b:
  label: I, IV six-four, V six, I
  code: n("[0,2,4] [0,3,5] [-1,1,4] [0,2,4]").scale("C4:major").s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
[CEG] [CFA] [B,DG] [CEG] |
w: 5/3 6/4 6 5/3
:::

In the first version the top voice leaps (G, C, D, G) and so does the bass (C, F, G, C). In the second the top voice moves only G, A, G, G and the bass C, C, B, C.

:::bridge{title="Figured bass in the brackets"}
The numbers in a bracket are scale degrees, not figures, but the figures are one step away. Take each upper number minus the lowest one, then add 1, because figures count the bass as 1. In `[0,3,5]` that gives 4 and 6 above C: F major as a 6/4. In `[-1,1,4]` it gives 3 and 6 above B: G major as a 6.
:::
