---
id: pit.modes.lesson
title: Scales and modes, bar by bar
skill: pit.modes
---

The word after the colon in `scale` is the scale type. Strudel takes its scale types from the tonal library {cite doc=scale}. Besides *major* and *minor* (natural minor), that list includes the church modes by name: *dorian*, *phrygian*, *lydian*, *mixolydian*, *aeolian* and *locrian*. A type whose name has a space takes a colon in its place, so harmonic minor on A3 is `"A3:harmonic:minor"` {cite doc=scale}. That is the minor with the raised seventh, the leading tone that minor-key harmony needs.

The degree numbers stay the same, and the scale decides the intervals. Here is one rising line in C major and in C minor. Only the notes on 2, 5 and 6 (the third, sixth and seventh degrees) change, each a semitone lower in minor:

:::compare{diff="scale C4:major → C4:minor"}
a:
  label: C major
  code: n("0 1 2 3 4 5 6 7").scale("C4:major").s("triangle")
b:
  label: C minor
  code: n("0 1 2 3 4 5 6 7").scale("C4:minor").s("triangle")
:::

The scale name is a pattern like any other, so `< >` can change it once per bar. Angle brackets work inside the name, after the colon {cite doc=scale}. Here the same scale on D steps through four modes, one bar each:

:::play{label="D dorian, D phrygian, D lydian, D mixolydian, one bar each"}
n("0 1 2 3 4 5 6 7")
  .scale("D4:<dorian phrygian lydian mixolydian>")
  .s("triangle")
:::

Listen for each mode's characteristic degree, the one that sets it apart from natural minor (dorian, phrygian) or from major (lydian, mixolydian). Dorian has the major sixth (B), phrygian the minor second (E flat), lydian the raised fourth (G sharp) and mixolydian the minor seventh (C).

:::bridge{title="Modal mixture in one word"}
`"C4:<major minor>"` is modal mixture written once. Every second bar borrows the lowered third, sixth and seventh from the parallel minor, the way a Romantic song turns to the minor for a phrase without leaving its key. The degree line, which is the tune, does not change. Only the scale under it does.
:::
