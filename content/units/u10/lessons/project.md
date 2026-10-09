---
id: spop.project.lesson
title: "Building a synth-pop track in checkpoints"
skill: spop.project
---

This lesson puts the unit together: a drum machine, a sequenced bass, a bed with brass stabs, and a modal hook, as one eight-bar loop. The song projects that follow ask you to build your own. The method matters as much as the sounds: **build in checkpoints**, and keep every part playing while you add the next. At each checkpoint the loop should already sound like a finished (if sparse) record.

**Plan before you play.** Three decisions keep a five-part arrangement clear.

- **Registers.** Give each part its own octave, the way an orchestrator spaces a score: bass in octave 3 (C3 to B3, jumping to octave 4 for its octave notes), bed and stabs in octaves 3 to 5 (the default voicings run from about D3 up to C5), hook in octave 5, above everything. When two parts share a register, one of them hides.
- **Orbits.** Parts that need different spaces need different orbits, because the reverb's size belongs to the orbit {cite src="packages/superdough/superdoughoutput.mjs#L69-L93"} {cite doc=orbit}. Here: the dry drums and bass on the default orbit, the short "gated" snare room on orbit 2, the long hall of the bed on orbit 3.
- **Levels.** Bring parts in at a modest `gain` (0.3 to 0.6) and balance at the end. Chords are several voices at once, so they need less gain than a single line.

**Checkpoint 1: drums.** A syncopated 808 kick, accented hats, and the snare on its own orbit in a short, loud room.

:::play{label="Checkpoint 1: the drum machine"}
setcpm(116 / 4)
$: s("bd ~ ~ bd ~ bd ~ ~").bank("RolandTR808")
$: s("[hh hh oh hh]*4").bank("RolandTR808").gain("[0.6 0.25 0.4 0.25]*4")
$: s("~ sd ~ sd").bank("RolandTR808").room(0.8).roomsize(0.4).orbit(2)
:::

**Checkpoint 2: sequenced bass.** Roots of C minor, A flat, E flat and B flat, one per bar, as sixteenths with an octave on the third sixteenth of each beat and a ticking filter envelope. Add this line under the drums.

:::code
$: note("<c3 ab3 eb3 bb3>")
  .ply(16)
  .add(note("[0 0 12 0]*4"))
  .s("sawtooth")
  .lpf(400)
  .lpenv(3)
  .lpdecay(0.1)
  .gain(0.6)
:::

**Checkpoint 3: bed and stabs.** A string bed holds the chords on orbit 3, and brass stabs punch the off-beats. Both read the same symbols: Cm, Ab, Eb, Bb.

:::code
$: chord("<Cm Ab Eb Bb>")
  .voicing()
  .s("supersaw")
  .unison(5)
  .detune(0.2)
  .attack(0.5)
  .release(1)
  .lpf(2500)
  .room(0.5)
  .roomsize(3)
  .orbit(3)
  .gain(0.3)
$: chord("<Cm Ab Eb Bb>")
  .struct("~ x ~ x ~ ~ x ~")
  .voicing()
  .s("sawtooth")
  .attack(0.01)
  .lpf(500)
  .lpenv(3)
  .lpattack(0.06)
  .lpdecay(0.25)
  .gain(0.35)
:::

**Checkpoint 4: hook and form.** The hook comes in only in bars 5 to 8. `mask` silences a pattern wherever its own pattern is 0 {cite doc=mask}. `"<0!4 1!4>"` is 0 for four bars, then 1 for four, so the first half is the groove alone and the hook arrives in the second. `lastOf(4, …)` answers the hook in bar 8 {cite doc=lastOf}. Here is the whole loop:

:::play{label="The finished eight-bar loop in C minor"}
setcpm(116 / 4)
$: s("bd ~ ~ bd ~ bd ~ ~").bank("RolandTR808")
$: s("[hh hh oh hh]*4").bank("RolandTR808").gain("[0.6 0.25 0.4 0.25]*4")
$: s("~ sd ~ sd").bank("RolandTR808").room(0.8).roomsize(0.4).orbit(2)
$: note("<c3 ab3 eb3 bb3>")
  .ply(16)
  .add(note("[0 0 12 0]*4"))
  .s("sawtooth")
  .lpf(400)
  .lpenv(3)
  .lpdecay(0.1)
  .gain(0.6)
$: chord("<Cm Ab Eb Bb>")
  .voicing()
  .s("supersaw")
  .unison(5)
  .detune(0.2)
  .attack(0.5)
  .release(1)
  .lpf(2500)
  .room(0.5)
  .roomsize(3)
  .orbit(3)
  .gain(0.3)
$: chord("<Cm Ab Eb Bb>")
  .struct("~ x ~ x ~ ~ x ~")
  .voicing()
  .s("sawtooth")
  .attack(0.01)
  .lpf(500)
  .lpenv(3)
  .lpattack(0.06)
  .lpdecay(0.25)
  .gain(0.35)
$: n("4 ~ 5 4 2 ~ 0 2".lastOf(4, (x) => x.add(2)))
  .scale("C5:minor")
  .s("square")
  .decay(0.2)
  .sustain(0.3)
  .lpf(3000)
  .delay(0.3)
  .delaysync(3 / 16)
  .gain(0.4)
  .mask("<0!4 1!4>")
:::

The hook plays G5 rest A flat 5 G5 E flat 5 rest C5 E flat 5. Over the four chords its G is the fifth of C minor, the major seventh of A flat, the third of E flat and the sixth of B flat. In bar 8 it rises two scale steps.

**Balancing.** Listen for each part in turn. If you can't follow the bass, the bed is too loud or too low (lower its `gain`, or its `lpf`). If the stabs smear into the bed, they share too much of its register and sound; make them brighter (`lpenv`) or shorter. If the snare's room swamps the groove, lower its `room` send. Change one thing at a time.

:::bridge{title="Scoring for a small band"}
This is orchestration for five players: a percussionist, a bass that never stops, divisi strings holding the harmony, a horn section punching off the beat, and a solo line that enters once the accompaniment is established. The same questions decide whether it works: does each part have its own register and its own role, and does the texture build?
:::
