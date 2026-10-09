---
id: pat.ply-struct.lesson
title: "Repeated notes and imposed rhythm: ply and struct"
skill: pat.ply-struct
---

Brass players articulate quick repeated notes by double tonguing (*ta-ka*, for notes in pairs) and triple tonguing (*ta-ta-ka*, for notes in threes). Play a line that way, each note repeated two or three times in its own beat, and the line keeps its shape; every note is simply split. `ply(n)` does that to a pattern: it repeats each event `n` times inside the event's own length {cite doc=ply} {cite src="packages/core/pattern.mjs#L1905-L1911"}.

`fast(n)` sounds similar but is a different operation: it squeezes `n` bars of the pattern into one, so a one-bar line plays `n` times per bar. On the same line:

:::compare{diff="ply(2) → fast(2)"}
a:
  label: "ply(2): C4 C4 E4 E4 G4 G4 C5 C5, each note repeated"
  code: n("0 2 4 7").scale("C4:major").s("triangle").ply(2)
b:
  label: "fast(2): C4 E4 G4 C5 C4 E4 G4 C5, the bar repeated"
  code: n("0 2 4 7").scale("C4:major").s("triangle").fast(2)
:::

`ply` repeats each note; `fast` repeats the bar. Both turn four quarter notes into eight eighth notes, but only `ply` keeps the order of the line.

Each note is split within its own length, so long and short notes stay long and short. In `"0 4 2@2"` the half note E4 (`@2` gives it two of the four units) becomes two quarter notes, while C4 and G4 become pairs of eighths. `ply(2)` saves writing `*2` on every step: by hand, the same bar is `"0*2 4*2 2*2@2"`.

:::play{label="ply(2) on C4, G4, E4 (half note): pairs of eighths, then two quarters"}
n("0 4 2@2").scale("C4:major").s("triangle").ply(2)
:::

**Imposing a rhythm: struct.** `struct` gives a pattern a new rhythm {cite doc=struct}. The rhythm string says where notes start: a step (such as the letter x) for a note, `~` for a rest. Each new note takes whatever value the pattern has at that moment {cite src="packages/core/pattern.mjs#L1161-L1163"} {cite src="packages/core/pattern.mjs#L1026"}. A chord held for a whole bar becomes a rhythm of chord stabs, and when the chord changes per bar, the rhythm stays and the harmony moves underneath it.

:::play{label="One chord per bar, played in the rhythm x ~ x x ~ x ~ x"}
chord("<C Am F G>").voicing().struct("x ~ x x ~ x ~ x").s("square").gain(0.5)
:::

The rhythm has eight equal steps in one bar of 4/4, so each hit is an eighth note: stabs on beat 1, on beat 2 and the eighth after it, and on the offbeats after beats 3 and 4.

**Flipping a rhythm: invert.** The rhythm can also be written in 1s and 0s: `"1 0 1 1 0 1 0 1"` is the same rhythm as above, with `1` for a note and `0` for silence. Written that way, `invert` swaps the 1s and 0s {cite doc=invert}, which gives the complementary rhythm: notes exactly where the original rests. Two parts that share the bar this way interlock without ever sounding together.

:::play{label="Hocket: C4 on the 1s, G4 on the 0s"}
stack(
  note("c4").s("triangle").struct("1 0 1 1 0 1 0 1"),
  note("g4").s("square").struct("1 0 1 1 0 1 0 1".invert()),
)
:::

This is the only job of `invert`: it works on rhythms of 1s and 0s, never on pitch. A melody upside down needs the arithmetic from the inversion lesson.

:::bridge{title="Hocket"}
Medieval composers called this *hoquetus*, the hiccup: one line shared between two voices, each singing where the other rests, as in Machaut's *Hoquetus David*. `struct` with a rhythm and its `invert` is a hocket in two lines of code.
:::
