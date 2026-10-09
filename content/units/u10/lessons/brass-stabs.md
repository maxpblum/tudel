---
id: spop.brass-stabs.lesson
title: "Synth brass stabs"
skill: spop.brass-stabs
---

The polyphonic synthesizers of around 1980 (Prophet-5, Oberheim OB-X, Roland Jupiter-8) all had a "brass" sound, and synth-pop used it for short, punchy chord hits: **stabs**. Nobody mistakes it for a real horn section, but it borrows the one feature of brass that the ear notices most: the tone **brightens as each note speaks**.

That is something you know from the inside. When a trombone note starts, the lips take a moment to settle into a full buzz, and the upper partials arrive just after the fundamental. Play louder and the sound gets brighter as well as louder. A sawtooth through a low-pass filter imitates this with a **filter envelope whose attack is not instant**: the cutoff rises over a few hundredths of a second, so the partials bloom in, then it falls back.

**The patch, step by step.** Start from sawtooth chords {cite doc=voicing}. Then:

- `lpf(500)` is the closed, dark resting tone.
- `lpenv(3)` lets the envelope open the cutoff 3 octaves above that, to 4000 Hz (500 × 2 × 2 × 2) {cite doc=lpenv}.
- `lpattack(0.06)` takes 0.06 seconds (60 ms) to open, the brass "bloom" {cite doc=lpattack}.
- `lpdecay(0.25)` closes it again over the next 0.25 seconds {cite doc=lpdecay}.
- `attack(0.01)` softens the amplitude's start a little, so the onset doesn't click {cite doc=attack}.

:::envelope
attack: 0.06
decay: 0.25
sustain: 0
release: 0.1
hold: 0.25
:::

The plot shows the cutoff's movement for one eighth-note stab (0.25 seconds): 0 is 500 Hz and 1 is 4000 Hz.

:::play{label="Sawtooth brass: one held chord per bar, A minor, F, C, G"}
chord("<Am F C G>")
  .voicing()
  .s("sawtooth")
  .attack(0.01)
  .lpf(500)
  .lpenv(3)
  .lpattack(0.06)
  .lpdecay(0.25)
  .gain(0.5)
:::

**Filter attack versus amplitude attack.** Both make a note's start softer, and they are easy to confuse. An amplitude `attack` makes the *loudness* rise: the note fades in like a bowed string. A filter attack keeps the loudness and makes the *brightness* rise: the note is there at once but its tone opens, like a horn. Same chords, same 60 ms, one parameter moved:

:::compare{diff="attack(0.06) with a fixed lpf 1500 Hz → lpattack(0.06) with lpenv 3 on lpf 500 Hz"}
a:
  label: Amplitude attack, a soft swell
  code: chord("<Am F>").voicing().s("sawtooth").attack(0.06).lpf(1500).gain(0.5)
b:
  label: Filter attack, a brassy bloom
  code: |
    chord("<Am F>")
      .voicing()
      .s("sawtooth")
      .attack(0.01)
      .lpf(500)
      .lpenv(3)
      .lpattack(0.06)
      .lpdecay(0.25)
      .gain(0.5)
:::

**Stabs: short and syncopated.** A held brass chord is a pad. A stab is the same chord cut to an eighth note and placed off the beat. `struct` imposes a rhythm on the chord line: each x is a hit, each `~` a rest {cite doc=struct}. Put it **before** `voicing`, so each hit is voiced as a whole chord. Eight steps make eighth notes, and `"~ x ~ x ~ ~ x ~"` hits the "and" of 1, the "and" of 2 and the "and" of 4:

:::play{label="Off-beat brass stabs over a 909 groove"}
setcpm(120 / 4)
$: s("bd*4, ~ cp ~ cp").bank("RolandTR909")
$: chord("<Am F C G>")
  .struct("~ x ~ x ~ ~ x ~")
  .voicing()
  .s("sawtooth")
  .attack(0.01)
  .lpf(500)
  .lpenv(3)
  .lpattack(0.06)
  .lpdecay(0.25)
  .gain(0.5)
:::

Another favourite is the 3 + 3 + 2 grouping, `"x ~ ~ x ~ ~ x ~"`: three hits that cut across the four beats.

The `gain(0.5)` matters: five sawtooth voices at once are loud, and a stab should sit beside the drums, not over them. For a thicker, slightly chorused brass, swap `"sawtooth"` for `"supersaw"` with `unison(2)` and a small `detune`, as in the detune lessons.

:::bridge{title="Fortepiano brass, a section's sforzando"}
A brass section's *sfz* or *fp* hit is exactly this shape: a bright, cutting start that falls back at once. The filter envelope writes the bright start and the fall into every chord, and `struct` places the hits where an arranger would put horn punches: off the beat, between the singer's phrases.
:::
