---
id: snd.bandpass.lesson
title: Band-pass filter
skill: snd.bandpass
---

A **band-pass filter** keeps one region of the spectrum and turns down everything above and below it. `bpf` sets the centre of that band in hertz {cite doc=bpf}. Like `lpf` and `hpf`, it is a Web Audio BiquadFilterNode, here of type bandpass, and it comes after the high-pass in the chain {cite src="packages/superdough/superdough.mjs#L696-L758"}.

:::compare{diff="bpf 500 Hz → 2000 Hz"}
a:
  label: Band centred on 500 Hz
  code: note("c4 eb4 g4 bb4").s("sawtooth").bpf(500)
b:
  label: Band centred on 2000 Hz
  code: note("c4 eb4 g4 bb4").s("sawtooth").bpf(2000)
:::

The pitches stay the same, because the partials that survive are still harmonics of each note. Only the colour moves: low and dark at 500 Hz, high and thin at 2000 Hz.

`bpq` sets the width {cite doc=bpq}. Unlike `lpq`, it is a plain number, not decibels: for a band-pass, Web Audio [reads Q as linear](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q), and the [band-pass formula](https://www.w3.org/TR/webaudio/#filters-characteristics) never boosts. The centre always passes at full level (0 dB), and a higher `bpq` only narrows the band around it. The width in hertz between the two points 3 dB down is about the centre divided by `bpq`. So the default, 1 {cite src="packages/superdough/helpers.mjs#L219-L227"}, keeps about 1.4 octaves around the centre, and `bpq` 5 keeps about a third of an octave (618 to 1618 Hz versus 905 to 1105 Hz around 1000 Hz).

:::filter{title="Band-pass at 1000 Hz, different widths"}
type: bandpass
curves:
  - cutoff: 1000
    q: 1
    label: bpq 1 (default)
  - cutoff: 1000
    q: 5
    label: bpq 5
  - cutoff: 1000
    q: 12
    label: bpq 12
:::

A narrow band passes fewer partials, so the sound gets quieter and more whistling as `bpq` rises:

:::play{label="bpf 1000 Hz with bpq 1, 4, 12, one bar each"}
note("c4 eb4 g4 bb4").s("sawtooth").bpf(1000).bpq("<1 4 12>")
:::

One `bpf` says "only this band" more clearly than an `lpf` and `hpf` pair.

:::bridge{title="One formant"}
A sung vowel is shaped by bands the mouth emphasises, its formants. A band-pass is one such band laid over a buzzing source. Move its centre and the colour moves, a little as it does between vowels. Centre it near 1000 Hz and narrow it, and the tone turns nasal, like a singer placing the sound in the nose.
:::
