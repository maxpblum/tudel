---
id: pit.register-inversion.lesson
title: Inversion and register with anchor and mode
skill: pit.register-inversion
---

`voicing` lines each chord up against one note, the **anchor**, which is C5 unless you set it {cite doc=anchor}. **`mode`** says which end of the voicing touches the anchor {cite src="packages/tonal/tonleiter.mjs#L131-L137"}:

- `mode("below")` (the default): the top note is the closest chord tone at or below the anchor.
- `mode("above")`: the bottom note is the closest chord tone at or below the anchor. Strudel's documentation says "at or above", but the code rounds down {cite doc=voicing} {cite src="packages/tonal/tonleiter.mjs#L148-L169"}. Put the anchor on a chord tone and the bottom note lands exactly on it.
- `mode("root")`: always the root-position voicing, with the root at or below the anchor {cite src="packages/tonal/tonleiter.mjs#L159-L161"}.

The dictionary's voicings differ in which chord tone is on top and which is in the bass, so moving the anchor changes the inversion too, not just the register. With the anchor on C5, C major gets C5 on top and E3 in the bass, a 6/3. With the anchor on G4, it gets G4 on top and C3 in the bass, root position:

:::compare{diff="anchor c5 → g4"}
a:
  label: Anchor C5 (default)
  code: chord("C").anchor("c5").voicing().s("triangle")
b:
  label: Anchor G4
  code: chord("C").anchor("g4").voicing().s("triangle")
:::

To choose the inversion directly, use `mode("above")` and anchor the bass note you want:

:::play{label="C major with C3, E3, then G3 in the bass: 5/3, 6/3, 6/4"}
chord("C").anchor("<c3 e3 g3>").mode("above").voicing().s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
%%score {1 2}
V:1
[CE]4 | [CEG]4 | [CEGc]4 |
V:2 clef=bass
[C,G,]4 | [E,G,]4 | G,4 |
w: 5/3 6/3 6/4
:::

:::bridge{title="Soprano position and figured bass"}
These two modes match the two questions a harmony teacher asks about a chord. With `mode("below")`, the anchor chooses the **soprano**: the position of the octave, third or fifth on top. With `mode("above")`, it chooses the **bass**, and with it the figure. You can control one end or the other, but not both in a single `voicing`.
:::
