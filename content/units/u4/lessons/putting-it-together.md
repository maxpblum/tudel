---
id: mod.putting-it-together.lesson
title: "Putting it together: multi-speed modulation soundscapes"
skill: mod.putting-it-together
---

Real acoustic instruments never stay motionless: a string player's bow arm creates a phrase-length dynamic arc, their wrist produces a steady vibrato, and finger micro-tremors produce subtle pitch imperfections. In Strudel, you achieve organic depth by layering signals running at three distinct speeds: macro, meso, and micro {cite doc=range} {cite doc=slow} {cite doc=perlin}.

## Three speeds of musical motion

Layering modulations across different time domains brings electronic soundscapes to life:

1. **Macro-speed (phrase arc):** a slow 4-bar ramp (`saw.range(400, 2800).slow(4)`) shaping a filter cutoff toward the cadence.
2. **Meso-speed (rhythmic pulse):** a 1-cycle sine or square wave (`sine.range(0.3, 0.7)`) pulsing volume or panning across the bar.
3. **Micro-speed (organic drift):** non-repeating Perlin noise (`perlin.range(-0.15, 0.15).slow(2)`) drifting pitch or resonance so repeated notes never sound cloned.

:::play{label="Three speeds: 4-bar filter sweep, 1-beat volume tremolo, and Perlin pitch drift"}
setcpm(120 / 4)
stack(
  s("bd*2, ~ sd, hh*8").bank("RolandTR808"),
  note("<a3*8 f3*8 c3*8 g3*8>")
    .add(note(perlin.range(-0.15, 0.15).slow(2)))
    .s("sawtooth")
    .lpf(saw.range(400, 2400).slow(4))
    .gain(sine.range(0.4, 0.75).fast(4)),
)
:::

Listen to how the speeds combine: the eighth notes pulse with a fast tremolo, while the overall filter sweeps open across four bars, and Perlin noise imparts subtle analog warmth to the pitches.

:::bridge{title="Micro-time and macro-time in orchestration"}
In an orchestra, an oboist breathes over an 8-bar melody (macro-arc), uses a 6-Hz vibrato from the diaphragm (meso-rate), and makes infinitesimal variations in reed pressure (micro-nuance). Synthesizing multiple modulation speeds gives electronic music that same living, breathing quality.
:::
