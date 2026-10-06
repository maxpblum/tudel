---
id: fx.filter.lesson
title: Low-pass filter
skill: fx.filter
---

`lpf` sets the cutoff of a low-pass filter {cite doc=lpf}, and `lpq` its resonance.

:::compare{diff="lpf 400 → 2000"}
a:
  label: Cutoff 400 Hz
  code: note("c3").s("sawtooth").lpf(400)
b:
  label: Cutoff 2000 Hz
  code: note("c3").s("sawtooth").lpf(2000)
:::

:::filter
type: lowpass
cutoff: 800
q: 10
:::

:::envelope
attack: 0.01
decay: 0.2
sustain: 0.5
release: 0.3
hold: 0.5
:::

:::signal
shape: sine
min: 200
max: 2000
period: 4
cycles: 4
label: lpf
:::

| Cutoff | Sound |
| ------ | ----- |
| 400    | dull  |
