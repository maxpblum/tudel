# M1 prose-style review (STYLE_TIPS.md §1-§8)

Reviewer: independent; read as the learner (advanced classical musician, knows Web Audio). No lesson was edited.
Scoring: ✅ follows / ⚠️ partly / ❌ fails. Word counts are prose only (frontmatter, directive bodies, `{cite}` tags and link URLs excluded; `:::bridge` text included).

## Summary

| Lesson | §1 | §2 | §3 | §4 | §5 | §6 | §7 | §8 | Words (target ~300) |
|---|---|---|---|---|---|---|---|---|---|
| waveforms | ❌ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | 358 (over) |
| lowpass | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 332 (over) |
| highpass | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 290 (ok) |
| filter-sweep | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 322 (over) |
| amp-envelope | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | 334 (over) |

Totals: 0 critical blockers; 3 ❌ cells, 21 ⚠️ cells; 26 findings below. 4 of 5 lessons are over the word budget.

## Findings

Severity: H = fix before shipping, M = should fix, L = polish.

### waveforms.md

- **W-01 (H)** waveforms:42-48, §1. Quote: `note("c3 c4 bb3 g3").s("sawtooth")` vs `.s("square")`. Problem: this is the compare that notes.md says is "still about an octave too low". Its lowest and first note is c3 (131 Hz), and the square/saw difference is mostly in harmonics 2, 4, 6, which laptop speakers handle poorly at this pitch. Not addressed. Fix: `note("c4 c5 bb4 g4")` for both (C4-C5, 262-523 Hz). Optionally lengthen the demo by using a slower step so each note rings for about 1 s.
- **W-02 (M)** waveforms:13, §2/§6. Quote: "`b` is flat and `#` sharp". Problem: `b` is also the note name B, and the same sentence goes on to say "the semitone below c4 is b3". A reader will read "b is flat" as "the note b is flat". Fix: "A letter followed by `b` is flat (`eb4`) and followed by `#` is sharp (`f#4`)."
- **W-03 (L)** waveforms:13, §2. Quote: "c4 is middle C, MIDI 60". MIDI is not a word the learner has been given. Fix: "(MIDI note number 60, the numbering Web Audio tools use)" or drop "MIDI 60" and keep "a4 is 440 Hz".
- **W-04 (M)** waveforms:15, §3. Quote: "It fits a string's steps (its space-separated entries) into one cycle, equally long unless marked otherwise." Problem: notes.md asked about `"c c"`, five notes, and double spaces. The lesson now answers only the four-note case. The reader's likeliest next questions ("what about two notes? five?") are left open. Fix, one added sentence: "Two steps, `"c4 g4"`, are two half notes; five steps would each take a fifth of the bar, which is a quintuplet. Extra spaces change nothing."
- **W-05 (M)** waveforms:10 vs :31, §2. Quote (demo 1): `.s("<sawtooth square triangle sine>")`; definition is 21 lines later: "`< >` ... plays one entry per cycle". Problem: `< >` is used before it is defined. Fix: before the first demo, add "Angle brackets `< >` play one entry per cycle, so each sound gets one bar." and delete the late sentence "The exception to one cycle per string is `< >`: ...".
- **W-06 (M)** waveforms:31, §3/§4. Quote: "The exception to one cycle per string is `< >`". Problem: a `< >` string still occupies each cycle; what differs is that it spreads entries over cycles. "Exception" invites confusion with the step rule. Fix: see W-05.
- **W-07 (M)** waveforms:21-28, §5. Quote: "`*2` plays a step twice inside its own time. `!2` repeats it as a second full-length step, so the string gains a step; here the c5 is dropped to keep four beats:" Problem: the demos use different inputs (`c4 e4*2 g4 c5` vs `c4 e4!2 g4`), and the tip wants one-sentence contrast on the same input. The two clauses are also split from the demos. Fix: "On `e4`: `e4*2` squeezes two e4s into one step; `e4!2` adds a second full-length step. (So `!2` makes five steps from four; the second demo drops c5 to stay at four beats.)" Better: replace the two `:::play` blocks with one `:::compare` with a = `note("c4 e4*2 g4").s("square")`... no, that has three steps; use `note("c4 e4*2 g4 c5")` vs `note("c4 e4!2 g4 c5")` and add "the second has five steps, so each is a fifth of a bar" only if quintuplets are welcome. The simplest and cleanest option is to keep the present demos and add the one-sentence contrast above.
- **W-08 (L)** waveforms:31, §1/§4. Quote: "Likewise `"c3*8"` puts eight notes in one cycle". Problem: no demo plays it, and it sets c3, the register this lesson was asked to avoid. Fix: use `"c4*8"` here, or cut the sentence and introduce `*8` where first played (see Word cuts).
- **W-09 (M)** waveforms:33-40, §7. Quote: "sawtooth: every harmonic, the nth at 1/n strength ... triangle: odd harmonics ... falling off as 1/n²". Problem: shapes and spectra are described but not drawn. Fix: add a plot of the four waveforms (one cycle each, same scale) and ideally a harmonic bar chart. Needs a `:::signal`-style or new `:::spectrum` directive; at minimum, the four wave shapes via `:::signal`.
- **W-10 (L)** waveforms:37, §8. Quote: "Hollow, like a clarinet in the chalumeau register". Problem: "chalumeau" is clarinet-specific jargon and the clarinet is not one of the learner's instruments. Fix: "Hollow and reedy, like the low notes of a clarinet" or "a hollow *oh*-less sung *eh*" (no). Keep the first, drop the link.
- **W-11 (L)** waveforms:51 vs :37, wordiness. The last paragraph repeats the square bullet. See cuts.

### lowpass.md

- **L-01 (M)** lowpass:54-55, §1. Quote: `lpq("<1 10 20 30>")` with `lpf(800)` on a saw at c3. Problem: lpq 30 is +30 dB (about 32x amplitude) at 800 Hz, close to the 6th harmonic of c3; this will be painfully loud or clip, and a listener on laptop speakers will turn the volume down and then lose the quiet bars. Fix: add `.gain(0.3)` (or the `postgain`) to this demo and mention "lpq 30 is loud", or cap the demo at `<1 10 20>`. Needs a check by ear.
- **L-02 (L)** lowpass:9-15, §1. `note("c3 c4 bb3 g3")` with `lpf(400)`: leaves only 131 and 262 Hz partials of c3. The contrast with 2000 Hz is large, so audible, but c3 under a 400 Hz cutoff will be very quiet on laptop speakers. Fix: raise to `note("c4 c5 bb4 g4")` and use `lpf(800)` vs `lpf(3000)`, or leave and accept. Judgement call.
- **L-03 (L)** lowpass:7, §2. Quote: "`lpf` sets the cutoff of a low-pass filter in hertz". "Cutoff" is not defined. Fix: "`lpf` sets the **cutoff**, the frequency above which a low-pass filter turns partials down."
- **L-04 (L)** lowpass:18, §6. Quote: "a boost just below the cutoff ... At the cutoff frequency itself, the boost equals `lpq`". Problem: "just below" and "at" read as contradictory. Fix: "a boost around the cutoff".
- **L-05 (L)** lowpass:54, §6. Label "lpq 1, 10, 20, 30" has no unit. Fix: "lpq 1, 10, 20, 30 dB". Same for plot curve labels (`lpq 10` -> `lpq 10 dB`).
- **L-06 (L)** lowpass:18, readability. The resonance paragraph is one 150-word block with seven citations before the learner sees the plots. Fix: end it with "The two plots below show it." and split at "Strudel passes it...".

### highpass.md

- **H-01 (M)** highpass:23-26, §1. Quote: `note("c3,eb3,g3,bb3")` with `hpf(100)` vs `hpf(1000)`. Problem: the difference being taught is the loss of the 131-233 Hz "body", which laptop speakers reproduce poorly anyway; the compare may sound much less different than described. Fix: `c4,eb4,g4,bb4` with `hpf(100)` vs `hpf(1500)`. The dB figures in line 29 must then be recomputed (fundamentals 262-466 Hz at a 1500 Hz cutoff would drop about 28 to 36 dB roughly; recompute, do not trust this estimate).
- **H-02 (M)** highpass:31, §2. Quote: "then `gain`, then the low-pass". `gain` is not defined in this lesson (amp-envelope defines it). Fix: "then `gain` (overall level)".
- **H-03 (M)** highpass:7-20, §5. Problem: the lesson calls hpf the mirror of lpf but never shows both on the same input. Fix: one `:::compare` with `note("c3,eb3,g3,bb3").s("sawtooth").lpf(1000)` vs `.hpf(1000)` (or c4, matching H-01), diff "lpf 1000 -> hpf 1000"; one sentence: "`lpf` keeps what is below the cutoff, `hpf` keeps what is above."
- **H-04 (L)** highpass:47, §6/§7. Quote: "you keep only a band, here roughly 600 to 2500 Hz." Problem: the band is not drawn, and "keep" overstates; the edges slope at 12 dB per octave. Fix: add a plot showing both curves (if the filter plot can overlay lowpass and highpass), or say "keep mostly a band".
- **H-05 (L)** highpass:9, §6. Plot title "High-pass at the two cutoffs below" -> "High-pass at 100 Hz and 1000 Hz (default resonance)".
- **H-06 (L)** highpass:54, §8. Quote: "Mixing engineers use it the same way: they high-pass the sustained chords and the melody so the bass line owns the low register". Mixing is outside the learner's stated background, and the arranger half already carries the point. Fix: drop the mixing-engineer clause.

### filter-sweep.md

- **S-01 (M)** filter-sweep:12 and :27, §1. Quote: `note("c3*8").s("sawtooth").lpf("<300 600 1200 2400>")`. Problem: with a 300-400 Hz cutoff the c3 sound is almost only 131-262 Hz, barely audible on laptop speakers, so the first bars of both sweeps are weak. Fix: `c4*8` (262 Hz). Then lpf 300 leaves a near-sine at 262 Hz, which is audible and still dark.
- **S-02 (L)** filter-sweep:43, §7. Quote: "so it seems to rush at the bottom and crawl at the top." Problem: a described shape not drawn. Fix: plot `saw.range(200,4000)` with octave gridlines, or cut (see cuts).
- **S-03 (L)** filter-sweep:30-39, §5. The saw shape is plotted but not played. Fix: add a `:::play` with `saw.range(400,2000).slow(4)`, so the two sweeps can be heard side by side.

### amp-envelope.md

- **A-01 (M)** amp-envelope:7, §2/§3. Quote: "`adsr("a:d:s:r")` sets all four in one call". Problem: the colon-separated string is never shown with numbers, and "a:d:s:r" is a bare symbol. Fix: "`adsr("0.4:0.1:1:1")` sets attack 0.4 s, decay 0.1 s, sustain 1 and release 1 s, in that order." (Check the numbers against the pad.)
- **A-02 (M)** amp-envelope:9 and :27, §2. Quote: "The first plot is the pluck ... the second the pad." Problem: "pluck" and "pad" are synth labels that are never defined. Fix: "A *pluck* is struck and dies away (as a plucked string does); a *pad* swells in slowly and lingers."
- **A-03 (M)** amp-envelope:11-25, §7. Problem: the two `:::envelope` plots have no title or label (the component only takes the four stages and `hold`; see `apps/web/src/ui/plots.tsx` `EnvelopePlot`), and the y-axis shows 0 and 1 with no unit. Identification relies on order ("the first plot ... the second"). `hold: 0.5` is not explained in prose. Fix: add a `title` or `label` field ("Pluck", "Pad") and a sentence "both plots assume a 0.5-second note"; label y "level".
- **A-04 (M)** amp-envelope:36, §4. Quote: "Each note here is a quarter of a cycle, 0.5 seconds". Problem: the premise that four notes share one cycle is not stated. Fix: "The four notes share one cycle, so each lasts a quarter of a cycle, 0.5 seconds."
- **A-05 (M)** amp-envelope:38, §3/§6. Quote: "Set any stage and unset attack and decay become 0.001 s. Sustain becomes 1 (as in the pad), unless you set `decay` without `sustain`; then it is 0.001." Problem: "stage" is not defined; what happens to unset release is not stated (an obvious "and release?" question); the rule has three exceptions in two lines. Fix: "Set any one of the four and the unset attack and decay become 0.001 s; sustain becomes 1, unless you set `decay` alone, which sets sustain to 0.001; release keeps 0.01 s [verify against helpers.mjs]." Then drop "Still write `.sustain(0)`..." or keep as one clause.
- **A-06 (M)** amp-envelope:27-34, §5. Problem: decay (fall while the note is held) and release (fall after the note ends) are look-alikes named in STYLE_TIPS §5 itself, and the only comparison changes decay, sustain, attack and release at once. Fix: add a second compare on the same input, `.decay(0.3).sustain(0)` vs `.release(0.3)`, diff "decay 0.3 s vs release 0.3 s", with the sentence "decay falls while the note is held; release falls after it ends." (Use a sustain level and note length so the difference is audible; check by ear.)
- **A-07 (L)** amp-envelope:40, §4. Quote: "four times per bar". The previous paragraph speaks of cycles. Fix: "four times per cycle (this course's bar)".
- **A-08 (L)** amp-envelope:30, 33, §1. `note("c3 eb3 g3 bb3")` with `lpf(1500)`. Acceptable by the tip (C3 is the floor), but the pad's slow attack at c3 is soft. Fix: use `c4 eb4 g4 bb4`.

### Cross-cutting

- **X-01 (L)** Several `:::compare{diff=...}` strings carry no units ("hpf 100 → 1000", "lpf 400 → 2000"). Fix: "hpf 100 Hz → 1000 Hz".

## Word-count review and cuts (no needed content lost)

Counts include bridges. Note that several fixes above add words; cuts must pay for them.

- **waveforms 358 -> ~310.** (1) Cut the sentence "`"c4,e4,g4"` stacks notes into a chord." (-9; the highpass lesson explains the comma). (2) Cut the final paragraph (-25) and fold into the square bullet: "odd harmonics only (no 2nd, the octave above), also 1/n". (3) Shorten the bullets by removing "Bright and buzzy," "purer than any instrument" (-8). (4) Drop "Without `s` you get a triangle, but write it anyway." only if the budget remains tight (-11). Additions needed (W-04, W-05, W-07) add about 45 words, so the net is about 355; accept up to about 330 by trimming citations' neighbours, or move the `*`/`!` section to its own lesson.
- **lowpass 332 -> ~300.** (1) Replace "Strudel passes it straight to the Q of a Web Audio BiquadFilterNode, which for low-pass and high-pass filters Web Audio reads in decibels" with "`lpq` is the Q of a Web Audio BiquadFilterNode, read in decibels for low-pass" (-12). (2) In the sine paragraph, drop "and two octaves below, about 24 dB" (-8). (3) Drop "useful values span hearing, about 20 to 20000 Hz" (-9) if the plots show the range.
- **filter-sweep 322 -> ~270.** (1) Reduce the rangex paragraph to "`range` is linear in hertz, but the ear hears octaves, so a linear saw from 200 to 4000 Hz spends half its time above 2000 Hz. `rangex` gives each octave equal time; a later lesson uses it." (-35). (2) Drop the bridge's last sentence "You will often use both ..." (-17).
- **amp-envelope 334 -> ~280.** (1) Compress line 38 (-20, see A-05). (2) Drop "Strudel's reference calls it exponential, but by default it is" (-12) -> "`gain` is a plain multiplier by default". (3) Drop the bridge's last sentence about staccato/legato (-20). (4) Drop "as the plots show" and "Still write `.sustain(0)` ..." (-14). Additions A-01, A-02, A-04 add about 35.
- **highpass 290:** within budget.

## notes.md items

| # | Note | Status |
|---|---|---|
| 1 | Waveforms: first demo too low, bump an octave | Addressed (c4 eb4 g4 bb4) |
| 2 | Parenthetical that b3 is below c4 | Addressed (line 13), but see W-02 ("`b` is flat") |
| 3 | Drop "U1"; use "This lesson teaches only a few symbols, and later lessons cover the rest" | Addressed, verbatim |
| 4 | "Spaces divide the bar evenly" unclear (c c? five notes? double spaces?) | Partly: four-note example and "equally long unless marked otherwise"; five notes and double spaces unanswered (W-04) |
| 5 | Why "c2*8" is eighths | Addressed (eight notes, one cycle, course treats cycle as bar of 4/4, so eighths) |
| 6 | "sound name" bare in "one cycle is one bar" sentence | Addressed (phrase removed) |
| 7 | Bar vs cycle: Strudel concept or course convention? | Addressed ("Strudel has no bars; this course treats one cycle as one bar of 4/4") |
| 8 | Saw vs square demo still an octave too low | **Not addressed** (W-01) |
| 9 | Difference between `!` and `*` unclear | Partly (W-07) |
| 10 | `lpq` "sets the filter's Q" unintelligible; resonance not understood | Addressed (resonance first, what it sounds like, plot, Q in parentheses) |
| 11 | "0 to 50" needs dB | Addressed |
| 12 | Plots of several Q at one cutoff and several cutoffs at one Q, labelled | Addressed (both families, labelled; unit tweak L-05) |
| 13 | Sine: "changes little" -> exact, and "if the input is only a sine wave" | Addressed |
| 14 | Swell box analogy removed; use vowel | Addressed (bucket mute, formant, vowel; no swell box) |

## Resolutions

Word counts after fixes (same counting rule): waveforms 313, lowpass 297, highpass 286, filter-sweep 277, amp-envelope 305. `pnpm verify` is green and the snapshots were updated and reviewed.

| ID | Resolution |
|---|---|
| W-01 | Fixed. The compare is now `c4 c5 bb4 g4`. At c3 the even harmonics that carry the difference (262, 523 Hz…) start near laptop-speaker roll-off. At c4 they start at 523 Hz, which is clearly reproduced, and the compare matches the first demo's octave. |
| W-02 | Fixed: "A letter followed by `b` is flat (eb4), followed by `#` sharp (f#4)." |
| W-03 | Fixed. MIDI numbers dropped. "c4 is middle C and a4 is 440 Hz" kept, with the b3 boundary note. |
| W-04 | Fixed: `"c4 g4"` is two half notes, five steps are a quintuplet, and extra spaces change nothing (cited to the krill `ws` rule, L98). |
| W-05 | Fixed. `< >` is defined before the first demo, and the late sentence is deleted. |
| W-06 | Fixed (see W-05); the "exception" wording is gone. |
| W-07 | Fixed. One-sentence contrast on `e4`: "`e4*2` squeezes two e4s into one step; `e4!2` adds a second full-length step, so the second demo drops c5 to keep four beats." The orchestrator's four-beat demos are kept. |
| W-08 | Fixed: `"c4*8"`. |
| W-09 | Justified, not drawn. `:::signal` would draw the shapes, but its caption is hard-coded to "one period = N cycles (bars) · x axis in cycles" (apps/web/src/ui/plots.tsx L132). An audio waveform's period is a few milliseconds, so the plot would tell the learner the wrong time scale, which conflicts with §4. A spectrum or waveform plot needs an app change, which is outside this task. |
| W-10 | Fixed: "like a clarinet's low notes" (link kept, "chalumeau" dropped). |
| W-11 | Fixed. The final paragraph is folded into the square bullet ("no 2nd, the octave above"). |
| L-01 | Fixed. Added `.gain(0.4)` with a one-line note; haps checked. Simulated band-limited saw at c3 through the biquad: peak output relative to the input is 1.29 at lpq 1 dB and 3.64 at lpq 30 dB. With gain 0.4, the lpq 30 bar peaks about 3 dB above the old lpq 1 bar at default gain 0.8, instead of 9 dB. |
| L-02 | Fixed. The compare is now `c4 c5 bb4 g4` with lpf 600 Hz → 3000 Hz. |
| L-03 | Fixed. **Cutoff** is defined where `lpf` is introduced. |
| L-04 | Fixed: "a boost around the cutoff … a narrow peak just below the cutoff". |
| L-05 | Fixed. Units are in the play label and all plot labels and titles (dB, Hz). |
| L-06 | Fixed. The paragraph is split, ending with "The plots below show it." |
| H-01 | Fixed. The chord is now `c4,eb4,g4,bb4`, hpf 100 Hz → 1500 Hz. Recomputed with the Web Audio biquad formulas: hpf 100 changes the fundamentals (262–466 Hz) by under 1 dB (+0.2 to +0.7), and hpf 1500 drops them by 20 to 30 dB (−19.9 to −30.2). |
| H-02 | Fixed: "`gain` (overall level)". |
| H-03 | Fixed. Added a play of the same chord with `lpf(1500)` and the sentence "On the same chord, `lpf` does the opposite: it keeps the body and removes the bright upper partials." It is a play rather than a compare, because a compare must differ in one parameter. |
| H-04 | Partly fixed. The wording is now "keep mostly a band", and a note says the fundamentals (262–466 Hz) sit below it and are turned down (2 to 14 dB at hpf 600). The combined band is not drawn: a `:::filter` block takes one `type`, so a cascade can't be plotted without an app change. |
| H-05 | Fixed: "High-pass at 100 Hz and 1500 Hz (default resonance)". |
| H-06 | Fixed. The mixing-engineer clause is dropped. |
| S-01 | Fixed. All demos are now `c4*8`. There are no dB figures in this lesson to recompute. |
| S-02 | Fixed by cutting. The sentence is now "spends about half its time above 2000 Hz, the top octave" (no undrawn curve). `:::signal` has no exponential shape for a `rangex` plot. |
| S-03 | Fixed. Added a saw sweep play. |
| A-01 | Fixed: `adsr("0.01:0.2:0.5:0.3")` "sets all four, in that order" (haps checked). |
| A-02 | Fixed: "A *pluck* is struck and dies away; a *pad* swells and lingers." |
| A-03 | Fixed in prose. "The pluck, on a 0.5-second note:" comes before plot 1 and "The pad:" before plot 2. `:::envelope` has no title field (app change needed). |
| A-04 | Fixed: "a cycle lasts 2 seconds; four notes share it, so each lasts 0.5 seconds". |
| A-05 | Fixed. The rule is now one sentence covering attack, decay, release and sustain, checked against helpers.mjs L167-L178. |
| A-06 | Fixed. New compare on the same input, decay 0.3 s + sustain 0 vs release 0.3 s, with "Decay falls while the note is held; release falls after it ends." |
| A-07 | Fixed: "four times per cycle (one bar)". |
| A-08 | Fixed. The compares and the accent demo are now c4. |
| X-01 | Fixed. Units are in the compare `diff` strings and labels. |
| Cuts | Applied. waveforms (dropped the default-triangle sentence, folded the last paragraph, shortened bullets), lowpass (merged Q sentences, dropped the 24 dB figure), filter-sweep (rangex paragraph, bridge's last sentence), amp-envelope (staccato sentence, "Still write…", gain sentence). waveforms stays at 313 because of the W-04, W-05 and W-07 additions. |
