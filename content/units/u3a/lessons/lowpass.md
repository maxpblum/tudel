---
id: snd.lowpass.lesson
title: Low-pass filter and resonance
skill: snd.lowpass
---

Subtractive synthesis starts bright and removes partials (harmonics). `lpf` sets the **cutoff**, in hertz {cite doc=lpf}: a low-pass filter lets the partials below it through and turns those above it down, well above it by 12 dB more per octave {cite src="packages/superdough/superdough.mjs#L360-L364"}.

:::compare{diff="lpf 600 Hz → 3000 Hz"}
a:
  label: Cutoff 600 Hz
  code: note("c4 c5 bb4 g4").s("sawtooth").lpf(600)
b:
  label: Cutoff 3000 Hz
  code: note("c4 c5 bb4 g4").s("sawtooth").lpf(3000)
:::

A filter can also have **resonance**: a boost around the cutoff, so the partials there stand out. Turned up, it becomes a narrow peak just below the cutoff, and you hear a whistling, ringing pitch there. `lpq` sets its height {cite doc=lpq} (engineers call it the filter's Q). The plots below show it.

Strudel passes `lpq` straight to the Q of a Web Audio BiquadFilterNode {cite src="packages/superdough/superdough.mjs#L659-L664"} {cite src="packages/superdough/helpers.mjs#L241-L248"}. Strudel documents a range of 0 to 50 {cite doc=lpq}, and for low-pass and high-pass filters Web Audio [reads Q in decibels](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q), so that is 0 to 50 dB. At the cutoff itself, the boost equals the `lpq` value ([Web Audio filter formulas](https://www.w3.org/TR/webaudio/#filters-characteristics)). The default is 1 dB {cite src="packages/superdough/helpers.mjs#L219-L227"}, a rise of at most about 2 dB.

:::filter{title="Same cutoff (800 Hz), different resonance"}
type: lowpass
curves:
  - cutoff: 800
    q: 1
    label: lpq 1 (1 dB, default)
  - cutoff: 800
    q: 10
    label: lpq 10 (10 dB)
  - cutoff: 800
    q: 20
    label: lpq 20 (20 dB)
  - cutoff: 800
    q: 30
    label: lpq 30 (30 dB)
:::

:::filter{title="Same resonance (lpq 10 dB), different cutoffs"}
type: lowpass
curves:
  - cutoff: 400
    q: 10
    label: lpf 400 Hz
  - cutoff: 800
    q: 10
    label: lpf 800 Hz
  - cutoff: 1600
    q: 10
    label: lpf 1600 Hz
  - cutoff: 3200
    q: 10
    label: lpf 3200 Hz
:::

:::play{label="Resonance at lpf 800 Hz: lpq 1, 10, 20, 30 dB, one bar each"}
note("c3*8").s("sawtooth").lpf(800).lpq("<1 10 20 30>").gain(0.4)
:::

(`.gain(0.4)` keeps the lpq 30 bar comfortable.)

A filter only turns existing partials up or down. So **if the input is only a sine wave**, `lpf` changes its loudness, never its colour. A cutoff exactly at the note's frequency raises it by the `lpq` value in dB. With the default `lpq`, a cutoff two or more octaves above the note changes it by under 0.5 dB, and one an octave below makes it about 11 dB quieter. To hear colour change, filter a sawtooth or square.

:::bridge{title="The mute and the vowel"}
A low cutoff works like a bucket mute on a trombone: the upper partials are damped and the tone darkens. Resonance is like one formant of a sung vowel, emphasizing one region of the spectrum. Glide a resonant cutoff and you get a vowel-like *wah*, much like a plunger mute opening.
:::
