---
id: rhy.alternate.lesson
title: "One per bar: < > and /"
skill: rhy.alternate
---

Angle brackets hold a list of entries, and play **one entry per cycle**, in turn, then start again {cite src="packages/mini/krill.pegjs#L122-L125"} {cite src="packages/mini/mini.mjs#L95-L96"}. With one cycle per bar, `"<c4 e4 g4>"` plays a whole-note C, then E, then G, and repeats every three bars.

`< >` can sit inside a step, so only that step changes from bar to bar. Here beats 1 to 3 repeat, and beat 4 is d5 in bar 1 and c5 in bar 2:

:::play{label="Same three beats; the last note alternates d5, c5"}
note("c4 e4 g4 <d5 c5>").s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
C E G d | C E G c |
:::

The entries can be whole groups, so `"<[c4 e4 g4 d5] [c4 e4 g4 c5]>"` gives exactly the same two bars. The short form writes the shared beats once.

`/n` does the opposite of `*n`: it slows a step down so that it lasts n cycles {cite src="packages/mini/krill.pegjs#L150-L151"} {cite doc=slow}. `"[c4 e4 g4 c5]/2"` spreads four notes over two bars, so each is a half note. It gives the same events as `"<[c4 e4] [g4 c5]>"`.

:::play{label="Four notes over two bars: half notes"}
note("[c4 e4 g4 c5]/2").s("triangle")
:::

The number after `*` may itself be an alternation {cite src="packages/mini/krill.pegjs#L128-L128"} {cite src="packages/mini/krill.pegjs#L153-L154"}: `"g4*<2 4>"` plays two notes in bar 1 and four in bar 2.

:::bridge{title="First and second endings"}
`"c4 e4 g4 <d5 c5>"` is a repeated bar with *prima* and *seconda volta*: the first time it ends open on D, the second time it closes on C. Unlike a score, Strudel has no *fine*: after the second ending the loop goes back to the first.
:::
