---
id: pat.putting-it-together.lesson
title: "Putting it together: polyphonic transform grooves"
skill: pat.putting-it-together
---

Live coding reaches its highest economy when a whole musical arrangement is derived from a single melodic seed. Instead of manually typing out a lead line, a countermelody, an octave double, and drum variations line by line, you apply **transformations**: canons, structural masking, and phrase-level variations {cite doc=superimpose} {cite doc=lastOf}.

## Deriving an arrangement from one motif

Transform methods let you spin multiple musical voices out of one central idea:

- **The rhythmic foundation:** drum patterns that keep time for three bars, then execute an automatic sixteenth-note snare fill on the fourth bar using `.lastOf(4, (x) => x.ply(2))`.
- **The seed motif:** a 1-bar melodic phrase that establishes the theme.
- **The canon follower:** using `.superimpose((x) => x.add(note(12)).rev())` to layer an octave-doubled retrograde countermelody on top of the original line.

:::play{label="A derived polyphonic groove: automatic 4th-bar fill and superimposed countermelody"}
setcpm(116 / 4)
stack(
  s("bd ~ bd ~, ~ sd ~ sd, hh*8")
    .bank("RolandTR909")
    .lastOf(4, (x) => x.ply(2)),
  note("<a3 f3 c3 g3>").ply(2).s("sawtooth").lpf(600).gain(0.7),
  n("0 2 4 7 5 4 2 0")
    .scale("A4:minor")
    .superimpose((x) => x.add(note(12)).rev())
    .s("triangle")
    .gain(0.4),
)
:::

Notice how much music emerges from few lines of code: the drums automatically deliver an energetic fill at the phrase cadence, while the lead synth plays its melody forward in octave 4 and backward in octave 5 simultaneously.

:::bridge{title="Fugal generation and live coding"}
In J.S. Bach's *The Art of Fugue*, an entire multi-movement work is derived by systematically transforming a single 12-note subject: running it backward, inverting its intervals, and staggering its entrances. Strudel's pattern transforms bring that exact compositional power to your keyboard.
:::
