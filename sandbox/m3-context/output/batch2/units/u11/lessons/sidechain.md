---
id: swave.sidechain.lesson
title: "Sidechain ducking from the kick"
skill: swave.sidechain
---

The last lesson drew the pumping shape in advance: a swell on every beat, whether the kick plays or not. In a studio the shape usually comes from the kick itself. A compressor sits on the pad, but instead of listening to the pad it listens to the kick drum through a separate input, the **sidechain**. Every time the kick hits, the compressor turns the pad down; when the kick has passed, it lets the pad back up. Engineers call this **ducking**: the pad ducks under the kick. It was a dance-music production trick before synthwave adopted it, and it is now part of the genre's sound.

:::bridge{title="Making room for the soloist"}
When the soloist enters in a concerto, the orchestra drops back, and when the solo phrase ends, it comes forward again. Nobody writes those dynamics into every orchestral part: the players listen and respond to the soloist. A sidechain is that listening, wired in. One part's entries control another part's level, so the accompaniment always makes room at exactly the right moments, including the irregular ones.
:::

## `duckorbit`: the kick ducks a whole bus

Strudel does this per orbit. Put `duckorbit(n)` on the kick, and each kick turns down the whole output of orbit n, then lets it recover {cite doc=duckorbit} {cite src="packages/superdough/superdough.mjs#L511-L513"}. Everything on orbit n ducks together: every part on it, and its reverb and delay too, because they feed the same output {cite src="packages/superdough/superdoughoutput.mjs#L27-L32"} {cite src="packages/superdough/superdoughoutput.mjs#L69-L74"}.

So the first decision is which parts go on which orbit. A typical synthwave plan:

:::diagram
digraph sidechain {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  kick [label="kick\norbit 1\nduckorbit(2)"];
  drums [label="snare, hats\norbit 1"];
  o2 [label="orbit 2\npad + bass\n(and their reverb)"];
  o3 [label="orbit 3\nlead + its hall"];
  out [label="output"];
  kick -> out;
  drums -> out;
  o2 -> out;
  o3 -> out;
  kick -> o2 [style=dashed, label=" ducks"];
}
:::

- **Orbit 1: the drums.** The kick must not be on the orbit it ducks, or it would turn itself down.
- **Orbit 2: the parts that pump.** The pad, and often the bass.
- **Orbit 3: the lead.** It stays steady above the pumping, which is how most synthwave mixes sound.

Three controls set the shape of each duck, all in **seconds** or as a fraction, not in cycles:

- `duckdepth`: how far the level drops. The orbit falls to 1 − √depth of its level {cite src="packages/superdough/superdoughoutput.mjs#L118-L118"}. Depth 1 (the default) is nearly silence (0.01, −40 dB); depth 0.5 falls to 0.29 (about −11 dB); depth 0.3 to 0.45 (about −7 dB) {cite doc=duckdepth}.
- `duckattack`: how long the level takes to **come back** to full, default 0.1 seconds {cite src="packages/superdough/superdoughoutput.mjs#L102-L120"}. Despite its name it is the recovery time, as its reference entry says {cite doc=duckattack}. This is the control that makes the pump: at 100 BPM a beat is 0.6 seconds, so `duckattack(0.4)` swells back over about two thirds of the beat.
- `duckonset`: how long the level takes to fall, default 0, an instant drop {cite doc=duckonset}. A few milliseconds (0.005) can soften a click.

:::play{label="Kick ducks orbit 2 (pad and bass); lead on orbit 3 stays steady"}
setcpm(100 / 4)
$: s("bd*4").bank("RolandTR909").duckorbit(2).duckdepth(0.6).duckattack(0.4)
$: s("~ sd ~ sd, hh*8").bank("RolandTR909")
$: chord("<Am9 F^7 Cadd9 G6>")
  .voicing()
  .s("supersaw")
  .unison(7)
  .detune(0.25)
  .attack(0.3)
  .release(1)
  .lpf(2000)
  .orbit(2)
  .room(0.4)
  .roomsize(6)
  .gain(0.5)
$: note("<a3 f3 c3 g3>")
  .ply(8)
  .s("sawtooth")
  .lpf(400)
  .lpenv(3)
  .lpdecay(0.1)
  .orbit(2)
$: note("<[e5@3 d5] [c5@2 b4@2] a4 ~>")
  .s("sawtooth")
  .attack(0.05)
  .release(0.4)
  .lpf(3000)
  .orbit(3)
  .delay(0.35)
  .delaysync(3 / 16)
  .gain(0.5)
:::

When you first press play, the console may show `duck target orbit 2 does not exist`. A duck only works on an orbit that has already played a note; if the kick's first hit comes before the pad's, that one duck is skipped and the message is logged {cite src="packages/superdough/superdoughoutput.mjs#L206-L211"}. From the next kick on, it works.

## Following the kick, not the clock

The difference from the drawn pump shows as soon as the kick pattern changes. Below, the kick drops out for the last beat of every fourth bar, a common way to set up the next phrase. With `duckorbit`, the pad stops pumping exactly where the kick is missing and holds full level into the next bar. A `tremolosync(4)` pad would keep dipping on that beat, with nothing to make room for.

:::compare{diff="tremolosync(4) on the pad → duckorbit(2) on the kick"}
a:
  label: "Drawn pump: dips on beat 4 of bar 4 although no kick plays"
  code: |
    setcpm(100 / 4)
    $: s("<bd*4 bd*4 bd*4 [bd bd bd ~]>").bank("RolandTR909")
    $: chord("<Am9 F^7 Cadd9 G6>")
      .voicing()
      .s("supersaw")
      .unison(7)
      .detune(0.25)
      .attack(0.3)
      .release(1)
      .lpf(2000)
      .tremolosync(4)
      .tremolodepth(0.6)
      .gain(0.5)
b:
  label: "Sidechain: the pump follows the kick and stops where it stops"
  code: |
    setcpm(100 / 4)
    $: s("<bd*4 bd*4 bd*4 [bd bd bd ~]>")
      .bank("RolandTR909")
      .duckorbit(2)
      .duckdepth(0.6)
      .duckattack(0.4)
    $: chord("<Am9 F^7 Cadd9 G6>")
      .voicing()
      .s("supersaw")
      .unison(7)
      .detune(0.25)
      .attack(0.3)
      .release(1)
      .lpf(2000)
      .orbit(2)
      .gain(0.5)
:::

## The three ways side by side

| | `gain(saw…)` + `segment(16)` | `tremolosync(4)` | `duckorbit` on the kick |
|---|---|---|---|
| Written on | the pad | the pad | the kick (the trigger) |
| Affects | that part's notes | that part's notes | every part on the target orbit, and its reverb and delay |
| Shape | four steps per beat | smooth ramp per beat | instant drop, recovery over `duckattack` seconds |
| Timing | every beat, fixed | every beat, fixed | wherever the kick plays |
| Tempo change | follows (cycles) | follows (cycles) | recovery time is in seconds: retune it |

Choose the drawn pump when you want a fixed, clockwork breathing, or a stepped sixteenth pulse; choose `duckorbit` when the pumping should belong to the kick, including the bars where the kick changes. And because `duckattack` is in seconds, a faster tempo needs a shorter recovery: about two thirds of a beat is a good start (0.4 seconds at 100 BPM, 0.33 seconds at 120 BPM).
