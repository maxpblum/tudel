---
id: chip.pulse-channels.lesson
title: "Pulse waves and the four-channel band"
skill: chip.pulse-channels
---

The music of 1980s game consoles came from a few simple tone generators on the console's sound chip, each able to play **one note at a time**. Nintendo's NES (1983 in Japan, 1985 elsewhere) had four musical channels: two **pulse** channels, one **triangle** channel and one **noise** channel, plus a channel for short low-quality samples that this unit leaves out. Composers wrote for that band the way an arranger writes for a string quartet: a melody, a second voice, a bass, and percussion, and nothing else. "Chiptune" today means music that keeps those sounds, and usually that discipline, by choice. This lesson builds the two pulse voices and sets up the band.

**A pulse wave and its width.** A pulse wave jumps between two levels, like a square wave, but it doesn't have to spend equal time at each. The fraction of each period spent at the high level is the **duty cycle** (or pulse width). A square wave is a pulse with a 50 % duty cycle:

:::signal
shape: square
min: 0
max: 1
period: 1
cycles: 3
label: "50 % duty cycle (a square): high for half of each period. A 25 % pulse is high for a quarter, a 12.5 % pulse for an eighth."
:::

The width changes the timbre because it decides which harmonics are missing. A pulse with duty cycle 1/k has no energy at every k-th harmonic: the 50 % square has no 2nd, 4th, 6th… harmonics (only odd ones, the classic hollow sound), the 25 % pulse lacks the 4th, 8th, 12th…, and the 12.5 % pulse lacks only the 8th, 16th… ([Pulse wave](https://en.wikipedia.org/wiki/Pulse_wave)). The narrower the pulse, the more upper harmonics it keeps and the weaker its fundamental, so it sounds thinner and more nasal. The NES pulse channels offered exactly four widths: 12.5 %, 25 %, 50 % and 75 % (75 % sounds the same as 25 %, because it is the same wave upside down).

**`s("pulse")` and `pw`.** Strudel's `"pulse"` synth is a pulse oscillator whose width is set by `pw` {cite doc=pw} {cite src="packages/superdough/synth.mjs#L296-L346"}. The number is not the duty cycle itself. The oscillator subtracts two sawtooth waves that are shifted in phase by (1 − `pw`) × π {cite src="packages/superdough/worklets.mjs#L806-L806"} {cite src="packages/superdough/worklets.mjs#L828-L834"}, and the duty cycle comes out as (1 − `pw`) ÷ 2:

| `pw` | duty cycle | sound |
|---|---|---|
| 0 | 50 % | square: hollow, odd harmonics only |
| 0.5 (default) | 25 % | the classic NES lead: brighter, a little nasal |
| 0.75 | 12.5 % | thin and nasal, like a reed |

Unset, `pw` is 0.5 {cite src="packages/superdough/synth.mjs#L312-L312"}, so a plain `s("pulse")` already plays the 25 % pulse. `pw(0)` gives the same 50 % wave as `s("square")`. Here are the three widths, one per bar, on the same phrase:

:::play{label="pw 0, then 0.5, then 0.75: 50 %, 25 %, 12.5 % duty cycle"}
note("e4 g4 a4 b4 d5 b4 a4 g4").s("pulse").pw("<0 0.5 0.75>").gain(0.6)
:::

:::compare{diff="pw: 0 → 0.75"}
a:
  label: 50 % (square), hollow
  code: note("a4 c5 e5 c5").s("pulse").pw(0).gain(0.6)
b:
  label: 12.5 %, thin and nasal
  code: note("a4 c5 e5 c5").s("pulse").pw(0.75).gain(0.6)
:::

**Moving the width.** On the Commodore 64's sound chip (the SID, 1982) the width could change continuously, and a slowly moving width became that machine's signature: the tone seems to breathe and turn. Strudel's pulse has a built-in low-frequency oscillator for this: `pwrate` sets its speed in hertz and `pwsweep` its depth {cite doc=pwrate} {cite doc=pwsweep}. If you set only `pwrate`, the depth defaults to 0.3; if you set only `pwsweep`, the rate defaults to 1 Hz {cite src="packages/superdough/synth.mjs#L299-L310"}. The sweep moves the width around the `pw` you set, so it starts from the default 25 % unless you change it:

:::play{label="Pulse-width modulation: the width sweeps 0.5 times per second"}
note("<a3 f3 c4 g3>").s("pulse").pwrate(0.5).pwsweep(0.4).gain(0.6)
:::

Hold each bar and listen: the pitch doesn't move, but the tone slides between hollow and nasal, as if the vowel were changing.

**The four-channel band.** Strudel itself has no channel limit: a `$:` line can play chords, and you can have as many lines as you like. Chiptune keeps the limit as a style. The usual NES layout is:

- **Pulse 1, lead:** the melody, often at 25 % or 12.5 % so it cuts through.
- **Pulse 2, harmony:** a second line, a broken chord, or an echo of the lead, often at 50 % so it sits behind.
- **Triangle, bass:** the triangle has few upper harmonics, so it is round and soft. On the NES it had no volume control: it was either on or off, so its level never changes.
- **Noise, drums:** hi-hats and snares (the next lesson builds them).

In code, that is one `$:` line per channel, and each line plays one note at a time:

:::play{label="Four channels, one note each: original tune in A minor, 150 BPM"}
setcpm(150 / 4)
$: note("a4 c5 e5 d5 c5 b4 c5 ~").s("pulse").pw(0.5).gain(0.5)
$: note("<[e4 ~ e4 ~] [d4 ~ d4 ~]>*2").s("pulse").pw(0).gain(0.3)
$: note("<a3 f3 g3 e3>").ply(8).s("triangle").gain(0.9)
$: s("white*8").decay(0.03).sustain(0).hpf(7000).gain(0.25)
:::

The lead and harmony pulses differ in width as well as level, so they stay apart like two instruments of the same family. The triangle bass gets a higher `gain` than the pulses because the basic waveforms are turned down inside the synth and the triangle's energy is concentrated in its fundamental, which laptop speakers reproduce weakly in octave 3; set the balance by ear.

:::bridge{title="A quartet, not an orchestra"}
Writing for four monophonic channels is writing for a string or brass quartet: every voice is a single line, and every chord tone you want heard has to be given to someone. Like an SATB arranger, you choose which notes of the harmony to keep (root in the bass, third and the melody note above) and which to imply. The constraint is the style: the moment a line plays a three-note block chord, the result stops sounding like a game console and starts sounding like a synthesizer.
:::
