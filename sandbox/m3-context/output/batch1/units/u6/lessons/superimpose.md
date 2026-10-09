---
id: pat.superimpose.lesson
title: "Doubling with superimpose, answering with jux"
skill: pat.superimpose
---

An orchestrator doubles a melody by giving it to a second instrument at the same moment, often an octave away. `superimpose(f)` does that to a pattern: it plays the pattern and, at the same time, the copy that `f` returns {cite doc=superimpose} {cite src="packages/core/pattern.mjs#L810-L812"}. It is `off` without the delay. `off(0, f)` gives the same events, because `off` only shifts its copy by the delay before applying `f` {cite src="packages/core/pattern.mjs#L2236-L2238"}.

So the two differ in one thing. On the same arpeggio, with the same octave copy:

:::compare{diff="superimpose(f) → off(1 / 8, f)"}
a:
  label: "superimpose: an octave doubling, both voices together"
  code: |
    n("0 2 4 7 4 2 0@2".superimpose((x) => x.add(7)))
      .scale("C4:major")
      .s("triangle")
b:
  label: "off: the octave copy one eighth note later, an echo"
  code: |
    n("0 2 4 7 4 2 0@2".off(1 / 8, (x) => x.add(7)))
      .scale("C4:major")
      .s("triangle")
:::

`superimpose` doubles; `off` imitates.

**When add is enough.** For a plain octave, the parallel-voice form from earlier says the same in fewer words: `n("0 2 4 7 4 2 0@2".add("0,7"))` gives the same events as the first snippet above. `superimpose` earns its place when the copy is more than a transposition: when it has its own rhythm or its own sound.

**A copy with its own rhythm.** Here the copy is the subject an octave lower in augmentation: `x.slow(2).sub(7)`. On top, the subject plays as written, once per bar. Underneath, the same subject in doubled note values takes two bars to get through once. Its lowest note is C3, the floor of this course's range.

:::play{label="The subject over itself in augmentation, an octave lower"}
n("0 2 4 7 [6 5] 4 3@2".superimpose((x) => x.slow(2).sub(7)))
  .scale("C4:major")
  .s("triangle")
:::

**A copy with its own sound.** To give the copy another waveform or level, apply `superimpose` after `s`, so the copy has an `s` to replace. The copy is then a list of named settings, not plain degrees, so transpose it with `transpose`, in semitones {cite doc=transpose}:

:::play{label="A triangle melody doubled an octave lower by a quieter square wave"}
n("0 2 4 7 [6 5] 4 3@2")
  .scale("C5:major")
  .s("triangle")
  .superimpose((x) => x.transpose(-12).s("square").gain(0.5))
:::

**Left and right: jux.** `jux(f)` is a superimpose split across the stereo field: the original plays hard left and the copy that `f` returns plays hard right {cite doc=jux}. It sets each copy's `pan`, where 0 is the left speaker and 1 the right {cite src="packages/core/pattern.mjs#L2356-L2381"}. Because it sets `pan`, it goes after `n(...)` and `scale`, on the finished notes. Listen on headphones: the scale rises on the left while its retrograde falls on the right, and the two cross in the middle of the bar.

:::play{label="jux(rev): the scale up on the left, down on the right"}
n("0 1 2 3 4 5 6 7").scale("C4:major").s("triangle").jux(rev)
:::

:::bridge{title="Cori spezzati"}
In St Mark's, Venice, Giovanni Gabrieli placed two choirs in galleries on opposite sides of the church, so that one could answer the other across the space. `jux` gives you two such choirs: one sings the line, the other sings it changed, from the other side.
:::
