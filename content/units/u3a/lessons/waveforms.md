---
id: snd.waveforms.lesson
title: Four waveforms, four registrations
skill: snd.waveforms
---

A synth voice in Strudel starts with an oscillator. `note` says *what* to play and `s` says *with what*. The four basic synth sounds are `"sawtooth"`, `"square"`, `"triangle"` and `"sine"` {cite src="packages/superdough/synth.mjs#L23-L29"}. They are plain Web Audio OscillatorNode types {cite src="packages/superdough/synth.mjs#L521-L525"}.

:::play{label="One bar on each: sawtooth, square, triangle, sine"}
note("c3 eb3 g3 bb3").s("<sawtooth square triangle sine>")
:::

Note names work as you would expect: c4 is middle C, MIDI 60 {cite src="packages/core/util.mjs#L31-L38"}, and A4 (MIDI 69) is 440 Hz {cite doc=note}. If you give `note` but no `s`, you get a triangle {cite src="packages/superdough/superdough.mjs#L180-L181"}. Write the `s` anyway.

The quoted strings are mini-notation, a compact score. This unit needs only a few symbols, and U1 covers the rest. Spaces divide the bar evenly, `[ ]` squeezes a group into one step, and `*n` repeats a step *n* times, so `"c2*8"` is eight eighths. `@n` makes a step *n* units long, `!n` repeats it *n* times, `,` stacks notes into a chord, and `<a b>` picks one entry per cycle. In this course one cycle is one bar, so even the sound name can change per bar.

:::play{label="Mini-notation: a quarter, two eighths, a half note"}
note("c4 [e4 g4] c5@2").s("square")
:::

:::bridge{title="From the organ loft"}
Think of the four as stops, ordered from brightest to purest ([Fourier coefficients in the Web Audio spec](https://www.w3.org/TR/webaudio/#oscillator-coefficients)):

- **sawtooth**: every harmonic, falling off as 1/n. Bright and buzzy, like brass.
- **square**: odd harmonics only, also 1/n. Hollow, like a [clarinet in the chalumeau register](https://newt.phys.unsw.edu.au/jw/clarinetacoustics.html).
- **triangle**: odd harmonics again, but falling off as 1/n², so it sounds [soft and mellow](https://till.com/articles/wavepalette/), like a muted clarinet.
- **sine**: the fundamental alone, purer than any real stop.

For chiptune: the NES sound chip had [two pulse channels and one triangle channel](https://www.nesdev.org/wiki/APU), and a square is a pulse at 50% duty.
:::

:::compare{diff="s sawtooth → square"}
a:
  label: Sawtooth
  code: note("c2 c3 bb2 g2").s("sawtooth")
b:
  label: Square
  code: note("c2 c3 bb2 g2").s("square")
:::

The square lacks the even harmonics, including the octave above the fundamental. That gap is the hollowness.
