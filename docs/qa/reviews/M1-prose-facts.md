# M1 prose fact-check (u3a lessons, diff vs HEAD)

Pin: Strudel f610965 (tools/strudel-ref/.cache/strudel). Biquad numbers recomputed with Web Audio RBJ lowpass/highpass formulas, Q(dB) -> 10^(Q/20), script /tmp/bq.js; fs 48000 and 44100 agree to <=0.01 dB for every figure quoted (differences only in 3rd decimal, e.g. 0.30 vs 0.31 dB).

No blockers, no majors. All cite line ranges were read and point at supporting code.

## Findings

| ID | Lesson:line | Sev | Claim | Evidence | Suggested fix |
|----|-------------|-----|-------|----------|---------------|
| F1 | lowpass:~21 | minor | "Strudel documents a range of 0 to 50 dB" | doc.json lpq/hpq param text is "resonance factor between 0 and 50", no unit. dB comes from Web Audio spec (Q for lp/hp is in dB), not from Strudel docs. | "Strudel documents a range of 0 to 50 (Web Audio reads that as dB)". |
| F2 | amp-envelope bridge / filter-sweep rangex para / lowpass | minor | Forward refs: "a later lesson shows how to shorten a note within its step"; "A later lesson uses it" (rangex) | content/skills.yaml lists only 5 skills (u3a); grep finds no lesson/skill covering clip/legato/rangex. Dangling promise. | Say "in a later unit" or drop until a skill exists. |
| F3 | waveforms:~22 | nit | `b` is flat and `#` sharp | True for accidentals (eb3, bb3, f#). But a bare `b` is the pitch B; as written it could be misread. Source: note doc "optional accidentals (b or #)". | "a `b` after a letter is flat (eb3), `#` sharp". |
| F4 | waveforms:~34 | nit | "The exception to one cycle per string is `< >`" | Not the only one: `/` (e.g. "a/2"), and `.slow()` also stretch across cycles. True within the symbols taught. | "The one symbol here that spans cycles is `< >`". |
| F5 | waveforms bridge | nit | triangle "close to a sung oo"; sine "purer than any instrument" | Qualitative. A sung oo is low-F1 with a steep spectrum, so loosely triangle-like; "purer than any instrument" is arguable (flute top register, tuning fork). | Soften: "somewhat like a sung oo"; "purer than almost any instrument". |
| F6 | lowpass bridge | nit | glide a resonant cutoff -> "ooo-aaa", like plunger mute | A single swept resonance sounds closer to wah/"wow-yow" than two-formant vowels; plunger mute analogy is standard (wah). Bucket mute darkening/pitch clear is correct. | Say "vowel-like, or wah" to avoid overpromising. |
| F7 | highpass:~29 | nit | band "roughly 600 to 2500 Hz" for the telephone example | Cutoffs only; notes c4-bb4 fundamentals are 262-466 Hz, below the band, so the fundamentals are attenuated and only partials pass. Consistent with the lesson's idea but may surprise. | Optional note that the melody's fundamentals sit below 600. |
| F8 | amp-envelope:~12 | nit | "Set any stage and unset attack and decay become 0.001 s" | Correct (helpers.mjs L174-177); release floors at 0.01 s and is not mentioned. Not wrong, just incomplete (matters for the pluck plot, which uses 0.01). | Optional: "release at least 0.01 s". |

## Claims tried to refute and confirmed

- Default cps 0.5 (cyclist.mjs L24) -> cycle 2 s; evaluator prints `cps: 0.5`. Quarter note = 0.5 s; pad attack 0.4 < 0.5 s so it "just fits".
- Defaults [0.001, 0.05, 0.6, 0.01] (synth.mjs L47-51). getADSRValues (helpers L167-178): sustain = given; else 1 if (a set, d unset) or (both unset); else 0.001. Matches "1 as in the pad; 0.001 if decay without sustain". Plot params (pluck 0.001/0.2/0/0.01, pad 0.4/0.001/1/1) match.
- adsr(".4:1:.5:2") evaluates to attack .4 decay 1 sustain .5 release 2.
- Linear ramps: getParamADSR(..., 'linear') synth.mjs L68.
- Gain default 0.8 (superdough L180-182, used via getDefaultValue); gainCurveFunc default identity (L65), only changed by setGainCurve, never called in repo at pin. 0.5 -> -6.02 dB. Doc text says "exponential" (confirmed). `"[1 0.5]*4"` with `c3*8` accents each beat's first eighth.
- lpq -> `resonance` control (controls.mjs L1705; evaluator shows resonance:N), lpMap q: 'resonance' (superdough L663), createFilter default q = 1 and `filter.Q.value = q` on a BiquadFilterNode (helpers L219-248). Default ftype -> '12db', no worklet unless model==='ladder'; so straight passthrough in the default model. hpq -> hresonance -> hpMap q likewise.
- Biquad numbers (48 kHz): lowpass 800 Hz: lpq1 peak 621.5 Hz +1.96 dB; lpq10 peak 780 Hz +10.11 dB; lpq20 798 Hz; lpq30 800 Hz; gain at cutoff = Q dB exactly (1.00, 10.00, 20.00, 30.00). Default curve rises at most ~2 dB (1.96).
- Sine through default lowpass: cutoff 1 octave below note -10.87 dB (~11), 2 octaves below -23.78 (~24); cutoff 2 octaves above max +0.32 dB (<0.5), 3 octaves above +0.08 dB.
- Highpass 100 Hz Q1 dB: peak +1.96 dB at 129 Hz; c3 (130.8 Hz) +1.96 (~2 dB). Highpass 1000 Hz: c3 -35.3, eb3 -32.2, g3 -28.1, bb3 -25.0 dB -> "25 to 35 dB" and "131 to 233 Hz" correct.
- 12 dB/oct for the default single biquad (2nd order); applies to hpf as well (same filt()).
- Chain order gain -> lpf -> hpf (superdough L651-721); envelope inside synth before it.
- sine begins at 0.5 and rises, period 1 cycle (signal.mjs L70-80); saw = t % 1 (L35). Evaluator: lpf(sine.range(400,2000).slow(4)) on 3 notes gives cutoffs 1200, 1600, 1765.7 ... sampled at each onset. c3*8 over 4 bars = 32 notes.
- rangex = exp(range(log min, log max)) (pattern.mjs L1786-1788); saw.rangex(200,4000).segment(4) -> 200, 423, 894, 1891: equal ratio per step (octave-equal time). Linear saw 200-4000: octave 200-400 is 200/3800 = 5.3% of time; 2000-4000 is 52.6% -> "about 5%" and "about half" correct.
- Mini-notation, evaluator output: `c4 [e4 g4] c5@2` = 1/4,1/8,1/8,1/2 (half note); `c4 e4*2 g4 c5` = e4 twice inside beat 2; `c4 e4!2 g4` = e4 on beats 2 and 3 as quarter notes; `c3*8` = eight 1/8 haps; `c3,eb3,g3,bb3` stacks; `<...>` one entry per cycle then wraps. krill.pegjs L134-135 (@ weight), L137-145 (!), L153-154 (*) support the sentences.
- MIDI: c4 = (4+1)*12 = 60; a4 = 69; octave increments at C so below c4 is b3 (util.mjs L31-38). Default s = triangle (superdough L181). Waveform names/OscillatorNode types (synth L23-29, L521-525).
- Harmonic series: saw all harmonics 1/n; square odd 1/n; triangle odd 1/n^2 (Web Audio oscillator coefficients); square lacks 2nd harmonic (octave).
- Trombone bucket-mute darkening; piano as decay-with-no-sustain; damper/pedal analogy for release; high-passing chords/melody to leave low register to bass: all standard and not overstated.

## Resolutions

| ID | Resolution |
|---|---|
| F1 | Fixed: "Strudel documents a range of 0 to 50, and for low-pass and high-pass filters Web Audio reads Q in decibels, so that is 0 to 50 dB." |
| F2 | Fixed. The specific forward references are now generic: rangex "you will meet it later", and the staccato/shortening promise is removed. "later lessons cover the rest" (waveforms) and "covered in its own lesson" (highpass → amp-envelope, which exists) remain. |
| F3 | Fixed: "A letter followed by `b` is flat (eb4), followed by `#` sharp (f#4)." |
| F4 | Fixed. The "exception" sentence is gone; `< >` is defined as "one entry per cycle, then start over". |
| F5 | Fixed: "somewhat like a sung *oo*", "purer than almost any instrument". |
| F6 | Fixed: "a vowel-like *wah*, much like a plunger mute opening". |
| F7 | Fixed. A note that the melody's fundamentals (262–466 Hz) sit below the 600–2500 Hz band and are turned down, so the pitch rides on the upper partials (computed: −13.5 to −2.4 dB at hpf 600, Q 1 dB). |
| F8 | Fixed. The defaults sentence now states release 0.01 s explicitly. |
| New figures | Recomputed with the W3C RBJ formulas (fs 48 kHz). hpf 100 on c4–bb4 fundamentals: +0.7 to +0.2 dB. hpf 1500: −30.2 to −19.9 dB. lpf 1500 on the same: +0.2 to +0.5 dB. Sine figures unchanged (cutoff one octave below the note −10.9 dB ≈ 11; two octaves above < 0.5 dB). |
