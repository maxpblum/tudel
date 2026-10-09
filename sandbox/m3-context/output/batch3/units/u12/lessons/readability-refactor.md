---
id: zen.readability-refactor.lesson
title: "Refactoring a sprawling piece into a readable score"
skill: zen.readability-refactor
---

Live-coded pieces grow by accretion: a line copied and changed, a mask added, a callback nested inside another. After twenty minutes the music may be good while the code has become hard to read and, worse, hard to change while it plays. **Refactoring** means rewriting code so that it is clearer but sounds exactly the same. This lesson names the usual signs of sprawl, shows the fix for each, and works through one piece from start to finish.

:::bridge{title="Preparing a score"}
Before a first rehearsal, a conductor marks the score so that the structure is visible at a glance: rehearsal letters at section starts, the instrumentation on the first page, a dynamic written once at the start of a phrase rather than under every note. Nothing in the music changes. What changes is how fast you can find your way in it, and how safely you can make a change in the middle of a rehearsal. A refactor does the same for code.
:::

## A sprawling piece

This eight-bar piece works. It has a four-bar verse and a four-bar chorus in A minor at 100 BPM, and its hook answers itself in the last bar of the chorus. Read it and try to say, without playing it, how long the verse is and which parts play in the chorus:

:::code
setcpm(25)
$: s("bd ~ sd ~").bank("RolandTR909").mask("<1 1 1 1 0 0 0 0>")
$: s("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR909").mask("<0 0 0 0 1 1 1 1>")
$: note("<a3 f3 c3 g3>")
  .ply(4)
  .s("sawtooth")
  .lpf(600)
  .gain(0.6)
  .mask("<1 1 1 1 0 0 0 0>")
$: note("<a3 f3 c3 g3>")
  .ply(8)
  .s("sawtooth")
  .lpf(900)
  .gain(0.6)
  .mask("<0 0 0 0 1 1 1 1>")
$: chord("<Am F C G>").voicing().s("triangle").gain(0.5)
$: n("4 ~ 5 4 2 ~ 0 2")
  .scale("A4:minor")
  .s("square")
  .lpf(3000)
  .delay(0.3)
  .delaysync(0.1875)
  .orbit(2)
  .gain(0.3)
  .lastOf(4, (x) => x.rev().superimpose((y) => y.add(note(12))))
  .mask("<0 0 0 0 1 1 1 1>")
:::

You can work it out, but only by lining up five mask strings bar by bar. Here is what makes it hard.

## Five signs of sprawl, and their fixes

1. **The form is scattered.** The verse's length is written in five mask strings. Making the verse eight bars long means editing all five, and one missed string breaks the piece. *Fix:* build each section as a named `stack` and write the form once, with `arrange` {cite doc=arrange}.
2. **A part is copied with one change.** The two bass lines differ only in `ply` and `lpf`. *Fix:* name what they share, and add the differences where each is used.
3. **A callback inside a callback.** `(x) => x.rev().superimpose((y) => y.add(note(12)))` must be read inside out. *Fix:* give each step a name: *octaveUp*, then *answer*. A named function reads like a word in a sentence: `lastOf(4, answer)` {cite doc=lastOf}.
4. **Unexplained numbers.** `setcpm(25)` hides the tempo, and `delaysync(0.1875)` hides the rhythm. *Fix:* write them the course's way, `setcpm(100 / 4)` and `delaysync(3 / 16)`: 100 BPM in four beats per bar, and an echo a dotted eighth later.
5. **The layout doesn't follow the music.** Sound settings, rhythm and form are interleaved line by line, so to find out what plays in bar 6 you have to read every line. *Fix:* order the file the way a score is ordered: tempo first, then the parts, then the sections, and the form last.

## The same piece, refactored

:::play{label="The same eight bars, rewritten: parts, then sections, then the form"}
setcpm(100 / 4)
const bass = note("<a3 f3 c3 g3>").s("sawtooth")
const chords = chord("<Am F C G>").voicing().s("triangle").gain(0.5)
const octaveUp = (x) => x.add(note(12))
const answer = (x) => x.rev().superimpose(octaveUp)
const hook = n("4 ~ 5 4 2 ~ 0 2")
  .scale("A4:minor")
  .s("square")
  .lpf(3000)
  .delay(0.3)
  .delaysync(3 / 16)
  .orbit(2)
  .gain(0.3)

const verse = stack(
  s("bd ~ sd ~").bank("RolandTR909"),
  bass.ply(4).lpf(600).gain(0.6),
  chords,
)
const chorus = stack(
  s("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR909"),
  bass.ply(8).lpf(900).gain(0.6),
  chords,
  hook.lastOf(4, answer),
)

arrange([4, verse], [4, chorus])
:::

It plays the same events as the sprawling version. Now the questions are easy: the last line says the verse is four bars and the chorus four bars, and the *chorus* stack lists its four parts. The `lastOf(4, …)` inside the chorus counts the chorus's own bars, because each `arrange` section runs on its own clock, so the answer always falls on the chorus's fourth bar.

The file now reads top to bottom like a score:

:::diagram
digraph layout {
  rankdir=TB;
  node [shape=box, fontname="Helvetica"];
  tempo [label="Tempo\nsetcpm(100 / 4)"];
  parts [label="Parts and their sounds\nbass, chords, hook, named functions"];
  sections [label="Sections\nverse = stack(...), chorus = stack(...)"];
  form [label="Form\narrange([4, verse], [4, chorus])"];
  tempo -> parts -> sections -> form;
}
:::

The tempo goes at the top, as on the first page of a score. The parts come next, like the list of instruments, and then the sections, like the rehearsal letters. The road map goes at the bottom.

## Name things by their musical role

Names are the cheapest documentation there is. Call a part what it does in the music: bass, chords, hook, pedal, riser. Avoid names that describe the code instead, such as saw1 or pattern2. Name a function after its musical effect, so that answer, octaveUp and fill read like performance directions.

*const* and arrow functions are plain JavaScript. Strudel adds nothing to them, so they work anywhere in your code.

## When not to refactor

- **A single loop with no form** is clearest as one `$:` line per part. Wrapping it in `arrange` adds a line and says nothing new.
- **A part that only drops in or out of a steady loop** is clearest with one `mask` on that part. One mask string is not sprawl. Five matching mask strings are.
- **Don't abstract a pattern you use once.** Name a part when it appears in two places, or when the name says something the code doesn't.

The test of a good refactor is the next edit. Ask "what would I change in the middle of a set?": a longer verse, a new chord loop, a brighter chorus. If each of those is a change in one place, the code is ready.
