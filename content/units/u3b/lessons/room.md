---
id: snd.room.lesson
title: Reverb with room
skill: snd.room
---

**Reverb** is the sound of a space: the wash of reflections that goes on after a note stops. Strudel adds it as a **send**. Your sound goes to the output at full level, the **dry** signal, and a copy goes to a reverb whose output is added on top, the **wet** signal {cite src="packages/superdough/superdough.mjs#L938-L955"} {cite src="packages/superdough/superdough.mjs#L973-L980"}.

:::diagram
digraph room {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  note [label="note after gain,\nfilters, effects"];
  send [label="send level\nroom"];
  rev [label="reverb\ndecay time roomsize"];
  out [label="output"];
  note -> out [label=" dry, full level"];
  note -> send -> rev;
  rev -> out [label=" wet"];
}
:::

`room` sets the send level, from 0 to 1 {cite doc=room}. Raising it adds more reverb without making the dry sound quieter. Short notes make the tail easiest to hear, because it fills the silence after each pluck:

:::compare{diff="room: none → 0.6"}
a:
  label: Dry
  code: note("c4 e4 g4 c5").s("triangle").decay(0.15).sustain(0)
b:
  label: room 0.6
  code: note("c4 e4 g4 c5").s("triangle").decay(0.15).sustain(0).room(0.6)
:::

`roomsize` sets how long the tail lasts: the seconds it takes to fade by 60 dB, the reverberation time that acousticians call RT60 {cite src="packages/superdough/reverbGen.mjs#L30-L36"} ([Reverberation](https://en.wikipedia.org/wiki/Reverberation)). Strudel documents 0 to 10 {cite doc=roomsize}; unset, it is 2 seconds {cite src="packages/superdough/reverb.mjs#L28-L28"}. The tail also darkens as it fades, from a 15 000 Hz to a 1000 Hz low-pass {cite src="packages/superdough/reverb.mjs#L28-L28"} {cite src="packages/superdough/reverbGen.mjs#L85-L102"}.

:::play{label="roomsize 6: a six-second tail"}
note("c4 e4 g4 c5").s("triangle").decay(0.15).sustain(0).room(0.6).roomsize(6)
:::

All parts share one reverb unless you separate them (a later lesson covers how), and a new `roomsize` rebuilds it {cite src="packages/superdough/superdoughoutput.mjs#L69-L93"}. Its reference entry says to change it only sparingly {cite doc=roomsize}. So pattern `room` if you like, but set `roomsize` once per piece.

:::bridge{title="Rehearsal room and cathedral"}
The same choir sounds close and exact in a carpeted rehearsal room and distant in a stone church. The church's long reverberation time is `roomsize`. How much of it reaches you compared with the direct sound, as when you move from the front row to the back, is `room`.
:::
