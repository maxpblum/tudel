---
id: det.chorus-detune.lesson
title: "Wide pads: spreading detuned voices across the stereo field"
skill: det.chorus-detune
---

A choir that stands in one block sounds like one source. Spread the same singers across the whole stage and the sound surrounds you, even though the notes are the same. With two speakers, "where a sound is" is the balance between left and right. `pan` places a whole sound on that line: 0 is hard left, 0.5 the centre, 1 hard right {cite doc=pan}. Strudel does this with a Web Audio stereo panner {cite src="packages/superdough/superdough.mjs#L842-L847"}.

A **wide** sound is one whose parts come from different places at once. Detuned copies are ideal parts for this: each copy is nearly the same note, so they still fuse into one pitch, but each has its own slow beating, so left and right never sound quite identical. This lesson shows two ways to build it.

**1. Inside `"supersaw"`: `spread`.** The unison voices of `"supersaw"` alternate between the right and the left of centre, and `spread` sets how far apart the two sides are, from 0 to 1 {cite doc=spread}. Unset, it is 0.6 {cite src="packages/superdough/synth.mjs#L157-L157"}. Counting from the lowest-tuned voice, the odd-numbered voices (1, 3, 5…) lean right and the even-numbered ones lean left, and every voice leans by the same amount: with `spread` s, roughly where `pan(0.5 + s / 2)` or `pan(0.5 - s / 2)` would put it {cite src="packages/superdough/worklets.mjs#L543-L572"}. With five voices and the default detune of 0.18 semitones:

:::diagram
digraph spread {
  rankdir=LR;
  node [shape=record, fontname="Helvetica", fontsize=12];
  v [label="{voice|1|2|3|4|5}|{offset|-9 cents|-4.5 cents|0 cents|+4.5 cents|+9 cents}|{side|right|left|right|left|right}|{spread(0)|centre|centre|centre|centre|centre}|{spread(0.6), default|about pan 0.8|about pan 0.2|about pan 0.8|about pan 0.2|about pan 0.8}|{spread(1)|hard right|hard left|hard right|hard left|hard right}"];
}
:::

So the stereo field holds two clusters, one each side, and each cluster contains voices tuned differently. With an odd number of voices the right side gets one more. With `unison(1)` there is nothing to spread, and the single voice stays in the centre {cite src="packages/superdough/synth.mjs#L169-L170"}.

:::compare{diff="spread 0 → 1"}
a:
  label: spread(0), all seven voices in the centre
  code: |
    note("<[a3,c4,e4] [f3,a3,c4]>")
      .s("supersaw")
      .unison(7)
      .detune(0.2)
      .spread(0)
      .attack(0.5)
      .release(1)
      .lpf(1400)
b:
  label: spread(1), voices alternating hard left and hard right
  code: |
    note("<[a3,c4,e4] [f3,a3,c4]>")
      .s("supersaw")
      .unison(7)
      .detune(0.2)
      .spread(1)
      .attack(0.5)
      .release(1)
      .lpf(1400)
:::

Use headphones or sit between your speakers for this one. On a single laptop speaker the two sound nearly the same.

**`spread` versus `pan`.** `pan` moves the whole sound to one place. `spread` pulls the voices apart around the centre, and the sound as a whole stays centred. `pan(0.2)` on a supersaw with `spread(0.6)` gives you a wide sound that sits to the left.

**2. With plain waveforms: layer detuned copies.** `detune` does nothing on a `"sawtooth"`, but you can build the same thing by hand. `superimpose` plays the pattern together with a changed copy of itself {cite doc=superimpose}. Make the copy 0.1 semitones (10 cents) sharp with `add(note(0.1))`, as in the drift lesson, and place the two on opposite sides:

:::play{label="Two sawtooths 10 cents apart, at pan 0.2 and 0.8"}
note("<[a3,c4,e4] [f3,a3,c4]>")
  .s("sawtooth")
  .attack(0.5)
  .release(1)
  .lpf(1400)
  .pan(0.2)
  .superimpose((x) => x.add(note(0.1)).pan(0.8))
:::

Order matters here. A control set later in the chain replaces the earlier value on every event {cite src="packages/core/controls.mjs#L41-L49"} {cite src="packages/core/pattern.mjs#L1024-L1024"}. Put `.pan(0.2)` *before* `superimpose`, and set the copy's position inside the function. A `.pan(0.2)` placed after `superimpose` would move both copies back to 0.2.

`jux` does the hard-panned version in one call: it plays the original at hard left and the changed copy at hard right {cite doc=jux} {cite src="packages/core/pattern.mjs#L2356-L2381"}. `jux((x) => x.add(note(0.1)))` gives two copies 10 cents apart, at pan 0 and pan 1. Hard panning is the widest possible, but on headphones each ear then hears a single plain sawtooth, which can sound like two instruments rather than one wide one. `superimpose` with your own pan values lets you choose.

The difference between the two methods in one sentence: `spread` widens the voices that `"supersaw"` already has, while `superimpose` and `jux` make new copies of any sound, which you then detune and place yourself.

**A name that looks right but isn't: `chorus`.** In studio language a *chorus* effect makes one sound seem like several by mixing in slightly delayed, slightly detuned copies. Strudel's documentation lists `chorus` as "mix control for the chorus effect" {cite doc=chorus}, but the control is only a name {cite src="packages/core/controls.mjs#L709-L718"}. The audio engine this course uses never reads it, and only an experimental alternative engine implements it {cite src="packages/supradough/dough.mjs#L975-L976"}. `note("c4").s("sawtooth").chorus(0.5)` sounds exactly like a plain sawtooth. Build chorus with detuned voices instead, as above.

:::bridge{title="The voix céleste"}
Many organs have a stop called *voix céleste*, a rank of pipes tuned a little sharp on purpose. Drawn together with a normal rank, it makes the slow, gentle undulation of beating. It is the organ builder's version of `superimpose((x) => x.add(note(0.1)))`: a second, slightly sharp copy of the same sound, played together with the first.
:::
