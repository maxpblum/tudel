---
id: rhy.drums.lesson
title: Drum names and drum machines
skill: rhy.drums
---

`s` also plays recorded drum sounds (samples) {cite doc=s}. Their names are short standard abbreviations {cite src="website/src/pages/learn/samples.mdx#L25-L39"}:

- `"bd"` bass drum (kick), `"sd"` snare drum, `"rim"` rimshot, `"cp"` handclap
- `"hh"` closed hi-hat, `"oh"` open hi-hat, `"cr"` crash, `"rd"` ride
- `"lt"`, `"mt"`, `"ht"` low, middle and high tom

`bank` chooses whose recordings you hear. It puts the bank name and an underscore in front of each sound name, so `s("bd").bank("RolandTR909")` plays `"RolandTR909_bd"` {cite doc=bank}. This course uses two classic drum machines, the Roland TR-808 and TR-909: `bank("RolandTR808")` and `bank("RolandTR909")`. Not every bank has every drum {cite src="website/src/pages/learn/samples.mdx#L91-L93"}.

:::compare{diff="bank RolandTR808 → RolandTR909"}
a:
  label: TR-808
  code: s("bd hh sd hh").bank("RolandTR808")
b:
  label: TR-909
  code: s("bd hh sd hh").bank("RolandTR909")
:::

Samples are downloaded the first time they play, so a sound can be missing on its first pass {cite src="website/src/pages/learn/samples.mdx#L70-L72"}. Drum examples need a network connection.

**Step length is not ring length.** A sample plays to its natural end, however long its step is {cite src="packages/superdough/sampler.mjs#L313-L317"}. In `s("bd hh sd hh")` each step is a quarter note; whether a drum stops sooner or rings on depends only on the recording. The step decides when the next hit comes.

Drum dictations in this course use a percussion staff: bass drum in the bottom space, snare in the third space, hi-hat above the staff with x noteheads. The beat above looks like this:

:::abc
X:1
M:4/4
L:1/4
K:C clef=perc
F !style=x!g c !style=x!g |
:::

:::bridge{title="Read it like a percussion part"}
In a snare-drum part, a quarter note and an eighth note followed by an eighth rest sound the same: the note value marks the time until the next stroke, not how long the drum rings. Strudel's drum steps work the same way. The bank is like choosing which orchestra's percussion section plays the part.
:::
