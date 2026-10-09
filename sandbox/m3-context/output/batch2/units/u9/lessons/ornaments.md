---
id: chip.ornaments.lesson
title: "Arcade ornaments: grace notes, trills, slides and the echo channel"
skill: chip.ornaments
---

A pulse wave can't play louder, softer, warmer or breathier the way a singer or a trombonist can, so chip composers put the expression into the notes themselves: grace notes, trills, repeated-note stutters, slides into and away from pitches, vibrato on long notes, and a quieter echo of the melody on a second channel. All of these are written, not performed, which makes them a good fit for code. This lesson collects them on one original melody.

The plain melody, in A minor at 150 BPM (a beat is 0.4 seconds):

:::play{label="The plain melody, 25 % pulse"}
setcpm(150 / 4)
note("<[a4 c5 e5 d5] [c5 b4 a4@2]>").s("pulse").gain(0.5)
:::

**Grace notes and turns, inside the step.** Put the ornament inside the step it decorates, with `@` giving the main note most of the time. `[g#4 a4@3]` plays G sharp for a quarter of the step and A for three quarters: at 150 BPM, a 0.1-second grace note before a 0.3-second A. `[g#4 a4@7]` makes the grace note 0.05 seconds, closer to a crushed acciaccatura. A turn around C is `[d5 c5 b4 c5]`. Because each ornament stays inside its own step, the bar's grid and the other channels are untouched.

:::play{label="Grace notes on beat 1 of each bar (G sharp into A, B into C), a turn on beat 2 of bar 1"}
setcpm(150 / 4)
note("<[[g#4 a4@3] [d5 c5 b4 c5] e5 d5] [[b4 c5@3] b4 a4@2]>").s("pulse").gain(0.5)
:::

**Trills and stutters.** A trill is two notes alternating fast: `[e5 f5]*4` fills a quarter-note step with eight notes, 20 per second at this tempo. A stutter repeats one note: `ply(n)` repeats every event n times inside its own step {cite doc=ply}, so `ply(2)` turns quarter notes into repeated eighths. Contrast them on the same input:

:::compare{diff="ornament: trill on beat 3 → ply(2) on the whole bar"}
a:
  label: Trill on beat 3, [e5 f5]*4
  code: note("a4 c5 [e5 f5]*4 d5").s("pulse").gain(0.5)
b:
  label: Stutter, every note twice with ply(2)
  code: note("a4 c5 e5 d5").ply(2).s("pulse").gain(0.5)
:::

**Slides with a pitch envelope.** The pitch envelope that made the kick drum also makes slides. With a *negative* `penv`, the note starts below its written pitch and rises to it: `penv(-2).pdecay(0.08)` scoops up a whole step in 0.08 seconds, like a singer sliding into a note {cite doc=penv} {cite src="packages/superdough/helpers.mjs#L326-L344"}. A *positive* `penv` starts above and falls; with a long `pdecay`, such as `penv(12).pdecay(0.3)`, it is the falling "power-down" of a game character losing a life. Pattern the amount so only some notes slide: `penv("-2 0 0 0")` scoops into beat 1 only.

:::play{label="A scoop into beat 1 of each bar"}
setcpm(150 / 4)
note("<[a4 c5 e5 d5] [c5 b4 a4@2]>")
  .s("pulse")
  .penv("-2 0 0 0")
  .pdecay(0.08)
  .gain(0.5)
:::

**Vibrato on the long notes.** `vib` sets the vibrato rate in hertz and `vibmod` its depth in semitones {cite doc=vib} {cite doc=vibmod}. Chip vibrato is often wide and obvious, 0.2 to 0.4 semitones (±20 to ±40 cents). The vibrato starts with the note, not after a delay as a singer's would; to keep short notes plain, give `vibmod` a pattern that is 0 on them. Here only the half-note A at the end of bar 2 wobbles:

:::play{label="Vibrato of 6 Hz and 0.3 semitones on the final long note only"}
setcpm(150 / 4)
note("<[a4 c5 e5 d5] [c5 b4 a4@2]>")
  .s("pulse")
  .vib(6)
  .vibmod("<0 [0 0 0.3@2]>")
  .gain(0.5)
:::

**The echo channel.** The NES had no delay effect. Composers faked one by giving the second pulse channel a copy of the lead, a little later and much quieter. `off(time, f)` makes that copy: it adds f(the pattern) shifted by `time` cycles {cite doc=off}. `off(1 / 8, (x) => x.gain(0.2))` adds a copy an eighth note (an eighth of a bar) later at gain 0.2. Set the lead's own `gain` before `off`, so the copy's 0.2 replaces it for the copy only:

:::play{label="Lead with an echo channel: a copy an eighth note later at gain 0.2"}
setcpm(150 / 4)
note("<[a4 c5 e5 d5] [c5 b4 a4@2]>")
  .s("pulse")
  .gain(0.5)
  .off(1 / 8, (x) => x.gain(0.2))
:::

This is not the same as `delay`. A delay feeds the sound back into itself and makes a decaying series of repeats on its bus; the echo channel is one discrete copy, and it is a channel: while it plays, the second pulse can't play harmony. That trade-off is the chip composer's daily decision.

:::bridge{title="Agréments for a machine"}
Baroque keyboard players ornamented their lines because the harpsichord can't swell or shade a note: a trill, a mordent or an appoggiatura gave a long note life and stressed an important beat. A pulse wave has the same limitation, and chip composers reached for the same solution. Write the ornaments where a harpsichordist would put them: on strong beats, on long notes, and at cadences, not on every note.
:::
