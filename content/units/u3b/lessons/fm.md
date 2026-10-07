---
id: snd.fm.lesson
title: FM synthesis basics
skill: snd.fm
---

**Frequency modulation (FM)** makes a sound's pitch swing up and down hundreds of times a second. It is far too fast to hear as vibrato; instead you hear new partials, called sidebands. Two oscillators do it: the **carrier**, the one you hear, and the **modulator**, a sine wave that pushes the carrier's frequency {cite src="packages/superdough/helpers.mjs#L408-L412"} {cite src="packages/superdough/helpers.mjs#L443-L443"}. The sidebands sit above and below the carrier, spaced by the modulator's frequency ([Chowning 1973](https://yamahasynth.com/wp-content/uploads/images/fm_synthesispaper-2.pdf)).

:::diagram
digraph fm {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  mod [label="modulator (sine)\nfrequency = note × fmh"];
  depth [label="depth\nfmi × modulator frequency"];
  car [label="carrier\ns(\"sine\") at the note"];
  out [label="amp envelope, filters, output"];
  mod -> depth;
  depth -> car [label=" pushes its frequency"];
  car -> out;
}
:::

Strudel names the two controls after FM's own terms:

- `fmh`, the **harmonicity ratio**, sets the modulator's frequency as a multiple of the note, default 1 {cite doc=fmh} {cite src="packages/superdough/helpers.mjs#L443-L443"}. A whole number keeps every sideband on the harmonic series. With `fmh(2)` only the odd harmonics appear, the hollow spectrum of a square wave ([Reid, Sound On Sound](https://www.soundonsound.com/techniques/more-frequency-modulation)). Ratios that are neither whole numbers nor simple fractions, such as 1.41, put the sidebands between the harmonics, which sounds metallic {cite doc=fmh}. (A simple fraction such as 1.5 stays harmonic, but on a fundamental an octave below the note.)
- `fmi`, the **modulation index**, sets the depth: the carrier's frequency swings by up to `fmi` times the modulator's frequency {cite src="packages/superdough/helpers.mjs#L471-L474"}. That is exactly Chowning's index. A higher index spreads energy into more sidebands, so the tone gets brighter {cite doc=fmi}. On c4 (262 Hz) with `fmh(2)` and `fmi(3)`, the modulator runs at 523 Hz and the pitch swings by up to 1570 Hz each way.

:::play{label="fmi 0, 1, 2, 4, one bar each (fmh 1)"}
note("c4 e4 g4 c5").s("sine").fmi("<0 1 2 4>")
:::

:::compare{diff="fmh 2 → 1.41"}
a:
  label: fmh 2 (odd harmonics)
  code: note("c4 e4 g4 c5").s("sine").fmi(3).fmh(2)
b:
  label: fmh 1.41 (inharmonic)
  code: note("c4 e4 g4 c5").s("sine").fmi(3).fmh(1.41)
:::

FM works on any basic waveform {cite src="packages/superdough/synth.mjs#L537-L537"}. On a sine you hear only what the modulator adds.

:::bridge{title="Harmonic and inharmonic"}
A trombone's partials sit on the harmonic series, so they fuse into one clear pitch. A gong's or a church bell's do not, which is why they sound metallic and their pitch is hard to sing back. Whole-number `fmh` gives you the trombone kind; other ratios give you the bell kind.
:::
