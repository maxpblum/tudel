---
id: rhy.euclid.lesson
title: Euclidean rhythms
skill: rhy.euclid
---

`"c4(3,8)"` divides the step into 8 equal slots and puts 3 hits on them, spread as evenly as possible {cite src="packages/mini/krill.pegjs#L147-L148"} {cite doc=euclid}. Strudel computes the spread with the Bjorklund algorithm {cite src="packages/core/euclid.mjs#L43-L52"}. Over a whole bar, the 8 slots are eighth notes, so `(3,8)` puts its hits 3, 3 and 2 eighths apart, the rhythm Strudel's documentation names the Cuban tresillo {cite doc=euclid}. `(5,8)` gives gaps of 2, 1, 2, 1 and 2 eighths, the cinquillo {cite src="packages/core/euclid.mjs#L106-L107"}.

A third number rotates the pattern. In this version of Strudel, rotation r moves every hit r slots **later**, and hits pushed past the end wrap around to the start {cite src="packages/core/euclid.mjs#L130-L136"} {cite src="packages/core/util.mjs#L153-L153"}. So `(3,8,2)` puts its hits on slots 1, 3 and 6, counting from 1. In the diagram, x is a hit and · an empty slot.

:::diagram
digraph euclid {
  rankdir=TB;
  node [shape=record, fontname="Helvetica", fontsize=12];
  edge [style=invis];
  a [label="(3,8)|x|·|·|x|·|·|x|·"];
  b [label="(3,8,2)|x|·|x|·|·|x|·|·"];
  c [label="(5,8)|x|·|x|x|·|x|x|·"];
  a -> b -> c;
}
:::

:::play{label="Tresillo: (3,8)"}
note("c4(3,8)").s("square")
:::

:::play{label="The same, rotated 2 slots later: (3,8,2)"}
note("c4(3,8,2)").s("square")
:::

The same rhythms exist as methods: `.euclid(3, 8)` and `.euclidRot(3, 8, 2)` {cite doc=euclidRot} give the same events as the bracket forms {cite src="packages/mini/mini.mjs#L36-L42"}: `note("c4").euclid(3, 8)` equals `note("c4(3,8)")`.

The spread can also be written out with rests: `"c4 ~ ~ c4 ~ ~ c4 ~"` is the tresillo again. Use `(k,n)` when the hits really are evenly spread; write the rests when they are not.

:::bridge{title="3 + 3 + 2"}
Group eight eighth notes as 3 + 3 + 2 instead of 4 + 4 and you have the tresillo: the uneven bar a conductor beats long, long, short. The algorithm finds, for any k and n, the grouping closest to even: 5 hits over 8 slots become 2 + 1 + 2 + 1 + 2.
:::
