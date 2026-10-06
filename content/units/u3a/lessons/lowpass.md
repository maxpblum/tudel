---
id: snd.lowpass.lesson
title: Low-pass filter and resonance
skill: snd.lowpass
---

Subtractive synthesis starts bright and takes partials away. `lpf` sets the cutoff of a low-pass filter in hertz, audible roughly from 0 to 20000 {cite doc=lpf}. Under the hood it is a Web Audio BiquadFilterNode of type lowpass {cite src="packages/superdough/helpers.mjs#L241-L248"}. By default it is a single 12 dB-per-octave stage {cite src="packages/superdough/superdough.mjs#L360-L364"}.

:::compare{diff="lpf 400 → 2000"}
a:
  label: Cutoff 400 Hz
  code: note("c2 c3 bb2 g2").s("sawtooth").lpf(400)
b:
  label: Cutoff 2000 Hz
  code: note("c2 c3 bb2 g2").s("sawtooth").lpf(2000)
:::

`lpq` sets the filter's Q {cite doc=lpq}, which raises a peak at, or just below, the cutoff. The documented range is 0 to 50 {cite doc=lpq}. If you set no `lpq`, Q is 1 {cite src="packages/superdough/helpers.mjs#L219-L227"}, a gentle corner with no obvious peak. As you raise it, the cutoff region starts to whistle, then ring: the resonant, "squelchy" bass sound. For low-pass and high-pass filters, the Web Audio spec [interprets Q in decibels](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q).

:::filter
type: lowpass
cutoff: 800
q: 10
:::

:::play{label="Resonance: lpq 0, 10, 20, 30, one bar each"}
note("c2*8").s("sawtooth").lpf(800).lpq("<0 10 20 30>")
:::

A filter can only remove what is there. A sine has nothing above the fundamental, so `lpf` changes little until the cutoff approaches the note itself. Use a sawtooth or square when you want to hear the filter.

:::bridge{title="The swell box and the vowel"}
Closing an organ's swell box makes the division softer and duller. A low cutoff gives the dulling without much loss of the fundamental. Resonance is like one formant of a sung vowel: it emphasizes one region of the spectrum. Glide a resonant cutoff and you get a vowel-ish *ooo-aaa* colour.
:::
