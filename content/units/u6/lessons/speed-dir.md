---
id: pat.speed-dir.lesson
title: "Diminution, augmentation and retrograde: fast, slow, rev, palindrome"
skill: pat.speed-dir
---

A fugue keeps its subject recognisable while changing it. Four classic ways are: halve the note values (diminution), double them (augmentation), play the subject backwards (retrograde), or turn it upside down (inversion). Strudel does the first three with one method each. Inversion has no method of its own; a later lesson in this unit builds it from arithmetic.

This lesson uses one subject, one bar in C major. The bar holds eight units: five single notes, the bracket `[6 5]` (one unit) and `3@2` (two units). With one bar of 4/4 split into eight equal units, each plain step is an eighth note. `[6 5]` splits one eighth into two sixteenths, and `@2` gives the last note two units, a quarter note.

:::play{label="The subject: C4 E4 G4 C5, B4 A4 (sixteenths), G4, F4 (quarter)"}
n("0 2 4 7 [6 5] 4 3@2").scale("C4:major").s("triangle")
:::

:::abc
X:1
M:4/4
L:1/8
K:C
C E G c B/A/ G F2 |
:::

**Diminution and augmentation.** You have met `fast` and `slow` on signals. They do the same to a melody. `fast(2)` plays the pattern twice as fast {cite doc=fast}, so the one-bar subject plays twice per bar, every note value halved. `slow(2)` stretches the pattern over two cycles {cite doc=slow}, so the subject fills two bars, every value doubled. Both only rescale time; the pitches stay as written {cite src="packages/core/pattern.mjs#L1924-L1936"} {cite src="packages/core/pattern.mjs#L1958-L1963"}.

:::compare{diff="fast(2) → slow(2)"}
a:
  label: "Diminution: fast(2), the subject twice per bar"
  code: n("0 2 4 7 [6 5] 4 3@2").scale("C4:major").s("triangle").fast(2)
b:
  label: "Augmentation: slow(2), the subject over two bars"
  code: n("0 2 4 7 [6 5] 4 3@2").scale("C4:major").s("triangle").slow(2)
:::

Strudel measures both in cycles, and this course plays one cycle per bar of 4/4 (a course convention: Strudel itself has no bars). So `fast(2)` turns the eighths into sixteenths, and `slow(2)` turns them into quarter notes. Neither changes the tempo of anything else: `setcpm` sets the tempo for every part, while `fast` and `slow` change only the pattern they are attached to.

One boundary case: if the line already changes per bar with `< >`, `fast(2)` fits two of its bars into one. `n("<0 4> 2")` plays degrees 0 2 in bar 1 and 4 2 in bar 2; with `.fast(2)` it plays 0 2 4 2 in every bar.

**Retrograde.** `rev` reverses each cycle {cite doc=rev}: it mirrors the time of every event inside its own cycle {cite src="packages/core/pattern.mjs#L2259-L2281"}. The durations travel with their notes, so the quarter-note F4 that ended the subject now opens the bar, and the two sixteenths come out as A4 B4.

:::play{label="Retrograde: F4 (quarter), G4, A4 B4, C5, G4, E4, C4"}
n("0 2 4 7 [6 5] 4 3@2").scale("C4:major").s("triangle").rev()
:::

:::abc
X:1
M:4/4
L:1/8
K:C
F2 G A/B/ c G E C |
:::

"Each cycle" matters as soon as a subject is longer than one bar. In `n("<[0 1 2 3] [4 5 6 7]>").rev()`, in C major from C4, each bar is reversed in place, but the bars keep their order: F4 E4 D4 C4, then C5 B4 A4 G4. That is not the retrograde of the two-bar line. Write the whole line in one cycle, reverse it, and stretch it afterwards: `n("0 1 2 3 4 5 6 7".rev().slow(2))` runs C5 down to C4 across two bars. Or use `revv`, which reverses the order of the cycles as well as the notes inside each one {cite doc=revv}: `n("<[0 1 2 3] [4 5 6 7]>").revv()` also runs C5 down to C4 across two bars.

**Forwards, then backwards.** `palindrome` plays the pattern forwards in one cycle and backwards in the next, alternating {cite doc=palindrome}. Its source is one line: apply `rev` to the last of every two cycles {cite src="packages/core/pattern.mjs#L2340-L2347"}. Over four bars:

:::diagram
digraph speeddir {
  rankdir=TB;
  node [shape=record, fontname="Helvetica", fontsize=12];
  edge [style=invis];
  a [label="rev()|bar 1: backwards|bar 2: backwards|bar 3: backwards|bar 4: backwards"];
  b [label="palindrome()|bar 1: forwards|bar 2: backwards|bar 3: forwards|bar 4: backwards"];
  a -> b;
}
:::

:::compare{diff="rev() → palindrome()"}
a:
  label: "rev: the subject backwards in every bar"
  code: n("0 2 4 7 [6 5] 4 3@2").scale("C4:major").s("triangle").rev()
b:
  label: "palindrome: forwards in bars 1 and 3, backwards in bars 2 and 4"
  code: n("0 2 4 7 [6 5] 4 3@2").scale("C4:major").s("triangle").palindrome()
:::

`rev` replaces the subject with its retrograde. `palindrome` keeps both, one after the other, so a one-bar figure becomes a two-bar arch.

:::bridge{title="Al rovescio"}
The minuet of Haydn's Symphony No. 47 is a minuet *al rovescio*: its second half is its first half played backwards. That is `palindrome` at the scale of a section. Bach's *Musical Offering* has a crab canon, where the second voice is the first read backwards from its last note; each voice there is the other's `rev`.
:::
