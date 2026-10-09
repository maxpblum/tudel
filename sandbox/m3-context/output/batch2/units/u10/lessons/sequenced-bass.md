---
id: spop.sequenced-bass.lesson
title: "Pumping 16th-note sequenced bass"
skill: spop.sequenced-bass
---

The bass of early synth-pop often wasn't played by a person. A **sequencer** stepped through the notes and played a monophonic synth on every sixteenth note, with machine-perfect timing and every note the same length. Depeche Mode, New Order and Human League built whole songs on that tireless pulse: the harmony changes once a bar, and the bass restates the root sixteen times. This lesson writes that bass in Strudel.

**One root per bar, sixteen times.** Write the roots once, one per bar, with `< >`. Then `ply(16)` repeats each event sixteen times inside its own slot {cite doc=ply}. A one-bar event becomes sixteen sixteenths, all on the root:

:::play{label="Roots C3, Ab3, Eb3, Bb3, one per bar, as sixteenths"}
setcpm(120 / 4)
note("<c3 ab3 eb3 bb3>").ply(16).s("sawtooth").lpf(800)
:::

At 120 BPM a bar lasts 2 seconds, so each sixteenth lasts 0.125 seconds: 8 notes per second.

`ply` and `fast` look alike but do different things to this line. `ply(16)` repeats each bar's root inside that bar. `fast(16)` squeezes the whole pattern, and that includes the `< >`, so it steps to the next root on every sixteenth:

:::compare{diff="ply(16) → fast(16)"}
a:
  label: ply(16), one root per bar
  code: note("<c3 ab3 eb3 bb3>").ply(16).s("sawtooth").lpf(800)
b:
  label: fast(16), a new root every sixteenth
  code: note("<c3 ab3 eb3 bb3>").fast(16).s("sawtooth").lpf(800)
:::

**A tick on every note.** A plain sawtooth through a fixed low-pass sounds like a held organ pedal chopped up. Sequenced basses tick: each note starts bright and closes almost at once. That is a short filter envelope. `lpenv(3)` opens the cutoff 3 octaves above `lpf`, and `lpdecay(0.1)` closes it again within 0.1 seconds {cite doc=lpenv} {cite doc=lpdecay} {cite src="packages/superdough/helpers.mjs#L253-L263"}. With `lpf(400)` that is a flash from 400 Hz up to 3200 Hz (400 × 2 × 2 × 2) and back, inside every 0.125-second note:

:::envelope
attack: 0.005
decay: 0.1
sustain: 0
release: 0.1
hold: 0.125
:::

:::compare{diff="fixed lpf 800 Hz → lpf 400 Hz with lpenv 3, lpdecay 0.1"}
a:
  label: Fixed filter
  code: note("<c3 ab3 eb3 bb3>").ply(16).s("sawtooth").lpf(800)
b:
  label: Filter envelope, every note ticks
  code: |
    note("<c3 ab3 eb3 bb3>")
      .ply(16)
      .s("sawtooth")
      .lpf(400)
      .lpenv(3)
      .lpdecay(0.1)
:::

**Octave jumps.** Many sequenced basses jump to the octave above on some steps, which makes the line bounce. Add the jumps as a pattern of note offsets in semitones, wrapped in `note(...)` because the line is already a control pattern {cite doc=add}. The offset pattern needs one step per bass note: `"[0 12]*8"` alternates root and octave across 16 steps, and `"[0 0 12 0]*4"` jumps up on the third sixteenth of every beat:

:::play{label="Octave on the third sixteenth of each beat"}
setcpm(120 / 4)
note("<c3 ab3 eb3 bb3>")
  .ply(16)
  .add(note("[0 0 12 0]*4"))
  .s("sawtooth")
  .lpf(400)
  .lpenv(3)
  .lpdecay(0.1)
:::

Bar 1 plays C3 C3 C4 C3, four times. Bar 4 plays Bb3 Bb3 Bb4 Bb3. The offsets follow whichever root is sounding, so the octaves change with the harmony for free. Other offsets work the same way: 7 adds the fifth above, so `"[0 12 7 12]*4"` outlines root, octave, fifth, octave.

**Accents.** A gain pattern over the notes gives the line a pulse, as on the drum machine: `.gain("[0.9 0.5 0.7 0.5]*4")` leans on each beat.

:::bridge{title="A Trommelbass on a synthesizer"}
Baroque and Classical scores often keep the bass on one repeated note per harmony, eighths or sixteenths drumming under the upper parts: the German name is *Trommelbass*, "drum bass". It keeps the motor running while the harmony moves slowly above. The sequenced synth bass is the same idea with machine precision. The filter envelope stands in for the bow's bite at the start of each repeated note.
:::
