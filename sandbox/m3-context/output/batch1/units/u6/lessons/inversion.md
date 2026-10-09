---
id: pat.inversion-idiom.lesson
title: Melodic inversion by reflecting degrees
skill: pat.inversion-idiom
---

Melodic inversion turns every interval upside down: where the subject rises a third, the inversion falls a third. Strudel has no method for this, and one name is a trap. `invert` exists, but it swaps 1s and 0s in a rhythm pattern {cite doc=invert}: it replaces each true value with false and each false with true {cite src="packages/core/pattern.mjs#L2202-L2210"}, and it is meant for the rhythms that `struct` uses, as a later lesson in this unit shows. It never mirrors pitch. Inversion is built from arithmetic instead.

**Reflection about an axis.** Pick an axis degree *a*. A note *k* degrees above the axis must become a note *k* degrees below it. In numbers, degree *d* becomes 2*a* − *d*. That is two steps: multiply every degree by −1 with `mul` {cite doc=mul}, then add 2*a*.

Take the rising arpeggio `"0 2 4 7"`, C4 E4 G4 C5 in C major, and mirror it about degree 4, G4. Then 2*a* = 8:

- 0 becomes 8 − 0 = 8, D5
- 2 becomes 8 − 2 = 6, B4
- 4 becomes 8 − 4 = 4, G4, the axis itself, unchanged
- 7 becomes 8 − 7 = 1, D4

:::compare{diff="add .mul(-1).add(8)"}
a:
  label: "The subject: C4 E4 G4 C5, rising"
  code: n("0 2 4 7").scale("C4:major").s("triangle")
b:
  label: "Inverted about G4: D5 B4 G4 D4, falling"
  code: n("0 2 4 7".mul(-1).add(8)).scale("C4:major").s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
C E G c | d B G D |
:::

As with parallel voices, do the arithmetic on the degrees inside `n(...)`, before `scale`. An odd number after `add` puts the axis halfway between two degrees: `.mul(-1).add(7)` mirrors about the point between F and G, so C4 becomes C5.

**Mind the floor.** The inversion of a rising line falls, so place the axis high enough. Mirrored about degree 0 instead, the same arpeggio becomes C4 A3 F3 C3, which already touches C3, the lowest note this course plays. For a line that rises a long way, put the axis in the middle of its range or higher.

**Tonal and real inversion.** Reflecting degrees keeps the line in the key: every step is mirrored by the same number of scale steps, so a major third may come back as a minor one. Above, the C major triad inverts to G B D, a G major triad, still in C major. That is a tonal (diatonic) inversion.

A real (chromatic) inversion mirrors every interval in exact semitones. Do the same arithmetic on note numbers, where one unit is a semitone and 60 is C4. G4 is 67, so 2*a* = 134:

:::compare{diff="tonal (degrees) → real (semitones)"}
a:
  label: "Tonal inversion about G4: D5 B4 G4 D4, G major"
  code: n("0 2 4 7".mul(-1).add(8)).scale("C4:major").s("triangle")
b:
  label: "Real inversion about G4: D5 B flat 4 G4 D4, G minor"
  code: note("60 64 67 72".mul(-1).add(134)).s("triangle")
:::

The rising major third C4–E4 (4 semitones) becomes a falling major third, D5 down to B flat 4, and the major triad becomes a minor one. B flat is outside C major. Use degrees when the inversion should stay in the key, semitones when every interval must stay exact.

**Retrograde and retrograde inversion.** With `rev` from earlier in this unit you have all four forms of a subject. `rev` only moves events in time and `mul`/`add` only change pitch, so the order of the two does not matter: `"0 2 4 7".mul(-1).add(8).rev()` and `"0 2 4 7".rev().mul(-1).add(8)` give the same events, D4 G4 B4 D5.

:::diagram
digraph forms {
  rankdir=TB;
  node [shape=record, fontname="Helvetica", fontsize=12];
  edge [style=invis];
  p [label="original|0 2 4 7|C4 E4 G4 C5"];
  i [label="inversion|.mul(-1).add(8)|D5 B4 G4 D4"];
  r [label="retrograde|.rev()|C5 G4 E4 C4"];
  ri [label="retrograde inversion|.mul(-1).add(8).rev()|D4 G4 B4 D5"];
  p -> i -> r -> ri;
}
:::

:::bridge{title="The Art of Fugue"}
In Bach's *Art of Fugue*, Contrapunctus 5 to 7 answer the subject with its own inversion, and Contrapunctus 12 and 13 are mirror fugues: each exists twice, the second version the whole fugue inverted. The words tonal and real mean here what they mean for a fugal answer: tonal adjusts intervals to stay in the key, real keeps them exact.
:::
