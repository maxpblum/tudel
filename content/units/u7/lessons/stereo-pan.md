---
id: bus.stereo-pan.lesson
title: Stereo placement with pan
skill: bus.stereo-pan
---

From the podium a conductor hears the orchestra spread out from left to right: in the most common modern seating, the first violins on the left and the cellos and basses on the right. Two speakers can spread a mix the same way. The position of a sound between the two speakers is its **pan** position. `pan` sets it for each note, from 0 (left) through 0.5 (centre) to 1 (right) {cite doc=pan}.

Here is a small ensemble seated across the stereo field. The melody sits left of centre, the arpeggio right of centre, and the bass in the middle:

:::play{label="Melody at pan 0.25, arpeggio at 0.75, bass in the centre"}
$: n("0 2 4 5 4 2 1 0").scale("C5:major").s("triangle").pan(0.25)
$: n("[0 4 2 4]*2").scale("C4:major").s("square").lpf(1500).gain(0.3).pan(0.75)
$: n("<0 3 4 0>").scale("C3:major").s("sawtooth").lpf(600).gain(0.5)
:::

Keeping the bass and the kick drum in the centre is a convention of pop mixing, not a Strudel rule: the foundation of the mix then sounds equally from both speakers. The orchestral seating above, with the basses on the right, is the other tradition, and both are fine choices.

Under the hood, `pan` adds a Web Audio StereoPannerNode to the note's chain and maps 0 to 1 onto its −1 to +1 range {cite src="packages/superdough/superdough.mjs#L842-L848"}. That node pans by **equal power**: for a mono source, such as the `"triangle"` synth, pan 0 puts the whole sound in the left speaker, and pan 0.5 sends it to both speakers about 3 dB down, so that its total power stays the same anywhere across the field ([Web Audio: StereoPannerNode algorithm](https://www.w3.org/TR/webaudio/#stereopanner-algorithm)). A note without `pan` gets no panner at all, and Web Audio copies a mono signal at full level into both channels ([Web Audio: up-mixing](https://www.w3.org/TR/webaudio/#UpMix-sub)). So, on a mono synth, writing `pan(0.5)` is about 3 dB quieter than writing no `pan`. It sounds from the same place.

The panner sits after the filters and before `postgain` and the sends {cite src="packages/superdough/superdough.mjs#L842-L848"} {cite src="packages/superdough/superdough.mjs#L924-L955"}. The copy a part sends to the delay is already panned, so a part's echoes come from the side the part is on.

Like every control, `pan` can be a pattern, so the position can change note by note or bar by bar. Here a phrase answers itself from the other side, a bar on the left, then a bar on the right:

:::play{label="Call on the left, answer on the right, pan 0.1 then 0.9 by bar"}
$: n("<[0 2 4 2] [4 3 2 1]>").scale("D4:dorian").s("triangle").pan("<0.1 0.9>")
:::

`pan` can also follow a signal. The signal moves smoothly, but each note reads it once, at its onset {cite src="packages/core/signal.mjs#L18-L21"}, and keeps that position: a held note doesn't move. On the same eight-note figure, a pattern makes the notes jump from speaker to speaker, and `sine`, one cycle per bar, makes them travel:

:::compare{diff="pan stepped [0 1]*4 → pan(sine)"}
a:
  label: Stepped, left and right in turn on every eighth
  code: note("[c5 e5 g5 e5]*2").s("triangle").decay(0.15).sustain(0).pan("[0 1]*4")
b:
  label: Swept, centre to right to left and back over the bar
  code: note("[c5 e5 g5 e5]*2").s("triangle").decay(0.15).sustain(0).pan(sine)
:::

With `sine`, the notes are placed at 0.5, 0.85, 1, 0.85, 0.5, 0.15, 0 and 0.15: centre on the downbeat, right on beat 2, centre on beat 3, left on beat 4. Slow it down to take the sound on a four-bar journey. With sixteenth notes there are enough positions to hear a smooth path:

:::signal
shape: sine
min: 0
max: 1
period: 4
cycles: 4
label: pan(sine.slow(4)), centre, right after bar 1, centre after bar 2, left after bar 3
:::

:::play{label="Four-bar pan sweep on sixteenths: pan(sine.slow(4))"}
note("[c5 e5 g5 e5]*4").s("triangle").decay(0.1).sustain(0).pan(sine.slow(4))
:::

For a quick stereo effect, `jux` plays a pattern twice at once: unchanged and panned hard left, and changed by a function and panned hard right {cite doc=jux} {cite src="packages/core/pattern.mjs#L2356-L2381"}. `n("0 2 4 7").scale("C4:major").s("triangle").jux(rev)` plays the line on the left and its retrograde on the right at the same time: a crab canon, like the *canon cancrizans* in Bach's *Musical Offering*.

:::bridge{title="Cori spezzati"}
At St Mark's in Venice, Giovanni Gabrieli wrote for choirs and brass groups placed apart in the church, answering one another from different sides. `pan("<0.1 0.9>")` is that call and response between two choirs, a bar each. Fixed `pan` values are the seating plan of an orchestra. A sweep is a player walking across the stage while playing.
:::
