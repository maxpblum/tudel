---
id: snd.highpass.lesson
title: High-pass filter and the signal chain
skill: snd.highpass
---

`hpf` is the mirror image of `lpf`. It sets a cutoff in hertz {cite doc=hpf}, but it keeps the partials *above* it and turns down those below: well below the cutoff, each octave lower is 12 dB quieter {cite src="packages/superdough/superdough.mjs#L360-L364"}. It is the same kind of Web Audio BiquadFilterNode, set to type highpass {cite src="packages/superdough/superdough.mjs#L696-L721"}. Its resonance, `hpq` {cite doc=hpq}, works like `lpq`, also [in dB](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q), with the same default of 1 dB {cite src="packages/superdough/helpers.mjs#L219-L227"}.

:::filter{title="High-pass at 100 Hz and 1500 Hz (default resonance)"}
type: highpass
curves:
  - cutoff: 100
    q: 1
    label: hpf 100 Hz
  - cutoff: 1500
    q: 1
    label: hpf 1500 Hz
:::

:::compare{diff="hpf 100 Hz → 1500 Hz"}
a:
  label: High-pass at 100 Hz
  code: note("c4,eb4,g4,bb4").s("sawtooth").hpf(100)
b:
  label: High-pass at 1500 Hz
  code: note("c4,eb4,g4,bb4").s("sawtooth").hpf(1500)
:::

The comma stacks the notes into a chord. Its fundamentals run from 262 to 466 Hz, so `hpf(100)` changes them by under 1 dB. At `hpf(1500)` the pitches don't change, but the fundamentals drop by 20 to 30 dB ([Web Audio filter formulas](https://www.w3.org/TR/webaudio/#filters-characteristics)): the body goes, and the chord sounds thin. On the same chord, `lpf` does the opposite: it keeps the body and removes the bright upper partials.

:::play{label="Same chord with lpf 1500 Hz instead: body kept, brightness removed"}
note("c4,eb4,g4,bb4").s("sawtooth").lpf(1500)
:::

Each note runs through a fixed chain: the oscillator and its amplitude envelope (its loudness over time, covered in its own lesson) {cite src="packages/superdough/synth.mjs#L65-L68"}, then `gain` (overall level), the low-pass and the high-pass {cite src="packages/superdough/superdough.mjs#L651-L721"}. The order of your method calls doesn't change it. By convention we write the note, `s`, the envelope, the filters, and `gain` last, where it is easy to find:

:::diagram
digraph chain {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  osc [label="oscillator\ns(\"sawtooth\")"];
  env [label="amp envelope\nattack to release"];
  gain [label="gain"];
  lpf [label="low-pass\nlpf, lpq"];
  hpf [label="high-pass\nhpf, hpq"];
  out [label="output"];
  osc -> env -> gain -> lpf -> hpf -> out;
}
:::

Both filters together keep mostly a band, here 600 to 2500 Hz, for a small, telephone-like sound. The notes' fundamentals (262 to 466 Hz) sit below the band and are turned down, so the pitch rides on the upper partials:

:::play{label="Band: hpf 600 plus lpf 2500"}
note("c4 eb4 g4 bb4").s("sawtooth").lpf(2500).hpf(600)
:::

:::bridge{title="Orchestration: who holds the bass?"}
When the cellos and basses drop out, an orchestral texture thins and floats. A high-pass does that to a single voice. High-pass the chords and melody, and the bass line owns the low register, as when an arranger keeps the accompaniment out of the bass.
:::
