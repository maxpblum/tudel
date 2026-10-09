---
id: chip.project.lesson
title: "Building a chiptune cue, channel by channel"
skill: chip.project
---

This lesson walks through a complete four-bar game cue, built in the same checkpoints the project asks for: drums, bass, arpeggiated harmony, lead, then the mix. Each checkpoint plays on its own and with everything before it, so you always have something that sounds finished. The cue is original, in E minor at 160 BPM (a bar lasts 1.5 seconds), on the Aeolian loop i-bVI-bVII-i: Em, C, D, Em.

**Plan the channels first.** Before writing a note, decide what each of the four channels does, as you would allot the parts of a quartet:

:::diagram
digraph band {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  p1 [label="Pulse 1, 25 %\nlead melody"];
  p2 [label="Pulse 2, 50 %\nfast arpeggio (harmony)"];
  tri [label="Triangle\nbass, plus the kick"];
  noi [label="Noise\nhi-hat and snare"];
  out [label="output (mono)"];
  p1 -> out; p2 -> out; tri -> out; noi -> out;
}
:::

The kick has no channel of its own. On the NES it often borrowed the triangle, so here the bass note on beats 1 and 3 starts with a pitch drop: the thump and the bass note are the same note.

**Checkpoint 1: the noise channel.** Hats and snare share one line, as on the console. The decay, high-pass and gain patterns repeat each beat-pair: a 30 ms hat, a 150 ms snare on beats 2 and 4, accents on the beats.

:::play{label="Checkpoint 1: hats and snare on one noise channel"}
setcpm(160 / 4)
$: s("white*8")
  .decay("[0.03 0.03 0.15 0.03]*2")
  .sustain(0)
  .hpf("[7000 7000 1500 7000]*2")
  .gain("[0.3 0.15 0.4 0.15]*2")
:::

**Checkpoint 2: triangle bass with the kick inside it.** The roots, one per bar, become eighth notes with `ply(8)`, and `add(note("[0 12]*4"))` bounces every other eighth up an octave. `penv("[36 0 0 0]*2")` gives steps 1 and 5 of the 8 (beats 1 and 3) a three-octave drop of 50 ms, and leaves the rest alone.

:::play{label="Checkpoint 2: octave-bouncing triangle bass with a pitch-drop kick on beats 1 and 3"}
setcpm(160 / 4)
$: note("<e3 c3 d3 e3>")
  .ply(8)
  .add(note("[0 12]*4"))
  .s("triangle")
  .penv("[36 0 0 0]*2")
  .pdecay(0.05)
  .gain(0.9)
:::

**Checkpoint 3: the harmony as a fast arpeggio.** The chord symbols are voiced by `voicing` and played on one pulse channel. Positions 1, 2 and 3 skip the voicing's bass note, which the triangle already plays: B3 E4 G4 for Em, C4 E4 G4 for C, A3 D4 F#4 for D. Played 12 times per bar, that is 36 notes in 1.5 seconds, 24 per second: fused into a shimmering chord.

:::play{label="Checkpoint 3: harmony arpeggio, 24 notes per second, 50 % pulse"}
setcpm(160 / 4)
$: chord("<Em C D Em>").voicing().arp("[1 2 3]*12").s("pulse").pw(0).gain(0.2)
:::

**Checkpoint 4: the lead, and the mix.** The lead is an eighth-note melody on the 25 % pulse with two ornaments: a grace note (D sharp into E) at the cadence and vibrato on the final long notes. The levels set the hierarchy: lead loudest among the pulses, harmony well behind it, bass full, noise in between.

:::play{label="The full cue: four channels, original melody in E minor, 160 BPM"}
setcpm(160 / 4)
$: note("<[e5 ~ b4 e5 g5 ~ f#5 e5] [e5 ~ c5 e5 g5 ~ a5 g5] [f#5 ~ d5 f#5 a5 ~ g5 f#5] [e5@3 b4 [d#5 e5@3]@4]>")
  .s("pulse")
  .vib(6)
  .vibmod("<0 0 0 [0@4 0.3@4]>")
  .gain(0.45)
$: chord("<Em C D Em>").voicing().arp("[1 2 3]*12").s("pulse").pw(0).gain(0.2)
$: note("<e3 c3 d3 e3>")
  .ply(8)
  .add(note("[0 12]*4"))
  .s("triangle")
  .penv("[36 0 0 0]*2")
  .pdecay(0.05)
  .gain(0.9)
$: s("white*8")
  .decay("[0.03 0.03 0.15 0.03]*2")
  .sustain(0)
  .hpf("[7000 7000 1500 7000]*2")
  .gain("[0.3 0.15 0.4 0.15]*2")
:::

**Checking the mix.** Listen for these, one at a time:

- **Can you sing the lead?** If the arpeggio covers it, lower the arpeggio's `gain` or narrow the lead's pulse (`pw(0.75)`) so it cuts through.
- **Does the harmony sound like chords, not notes?** If you can follow each arpeggio note, speed it up.
- **Is the bass even?** The triangle has no volume control on the console, so its level should be steady; balance everything else around it.
- **Is the noise a texture, not a hiss?** Hats should tick, not wash. Shorten `decay` if they blur.

**Where to go next.** A real game cue loops for minutes, so give it a second half: a variant melody for bars 5 to 8, or the same four bars a semitone higher with `transpose`. A fill on the last beat of bar 4 (a tom run with `penv(12)` on falling triangle notes) prepares the repeat. Later units cover how to lay such sections out as a song form.

:::bridge{title="A reduction in reverse"}
A pianist making a reduction of an orchestral score asks which notes can be dropped and still leave the music intact. Writing for four channels is the same question from the other side: you start from the essential notes and give each one to a voice. If the cue still sounds full with only four lines, the essential notes are in the right places.
:::
