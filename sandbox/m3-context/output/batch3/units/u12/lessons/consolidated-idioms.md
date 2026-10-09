---
id: zen.consolidated-idioms.lesson
title: "The zen of Strudel: the course's idioms in one piece"
skill: zen.consolidated-idioms
---

Every skill in this course came with an **idiom note**: the clean way to write the thing just learned. Taken together, they come down to a handful of principles. Each one makes code shorter, but that isn't the main point. Each one puts a musical decision in **one obvious place**, where you can find it and change it while the music plays. This lesson collects them, each with the earlier idioms it grew out of, and ends with a piece that uses them all.

:::bridge{title="Economy of gesture"}
A good conductor's beat is as small as it can be and still be clear: every movement carries information, and nothing is there for show. The orchestra reads it at a glance. Good live code has the same economy: every line says one musical thing, and a reader (including you, mid-performance) can find each decision without searching.
:::

## 1. Say what, then with what

Write the notes first, then the sound: `note(...)` or `n(...)` or `chord(...)`, then `.s(...)`, then the envelope, the filters, the space and finally `gain`. The order of the methods doesn't change the sound, but writing the same order every time means you always know where to look for the cutoff or the level.

## 2. Patterns go anywhere a number goes

If something changes from bar to bar, put the change inside the parameter, not in a copy of the line. One `.lpf("<400 800 1600 3200>")` replaces four lines that differ in one number.

:::compare{diff="four copies, one cutoff each → one line with a cutoff pattern"}
a:
  label: Four lines, each masked to one bar
  code: |
    $: note("c3*8").s("sawtooth").lpf(400).mask("<1 0 0 0>")
    $: note("c3*8").s("sawtooth").lpf(800).mask("<0 1 0 0>")
    $: note("c3*8").s("sawtooth").lpf(1600).mask("<0 0 1 0>")
    $: note("c3*8").s("sawtooth").lpf(3200).mask("<0 0 0 1>")
b:
  label: One line, the cutoff patterned per bar
  code: note("c3*8").s("sawtooth").lpf("<400 800 1600 3200>")
:::

## 3. Steps with < >, sweeps with signals

Use `< >` for a terraced change, one value per bar. Use a signal for a smooth one: `sine.range(...)` or, for frequencies, `rangex(...)`, slowed to the length of the phrase. And remember that **a signal needs notes to carry it**: each note reads the signal once, when it starts, so a sweep on whole-bar chords moves in whole-bar steps, while on sixteenths it sounds continuous {cite doc=rangex}.

## 4. Name the harmony, not the notes

Write chords as symbols, `chord("<Am F C G>").voicing()`, and steer the voicing with `anchor` and `mode` instead of spelling notes. Write melodies as scale degrees with `n` and `scale`, so the key is one word: `"A4:minor"` becomes `"C4:minor"` and every note follows {cite doc=voicing} {cite doc=scale}. Spell the dictionary's way: `^7` for a major seventh, `sus` for a sus4. A slash chord's bass gets a part of its own.

## 5. Write once, derive the rest

Most lines in a piece are related to another line. Write the original and derive the relative:

- Parallel voices: `n("0 1 2 3".add("0,2"))`, thirds above every note.
- Canon and imitation: `off(1 / 8, (x) => x.add(7))` on the degrees.
- Doubling: `superimpose((x) => x.add(note(12)))`, an octave above.
- Repeated notes and rhythm: one root per bar, `ply(8)` or `struct("x ~ x x")` for the rhythm.
- Transformation: `fast`, `slow`, `rev`, and reflection with `mul(-1)` for inversion.
- Variation: `lastOf(4, …)` for the end of a phrase.
- Key change: `transpose(1)` on the pitched parts.

When you do arithmetic on a part, wrap the number in the control it belongs to: `add(note(12))`, not `add(12)`.

## 6. Time in cycles, tempo once

`setcpm(BPM / 4)` goes on the first line, so the tempo reads in beats per minute. Everything else is measured in cycles, which in this course are bars: `slow(4)` is a four-bar phrase, `delaysync(3 / 16)` is a dotted-eighth echo, `off(1 / 8, …)` is an eighth note late. Change the tempo and all of these stay in time {cite doc=delaysync}.

## 7. One part per line, one space per orbit

Each independent part gets its own `$:` line or its own place in a `stack`. Parts that share a room share an orbit, and parts that need a different echo or room get their own. Write the room's settings (`roomsize`, `delaysync`) once per orbit, and vary only the sends (`room`, `delay`) per part {cite doc=orbit}.

## 8. Parts, then sections, then the form

Name the parts, build sections from them with `stack`, and write the form on the last line with `arrange` or `seqPLoop`. Choose `arrange` when the whole texture changes section by section, `seqPLoop` when parts enter and leave on their own, and `mask` when a single part drops in or out.

## 9. Balance last, in decibels

Get every part playing before you balance. Then set the most important part first and place each of the others a definite amount below it: halving a `gain` is about 6 dB quieter. Balancing one part at a time while you build means balancing everything again later.

## The principles in one piece

A 16-bar synthwave cue in E minor at 112 BPM. The comments name the principles at work.

:::play{label="16-bar cue in E minor: intro, verse, then an 8-bar chorus with the melody"}
// 6. Tempo once, at the top
setcpm(112 / 4)

// 4. The harmony, named once
const loop = "<Em C G D>"

// 1. and 7. Parts: what, then with what; one space per orbit
const kit = s("bd [~ bd] sd ~, hh*8").bank("RolandTR808").gain(0.8)
const bass = note("<e3 c3 g3 d3>")
  .ply(8)
  .add(note("[0 12]*4"))
  .s("sawtooth")
  .lpf(400)
  .lpenv(3)
  .lpdecay(0.1)
  .gain(0.6)
const pad = chord(loop)
  .voicing()
  .s("supersaw")
  .detune(0.15)
  .attack(0.3)
  .release(1)
  .lpf(sine.slow(8).rangex(1200, 3000))
  .room(0.5)
  .roomsize(4)
  .orbit(2)
  .gain(0.35)
// 5. Write once, derive: thirds from .add, the answer from lastOf
const melody = n("<[0 ~ 2 4] [4 ~ 2 0] [2 4 5 4] [3@3 ~]>".add("0,2"))
  .lastOf(4, (x) => x.add(n(7)))
  .scale("E4:minor")
  .s("square")
  .decay(0.2)
  .sustain(0.3)
  .lpf(2500)
  .delay(0.3)
  .delaysync(3 / 16)
  .orbit(3)
  .gain(0.25)

// 8. Sections from parts, the form at the bottom
const intro = stack(pad, bass)
const verse = stack(kit, bass, pad)
const chorus = stack(kit, bass, pad, melody)

arrange([4, intro], [4, verse], [8, chorus])
:::

Now test the code the way a live set would. Each change below touches only the line that holds that musical decision:

- **Another mode:** change `"E4:minor"` to `"E4:dorian"`. The melody and its thirds follow: the C5 in bar 3 becomes C sharp 5, the raised sixth that gives Dorian its brighter colour, while the chords stay as they are.
- **Another progression:** edit *loop*. The pad follows it.
- **A longer verse:** change `[4, verse]` to `[8, verse]`.
- **A darker chorus:** lower the pad's `rangex` ceiling.
- **A quieter melody:** lower its `gain`; nothing else moves.

:::bridge{title="Practising for the next edit"}
A pianist preparing a concert practises the passages most likely to go wrong, and fingers them so the hand never has to think twice. Writing live code is the same preparation: you lay out the piece so that the changes you'll want to make on stage are each one small, safe movement.
:::

## A checklist for your own code

Before you call a piece finished, read it once as a stranger would:

1. Can you find the tempo, the key and the chord loop in under five seconds?
2. Does the last line tell you the form and each section's length in bars?
3. Is any line a copy of another with one value changed? Pattern the value, or derive the line.
4. Is any musical fact (the chords, a part's sound) written in two places?
5. Does every number have a meaning you could say aloud: a BPM, a fraction of a bar, a cutoff in Hz, a step in dB?
6. Is any callback nested inside another? Give the inner one a name.
7. Do parts that share a space share an orbit, and only those?
