---
id: swave.pump.lesson
title: "Pumping: gain that breathes with the beat"
skill: swave.pump
---

Listen to almost any synthwave track and the pad does not simply sustain. On every beat it dips, then swells back up before the next beat, so the whole bed seems to breathe in time with the kick drum. Producers call this **pumping**. In the studio it usually comes from a compressor on the pad that is triggered by the kick, a technique called sidechain compression, which the next lesson builds properly. This lesson draws the shape directly instead: a gain that is low at the start of every beat and rises until the next one.

:::bridge{title="fp, crescendo, on every beat"}
Imagine a held string chord marked *fp* with a crescendo hairpin on each beat: an accent that drops at once to piano, then a swell to the next beat, where it drops again. That is the pumping shape, except that in synthwave the "drop" is the kick drum's moment, and the pad gets out of its way. An organist gets the same effect by closing the swell box on each beat and opening it again.
:::

The shape over one beat is a ramp: low, then rising steadily. Strudel's `saw` signal is exactly that, rising from 0 to 1 once per cycle {cite doc=saw}. `saw.fast(4)` rises four times per cycle, once per beat in this course's 4/4 bar, and `range(0.2, 0.8)` maps it from gain 0.2 up to gain 0.8 {cite doc=range}.

:::signal
shape: saw
min: 0.2
max: 0.8
period: 0.25
cycles: 1
label: saw.range(0.2, 0.8).fast(4), one rise per beat over one bar
:::

## Way 1: a gain signal on re-triggered notes

The obvious attempt is to put that signal into `gain` on the pad. It does nothing useful, and the reason is worth understanding. A note reads a signal **once, at its onset**, and keeps that value for its whole length (the "signals need notes to carry them" idiom). A pad chord that lasts a whole bar reads the saw once, at the start of the bar, where the saw is at its lowest. The chord plays at gain 0.2 for the whole bar, with no swell.

So the held chord has to be cut into shorter notes, each of which reads the saw at its own start. `segment(n)` does that: it re-samples a pattern n times per cycle, so a bar-long chord becomes n chords of equal length {cite doc=segment}. But how many? Compare four and sixteen:

:::compare{diff="segment(4) → segment(16)"}
a:
  label: "segment(4): every onset lands where the saw restarts at 0, so every chord gets gain 0.2"
  code: |
    setcpm(100 / 4)
    chord("<Am9 F^7 Cadd9 G6>")
      .voicing()
      .segment(4)
      .gain(saw.range(0.2, 0.8).fast(4))
      .s("supersaw")
      .unison(7)
      .detune(0.25)
      .lpf(2000)
b:
  label: "segment(16): four steps per beat, 0.2, 0.35, 0.5, 0.65, then back to 0.2"
  code: |
    setcpm(100 / 4)
    chord("<Am9 F^7 Cadd9 G6>")
      .voicing()
      .segment(16)
      .gain(saw.range(0.2, 0.8).fast(4))
      .s("supersaw")
      .unison(7)
      .detune(0.25)
      .lpf(2000)
:::

With `segment(4)` the four chords per bar start on the beats, exactly where the saw restarts, so all four read 0.2: you hear four quiet repeated chords and no pump at all. With `segment(16)` each beat has four sixteenth-note chords that read 0.2, 0.35, 0.5 and 0.65 on their way up the saw. That is a terraced swell, four steps per beat, and at 100 BPM (0.15 seconds per sixteenth) it is heard as a pulse that breathes.

This way has a cost. Every sixteenth is a new note, so every sixteenth restarts the amplitude envelope. A slow pad attack of 0.6 seconds would never finish: each chord would be cut off after 0.15 seconds while still swelling. Re-triggered pumping needs a short attack, and it turns a smooth pad into a sixteenth-note chord pulse. That pulse is a sound of its own (it is close to the "trance gate" of 1990s and 2000s dance music), but it is not a held pad that breathes.

## Way 2: tremolo locked to the bar, `tremolosync`

**Tremolo** is a repeated rise and fall in loudness. In Strudel it is applied *inside* each note, by a slow oscillator (an LFO) that multiplies the note's level continuously, not once per onset {cite src="packages/superdough/superdough.mjs#L796-L823"}. `tremolosync(k)` sets its speed in periods per cycle: `tremolosync(4)` is four swells per bar, one per beat {cite doc=tremolosync}. The oscillator's phase is computed from the position in the cycle, so its swells line up with the beats, whenever the note started.

Its default shape is the one we want. With no `tremoloshape` set, each period is a ramp from 0 up to 1 {cite src="packages/superdough/worklets.mjs#L72-L80"} {cite src="packages/superdough/superdough.mjs#L809-L809"}, slightly curved so it rises slowly at first and faster near the top. `tremolodepth` sets how far it dips {cite doc=tremolodepth}: the level never falls below 1 − depth {cite src="packages/superdough/superdough.mjs#L804-L804"}. At the default depth of 1 the pad goes silent on every beat; `tremolodepth(0.7)` keeps a floor at 0.3 of full level.

:::compare{diff="segment(16) with gain(saw) → held chord with tremolosync(4)"}
a:
  label: "Stepped: sixteen re-triggered chords per bar"
  code: |
    setcpm(100 / 4)
    chord("<Am9 F^7 Cadd9 G6>")
      .voicing()
      .segment(16)
      .gain(saw.range(0.2, 0.8).fast(4))
      .s("supersaw")
      .unison(7)
      .detune(0.25)
      .lpf(2000)
b:
  label: "Smooth: one held chord per bar, swelling four times"
  code: |
    setcpm(100 / 4)
    chord("<Am9 F^7 Cadd9 G6>")
      .voicing()
      .s("supersaw")
      .unison(7)
      .detune(0.25)
      .attack(0.3)
      .release(1)
      .lpf(2000)
      .tremolosync(4)
      .tremolodepth(0.7)
      .gain(0.6)
:::

In the second version the chord is held, keeps its slow attack and its release, and the swell inside it is continuous. That is the classic synthwave pad pump.

:::play{label="Pumping pad with bass and drums, 100 BPM"}
setcpm(100 / 4)
$: chord("<Am9 F^7 Cadd9 G6>")
  .voicing()
  .s("supersaw")
  .unison(7)
  .detune(0.25)
  .spread(0.8)
  .attack(0.3)
  .release(1)
  .lpf(2000)
  .tremolosync(4)
  .tremolodepth(0.7)
  .orbit(2)
  .room(0.4)
  .roomsize(6)
  .gain(0.5)
$: note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(400).lpenv(3).lpdecay(0.1)
$: s("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR909")
:::

The pad's lowest point falls exactly on each kick, so the kick sounds louder without being turned up: the pad makes room for it.

## Which to use

| | `gain(saw…)` with `segment(16)` | `tremolosync(4)` |
|---|---|---|
| Changes the level | once per sixteenth, in steps | continuously, inside the note |
| Envelope | restarts every sixteenth: short attack only | one envelope per chord: slow attack and release work |
| Sound | a pulsing sixteenth-note chord | a held chord that breathes |
| Follows the kick? | no, it repeats on every beat regardless | no, it repeats on every beat regardless |

Both are drawn in advance: they pump on every beat whether or not a kick is there. When the kick pattern changes (a missing kick at the end of a phrase, a fill), the pump does not notice. The next lesson makes the kick itself push the pad down.
