---
id: swave.rolling-bass.lesson
title: "Driving eighth-note bass"
skill: swave.rolling-bass
---

**Synthwave** (also called outrun or retrowave) is electronic music from the late 2000s onward that recreates the sound of 1980s film and TV scores: analog-style synthesizers, drum machines, minor keys, and a feeling of driving through a city at night. Kavinsky's "Nightcall" (2010) and the soundtrack of the film *Drive* (2011) made it widely known; The Midnight, FM-84 and, at its darker and faster end, Perturbator are typical later artists. Tempos usually sit between 80 and 120 BPM. This unit builds the style's four layers, one lesson at a time: bass, pad, pumping, and lead. Everything you write is your own material: the lessons describe techniques, never anyone's melody.

The layer that makes it *drive* is the bass. In most synthwave it is not a melody at all. It is one note per chord, repeated as steady eighth notes on a sawtooth, with a low-pass filter taking the edge off.

:::bridge{title="A Trommelbass with a filter"}
Baroque players had a name for a continuo line that repeats one pitch in even eighth notes: *Trommelbass*, drum bass. It holds the harmony still while giving the music a motor, like the opening of Vivaldi's "Winter". The synthwave bass is the same device. The pitch only changes when the chord does, and all the energy is in the rhythm.
:::

**The idiom: roots once, rhythm with `ply`.** Write the chord roots one per bar inside `< >`, then repeat each root eight times with `ply(8)` {cite doc=ply}. In this course one cycle is one bar of 4/4, so eight equal events per cycle are eighth notes.

:::play{label="Eighth-note roots A, F, C, G at 100 BPM, filtered sawtooth"}
setcpm(100 / 4)
note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(600)
:::

The roots are those of a loop you know from the earlier progressions lessons: Am, F, C, G, the i–VI–III–VII of A minor, which is the single most common chord loop in the genre.

A note about register: on a record this bass would sit one or two octaves lower, around A1 to A2 (55 to 110 Hz). This course keeps every note at C3 (131 Hz) or above, so that it is audible on laptop speakers. The patterns are the same in any octave.

**Shaping each note with the filter envelope.** A plain `lpf(600)` gives every eighth the same dull colour. Synthwave basses usually *tick*: each note opens bright and closes quickly, so the repeated notes are heard as separate strokes rather than a buzz. That is a filter envelope, as in the earlier filter-envelope lesson: `lpenv` sets how many octaves the cutoff opens above `lpf`, and `lpdecay` how many seconds it takes to close again {cite doc=lpenv} {cite doc=lpdecay} {cite src="packages/superdough/helpers.mjs#L253-L263"}. At 100 BPM an eighth note lasts 0.3 seconds, so a decay of about 0.1 seconds closes the filter in the first third of every note.

:::compare{diff="lpf 600 → lpf 400 with lpenv 3, lpdecay 0.1"}
a:
  label: Static filter at 600 Hz
  code: |
    setcpm(100 / 4)
    note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(600)
b:
  label: "Filter opens 3 octaves (400 → 3200 Hz) on every note, closes in 0.1 s"
  code: |
    setcpm(100 / 4)
    note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(400).lpenv(3).lpdecay(0.1)
:::

:::envelope
attack: 0.005
decay: 0.1
sustain: 0
release: 0.1
hold: 0.3
:::

The plot shows the cutoff's movement on one eighth note (0 = 400 Hz, 1 = 3200 Hz): a fast rise, a fall within 0.1 seconds, then dark for the rest of the note.

**Three rhythms on the same roots.** Because the roots and the rhythm are written in separate places, you can change the bass's character without touching the harmony.

1. **Drive**: plain eighths, `ply(8)`, as above.
2. **Octave pulse**: every other eighth jumps up an octave. Add a pattern of offsets in semitones, `add(note("[0 12]*4"))`: four pairs of "stay, octave up" per bar {cite doc=add}. The offset pattern needs as many steps per bar as the bass has, so 8 steps for 8 eighths. This is the bouncing bass of many 1980s pop records and of much synthwave.
3. **Gallop**: sixteenth notes with the first of each beat left out, `struct("[~ x x x]*4")` {cite doc=struct}. Three notes per beat, starting just after it. The empty sixteenth on the beat leaves room for the kick drum, which is why this "rolling" pattern is so common in synthwave: the kick and bass take turns instead of colliding. `struct` takes its pitches from the pattern before it, so the roots still change once per bar.

:::compare{diff="ply(8) → struct(\"[~ x x x]*4\")"}
a:
  label: Drive, eighths with the kick
  code: |
    setcpm(100 / 4)
    $: note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(400).lpenv(3).lpdecay(0.1)
    $: s("bd*4").bank("RolandTR909")
b:
  label: Gallop, sixteenths that skip each beat
  code: |
    setcpm(100 / 4)
    $: note("<a3 f3 c3 g3>")
      .struct("[~ x x x]*4")
      .s("sawtooth")
      .lpf(400)
      .lpenv(3)
      .lpdecay(0.08)
    $: s("bd*4").bank("RolandTR909")
:::

In the gallop, listen to bass and kick together: kick on the beat, three bass notes after it, kick again. The gallop's notes are shorter (0.15 seconds at 100 BPM), so its filter decay is a little shorter too.

:::abc
X:1
M:4/4
L:1/16
K:Am clef=bass
z A,A,A, z A,A,A, z A,A,A, z A,A,A, | z F,F,F, z F,F,F, z F,F,F, z F,F,F, |
:::

**A slow build over the phrase.** Synthwave tracks often open the bass's filter gradually over eight or sixteen bars, so the track grows brighter without any new notes. Put a slow signal in `lpf`, as in the earlier sweeps lessons: `lpf(sine.range(300, 900).slow(8))` moves the starting cutoff between 300 and 900 Hz over eight bars, and the envelope still opens three octaves above wherever it is.

:::play{label="Octave-pulse bass, filter breathing over eight bars, with drums"}
setcpm(100 / 4)
$: note("<a3 f3 c3 g3>")
  .ply(8)
  .add(note("[0 12]*4"))
  .s("sawtooth")
  .lpf(sine.range(300, 900).slow(8))
  .lpenv(3)
  .lpdecay(0.1)
  .gain(0.7)
$: s("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR909")
:::

Three things to keep:

- **One pitch per chord.** The bass states the root and gets out of the way; the harmony's colour comes from the pad above it.
- **Rhythm is the bass's job.** Drive, octave pulse and gallop are three rhythms on the same notes. Choose one per section and change it when the section changes.
- **Short filter decay, about a third of the note.** The notes then tick instead of droning, and the kick still cuts through.
