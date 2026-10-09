---
id: pat.canon-imitation.lesson
title: Canon and imitation with off
skill: pat.canon-imitation
---

In a canon, a second voice sings the leader's line a fixed time later, often at a fixed interval. `off(time, f)` builds exactly that from one line: it plays the pattern and, on top of it, a copy delayed by `time` cycles, with the function `f` applied to the copy {cite doc=off} {cite src="packages/core/pattern.mjs#L2236-L2238"}.

The function is written `(x) => x.add(7)`. Read it as "take the copy, call it `x`, and give back `x` seven degrees higher". Seven degrees of a seven-note scale is one octave. As with parallel voices, the `add` goes on the degrees inside `n(...)`, before `scale` turns degrees into notes {cite doc=add}.

**A round.** *Frère Jacques* is eight bars long, and each new voice enters two bars after the one before. With this course's convention of one cycle per bar, a two-bar delay is `off(2, …)`:

:::play{label="Frère Jacques in C major, second voice an octave higher, two bars later"}
n(
  "<[0 1 2 0]!2 [2 3 4@2]!2 [[4 5] [4 3] 2 0]!2 [0 -3 0@2]!2>".off(2, (x) =>
    x.add(7),
  ),
)
  .scale("C4:major")
  .s("triangle")
:::

The leader runs from G3 up to A4. The follower runs an octave higher, G4 to A5, two bars behind.

A loop has no beginning. Strudel repeats the eight bars endlessly, so the delayed copy reaches back into the previous pass: in bars 1 and 2 the follower is already singing the last two bars, "ding, dang, dong" (C5 G4 C5). A choir starts with the leader alone; this loop starts with both voices. Later lessons on form show how to bring parts in one at a time.

**The delay must not be a whole loop.** A one-bar line delayed by one bar lands exactly on itself: `n("0 2 4 7".off(1, (x) => x.add(7)))` is a plain octave doubling, with no imitation at all. The same goes for any delay that is a whole number of loop lengths. Keep the delay shorter than the line.

**Close imitation.** A short delay makes the voices overlap tightly, like the entries in a stretto. Here the same arpeggio is answered at the octave, first one eighth note behind, then one beat behind. In cycles, an eighth note is `1 / 8` and a beat is `1 / 4`. Every note is a tone of the C major triad, so whatever the delay, the two voices only ever sound notes of that one chord together.

:::compare{diff="off 1 / 8 → off 1 / 4"}
a:
  label: Answer one eighth note later
  code: |
    n("0 2 4 7 4 2 0@2".off(1 / 8, (x) => x.add(7)))
      .scale("C4:major")
      .s("triangle")
b:
  label: Answer one beat later
  code: |
    n("0 2 4 7 4 2 0@2".off(1 / 4, (x) => x.add(7)))
      .scale("C4:major")
      .s("triangle")
:::

Any interval works: `x.add(4)` answers a fifth higher (four degrees), `x.sub(3)` a fourth lower. Because the arithmetic is in degrees, the answer stays in the key, and each fifth is perfect or diminished as the scale decides.

**Lines written as note names.** Arithmetic on the copy only changes pitch while the copy is still plain numbers. After `note(...)` or `n(...)` the copy carries named settings (`note`, `s`, …), and `x.add(12)` does not know which setting to add to. Strudel prints "Can't do arithmetic on control pattern" and leaves the pitch as it was {cite src="packages/core/value.mjs#L10-L18"}, so the follower comes out at the unison. Either name the setting you add to, `x.add(note(12))`, or use `x.transpose(12)`, which moves note names by semitones {cite doc=transpose}:

:::play{label="A note-name line answered an octave up, one beat later"}
note("c4 e4 g4 e4 f4 d4 b3 c4")
  .s("triangle")
  .off(1 / 4, (x) => x.transpose(12))
:::

:::bridge{title="Dux and comes"}
The leader of a canon is the *dux* and the follower the *comes*. `off` writes only the dux; the comes is a rule ("one beat later, an octave up"), exactly as a canon is notated in old prints: one line, plus a sign for where the second voice enters and at what interval.
:::
