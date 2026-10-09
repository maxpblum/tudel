---
id: spop.drum-machine.lesson
title: "Drum-machine grooves on the 808 and 909"
skill: spop.drum-machine
---

Synth-pop of the early 1980s was built on **drum machines**: boxes that play a programmed pattern with perfect timing and no drummer. The Roland TR-808 (1980) has a long, booming bass drum and a dry clap; the TR-909 (1983) has a shorter, punchier bass drum and sampled cymbals. Other bands used other machines (Human League's *Dare* used a Linn LM-1, New Order's "Blue Monday" an Oberheim DMX), but the way of writing is the same, and this course uses the two Roland banks: `bank("RolandTR808")` and `bank("RolandTR909")` {cite doc=bank}.

Most of these machines are **step sequencers**: a bar is a row of 16 buttons, one per sixteenth note, and each drum has its own row. That is exactly a 16-step mini-notation string, one per drum, one `$:` line each. A few patterns cover most of the genre.

**Four-on-the-floor** puts the bass drum on every beat, the clap on beats 2 and 4, and the hi-hats on every sixteenth, with an open hi-hat on each off-beat eighth ("and"). It comes from disco and drives the dance end of synth-pop:

:::play{label="Four-on-the-floor on the 909, 120 BPM"}
setcpm(120 / 4)
$: s("bd*4").bank("RolandTR909")
$: s("~ cp ~ cp").bank("RolandTR909")
$: s("[hh hh oh hh]*4").bank("RolandTR909").gain("[0.7 0.3 0.5 0.3]*4")
:::

**The backbeat with a syncopated kick** keeps the snare on 2 and 4 but moves bass drums off the beat. On an eighth-note grid, a kick on beat 1, the "and" of 2 and the "and" of 3 pushes the bar forward:

:::abc
X:1
M:4/4
L:1/8
K:C clef=perc
F z c F z F c z | F z c F z F c z |
:::

:::play{label="Backbeat with a syncopated kick on the 808"}
setcpm(116 / 4)
$: s("bd ~ sd bd ~ bd sd ~").bank("RolandTR808")
$: s("hh*16").bank("RolandTR808").gain("[0.7 0.3 0.5 0.3]*4")
:::

The bass drum and snare share one line here because they never sound together: the mini-notation reads like the staff above, bottom space for the bass drum and third space for the snare.

**Accents live in a gain pattern.** A drum machine plays every step at the same strength, so a row of sixteen hi-hats sounds like a typewriter. The 808 has a single accent row that boosts whole steps. In Strudel you write the accents as a `gain` pattern laid over the hits {cite doc=gain}. `gain` multiplies the amplitude (default 0.8), so halving it is about −6 dB. `"[0.7 0.3 0.5 0.3]*4"` gives each beat a strong, weak, medium, weak shape: 0.7 on the beat, 0.5 on the "and", 0.3 on the two "e"s and "a"s. The pattern has 4 steps repeated 4 times, so each step lands on one sixteenth:

:::compare{diff="no accents → gain [0.7 0.3 0.5 0.3]*4"}
a:
  label: Every step equal
  code: s("hh*16").bank("RolandTR808").gain(0.5)
b:
  label: Accented sixteenths
  code: s("hh*16").bank("RolandTR808").gain("[0.7 0.3 0.5 0.3]*4")
:::

**The big snare.** In 1980, engineer Hugh Padgham and drummer Phil Collins found the sound that defined 80s drums, on Peter Gabriel's third album: a snare recorded with a huge, bright room sound that a noise gate cut off abruptly, about a quarter of a second later. The snare sounds enormous, and then the space vanishes before the next beat. Synth-pop producers put the same effect on drum machines.

Strudel has no noise gate, so you can't cut a long tail off. What you can do is the next best thing: send the snare loudly into a reverb with a *short* tail. `room` is the send level and `roomsize` the tail length in seconds (the time to fade by 60 dB) {cite doc=room} {cite doc=roomsize}. With `roomsize(0.4)` the tail lasts 0.4 seconds, less than one beat at 120 BPM (0.5 seconds), so it is gone before the next hit. A real gated reverb stays at full size until it stops; this one fades. It gives the "big, then gone" impression, not the hard cut.

The reverb's size belongs to the orbit, not to the note: every part on the same orbit shares one reverb, and a new `roomsize` rebuilds it {cite src="packages/superdough/superdoughoutput.mjs#L69-L93"}. So put the snare on its own orbit, and the pads you add later can have a long hall on another one {cite doc=orbit}:

:::compare{diff="roomsize 3 → 0.4 (and its own orbit)"}
a:
  label: Long hall, the tail washes over the groove
  code: |
    setcpm(116 / 4)
    $: s("bd ~ ~ bd ~ bd ~ ~").bank("RolandTR808")
    $: s("~ sd ~ sd").bank("RolandTR808").room(0.8).roomsize(3).orbit(2)
b:
  label: Short, loud room, big and then gone
  code: |
    setcpm(116 / 4)
    $: s("bd ~ ~ bd ~ bd ~ ~").bank("RolandTR808")
    $: s("~ sd ~ sd").bank("RolandTR808").room(0.8).roomsize(0.4).orbit(2)
:::

Two more 808 colours: the cowbell `"cb"` (the 909 has none) and the clap `"cp"`, often layered with the snare on 2 and 4 as `"~ [sd,cp] ~ [sd,cp]"`.

:::bridge{title="Accents are the conductor's beat pattern"}
A conductor's four-beat pattern is not four equal gestures: beat 1 is the strongest, beat 3 next, beats 2 and 4 lighter. Inside each beat the sixteenths have the same hierarchy one level down: the beat, then the "and", then the "e" and "a". A gain pattern like 0.7, 0.3, 0.5, 0.3 writes that metrical hierarchy into the hi-hats, which the machine itself can't feel.
:::
