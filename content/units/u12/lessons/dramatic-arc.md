---
id: zen.dramatic-arc.lesson
title: "Shaping the arc: tension and release across sections"
skill: zen.dramatic-arc
---

A list of sections is not yet a piece. What makes a form feel like a journey is its **arc**: the music gathers intensity, holds back, builds again and arrives. Electronic music has no conductor to shape a crescendo in the moment, so the arc has to be written into the sections. This lesson plans an arc on paper first, then realises it with tools the course has already taught.

## Six dimensions of intensity

Intensity is not just loudness. Each row below is a dimension you already control, with what moves it toward more tension:

| Dimension | Calmer | More intense | In Strudel |
|---|---|---|---|
| Density | few parts, long notes | many parts, short notes | more parts in the `stack`, `ply`, hats from 8 to 16 per bar |
| Register | middle | wide: high lead, low bass | `anchor`, an octave doubling with `superimpose` |
| Brightness | dark | bright | `lpf` from a few hundred Hz up to several kHz |
| Loudness | quiet | loud | `gain` (halving the gain is about −6 dB) |
| Harmony | tonic, stable | dominant, dissonant, unresolved | a pedal under changing chords, sus chords |
| Key | home | a step higher | `transpose(1)` on the pitched parts |

Moving one dimension at a time sounds mechanical. Moving several together, and in the same direction, is what a listener hears as a build. Moving them in opposite directions is a contrast: a breakdown can be quieter and sparser while its harmony gets more tense.

:::bridge{title="Terraces and hairpins"}
A Baroque organist changes dynamics by changing manuals: whole sections are loud or soft, a **terraced** dynamic. A Romantic orchestra makes **hairpins**: a crescendo that grows through the phrase. Sections in `arrange` are terraces: each sets its own level, brightness and density. Signals inside a section are hairpins: `saw.slow(4)` in a 4-bar section is a crescendo over the whole section. A strong arc uses both.
:::

## Plan the arc before the notes

Here is a plan for a 20-bar piece in A minor at 100 BPM, five sections of four bars, with intensity rising, falling back and rising further:

:::diagram
digraph arc {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  intro [label="Intro, 4 bars\npad alone, dark\nlow"];
  verse [label="Verse, 4 bars\n+ kick, snare, bass\nmedium"];
  chorus [label="Chorus, 4 bars\n+ hats, lead, bright\nhigh"];
  breakdown [label="Breakdown, 4 bars\ndrums out, dominant pedal,\nriser: tension builds"];
  finale [label="Final chorus, 4 bars\neverything, lead doubled\nan octave up: highest"];
  intro -> verse -> chorus -> breakdown -> finale;
}
:::

Two classical habits are in this plan. The highest point comes **near the end**, not in the first chorus, the way a conductor saves the real fortissimo for the last climax. And the breakdown lowers the density but raises the harmonic tension, so the return of the chorus is a release, not just a return.

## The breakdown: a dominant pedal and a riser

The breakdown holds **E3**, the dominant of A minor, in the bass for all four bars, while the chords above it change: F, D minor, A minor, E. Over the pedal these become F over E (a semitone clash between the bass and the chord's root), D minor over E, A minor over E, which is the **cadential six-four**, and finally E itself. Every bar leans on the next, and the whole section leans on the A minor that begins the final chorus.

Above that, a **riser**: white noise in sixteenths whose cutoff and level both grow through the section. Because `arrange` restarts each section's clock (the first lesson of this unit showed why), a `saw.slow(4)` inside a 4-bar section starts at 0 on the section's first bar and reaches its top at the section's last {cite src="packages/core/pattern.mjs#L1469-L1473"}. `rangex` maps it exponentially, so the cutoff doubles at an even rate and the rise sounds even {cite doc=rangex}.

:::signal
shape: saw
min: 0
max: 1
period: 4
cycles: 4
label: "saw.slow(4) inside the 4-bar breakdown: one rise from the first bar to the last, mapped by rangex to 400-8000 Hz for the noise's cutoff"
:::

The sixteenth notes matter: a signal is only heard where a note starts, so sixteen notes per bar give sixteen steps per bar, which the ear hears as a smooth rise.

:::bridge{title="The retransition"}
In sonata form, the end of the development often sits on a long **dominant pedal**, with harmonies piling up over it and a cadential six-four at the top, so that the recapitulation lands like a homecoming. A breakdown is the same gesture in miniature: four bars of V, then the tonic arrives with the whole band.
:::

## The reference piece

The code is laid out in the order of the plan: the parts first, then the sections built from them, and the form on the last line. *pad* is a small function, a recipe with blanks: give it a chord loop and a cutoff, and it returns the pad playing that loop at that brightness. The readability lesson returns to this.

:::play{label="20-bar arc in A minor: intro, verse, chorus, breakdown over an E pedal, final chorus"}
setcpm(100 / 4)
const loop = "<Am F C G>"
const kick = s("bd*4").bank("RolandTR909")
const snare = s("~ sd ~ sd").bank("RolandTR909")
const hats = s("hh*16").bank("RolandTR909").gain("[0.5 0.25]*8")
const bass = note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(700).gain(0.6)
const pad = (chords, cutoff) =>
  chord(chords)
    .voicing()
    .s("supersaw")
    .detune(0.2)
    .attack(0.5)
    .release(1)
    .lpf(cutoff)
    .room(0.4)
    .roomsize(4)
    .orbit(3)
    .gain(0.35)
const lead = n("<[4@3 5] [4 2 0@2] [2@3 4] [6@2 7@2]>")
  .scale("A4:minor")
  .s("square")
  .lpf(3000)
  .delay(0.3)
  .delaysync(3 / 16)
  .orbit(2)
  .gain(0.3)
const pedal = note("e3")
  .ply(8)
  .s("sawtooth")
  .lpf(saw.slow(4).rangex(300, 3000))
  .gain(0.6)
const riser = s("white*16")
  .decay(0.1)
  .sustain(0)
  .lpf(saw.slow(4).rangex(400, 8000))
  .gain(saw.slow(4).rangex(0.05, 0.4))

const intro = pad(loop, 800)
const verse = stack(kick, snare, bass, pad(loop, 1400))
const chorus = stack(kick, snare, hats, bass, pad(loop, 3000), lead)
const breakdown = stack(pedal, pad("<F Dm Am E>", 1600), riser)
const finale = stack(
  kick,
  snare,
  hats,
  bass,
  pad(loop, 4000),
  lead.superimpose((x) => x.add(note(12))),
)

arrange([4, intro], [4, verse], [4, chorus], [4, breakdown], [4, finale])
:::

Listen for the arc, section by section:

- **Intro, bars 1 to 4:** only the pad, filtered at 800 Hz: dark and distant.
- **Verse, bars 5 to 8:** kick and snare come in with the eighth-note bass; the pad opens to 1400 Hz.
- **Chorus, bars 9 to 12:** sixteenth hats, the lead in octave 5, and the pad bright at 3000 Hz.
- **Breakdown, bars 13 to 16:** the drums and the moving bass stop. The bass holds E3 while its filter opens, the chords lean on the pedal, and the noise riser climbs for four bars.
- **Final chorus, bars 17 to 20:** the riser's peak lands on A minor with the full band, the pad brightest of all at 4000 Hz, and the lead doubled an octave higher.

Then the form loops to the intro. Heard after the final chorus, the intro works as an outro: the band falls away and only the pad remains.

## The semitone lift

A final chorus can also go up a semitone, the "truck driver's modulation" of the arcade lessons. Transpose only the pitched parts: drum sounds have no pitch, and `transpose` on a drum part logs an error {cite doc=transpose}. Group the pitched parts in an inner `stack` and transpose that:

:::play{label="The A-minor loop lifted to B flat minor; the drums stay untransposed"}
const drums = s("bd*4, ~ sd ~ sd").bank("RolandTR909")
const pitched = stack(
  note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(700).gain(0.6),
  chord("<Am F C G>").voicing().s("triangle").gain(0.5),
)
stack(drums, pitched.transpose(1))
:::

In the full piece, that is `stack(kick, snare, hats, pitched.transpose(1))` where *pitched* groups the bass, pad, and lead.

A lift changes the harmony around it, too. The breakdown above prepares A minor with its E pedal. Before a chorus in B flat minor, the pedal should be **F**, the new dominant, or the lift sounds like a wrong turn rather than a gear change.

:::bridge{title="Boléro's last gear"}
Ravel's *Boléro* builds for about fifteen minutes by orchestration alone: the same tune, the same snare rhythm, more and more instruments. Only near the very end does it leave C major, jumping up to E major for a few bars before it slides back and collapses. A late key change is the last lever to pull, after density, register and loudness have all been used.
:::
