---
id: det.putting-it-together.lesson
title: "Putting it together: full sound design with buses, detune and wobble"
skill: det.putting-it-together
---

A complete electronic mix balances four distinct dimensions: frequency, dynamics, space, and pitch animation. Combining multiple synthesizers without clashing requires disciplined gain staging and conscious spatial separation {cite doc=orbit} {cite doc=detune}.

## Structuring the electronic soundstage

Organize your electronic layers to occupy clear acoustic territory:

- **The sub-bass foundation:** mono, centered, filtered below 500 Hz to anchor the lowest register without detune.
- **The drum bus (orbit 0):** punchy, dry transients providing rhythmic clarity in the center channel.
- **The wide supersaw pad (orbit 1):** rich 5-voice unison with `.detune(0.2)` providing width and harmonic warmth.
- **The animated lead (orbit 2):** a distinct square or triangle melody with vocal-style pitch vibrato using `.vib(6).vibmod(0.25)`.

:::play{label="A full wall of sound: centered drums and bass, wide detuned pad, and vibrato lead"}
setcpm(120 / 4)
stack(
  s("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR909").gain(0.85),
  note("<a3 f3 c3 g3>").ply(2).s("sawtooth").lpf(450).gain(0.7),
  chord("<Am F C G>").voicing().s("supersaw").detune(0.2).lpf(2000).gain(0.35),
  n("<[4@2 5 7] [5@2 4 2] [0@2 2 4] [2@3 ~]>")
    .scale("A4:minor")
    .s("square")
    .vib(6)
    .vibmod(0.25)
    .gain(0.3),
)
:::

Notice how each sound has a clear character: the bass is steady and mono, the supersaw provides shimmering warmth, and the lead stands out cleanly because vibrato makes its pitch distinct to the human ear.

:::bridge{title="Orchestral layering and synthesizer stacking"}
A symphonic tutti works because instruments differ in both timbre and physical position: double basses in the center-right, violins on the left, brass in the center-rear, and woodwinds projecting solo lines over the top. Mixing synths with detune, filter carving, and distinct gains reproduces that same symphonic equilibrium.
:::
