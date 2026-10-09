---
id: bus.orbit.lesson
title: Effect buses with orbit
skill: bus.orbit
---

In a concert hall every player sends sound into the same acoustic. Strudel does the same unless you say otherwise. Each note builds its own short chain of Web Audio nodes when it starts: the source, then `gain`, filters, `pan`, and a last gain stage, `postgain` {cite src="packages/superdough/superdough.mjs#L651-L654"} {cite src="packages/superdough/superdough.mjs#L842-L848"} {cite src="packages/superdough/superdough.mjs#L924-L927"}. All those chains end in the same place, an **orbit**. An orbit is a group of nodes that lasts while the music plays: one summing node, at most one delay line and at most one reverb (a ConvolverNode) {cite src="packages/superdough/superdoughoutput.mjs#L19-L32"} {cite src="packages/superdough/superdoughoutput.mjs#L53-L93"}. Engineers call a shared path like this an **effect bus**. Strudel's reference calls an orbit a "global parameter context": patterns on the same orbit share the same global effects {cite doc=orbit}.

`orbit(n)` chooses the bus by number. The first note that names a number creates that orbit and connects it to the output {cite src="packages/superdough/superdough.mjs#L510-L510"} {cite src="packages/superdough/superdoughoutput.mjs#L221-L227"}. A note without `orbit` goes to orbit 1 {cite src="packages/superdough/superdough.mjs#L485-L485"} {cite src="packages/superdough/superdough.mjs#L195-L195"}. So far in this course, then, all your parts have shared one delay and one reverb.

:::diagram
digraph orbit {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  a [label="part A, each note\nsource, gain, filters,\npan, postgain"];
  b [label="part B, each note\nsource, gain, filters,\npan, postgain"];
  asd [label="send\ndelay 0.5"];
  asr [label="send\nroom 0.2"];
  bsr [label="send\nroom 0.6"];
  subgraph cluster_orbit {
    label="orbit 1 (shared)";
    fontname="Helvetica";
    dl [label="one delay line\ndelaysync, delayfeedback"];
    rv [label="one reverb\nroomsize"];
    sum [label="sum"];
  }
  out [label="output"];
  a -> sum [label=" dry"];
  b -> sum [label=" dry"];
  a -> asd -> dl;
  a -> asr -> rv;
  b -> bsr -> rv;
  dl -> sum;
  rv -> sum;
  sum -> out;
}
:::

The note's own chain carries only the **sends**. `delay` and `room` are levels, set note by note, of a copy that goes into the orbit's delay and reverb {cite src="packages/superdough/superdough.mjs#L929-L955"} {cite src="packages/superdough/helpers.mjs#L15-L20"}. The settings of the effects themselves belong to the orbit: it has one delay line, so one echo spacing and one feedback, and one reverb, so one reverb time.

| Set per note: the send level | Set per orbit: the shared effect |
|---|---|
| `delay`, 0 to 1 | `delaysync` (cycles between echoes), `delayfeedback` (0 to 1) |
| `room`, 0 to 1 | `roomsize` (seconds of reverb tail) |

Each note still carries its own `delaysync` and `roomsize` values, because every control is set per note. When two parts on one orbit carry different values, the shared effect follows the note that arrived last. The delay and the reverb behave a little differently:

- **The delay.** Every note that sends to the delay (`delay` above 0) sets the shared line's echo time and feedback at its own start {cite src="packages/superdough/superdough.mjs#L929-L936"} {cite src="packages/superdough/superdoughoutput.mjs#L53-L67"}. A note that leaves `delaysync` unset still sets it, to the default of 3/16 of a cycle, and sets the feedback to its default of 0.5 {cite src="packages/superdough/superdough.mjs#L481-L483"} {cite src="packages/superdough/superdough.mjs#L193-L194"}. Echoes already going round the line's feedback loop are read out at the new time too. So on a shared orbit, both parts' echoes change their spacing whenever either part plays a note.
- **The reverb.** A note that sends to the reverb with a `roomsize` different from the current one makes Strudel compute a new impulse response, the room's answer to a single click, which the reverb convolves with every note {cite src="packages/superdough/superdoughoutput.mjs#L69-L93"} {cite src="packages/superdough/reverb.mjs#L26-L56"}. A note without `roomsize` leaves the reverb as it is {cite src="packages/superdough/superdoughoutput.mjs#L14-L14"}. So a part without `roomsize` sounds in whatever room the last part set, and two parts with different sizes rebuild the reverb back and forth. The reference asks you to change `roomsize` only sparingly {cite doc=roomsize}.

A note that sends nothing (`delay` or `room` at 0) leaves that effect alone {cite src="packages/superdough/superdough.mjs#L930-L930"} {cite src="packages/superdough/superdough.mjs#L938-L938"}.

Here is the fight, and its fix. Two plucks each want their own echo: c5 on beat 1 with quarter-note echoes (1/4 cycle), g4 on beat 3 with dotted-eighth echoes (3/16 cycle). The only change is `orbit(2)` on the second part:

:::compare{diff="second part: orbit 1 → orbit 2"}
a:
  label: One orbit, the echo spacing keeps switching
  code: |
    $: note("c5 ~ ~ ~")
      .s("triangle")
      .decay(0.1)
      .sustain(0)
      .delay(0.6)
      .delaysync(1 / 4)
    $: note("~ ~ g4 ~")
      .s("triangle")
      .decay(0.1)
      .sustain(0)
      .delay(0.6)
      .delaysync(3 / 16)
b:
  label: Two orbits, each part keeps its echoes
  code: |
    $: note("c5 ~ ~ ~")
      .s("triangle")
      .decay(0.1)
      .sustain(0)
      .delay(0.6)
      .delaysync(1 / 4)
    $: note("~ ~ g4 ~")
      .s("triangle")
      .decay(0.1)
      .sustain(0)
      .delay(0.6)
      .delaysync(3 / 16)
      .orbit(2)
:::

On one orbit, the c5's echo arrives on beat 2 as asked. From beat 3, when the g4 starts, every echo in the line, the c5's included, comes a dotted eighth apart. From the next downbeat, when the c5 starts again, they all come a quarter apart. On two orbits, the c5 echoes on every beat and the g4 echoes in dotted eighths, each on its own line.

Where you write `orbit` decides which notes it reaches. `stack` makes one pattern out of several, and a method written after it applies to every part inside {cite doc=stack}: `stack(a, b).orbit(2)` sends both parts to orbit 2. Each `$:` line is a pattern of its own, and Strudel stacks the lines only at the end {cite src="packages/transpiler/transpiler.mjs#L468-L470"} {cite src="packages/core/repl.mjs#L238-L258"}, so each line chooses its own orbit. Use `stack` for parts that belong in one space, and separate `$:` lines when each part needs its own routing:

:::code
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

The chords and drums share orbit 1 and its 3-second reverb, written once after the `stack`. The lead has its dotted-eighth delay to itself on orbit 2. A later lesson builds this layout step by step.

:::bridge{title="The offstage brass"}
In the finale of Mahler's Second Symphony a band of brass and percussion plays offstage while the orchestra plays on stage. Both reach the same audience, but the offstage players are heard through another space first, with its own reflections. The stage in the hall is orbit 1. The offstage band is orbit 2. Both orbits still end at the same output, as both groups reach the same listeners.
:::
