---
id: bus.shared-effects.lesson
title: "Shared spaces: send levels and separate buses"
skill: bus.shared-effects
---

In one hall the reverberation time is the same for every player, but how much of it you hear, compared with the direct sound, differs from player to player. The piano at the front of the stage sounds close and clear; the choir at the back sounds farther away. An orbit divides the work the same way. The orbit holds the parts of the space that everyone shares: one reverb time (`roomsize`) and one echo spacing (`delaysync`). Each part sets its own **send level**: how much of it goes into that shared reverb (`room`) or delay (`delay`).

A send is a gain node that takes a copy from the end of the note's chain into the orbit's effect, at the level you set {cite src="packages/superdough/helpers.mjs#L15-L20"} {cite src="packages/superdough/superdough.mjs#L950-L952"}. The dry sound goes to the orbit at full level whatever the send {cite src="packages/superdough/superdough.mjs#L973-L980"}. So a bigger `room` moves a part back in the space without making its direct sound quieter. Both versions below use one 3-second reverb on orbit 1. Only the sends differ:

:::compare{diff="sends: drums 0.4 → 0.05, chords 0.4 → 0.6"}
a:
  label: Same send for both, same distance
  code: |
    $: chord("<Am F C G>").voicing().s("triangle").room(0.4).roomsize(3)
    $: s("bd ~ sd ~").bank("RolandTR909").room(0.4).roomsize(3)
b:
  label: Drums close, chords farther back
  code: |
    $: chord("<Am F C G>").voicing().s("triangle").room(0.6).roomsize(3)
    $: s("bd ~ sd ~").bank("RolandTR909").room(0.05).roomsize(3)
:::

In the second version the kick and snare are short and nearly dry and sit in front, while the chords carry a long wash behind them (the drums need network to load). Both parts write the same `roomsize`, so they never rebuild the shared reverb.

The send copies the signal after `gain` and `postgain` {cite src="packages/superdough/superdough.mjs#L924-L955"}. Turning a part down therefore turns down its reverb and echoes by the same amount, and the balance between its dry sound and its reverb stays the same: it plays more softly in the same seat. Mixing engineers call this a post-fader send.

So the plan for a mix has three rules:

1. **Parts in one space share one orbit.** Write the space's settings (`roomsize`, `delaysync`, `delayfeedback`) once, after a `stack` of those parts, so the parts cannot disagree. Vary only the sends, part by part.
2. **A part that needs a different space gets its own orbit**: a longer or shorter reverb, or a different echo spacing.
3. **A dry part needs no orbit of its own.** With `room` and `delay` at 0, its notes leave the effects alone {cite src="packages/superdough/superdough.mjs#L930-L930"} {cite src="packages/superdough/superdough.mjs#L938-L938"}.

Here is a three-part layout built on those rules. The chords and drums are one ensemble in one 3-second room. The lead needs dotted-eighth echoes that the chords should not get, so it has orbit 2 to itself:

:::diagram
digraph shared {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  chords [label="chords\n(triangle)"];
  drums [label="drums\n(TR-909)"];
  lead [label="lead\n(square, gain 0.4)"];
  subgraph cluster_o1 {
    label="orbit 1: the room";
    fontname="Helvetica";
    rv1 [label="reverb\nroomsize 3 s"];
    sum1 [label="sum"];
  }
  subgraph cluster_o2 {
    label="orbit 2: the echo bus";
    fontname="Helvetica";
    dl2 [label="delay line\ndelaysync 3/16 cycle"];
    sum2 [label="sum"];
  }
  out [label="output"];
  chords -> sum1 [label=" dry"];
  drums -> sum1 [label=" dry"];
  chords -> rv1 [label=" room 0.6"];
  drums -> rv1 [label=" room 0.05"];
  rv1 -> sum1;
  lead -> sum2 [label=" dry"];
  lead -> dl2 [label=" delay 0.5"];
  dl2 -> sum2;
  sum1 -> out;
  sum2 -> out;
}
:::

:::play{label="Chords and drums in one room, lead on its own echo bus (needs network)"}
$: stack(
  chord("<Am F C G>").voicing().s("triangle").room(0.6),
  s("bd ~ sd ~").bank("RolandTR909").room(0.05),
).roomsize(3)
$: note("e5 ~ [c5 d5] ~")
  .s("square")
  .decay(0.1)
  .sustain(0)
  .lpf(2000)
  .delay(0.5)
  .delaysync(3 / 16)
  .orbit(2)
  .gain(0.4)
:::

The `roomsize(3)` after the `stack` reaches both of its parts, so the room is written once. The lead echoes in dotted eighths, and the chords, though they play at the same time, have no echoes at all: they send nothing to a delay, and the lead's delay is on another orbit. Orbit 2 also has a reverb of its own, unused here. If the lead had a `room` send, it would go to orbit 2's reverb, not to orbit 1's.

Two parts on separate orbits can sit in different spaces at once: a close, dry ensemble on one, a distant part in a long reverb on another. That is the offstage brass from the lesson on orbits.

One orbit can also dip the level of another, like the pumping heard in dance music (`duckorbit`) {cite doc=duckorbit}. Later lessons use it.

:::bridge{title="One hall, many distances"}
When you conduct a choir with a piano in a resonant church, the church's reverberation time is the same for both: that is `roomsize`, one per orbit. The piano near you sounds clear and the choir in the chancel sounds distant, because more of what reaches you from them is reflected sound: that is `room`, one per part. Moving the choir forward doesn't change the church. In Strudel, lowering their send doesn't change the orbit.
:::
