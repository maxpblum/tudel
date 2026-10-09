---
id: spop.pads.lesson
title: "Choir pads, string beds and arpeggiated beds"
skill: spop.pads
---

Under the drums, bass and hook, a synth-pop song needs a **bed**: something that holds the harmony. Early-80s records used three kinds. A choir: Mellotron tape choirs and, later, sampled voices (Orchestral Manoeuvres in the Dark's *Architecture & Morality*, 1981, is full of them). A **string machine**, an organ-like keyboard that imitated a string section with many slightly detuned voices. And a **moving bed**: a sequencer arpeggiating the chords. All three can come from one chord line. Only the sound around it changes.

Throughout this lesson the chord line is the same: `chord("<Am F C G>").voicing()`, the A minor, F, C, G loop, voiced with the default settings {cite doc=voicing}.

**1. A choir pad from vowels.** A sung vowel is a set of resonances of the vocal tract, the **formants**, that boost certain frequency bands whatever note is sung. `vowel` puts five band-pass filters at a vowel's formants {cite doc=vowel} {cite src="packages/superdough/superdough.mjs#L768-L771"}. For "a" they sit at 660, 1120, 2750, 3000 and 3350 Hz {cite src="packages/superdough/vowel.mjs#L4-L9"}. A filter can only shape partials that exist, so start from the richest source, a sawtooth. Then slow the amplitude's start and end: `attack(0.3)` fades each chord in over 0.3 seconds, and `release(0.8)` lets it fade over 0.8 seconds after it ends {cite doc=attack} {cite doc=release}.

:::play{label="Choir pad: sawtooth chords through the vowel a"}
chord("<Am F C G>")
  .voicing()
  .s("sawtooth")
  .attack(0.3)
  .release(0.8)
  .vowel("a")
  .gain(0.5)
:::

The vowel changes the colour as it would in a choir. "o" and "u" put the formants lower (430 and 820 Hz for "o", 370 and 630 Hz for "u"), so they are darker and rounder. "i" has its second formant high, at 1850 Hz, so it is thinner and brighter {cite src="packages/superdough/vowel.mjs#L5-L9"}:

:::play{label="Vowels a, o, u, i, one per bar"}
chord("<Am F C G>")
  .voicing()
  .s("sawtooth")
  .attack(0.3)
  .release(0.8)
  .vowel("<a o u i>")
  .gain(0.5)
:::

**2. A string bed from detuned voices.** A string section sounds wide because no two players are exactly in tune and no two start exactly together. The string machines copied the first with many detuned oscillators and a chorus effect. In Strudel, that is the supersaw from the detune unit: `unison(5)` voices spread over `detune(0.2)` semitones (20 cents from the lowest to the highest voice) {cite src="packages/superdough/synth.mjs#L153-L200"}. A slower `attack(0.5)` imitates the bowed entry, and `lpf(2500)` takes off the fizz above the strings' range:

:::play{label="String bed: detuned supersaw, slow attack"}
chord("<Am F C G>")
  .voicing()
  .s("supersaw")
  .unison(5)
  .detune(0.2)
  .attack(0.5)
  .release(1)
  .lpf(2500)
  .gain(0.6)
:::

**3. A moving bed with `arp`.** `arp` plays the notes of a stacked chord one at a time, in the order you give: 0 is the lowest voice of the voicing, 1 the next, and so on {cite doc=arp}. Three of the voicings here have five notes (A minor is A3 C4 E4 A4 C5), so `"0 1 2 3 4 3 2 1"` runs up through all five and back down, as eighth notes. The G voicing has only four (G3 D4 G4 B4), and a position past the top wraps around to the bottom {cite src="packages/core/pattern.mjs#L952-L970"}, so in that bar position 4 plays G3 again: the run touches the bass before it comes back down. A short pluck and a dotted-eighth echo turn it into the sequenced bed of countless 80s records:

:::play{label="Arpeggiated bed: up and down the voicing in eighths"}
setcpm(120 / 4)
chord("<Am F C G>")
  .voicing()
  .arp("0 1 2 3 4 3 2 1")
  .s("square")
  .decay(0.15)
  .sustain(0)
  .lpf(2000)
  .delay(0.3)
  .delaysync(3 / 16)
  .gain(0.5)
:::

**Held or moving?** A held bed (choir, strings) fills the space and lets the rhythm come from elsewhere; it suits a song whose drums and bass are busy. A moving bed adds rhythm itself, so it works best over a simpler beat, or with the held bed under it, quieter. Because both come from the same chord line, they always agree on the harmony.

:::bridge{title="Choir vowels and string divisi"}
A choral conductor changes a choir's colour with the vowel: "oo" for a dark, blended pianissimo, "ah" for an open forte. `vowel` is that instruction for a synthesizer. The string bed is the orchestrator's other bed: divisi strings holding a chord, warm because every desk is a little out of tune with the next. The arpeggiated bed is the harp or the piano's broken chords under a melody.
:::
