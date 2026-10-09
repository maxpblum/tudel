---
id: snd.putting-it-together-filters.lesson
title: "Putting it together: filtered drums and sweeping bass"
skill: snd.putting-it-together-filters
---

A raw sawtooth wave contains every integer harmonic, which can easily overpower acoustic drum samples. By shaping the synth's harmonics with lowpass filtering and filter sweeps while leaving drum transients clean, you create clarity and dramatic motion {cite doc=lpf} {cite doc=range}.

## Frequency carving and phrase sweeps

In a mix, every element needs its own slice of the frequency spectrum:

- **The drums:** need high-frequency snap in the hi-hats (above 6000 Hz) and clean low-end punch in the kick (below 120 Hz).
- **The bass:** starts warm and muffled when filtered at 400 Hz, leaving the midrange open.
- **The sweep:** as the 4-bar phrase progresses, sweeping the bass filter with `saw.range(400, 2400).slow(4)` injects brightness and energy toward the bar line.

:::play{label="A 4-bar groove: TR-909 beat anchored by a rising lowpass sweep on bass"}
setcpm(120 / 4)
stack(
  s("bd ~ bd ~, ~ sd ~ sd, hh*8").bank("RolandTR909"),
  note("<d3 c3 bb3 a3>")
    .ply(4)
    .s("sawtooth")
    .lpf(saw.range(400, 2400).slow(4))
    .lpq(2)
    .gain(0.7),
)
:::

Notice the interplay: in bar 1, the bass is dark and sits politely underneath the kick; by bar 4, its harmonics have opened up through 2400 Hz, adding high-frequency buzz before resetting on the downbeat.

:::bridge{title="Mutes and filter sweeps"}
In a brass ensemble, a trumpet player uses a straight mute to shave off lower resonances and focus the sound, or slowly removes a cup mute to create an acoustic swell. Synthesizer lowpass sweeps accomplish the exact same acoustic transformation electronically.
:::
