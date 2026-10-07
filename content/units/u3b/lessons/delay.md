---
id: snd.delay.lesson
title: Tempo-synced delay
skill: snd.delay
---

A **delay** repeats a sound as echoes. Like reverb it is a send: the dry note plays at full level, and `delay` sets how loud the copy sent to the echo is, from 0 to 1 {cite doc=delay} {cite src="packages/superdough/superdough.mjs#L929-L936"}.

`delaysync` sets the time between echoes **in cycles** {cite doc=delaysync}. Strudel turns it into seconds with the current tempo {cite src="packages/superdough/superdough.mjs#L503-L503"} {cite src="packages/superdough/util.mjs#L76-L78"}, so the echoes stay on the grid when `setcpm` changes. In this course one cycle is one bar of 4/4, so 1/8 of a cycle is an eighth note: 0.25 seconds at 120 BPM. The default, 3/16 of a cycle {cite src="packages/superdough/superdough.mjs#L194-L194"}, is three sixteenths, a dotted eighth. Write it as a division, such as `delaysync(3 / 16)`.

:::compare{diff="delaysync 1 / 8 → 3 / 16"}
a:
  label: Echoes an eighth note later
  code: |
    note("c5 g4 e5 g4")
      .s("triangle")
      .decay(0.1)
      .sustain(0)
      .delay(0.5)
      .delaysync(1 / 8)
b:
  label: Echoes a dotted eighth later
  code: |
    note("c5 g4 e5 g4")
      .s("triangle")
      .decay(0.1)
      .sustain(0)
      .delay(0.5)
      .delaysync(3 / 16)
:::

With quarter-note plucks, eighth-note echoes fill the offbeats; dotted-eighth echoes fall between the beats and make a running sixteenth-note pattern.

`delayfeedback` is how much of each echo is fed back to make the next, default 0.5 {cite src="packages/superdough/superdough.mjs#L193-L193"}. Each echo is that fraction of the one before {cite src="packages/superdough/feedbackdelay.mjs#L3-L17"}, so 0.5 makes each one 6 dB quieter. Values above 0.98 are clamped {cite src="packages/superdough/superdoughoutput.mjs#L53-L58"}. At 0 the delay switches off entirely {cite src="packages/superdough/superdough.mjs#L930-L930"}; for a single clear echo, use a small value such as 0.1 (the second echo is then 20 dB below the first).

:::diagram
digraph delay {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  note [label="note"];
  send [label="send level\ndelay"];
  line [label="wait\ndelaysync cycles"];
  fb [label="feedback\ndelayfeedback"];
  out [label="output"];
  note -> out [label=" dry"];
  note -> send -> line -> out;
  line -> fb -> line;
}
:::

The gap between echoes can be at most 1 second (the Web Audio [default maximum](https://www.w3.org/TR/webaudio/#DelayOptions)) {cite src="packages/superdough/feedbackdelay.mjs#L1-L6"}: half a bar at 120 BPM.

:::bridge{title="A canon at the unison"}
A delay sings a canon at the unison with your line: each entry comes `delaysync` later and softer by `delayfeedback`. Tie the entries to the beat, and the canon stays in time at any tempo.
:::
