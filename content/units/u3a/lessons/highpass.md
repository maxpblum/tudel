---
id: snd.highpass.lesson
title: High-pass filter and the signal chain
skill: snd.highpass
---

`hpf` is the mirror image of `lpf`: it removes everything *below* its cutoff, in hertz {cite doc=hpf}. It is the same kind of Web Audio biquad, set to type highpass {cite src="packages/superdough/superdough.mjs#L696-L721"}, with the same default Q of 1 {cite src="packages/superdough/helpers.mjs#L219-L227"}.

:::compare{diff="hpf 100 → 1000"}
a:
  label: High-pass at 100 Hz
  code: note("c3,eb3,g3,bb3").s("sawtooth").hpf(100)
b:
  label: High-pass at 1000 Hz
  code: note("c3,eb3,g3,bb3").s("sawtooth").hpf(1000)
:::

The comma in `"c3,eb3,g3,bb3"` stacks the notes into a chord. The pitches don't change when you raise `hpf`. What disappears is the body: the fundamentals and lower partials, so the chord sounds thin.

Each note runs through a fixed chain. The oscillator and its amplitude envelope come first {cite src="packages/superdough/synth.mjs#L65-L68"}, then `gain`, then the low-pass, then the high-pass {cite src="packages/superdough/superdough.mjs#L651-L721"}. The order of your method calls doesn't change this chain. By convention we write the note, then `s`, the envelope, the filters, and `gain` last:

:::diagram
digraph chain {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  osc [label="oscillator\ns(\"sawtooth\")"];
  env [label="amp envelope\nattack to release"];
  gain [label="gain"];
  lpf [label="low-pass\nlpf, lpq"];
  hpf [label="high-pass\nhpf"];
  out [label="output"];
  osc -> env -> gain -> lpf -> hpf -> out;
}
:::

Use both filters together and you keep only a band, which gives the small, "telephone" sound:

:::play{label="Band: hpf 600 plus lpf 2500"}
note("c4 eb4 g4 bb4").s("sawtooth").lpf(2500).hpf(600)
:::

:::bridge{title="Orchestration: who holds the bass?"}
When the cellos and basses drop out, an orchestral texture thins and floats. A high-pass does that to a single voice. In synth-pop mixes it's the everyday tool: high-pass the pads and leads so the bass line owns the low register, the way an arranger keeps the accompaniment out of the bass register.
:::
