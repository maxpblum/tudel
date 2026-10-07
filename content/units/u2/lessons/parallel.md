---
id: pit.parallel.lesson
title: Parallel voices from one line
skill: pit.parallel
---

To double a melody in thirds you don't write a second melody. Write the line once and **add** an interval to it. `add` adds a number to every value of a pattern {cite doc=add}, and a comma in the added pattern makes one copy of the line per number. So `"0 1 2 3".add("0,-2")` is the line itself (plus 0) together with the line two degrees lower (minus 2). The line keeps its rhythm: each of its notes gets one copy per added number, with the note's own onset and length {cite src="packages/core/pattern.mjs#L1114-L1115"} {cite src="packages/core/pattern.mjs#L745-L747"} {cite src="packages/core/pattern.mjs#L175-L208"}. Below, each eighth note becomes a two-note chord.

Do the adding on the degrees, *inside* `n(...)`, before `scale` turns them into notes. Then the interval is diatonic: each third is major or minor, as the key requires {cite doc=add} {cite doc=scale}. Change one number to change the interval: −2 is a third below, −5 a sixth below.

:::compare{diff="add 0,-2 → 0,-5"}
a:
  label: Thirds below
  code: n("0 1 2 3 4 3 2 1".add("0,-2")).scale("G4:major").s("triangle")
b:
  label: Sixths below
  code: n("0 1 2 3 4 3 2 1".add("0,-5")).scale("G4:major").s("triangle")
:::

:::abc
X:1
M:4/4
L:1/8
K:G
[GE] [AF] [BG] [cA] [dB] [cA] [BG] [AF] |
:::

Adding to note names instead adds **semitones**: `note("g4 a4 b4 c5".add("0,-4"))` puts a major third (4 semitones) under every note, so the lower voice runs E flat, F, G, A flat, out of the key {cite doc=add}. Use semitones when you want the same exact interval everywhere, and degrees when the voice should stay in the key.

One trap: `.add("0,2")` written *after* `n(...)` does not add anything. Strudel prints "Can't do arithmetic on control pattern" and plays each note twice in unison {cite src="packages/core/value.mjs#L10-L18"}. Put the `add` inside the parentheses, as above.

:::bridge{title="Tonal and real"}
This is the difference between a tonal and a real sequence. Adding degrees gives a tonal copy that follows the key, like thirds in a Mozart duet. Adding semitones gives a real copy that keeps the exact interval and steps outside the key.
:::
