---
id: rhy.putting-it-together.lesson
title: "Putting it together: multi-part rhythm groove"
skill: rhy.putting-it-together
---

A complete drum groove is not a single repetitive rhythm; it is an ensemble of complementary voices locking into 4/4 time. You already know every piece: kick patterns on the pulse, syncopated snares with rests, sixteenth-note subdivisions, alternating bars with `< >`, and Euclidean spreads {cite doc=stack} {cite doc=bank}.

## Assembling the drum kit

Put each drum voice on its own line inside `stack(...)`. This lets you write simple, clear patterns for each instrument instead of cramming them into one complex string:

- **Kick drum (`"bd"`):** establishes the pulse on beats 1 and 3, or four-on-the-floor on every quarter note.
- **Snare drum (`"sd"`):** anchors beats 2 and 4, with a ghost hit on the offbeat to create forward drive.
- **Closed hi-hat (`"hh"`):** fills the subdivisions with an odd Euclidean rhythm like `(5,8)` or sixteenths with dynamic variations.

:::play{label="A complete 2-bar drum groove with ghost snares and Euclidean hats"}
setcpm(120 / 4)
stack(
  s("<[bd ~ bd ~] [bd ~ ~ bd]>"),
  s("~ [sd ~ ~ sd] ~ sd"),
  s("hh(5,8)").gain(0.6),
).bank("RolandTR909")
:::

Notice how the layers interact: the kick varies across two bars using `< >`, the snare catches a syncopated sixteenth before beat 2, and the Euclidean hi-hat fills the gaps without crowding the primary downbeats.

:::bridge{title="The drum kit as a polyphonic ensemble"}
In an acoustic drum kit, a drummer's four limbs play distinct roles: right foot on kick (tempo and bass anchor), left hand on snare (backbeat), and right hand on hi-hat (timekeeper). In Strudel, `stack` is your virtual kit: separate rhythm streams sharing one shared clock and tempo.
:::
