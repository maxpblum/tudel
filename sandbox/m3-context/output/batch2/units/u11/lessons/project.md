---
id: swave.project.lesson
title: "Synthwave song project: planning and building a cue"
skill: swave.project
---

The project puts the whole unit together: an eight-bar synthwave cue with drums, a driving bass, a pumping detuned pad, and a soaring lead, each in its proper space. This lesson walks through one way to plan and build it. The project exercises then ask you to build your own, checkpoint by checkpoint.

:::bridge{title="Score layout before notes"}
Before writing a note of an orchestral piece you decide the forces and lay out the score: which instruments, on which staves, in what order. A synthwave cue has a score layout too, and the one decision that is hard to change later is which parts share an orbit. Make it first.
:::

## Step 0: the plan

Decide four things before any sound:

1. **Tempo and key.** Synthwave lives between about 80 and 120 BPM. 100 BPM in A minor is a safe start; slower (85 to 95) feels like a sunset drive, faster with a harder kick (110 to 120 and above) moves toward the darker style called darksynth.
2. **The chord loop.** Four bars, one chord per bar, usually a minor-key loop. For example i–VI–III–VII: Am9 F^7 Cadd9 G6.
3. **The orbits.**
   - Orbit 1: drums, nearly dry. The kick carries `duckorbit(2)`.
   - Orbit 2: pad and bass, the parts that pump, with the pad's long hall.
   - Orbit 3: the lead, with its own echo and hall.
4. **The arc.** Eight bars is enough for two four-bar phrases: the first without the lead, the second with it. A kick dropout on the last beat of bar 4 marks the join.

:::diagram
digraph plan {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  o1 [label="orbit 1\nkick (ducks 2), snare, hats"];
  o2 [label="orbit 2\npad + bass\nhall 6 s"];
  o3 [label="orbit 3\nlead\necho 3/16, hall 5 s"];
  out [label="output"];
  o1 -> out;
  o2 -> out;
  o3 -> out;
  o1 -> o2 [style=dashed, label=" duckorbit"];
}
:::

## Steps 1 to 4: build in layers

Build so that the piece plays at every step. Each layer below is one `$:` line, added under the previous ones.

1. **Drums.** Four-on-the-floor kick, snare on beats 2 and 4, eighth-note hats, from the 909 bank. The kick drops its last beat in the fourth bar of each phrase: `lastOf(4, (x) => x.struct("x x x ~"))` {cite doc=lastOf}.
2. **Bass.** Roots once per bar, `ply(8)` for eighths, filtered sawtooth with a short filter envelope. Orbit 2.
3. **Pad.** The extended chords on a seven-voice supersaw, slow attack, long release, orbit 2 with a 6-second hall. Now the kick's `duckorbit(2)` has something to duck: check that pad and bass dip on each kick.
4. **Lead.** Long notes, two-voice supersaw, dotted-eighth echo and its own hall on orbit 3. Make it enter in bar 5 with `mask("<0 0 0 0 1 1 1 1>")`: `mask` lets events through only where its pattern is 1 {cite doc=mask}, and the eight steps of `< >` take one bar each.

Then **balance**: the kick and snare clearly in front, the bass audible on laptop speakers, the pad a wide wall behind, the lead on top but not shouting. Adjust `gain` part by part, by ear.

## The reference cue

:::play{label="Eight-bar synthwave cue: drums, bass, pumping pad, lead from bar 5"}
setcpm(100 / 4)
$: s("bd*4")
  .lastOf(4, (x) => x.struct("x x x ~"))
  .bank("RolandTR909")
  .duckorbit(2)
  .duckdepth(0.6)
  .duckattack(0.4)
$: s("~ sd ~ sd, hh*8").bank("RolandTR909").room(0.1).gain(0.8)
$: note("<a3 f3 c3 g3>")
  .ply(8)
  .s("sawtooth")
  .lpf(400)
  .lpenv(3)
  .lpdecay(0.1)
  .orbit(2)
  .gain(0.7)
$: chord("<Am9 F^7 Cadd9 G6>")
  .voicing()
  .s("supersaw")
  .unison(7)
  .detune(0.25)
  .spread(0.8)
  .attack(0.6)
  .release(1.5)
  .lpf(sine.range(1000, 2400).slow(8))
  .orbit(2)
  .room(0.5)
  .roomsize(6)
  .gain(0.45)
$: note("<[e5@3 g5] [a5@2 g5 e5] [g5@2 d5 c5] [d5@2 ~@2]>")
  .mask("<0 0 0 0 1 1 1 1>")
  .s("supersaw")
  .unison(2)
  .detune(0.1)
  .vib(5)
  .vibmod(0.1)
  .attack(0.05)
  .release(0.5)
  .lpf(2800)
  .orbit(3)
  .delay(0.4)
  .delaysync(3 / 16)
  .delayfeedback(0.45)
  .room(0.4)
  .roomsize(5)
  .gain(0.5)
:::

Listen through it as a checklist:

- Bars 1 to 4: drums, bass and pad. The pad and the bass dip on every kick and swell back within about two thirds of a beat. On beat 4 of bar 4 there is no kick, and the pad holds steady into bar 5.
- Bars 5 to 8: the lead enters on top. It does **not** pump, because it is on orbit 3, and its dotted-eighth echoes fill the half bar of rest at the end of bar 8.
- Throughout: the pad's cutoff slowly opens and closes over the eight bars, so the second phrase is brighter than the first.

## When something sounds wrong

- **The lead pumps too.** It is on orbit 2 (or has no `orbit`, which means orbit 1 alongside the drums, where it won't pump but will share the drums' space). Give it `orbit(3)`.
- **Nothing pumps.** The kick has no `duckorbit`, or the pad and bass are not on the orbit it names. A console message `duck target orbit 2 does not exist` on the very first bar is harmless.
- **The reverb sounds wrong or keeps changing.** Two parts with different `roomsize` share an orbit. Each orbit should have one `roomsize`.
- **The pad smothers everything.** Lower its `gain` before touching anything else; five chord tones of seven voices each add up quickly.
- **The bass disappears on laptop speakers.** Raise its filter (`lpf`) a little rather than its gain; on small speakers you hear a bass by its upper harmonics.
