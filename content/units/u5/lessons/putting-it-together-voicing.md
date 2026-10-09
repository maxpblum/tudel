---
id: pit.putting-it-together-voicing.lesson
title: "Putting it together: extended harmony over a rhythm section"
skill: pit.putting-it-together-voicing
---

Rich harmony comes alive when paired with an active rhythm section. When you voice extended chords, borrowed chords, and slash basslines together, each layer needs clear register separation so colorful intervals (major sevenths, ninths, borrowed minor thirds) sound luminous rather than clashing {cite doc=chord} {cite doc=voicing}.

## Register separation in extended grooves

A professional neo-soul or synth-pop arrangement separates roles by octave:

- **The bass pedal (octave 3):** provides stability on the root or pedal tone, locking with the kick drum.
- **The keyboard voicings (octaves 4 and 5):** `voicing()` arranges the colorful chord tones smoothly, minimizing awkward register jumps between changes.
- **Modal color:** borrowed chords like the minor iv (*Fm* in C major) inject unexpected emotional gravity without disturbing the groove.

:::play{label="A sophisticated groove: TR-909 beat, C pedal bass, and modal mixture chords"}
setcpm(112 / 4)
stack(
  s("bd ~ bd ~, ~ sd ~ sd, hh*8").bank("RolandTR909"),
  note("c3*4").s("sawtooth").lpf(600).gain(0.7),
  chord("<C F Fm C>").voicing().s("supersaw").detune(0.15).lpf(2200).gain(0.4),
)
:::

Notice how the C3 pedal in the bass anchors the progression while the chord layer transitions smoothly from major IV (F) to borrowed minor iv (Fm) back to I (C).

:::bridge{title="Pedal points in modal jazz"}
In Miles Davis's modal jazz masterpieces, a double bass often holds a steady pedal note while the piano explores shifting extended modes above it. The stationary bass gives the ear a constant reference point to appreciate the subtle colors of upper-structure chords.
:::
