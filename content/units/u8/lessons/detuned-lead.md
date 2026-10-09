---
id: det.detuned-lead.lesson
title: "An 80s detuned lead: few voices, broken chords, a little wobble"
skill: det.detuned-lead
---

Many analog synthesizers of the late 1970s and 1980s had two or three oscillators for every key, and players often tuned one of them a few cents away from the other. Run through a low-pass filter with an envelope, and often played as a repeating broken chord by a sequencer, that slightly beating sound is now shorthand for the 1980s. Kyle Dixon and Michael Stein's score for the TV series *Stranger Things* is a well-known recent example of the style. This lesson builds the timbre and the texture from the earlier lessons in this unit. The music is our own: never copy that theme's melody or arpeggio.

**A lead needs few voices.** A pad can have seven voices spread wide, because it holds still. A melody has to be heard as clear pitches, and many widely detuned voices blur each note's centre. For a lead, use two or three voices and a small spread: `unison(2)` with `detune(0.12)` puts two voices at −6 and +6 cents, 12 cents apart {cite src="packages/superdough/worklets.mjs#L38-L45"}. At A4 (440 Hz) they beat about 3 times per second, and at A3 about 1.5 times, so the beating follows the register: low notes pulse slowly, high notes shimmer faster.

:::compare{diff="unison 2, detune 0.12 → unison 7, detune 0.4"}
a:
  label: Two voices, 12 cents apart, a clear lead
  code: note("e4 a4 c5 b4 a4 e4 g4 a4").s("supersaw").unison(2).detune(0.12)
b:
  label: Seven voices, 40 cents apart, the melody smears
  code: note("e4 a4 c5 b4 a4 e4 g4 a4").s("supersaw").unison(7).detune(0.4)
:::

**Broken chords with `arp`.** A sequencer that repeats a chord's notes one at a time is called an **arpeggiator**. Strudel's `arp` does this to a stacked chord: you give it a pattern of positions in the chord, 0 for the first note written, 1 for the second, and so on, and it plays one note for each position {cite doc=arp}. The position pattern decides the rhythm, and positions past the top wrap around to the bottom {cite src="packages/core/pattern.mjs#L952-L970"}. On `[a3,c4,e4]`, positions `"0 2 1 2"` play A3 E4 C4 E4: lowest, highest, middle, highest.

:::play{label="arp: the positions 0 2 1 2, twice per bar, on A minor and F major"}
note("<[a3,c4,e4] [f3,a3,c4]>")
  .arp("0 2 1 2 0 2 1 2")
  .s("supersaw")
  .unison(2)
  .detune(0.12)
  .decay(0.2)
  .sustain(0.3)
:::

The chords change once per bar with `< >`, and `arp` takes its notes from whichever chord is sounding. The F major bar plays F3 C4 A3 C4.

**Putting it together.** The arpeggio gets a short, plucky filter envelope (the cutoff opens 3 octaves above 500 Hz, to 4000 Hz, and closes again within 0.15 seconds of each onset) and a dotted-eighth echo. Above it, a slower lead line uses three voices, a light vibrato of 5 Hz and ±15 cents on its held notes, and a perlin drift of at most ±8 cents, the "worn tape" touch from the drift lesson:

:::play{label="Original 80s-style cue in A minor: arpeggio plus detuned lead"}
setcpm(96 / 4)
stack(
  note("<[a3,c4,e4] [f3,a3,c4] [c4,e4,g4] [g3,b3,d4]>")
    .arp("0 2 1 2 0 2 1 2")
    .s("supersaw")
    .unison(2)
    .detune(0.12)
    .decay(0.2)
    .sustain(0.3)
    .lpf(500)
    .lpenv(3)
    .lpdecay(0.15)
    .delay(0.4)
    .delaysync(3 / 16),
  note("<[e5@3 d5] [c5@2 a4@2] [g4@3 a4] [b4@2 d5@2]>")
    .add(note(perlin.range(-0.08, 0.08)))
    .s("supersaw")
    .unison(3)
    .detune(0.15)
    .vib(5)
    .vibmod(0.15)
    .attack(0.05)
    .release(0.3)
    .lpf(2400)
    .gain(0.6),
)
:::

What makes it sound "80s analog", ingredient by ingredient:

- **Slight detune on few voices** (12 to 15 cents, 2 or 3 voices): a beating that is heard as movement inside the tone, not as wrong notes.
- **Filter envelope on the arpeggio**: each note starts bright and closes quickly, so the pattern ticks like a sequencer rather than sustaining like an organ.
- **A tempo-synced echo**: the dotted-eighth delay fills the gaps between the eighth notes.
- **A little instability on the lead**: drift between notes and vibrato inside them, both small. With `vibmod` above about 0.3 (±30 cents) or drift above about ±0.2 semitones (±20 cents), the lead starts to sound out of tune rather than alive.

:::bridge{title="An Alberti bass on a synthesizer"}
Positions 0 2 1 2 (lowest, highest, middle, highest) are the Alberti bass from a classical sonata's left hand. A repeating broken-chord figure under a slow melody is the texture of a Mozart slow movement as much as of a 1980s synth score; what changes is the instrument. The sequencer plays it perfectly evenly, so the expression has to come from the timbre: the filter's pluck, the echo and the slow beating of the detuned voices.
:::
