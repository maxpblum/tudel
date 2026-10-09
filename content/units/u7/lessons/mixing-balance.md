---
id: bus.mixing-balance.lesson
title: Balance and dynamics with gain
skill: bus.mixing-balance
---

**Balance** is what a conductor adjusts when the brass covers the strings: how loud each part is compared with the others, so that the line that matters most comes through. In Strudel each part sets its own level with `gain`. Its default is 0.8 {cite src="packages/superdough/superdough.mjs#L180-L182"}. Despite its reference entry ("exponential") {cite doc=gain}, `gain` is a plain multiplier on the amplitude {cite src="packages/superdough/superdough.mjs#L65-L69"} {cite src="packages/superdough/superdough.mjs#L606-L611"}: a gain node at the start of each note's chain {cite src="packages/superdough/superdough.mjs#L651-L654"}.

Ears and mixing desks work in **decibels** (dB), not in multipliers. A gain g changes the level by 20 × log10(g) dB. Every halving is 6 dB down, and every tenth is 20 dB down:

| `gain` | Level compared with gain 1 |
|---|---|
| 1 | 0 dB |
| 0.8 (the default) | −1.9 dB |
| 0.5 | −6 dB |
| 0.4 | −8 dB |
| 0.25 | −12 dB |
| 0.2 | −14 dB |
| 0.1 | −20 dB |
| 0 | silence |

The difference between two parts is 20 × log10 of the ratio of their gains: a melody at 0.8 over chords at 0.2 (a ratio of 4) is 12 dB louder. As a rough guide from psychoacoustics, a sound about 10 dB quieter seems about half as loud ([Sone](https://en.wikipedia.org/wiki/Sone)).

Parts add up. Every part's sound arrives at a shared summing node (an **orbit**, the subject of a later lesson), and every orbit feeds one shared output {cite src="packages/superdough/superdoughoutput.mjs#L127-L129"} {cite src="packages/superdough/superdoughoutput.mjs#L161-L174"} {cite src="packages/superdough/superdoughoutput.mjs#L221-L227"}. Nothing on that path limits the level. A chord of five voices, each at the default 0.8, is louder than a single melody note at 0.8, and if the total goes past full scale, the output distorts. So turning parts *down* is most of mixing.

This course balances in a fixed order (a convention, not a Strudel rule). Set the most important part first, usually the melody, near the default. Then place every other part a stated number of dB below it: the bass about 6 dB below, a chord pad about 12 dB below. Compare the same three parts at the default gain and balanced that way:

:::compare{diff="gain: all 0.8 → melody 0.8, chords 0.2, bass 0.4"}
a:
  label: Everything at the default, the chords cover the melody
  code: |
    $: n("4 5 4 2 1 2 4 ~").scale("C5:major").s("triangle")
    $: chord("<C F G C>").voicing().s("sawtooth").lpf(1200)
    $: n("<0 3 4 0>").scale("C3:major").s("sawtooth").lpf(500)
b:
  label: Melody on top, bass 6 dB under it, chords 12 dB under it
  code: |
    $: n("4 5 4 2 1 2 4 ~").scale("C5:major").s("triangle").gain(0.8)
    $: chord("<C F G C>").voicing().s("sawtooth").lpf(1200).gain(0.2)
    $: n("<0 3 4 0>").scale("C3:major").s("sawtooth").lpf(500).gain(0.4)
:::

**Dynamics** are balance changing over time, and the two kinds you know from the score are two Strudel idioms. **Terraced dynamics**, the Baroque steps from piano to forte, are a value per bar inside `< >`. A **hairpin**, a smooth crescendo, is a signal. Here are both over four bars, from gain 0.1 to 0.8, an 18 dB rise:

:::compare{diff="gain stepped <0.1 0.2 0.4 0.8> → gain(saw.rangex(0.1, 0.8).slow(4))"}
a:
  label: Terraced, 6 dB louder at each barline
  code: |
    note("[c4 e4 g4 c5]*2")
      .s("triangle")
      .decay(0.2)
      .sustain(0)
      .gain("<0.1 0.2 0.4 0.8>")
b:
  label: Hairpin, an even crescendo through the four bars
  code: |
    note("[c4 e4 g4 c5]*2")
      .s("triangle")
      .decay(0.2)
      .sustain(0)
      .gain(saw.rangex(0.1, 0.8).slow(4))
:::

`saw` rises from 0 to 1 and drops back at the end of its period {cite src="packages/core/signal.mjs#L35-L35"}, so with `slow(4)` the crescendo lasts four bars and then starts again from quiet. Why `rangex` and not `range`? `range` is straight in amplitude {cite src="packages/core/pattern.mjs#L1771-L1773"}, and a straight line in amplitude is not a straight line in decibels:

:::signal
shape: saw
min: 0.1
max: 0.8
period: 4
cycles: 4
label: saw.range(0.1, 0.8).slow(4), straight in amplitude
:::

Halfway through, after bar 2, `range` has reached 0.45, which is already 13 dB above the start, and the last two bars add only 5 dB. The crescendo arrives too early. `rangex` follows an exponential curve {cite src="packages/core/pattern.mjs#L1786-L1788"}, which is a straight line in dB: each bar adds the same 4.5 dB. Here are the levels at each barline, in dB above the starting gain of 0.1:

| Barline | `range`: gain, dB | `rangex`: gain, dB |
|---|---|---|
| start of bar 1 | 0.1, 0 dB | 0.1, 0 dB |
| start of bar 2 | 0.28, +9 dB | 0.17, +4.5 dB |
| start of bar 3 | 0.45, +13 dB | 0.28, +9 dB |
| start of bar 4 | 0.63, +16 dB | 0.48, +13.5 dB |
| end of bar 4 | 0.8, +18 dB | 0.8, +18 dB |

As always with signals, each note reads the value once, at its onset {cite src="packages/core/signal.mjs#L18-L21"}. So the crescendo moves in steps, one per eighth note here. A single held note can't swell this way: shape it with its `attack` instead.

`postgain` looks like a second `gain`. It is a gain node at the very end of the note's chain, after filters, distortion and `pan` {cite doc=postgain} {cite src="packages/superdough/superdough.mjs#L924-L927"}. Both sit before the sends {cite src="packages/superdough/superdough.mjs#L929-L955"}, so both scale the dry sound and its reverb and echoes together. In a chain with only filters between them, the two simply multiply: `postgain(0.2)` on top of the default `gain` of 0.8 is the same as `gain(0.16)`. They differ when distortion sits between them. Distortion (`distort`, here at 3; Strudel suggests 0 to 10 and warns that it can get loud {cite doc=distort}) bends the waveform's peaks, and it bends a loud wave more than a quiet one, much as a trombone forced at fff turns brassy while the same note at mf does not {cite src="packages/superdough/helpers.mjs#L499-L499"} {cite src="packages/superdough/worklets.mjs#L452-L458"}:

:::compare{diff="gain(0.2) → postgain(0.2)"}
a:
  label: gain 0.2, a quieter wave into the distortion, cleaner
  code: note("c4 e4 g4 c5").s("sawtooth").distort(3).gain(0.2)
b:
  label: postgain 0.2, full distortion, then turned down
  code: note("c4 e4 g4 c5").s("sawtooth").distort(3).postgain(0.2)
:::

With `gain` the distortion receives less signal, so it bends the wave less. Because it squashes loud input more than quiet input, the output drops by less than the 12 dB that 0.2 instead of the default 0.8 asks for. With `postgain` the wave is distorted exactly as at full level and then scaled by 0.2, a full 14 dB down. Use `gain` for balance and dynamics, and keep `postgain` for turning down a part's sound after its effects.

:::bridge{title="Balance, then doubling"}
When a melody doesn't carry, a conductor asks the accompaniment to play under it before asking the melody to force. Do the same here: turn the other parts down rather than the melody up. An orchestrator has a second tool, doubling the line in another instrument, such as flute an octave above the violins. In Strudel that is another `$:` part playing the same line on another sound: it adds both level and colour.
:::
