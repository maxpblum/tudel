---
id: zen.section-arrange.lesson
title: "Song sections in order with arrange"
skill: zen.section-arrange
---

Almost every piece in this course so far has been a **loop**: one texture that repeats, perhaps with a part that enters halfway through. A song has **form**: an intro, a verse, a chorus, a breakdown and an outro, each with a texture of its own, in an order the composer chooses. This lesson writes form with `arrange`, which plays whole sections one after another, each for as many cycles as you say {cite doc=arrange}.

## One section after another

`arrange` takes a list of pairs. Each pair is `[cycles, pattern]`: first how many cycles the section lasts, then what it plays. In this course one cycle is one 4/4 bar, so the first number is the section's length **in bars**. When the last section ends, the list starts again from the top: `arrange` loops, like everything else in Strudel.

:::play{label="Two bars of C4 E4, then two bars of G4 B4; the 4-bar form repeats"}
arrange([2, note("c4 e4")], [2, note("g4 b4")]).s("triangle")
:::

:::diagram
digraph form {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];
  a [label="bars 1-2\nnote(\"c4 e4\")"];
  b [label="bars 3-4\nnote(\"g4 b4\")"];
  a -> b;
  b -> a [label=" repeat", style=dashed];
}
:::

A method written after the closing parenthesis, here `.s("triangle")`, applies to every section, just as a method after `stack(...)` applies to every part {cite doc=stack}. The numbers add up to the length of the whole form: 2 + 2 = 4 bars. At the default tempo of 120 BPM a bar lasts 2 seconds, so the form repeats every 8 seconds.

## Name the sections, then write the form

A real section is several parts at once, so build it with `stack`. Then give it a name with *const*. *const* is plain JavaScript, the language Strudel code is written in: `const verse = …` stores the pattern under the name verse, and every later mention of verse means that pattern. Naming changes nothing about the sound. It lets you write each section once and use it as often as the form needs.

Here is a small song in A minor at 100 BPM, in the form A A B A, with two bars per section:

:::play{label="A A B A: an A-minor verse three times, a C-major chorus as the B"}
setcpm(100 / 4)
const verse = stack(
  s("bd ~ sd ~").bank("RolandTR909"),
  note("<a3 f3>").ply(4).s("sawtooth").lpf(600).gain(0.6),
  chord("<Am F>").voicing().s("triangle").gain(0.5),
)
const chorus = stack(
  s("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR909"),
  note("<c3 g3>").ply(8).s("sawtooth").lpf(900).gain(0.6),
  chord("<C G>").voicing().s("supersaw").detune(0.2).lpf(2400).gain(0.4),
)
arrange([2, verse], [2, verse], [2, chorus], [2, verse])
:::

Read the last line and you have the form: eight bars, A A B A. The verse is quiet, with a half-time drum pattern and quarter-note bass. The chorus doubles the bass to eighths, adds the hi-hats and moves to the relative major, C and G. The verse is written once and played three times.

:::bridge{title="The road map at the end of the score"}
A big-band chart or a hymn arrangement often carries a **road map**: Intro, A, A, B, A, Coda, with bar counts, so the band can see the whole form at a glance instead of tracing repeat signs and D.S. markings through the parts. The `arrange` line is that road map. The sections above it are the rehearsal letters; the line at the bottom says in which order they're played.
:::

To leave a bar empty, a rest for the whole band, use `silence`, the pattern with no events {cite doc=silence}: `[1, silence]` is one bar of rest. Keep in mind that Strudel never stops by itself. After the last section the form starts again, so a piece "ends" when you stop playback.

## Each section starts from its own first bar

What happens to a `< >` inside a section? Here the second section steps through four notes, one per bar, but it lasts only three bars:

:::play{label="Two bars of C4, then three bars stepping through E4 F4 G4 A4"}
arrange([2, note("c4")], [3, note("<e4 f4 g4 a4>")]).s("sine")
:::

The first time through, bars 3, 4 and 5 play E4, F4 and G4. The section starts at its **own** first step, E4, even though it enters in bar 3 of the song. The second time through (bars 8 to 10) it plays A4, E4, F4: it picks up where it stopped, at its fourth step.

Why: `arrange` speeds each section up by its length, places the sections side by side in proportion to their lengths, then slows the whole result down by the total {cite src="packages/core/pattern.mjs#L1469-L1473"}. A section's own bars therefore count only while it is playing, as though the section were a separate player who turns the page only when it's their turn.

:::compare{diff="a 3-bar section → a 4-bar section around the same 4-step < >"}
a:
  label: 3-bar section, 4-step < >, a different start on each pass
  code: arrange([2, note("c4")], [3, note("<e4 f4 g4 a4>")]).s("sine")
b:
  label: 4-bar section, 4-step < >, the same E4 F4 G4 A4 on every pass
  code: arrange([2, note("c4")], [4, note("<e4 f4 g4 a4>")]).s("sine")
:::

The rule that follows: **make each section's length a whole multiple of the length of every `< >` inside it.** A 4-chord loop belongs in a section of 4, 8 or 16 bars; a 2-bar riff fits in any even number of bars. Then every pass through the form sounds the same, and the section always begins with its first chord. Signals behave the same way: a `saw.slow(4)` inside a 4-bar section starts its rise at the section's first bar on every pass, which a later lesson uses for risers.

## arrange or mask?

The project lessons brought a part in halfway with `mask("<0 0 0 0 1 1 1 1>")`, which lets the part's events through only in the bars marked 1 {cite doc=mask}. Both tools change what plays over time, but they answer different questions:

- `mask` on one part says **when this part plays**. It suits a steady loop in which one part enters or drops out.
- `arrange` says **what plays in each section**. It suits a piece whose whole texture changes from section to section, and it puts the form in one line instead of one mask string per part.

A later lesson adds a third tool, `seqPLoop`, for parts that enter one by one and overlap.
