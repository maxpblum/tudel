---
id: swave.pads.lesson
title: "Lush detuned pad beds"
skill: swave.pads
---

Above the driving bass, synthwave lays a **pad**: sustained chords that fill the middle of the texture like a wall of warm light. Three things make a synthwave pad, and this lesson adds them one at a time: richer chords, many slightly detuned voices, and a slow envelope and filter. A fourth, its own large reverb, keeps it behind the drums.

**1. Chords with sevenths and ninths.** Plain triads sound bare when they are held for a whole bar. Synthwave keeps the same roots but adds the colour tones from the earlier extended-chords lesson: a minor ninth chord on i, major sevenths on the major chords, add9 and sixth chords. In A minor, the loop Am F C G becomes Am9 F^7 Cadd9 G6 (remember: the major seventh is written `^7`, never `maj7`).

:::compare{diff="Am F C G → Am9 F^7 Cadd9 G6"}
a:
  label: Triads
  code: chord("<Am F C G>").voicing().s("sawtooth").lpf(1500)
b:
  label: Seventh, ninth, add9 and sixth chords
  code: chord("<Am9 F^7 Cadd9 G6>").voicing().s("sawtooth").lpf(1500)
:::

With the default anchor (C5) these voicings are close and smooth. The top voice moves B4, C5, C5, B4, and the lowest notes are A3, F3, E3, G3 {cite src="packages/tonal/tonleiter.mjs#L139-L179"}. The extended chords keep two or three common tones from bar to bar (E4 and C5 stay through the first three chords), which is what makes the progression sound like one continuous colour rather than four blocks.

**2. Many voices, moderately detuned.** A pad wants the opposite of a lead. A lead needs a clear pitch centre, so it uses two or three voices with little detune. A pad holds still and can be blurred: seven voices with a spread of about a quarter of a semitone. From the detune lessons: `unison` sets the number of voices {cite doc=unison}, `detune` the total spread from the lowest to the highest voice in semitones {cite doc=detune}, and `spread` how far left and right they are panned, 0 to 1 {cite doc=spread} {cite src="packages/superdough/synth.mjs#L153-L178"}. `unison(7).detune(0.25).spread(0.8)` puts seven voices 25 cents apart from lowest to highest (about 4 cents between neighbours), panned wide.

:::bridge{title="Divisi strings, a big choir"}
Twelve first violins playing one line never agree perfectly on pitch, and that slight disagreement is the warmth of a string section compared with a solo violin. A large choir blends the same way: no two sopranos are exactly in tune, so the section sounds like one wide, soft voice. A supersaw pad is a section, not a soloist. Seven voices within a quarter of a semitone are a section that blends; with a whole semitone of spread they would sound like a section that is out of tune.
:::

**3. A slow envelope and a breathing filter.** A pad should swell in and fade out, like strings entering *niente* rather than with an accent. With only `attack` and `release` set, the decay is skipped in effect, because sustain stays at full level {cite src="packages/superdough/helpers.mjs#L167-L178"}. So `attack(0.6).release(1.5)` gives a 0.6-second swell, a hold at full level while the chord lasts, and a 1.5-second fade after it ends. At 100 BPM a bar lasts 2.4 seconds, so the release of each chord overlaps the next chord's swell: the changes cross-fade instead of cutting.

:::envelope
attack: 0.6
decay: 0.01
sustain: 1
release: 1.5
hold: 2.4
:::

On top of that, let the cutoff move slowly over a phrase, so the pad brightens and darkens with the music's breathing. `lpf(sine.range(800, 2400).slow(8))` moves between 800 and 2400 Hz over eight bars. Because each chord samples the signal at its start, the cutoff changes once per bar, in eight small steps per sweep: a chord-by-chord brightening rather than a continuous sweep, which on a slow pad sounds natural.

:::signal
shape: sine
min: 800
max: 2400
period: 8
cycles: 8
label: sine.range(800, 2400).slow(8), the pad's cutoff over eight bars
:::

**4. Its own space.** Synthwave pads sit in a long reverb, five seconds or more, that the drums would drown in. From the buses lessons: reverb settings belong to the orbit, so a part with a different `roomsize` belongs on its own orbit {cite doc=orbit} {cite doc=roomsize} {cite src="packages/superdough/superdoughoutput.mjs#L69-L93"}. Put the pad on orbit 2 with a 6-second room and leave the drums dry on orbit 1.

:::play{label="Lush pad: Am9 F^7 Cadd9 G6 on a seven-voice supersaw, own 6-second hall"}
setcpm(100 / 4)
$: chord("<Am9 F^7 Cadd9 G6>")
  .voicing()
  .s("supersaw")
  .unison(7)
  .detune(0.25)
  .spread(0.8)
  .attack(0.6)
  .release(1.5)
  .lpf(sine.range(800, 2400).slow(8))
  .orbit(2)
  .room(0.5)
  .roomsize(6)
  .gain(0.5)
$: note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(400).lpenv(3).lpdecay(0.1)
$: s("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR909")
:::

The pad's `gain` is lower than the others because five chord tones of seven voices each add up; balance it by ear so the bass's eighths and the snare still come through.

What to remember:

- **Colour tones over the same roots.** The bass keeps the triad roots; the pad adds the sevenths and ninths.
- **Seven voices, a quarter of a semitone, wide spread.** Enough to blur into a section, not enough to sound sour.
- **Slow in, slow out, slow filter.** Attack about half a second, release longer than the attack, cutoff moving over eight bars or more.
- **Own orbit, own hall.** Long reverb for the pad only.
