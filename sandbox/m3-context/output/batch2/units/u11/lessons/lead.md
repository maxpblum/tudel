---
id: swave.lead.lesson
title: "A soaring lead: synced echoes and a big room"
skill: swave.lead
---

The synthwave lead is the voice of the track: a bright synth line, high above the pad, made of long notes that seem to hang in the air. Compared with the busy arpeggios of the 80s-style cue in the detune lessons, it plays few notes. Its sense of size comes from what happens between them: dotted-eighth echoes and a long hall fill every gap. This lesson builds the line, the sound, the echoes and the space, and ends with an octave doubling for the climax.

:::bridge{title="Phrasing for a resonant building"}
Brass music written for San Marco in Venice, or plainchant sung in a stone cathedral, moves slowly and leaves space, because the building keeps sounding after every note. A trombonist playing in such a room breathes between phrases and lets the hall answer. The synthwave lead is written the same way: long notes, two-bar phrases, and rests where the echo and the reverb finish the line.
:::

## The line: long notes and rests

Use the `@` weights from the rhythm lessons to write long notes, one bar per step inside `< >`. Here is an original four-bar phrase in A minor over the pad's Am9 F^7 Cadd9 G6, with the last half bar left empty:

:::play{label="The bare line: long notes, a breath at the end"}
setcpm(100 / 4)
note("<[e5@3 g5] [a5@2 g5 e5] [g5@2 d5 c5] [d5@2 ~@2]>").s("sawtooth").lpf(2800)
:::

:::abc
X:1
M:4/4
L:1/4
K:Am
e3 g | a2 g e | g2 d c | d2 z2 |
:::

The notes are chord tones or colour tones of the chords below: E5 and G5 over Am9 (fifth and seventh), A5 over F^7 (the third), G5 and D5 over Cadd9 (fifth and ninth), D5 over G6. Leaning on sevenths and ninths is a large part of the genre's bittersweet sound.

## The sound

Start from the earlier detuned-lead lesson, but simpler: a lead that has to sing above a seven-voice pad needs a clear pitch. Use a sawtooth, or a supersaw with only two voices close together (`unison(2).detune(0.1)`, 10 cents apart). Then:

- a gentle **attack** of about 0.05 seconds, so notes start like a breath rather than a pluck, and a **release** of about 0.5 seconds, so they don't stop dead;
- a **low-pass** around 2500 to 3000 Hz, which keeps the sawtooth bright but not harsh;
- a light **vibrato**: `vib` sets the speed in Hz and `vibmod` the depth in semitones {cite doc=vib} {cite doc=vibmod}. `vib(5).vibmod(0.1)` is 5 wobbles per second, ±10 cents.

## The echoes: `delaysync` and `delayfeedback`

From the delay lesson: `delay` is how much of the lead is sent to the echo, `delaysync` the time between echoes **in cycles**, and `delayfeedback` how much of each echo feeds the next {cite doc=delay} {cite doc=delaysync} {cite doc=delayfeedback}. Synthwave's standard echo is the dotted eighth, `delaysync(3 / 16)`: 0.45 seconds at 100 BPM. Against a line that moves in quarters and halves, the echoes fall *between* the beats and turn every held note into a little rhythmic tail. A `delayfeedback` of 0.45 makes each echo about 7 dB quieter than the one before, so a held note leaves four or five audible repeats.

:::compare{diff="no delay → delay 0.4, delaysync 3 / 16, delayfeedback 0.45"}
a:
  label: Dry lead
  code: |
    setcpm(100 / 4)
    note("<[e5@3 g5] [a5@2 g5 e5] [g5@2 d5 c5] [d5@2 ~@2]>")
      .s("sawtooth")
      .attack(0.05)
      .release(0.5)
      .lpf(2800)
b:
  label: Dotted-eighth echoes filling the gaps
  code: |
    setcpm(100 / 4)
    note("<[e5@3 g5] [a5@2 g5 e5] [g5@2 d5 c5] [d5@2 ~@2]>")
      .s("sawtooth")
      .attack(0.05)
      .release(0.5)
      .lpf(2800)
      .delay(0.4)
      .delaysync(3 / 16)
      .delayfeedback(0.45)
:::

Listen to the rest at the end of bar 4: in the second version it is not silent. The D5's echoes carry the line into the repeat.

## The space: a hall of its own

Add `room` for the hall, and give the lead its own orbit, so its echo time and reverb size are its own {cite doc=room} {cite doc=orbit}. If the lead shared an orbit with the pad, the two would share one delay line and one reverb, and whichever part played last would reset the settings for both (see the buses lessons). On orbit 3, the lead's 5-second hall and dotted-eighth echo leave the pad's 6-second hall on orbit 2 untouched, and the kick's ducking of orbit 2 leaves the lead steady.

:::play{label="Full lead: two-voice supersaw, vibrato, synced echoes, own hall"}
setcpm(100 / 4)
note("<[e5@3 g5] [a5@2 g5 e5] [g5@2 d5 c5] [d5@2 ~@2]>")
  .s("supersaw")
  .unison(2)
  .detune(0.1)
  .vib(5)
  .vibmod(0.1)
  .attack(0.05)
  .release(0.5)
  .lpf(2800)
  .orbit(3)
  .delay(0.4)
  .delaysync(3 / 16)
  .delayfeedback(0.45)
  .room(0.4)
  .roomsize(5)
  .gain(0.5)
:::

## A scoop into the note

Singers and trombonists often approach an important note from slightly below. The pitch envelope from the chiptune lessons can do it: `penv(-1).pdecay(0.08)` starts each note one semitone low and slides up to the written pitch in 0.08 seconds {cite src="packages/superdough/helpers.mjs#L326-L344"} {cite src="packages/superdough/helpers.mjs#L40-L66"}. Use it on the whole line for a vocal, slightly lazy feel, or keep it subtle (`penv(-0.5)`, a quarter-tone scoop). More than about 2 semitones sounds like a deliberate slide, not an expressive scoop.

## The climax: double the line an octave down

Near the end of a synthwave track the lead is often doubled to sound bigger. Doubling an octave below thickens it the way a horn doubled by a trombone does, without making it shrill. From the transforms lessons: `superimpose` plays a changed copy at the same time as the original {cite doc=superimpose}, and `add(note(-12))` moves the copy down twelve semitones. The lowest note of the line, C5, lands on C4, well clear of the bass.

:::compare{diff="single lead → superimpose((x) => x.add(note(-12)))"}
a:
  label: Lead alone
  code: |
    setcpm(100 / 4)
    note("<[e5@3 g5] [a5@2 g5 e5] [g5@2 d5 c5] [d5@2 ~@2]>")
      .s("sawtooth")
      .attack(0.05)
      .release(0.5)
      .lpf(2800)
      .delay(0.4)
      .delaysync(3 / 16)
b:
  label: Doubled an octave below, for the climax
  code: |
    setcpm(100 / 4)
    note("<[e5@3 g5] [a5@2 g5 e5] [g5@2 d5 c5] [d5@2 ~@2]>")
      .superimpose((x) => x.add(note(-12)))
      .s("sawtooth")
      .attack(0.05)
      .release(0.5)
      .lpf(2800)
      .delay(0.4)
      .delaysync(3 / 16)
:::

What to remember:

- **Few, long notes; leave rests.** The echoes and the hall finish the phrase.
- **A clear pitch.** Sawtooth or two close supersaw voices, light vibrato.
- **Dotted-eighth echo**, `delaysync(3 / 16)`, with feedback around 0.4 to 0.5.
- **Own orbit, own hall**, so the pad's space and the kick's ducking leave the lead alone.
- **Save the octave doubling** for the part of the track that should feel biggest.
