---
id: pit.putting-it-together.lesson
title: "Putting it together: rhythm and harmony groove"
skill: pit.putting-it-together
---

Music feels complete when rhythm and harmony lock together into a single groove. In Unit 1 you built multi-part drum beats, and in Unit 2 you voiced chord progressions and wrote basslines. Now you combine them into a three-tier rhythm section {cite doc=stack} {cite doc=voicing}.

## The three-tier rhythm section

In popular music and jazz, a rhythm section divides into three distinct frequency and musical roles:

1. **The drums (pulse and subdivision):** kick and snare maintain tempo and meter while hats subdivide the bar.
2. **The bass (root foundation):** low notes (octave 3, from C3 up) outlining the harmonic roots, locking in time with the kick drum.
3. **The harmony (color and sustain):** keyboard chords voiced across the middle register (octaves 4 and 5) that change once per bar.

:::play{label="A complete groove in C major: drums, walking bassline, voiced chords"}
setcpm(116 / 4)
stack(
  s("bd ~ bd ~, ~ sd ~ sd, hh*8").bank("RolandTR808"),
  note("<[c3 ~ c3 ~] [a3 ~ a3 ~] [f3 ~ f3 ~] [g3 ~ g3 ~]>")
    .s("sawtooth")
    .gain(0.7),
  chord("<C Am F G>").voicing().s("triangle").gain(0.5),
)
:::

Notice how the parts complement rather than compete: the bass hits on beats 1 and 3 match the kick, while the sustained triangle chords float above without cluttering the rhythm.

:::bridge{title="Continuo and rhythm section"}
In the Baroque era, the *basso continuo* paired a bass instrument (cello or bassoon) playing the root line with a chordal instrument (harpsichord or organ) realizing the harmony. Today's rhythm section—bass guitar, keyboards, and drums—serves the exact same musical purpose.
:::
