---
id: pat.variation-every.lesson
title: "Phrase-level variation: every, lastOf and when"
skill: pat.variation-every
---

A loop that repeats a bar unchanged soon stops being heard. Composers vary repetition at phrase level: the fourth bar of a four-bar phrase carries the cadence, and an accent marks the start of each new phrase. Strudel can apply a transform in chosen bars only and leave the others alone.

**Last bar of each group: lastOf.** `lastOf(n, f)` applies `f` on the last cycle of every group of `n` {cite doc=lastOf}. With this course's convention of one cycle per bar and four bars per phrase, `lastOf(4, f)` changes bars 4, 8, 12 and so on: the phrase ending.

**First bar of each group: every, also called firstOf.** `every(n, f)` is another name for `firstOf(n, f)` {cite doc=every}, and applies `f` on the **first** cycle of every group {cite doc=firstOf}: bars 1, 5, 9. The name suggests "every fourth bar", and a musician counts the fourth bar as bar 4. Here it means bar 1.

Both build a group of `n` cycles, one of them transformed, and choose by the cycle number {cite src="packages/core/pattern.mjs#L1995-L1999"} {cite src="packages/core/pattern.mjs#L2022-L2026"}. Strudel counts cycles from 0 and takes the remainder after dividing by `n` {cite src="packages/core/pattern.mjs#L1429-L1437"}. So cycle 0, which this course calls bar 1, is the first of a group, and cycle 3, bar 4, is the last.

:::diagram
digraph variation {
  rankdir=TB;
  node [shape=record, fontname="Helvetica", fontsize=12];
  edge [style=invis];
  a [label="every(4, f)|bar 1: f|bar 2|bar 3|bar 4|bar 5: f|bar 6|bar 7|bar 8"];
  b [label="lastOf(4, f)|bar 1|bar 2|bar 3|bar 4: f|bar 5|bar 6|bar 7|bar 8: f"];
  a -> b;
}
:::

On the same arpeggio, with `rev` as the transform: rising C4 E4 G4 C5 in three bars of four, falling C5 G4 E4 C4 in the other.

:::compare{diff="every(4, …) → lastOf(4, …)"}
a:
  label: "every: the phrase opens falling, then rises three times"
  code: |
    n("0 2 4 7".every(4, (x) => x.rev()))
      .scale("C4:major")
      .s("triangle")
b:
  label: "lastOf: rises three times, then falls to the tonic to close"
  code: |
    n("0 2 4 7".lastOf(4, (x) => x.rev()))
      .scale("C4:major")
      .s("triangle")
:::

With `lastOf`, the fourth bar ends on the low tonic, C4, and the phrase sounds finished. With `every`, the falling bar comes first and the phrase ends on C5, still open.

A transform that needs no value of its own, such as `rev`, can be passed by name: `lastOf(4, rev)` means the same as `lastOf(4, (x) => x.rev())`. A drummer's fill at the end of each phrase is a `lastOf` too: the last bar of every four plays the beat twice as fast.

:::play{label="A four-bar drum phrase with a fill in bar 4"}
s("bd hh sd hh")
  .bank("RolandTR909")
  .lastOf(4, (x) => x.fast(2))
:::

**Wherever a pattern says 1: when.** `when(pattern, f)` applies `f` wherever a pattern of 1s and 0s is 1 {cite doc=when}. The 1s and 0s are themselves a pattern, so they can switch per bar or inside a bar {cite src="packages/core/pattern.mjs#L2222-L2224"}:

- `when("<0 0 0 1>", f)` changes bar 4 of every four, the same as `lastOf(4, f)`.
- `when("<0 1>", f)` changes every second bar.
- `when("0 1", f)` changes the second half of **every** bar, which neither `every` nor `lastOf` can do: they only switch whole bars.

:::play{label="when with 0 1: the second half of every bar jumps up an octave"}
n("0 1 2 3".when("0 1", (x) => x.add(7)))
  .scale("C4:major")
  .s("triangle")
:::

Here the bar plays C4 D4, then E5 F5: the transform is applied only to the notes that start where the pattern is 1.

:::bridge{title="The cadential bar"}
In a four-bar phrase, bar 4 carries the cadence. It rarely repeats bars 1 to 3 note for note. `lastOf(4, …)` gives a loop that cadential bar, and `every(4, …)` gives it a downbeat: the conductor's larger beat at the start of each phrase.
:::
