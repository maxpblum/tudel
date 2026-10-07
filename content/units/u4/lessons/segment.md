---
id: mod.segment.lesson
title: Stepping a signal with segment
skill: mod.segment
---

A signal has a value at every moment but no rhythm of its own. `segment(n)` samples it *n* times per cycle {cite doc=segment}: it lays a pulse of *n* equal steps over each cycle and gives each step the signal's value {cite src="packages/core/pattern.mjs#L2173-L2175"}. The value is the one at the **start** of the step {cite src="packages/core/signal.mjs#L18-L21"}.

Those steps can be notes. In `note(...)`, a plain number is a MIDI note number {cite doc=note}: 69 is a4 (440 Hz), so 60 is c4 and 72 is c5. `saw.range(60, 72)` climbs from 60 towards 72 during one bar, and `.segment(12)` takes twelve readings, at 0/12, 1/12, … 11/12 of the bar: 60, 61, … 71. Twelve notes in four beats is three per beat, so that is a chromatic scale in eighth-note triplets. It stops on b4: the saw would only reach 72 at the barline, where it drops back to 60.

:::abc
X:1
M:4/4
L:1/8
K:C
(3C^CD (3^DEF (3^FG^G (3A^AB |
:::

:::play{label="saw.range(60, 72).segment(12): twelve steps, c4 up to b4"}
note(saw.range(60, 72).segment(12)).s("triangle")
:::

Inside a parameter, the notes still set the rhythm {cite src="packages/core/controls.mjs#L41-L49"}, and `segment` only decides when the value may change. Under sixteenths, this cutoff moves once per beat, in four steps: 400, 1100, 1800 and 2500 Hz.

:::play{label="Sixteenths; the cutoff steps up on each beat"}
note("c3*16").s("sawtooth").lpf(saw.range(400, 3200).segment(4))
:::

**Write `segment` last.** `slow` stretches everything written before it {cite doc=slow}, steps included. `saw.slow(4).segment(4)` gives four steps per bar, sixteen across the four-bar phrase. `saw.segment(4).slow(4)` gives one step per bar.

:::bridge{title="Slide and keyboard"}
A trombone glissando passes through every pitch on the way; a piano glissando can only sound the keys. `segment` turns the slide into a keyboard: the continuous signal becomes a row of separate, fixed values.
:::
