# M1 adversarial content review: U3a "Sound basics"

- **Reviewer:** fresh adversarial reviewer (LLM), not the author. No content was edited.
- **Date:** 2026-10-05
- **Pin:** `f610965f4332837febe45743105da170e8b331ed` (`tools/strudel-ref/pin.json`; `git log -1` in `tools/strudel-ref/.cache/strudel` matches).
- **Scope:** `content/skills.yaml`, `content/units/u3a/lessons/*.md` (5), `content/units/u3a/exercises/*.yaml` (20), `content/glossary/timbre-lexicon.yaml` (13 entries), `docs/strudel-idioms.md`, `docs/content-authoring.md`, `docs/curriculum.md`, `docs/decisions/0200-u3a-content-conventions.md`.

## Method

1. **Every snippet evaluated.** All 27 solutions and 12 lesson snippets (`:::play` and both sides of each `:::compare`) went through `packages/verify/.cache/eval.mjs` (the `scripts/run.mjs eval` bundle) for each variant's `verify.cycles` (4 for lesson snippets). All 39 evaluated with no error. I read every hap list against its prompt: pitches, onsets, durations, control keys and values.
2. **Accepted alternatives** (5 of them) were diffed hap by hap against the canonical solution. All are identical.
3. **Prettier** (house-style config) over all 39 snippets: no changes. No single quotes and no synonyms (`sound`, `lp`, `cutoff`, `att`, `saw`/`tri` as sound names) anywhere in content code.
4. **ABC:** both tunes went through abcjs `parseOnly().setUpAudio()` and the MIDI pitch, start and duration were compared with the haps (results below).
5. **Every `{cite src=…}` and every docs/ line citation** was opened at the pin. **Every `{cite doc=…}`** was checked against `tools/strudel-ref/doc.json`.
6. **Every URL** in the lexicon and lessons (16 distinct URLs) was fetched with curl (all HTTP 200), converted to text, and searched for the quoted or paraphrased claim.
7. I checked a signal-sampling claim with a partial query: `queryArc(0.05, 0.2)` on `note("c2*8").lpf(saw.range(0,1000))` returns the fragment of the first note with `cutoff:0`, so the value comes from the hap's whole (its onset), not the query start.
8. **App-side renderers:** `apps/web/src/ui/plotMath.ts` was read to see whether the lesson plot directives draw what the content means.

## Findings

Severity: **blocker** = wrong in a way that teaches something false or breaks a required gate; **major** = a false or self-contradictory claim, or a pedagogy gap a learner will hit; **minor** = inaccurate or overstated detail, or a breach of the project's own authoring rules; **nit** = polish.

| ID | file:line | Sev | Claim | Refutation evidence | Suggested fix |
|---|---|---|---|---|---|
| F01 | `content/skills.yaml:51-54`; `docs/strudel-idioms.md:57-61`; `content/units/u3a/lessons/highpass.md:20-34`; (orchestrator-owned) `docs/house-style.md` "Structure" | **major** | "Write the chain in signal order: source, then `.lpf`, then `.hpf`, then envelope and gain", which "makes the code read like the diagram". House style: "filter, then envelope, then gain. This mirrors a signal chain: source, filter, amp." | The pinned chain is oscillator → **amp envelope** → gain → lpf → hpf: `packages/superdough/synth.mjs:65-68` (envelope gain inside the synth voice), then `superdough.mjs:651-654` (gain), `:660-694` (lpf), `:696-730` (hpf). The lesson's own diagram (highpass.md:32, `osc -> env -> gain -> lpf -> hpf`) shows this. Idiom §5's "Why" cites this exact order and then recommends a different one. Filters-before-envelope is *not* signal order. A learner who knows Web Audio graphs will notice the contradiction. | Either (a) drop the "signal order" justification: say the order is a readability convention (what, with what, colour, articulation, level) and that the real chain is fixed; or (b) change the convention to match the real chain (envelope before filters) and update house-style.md, idiom 5, the highpass idiom_note and the references. (a) is cheaper. In both cases the diagram and the prose must agree. |
| F02 | `content/units/u3a/exercises/snd.waveforms.v02.yaml:18`; `snd.amp-envelope.v05.yaml:19`; `snd.waveforms.v01.yaml:12`; `snd.amp-envelope.v04.yaml:13`; `snd.filter-sweep.v03.yaml:13`; `snd.highpass.v03.yaml:13`; `lessons/amp-envelope.md:33`; `docs/decisions/0200-u3a-content-conventions.md:16` | **major** | ADR 0200 §3: U3a uses only `*`, `,`, `<...>`, `@`, `!`, "and each lesson explains the one it introduces in a sentence." | (1) `[ ]` subsequences appear in 7 solutions and lesson snippets but are not on the ADR's list and are never explained. (2) `*` appears in every lesson's snippets (`c2*8`, `[1 0.5]*4`) and is never explained in any lesson. (3) `@` appears only in `snd.waveforms.v02` (a dictation on the *first* skill, prereqs `[]`), and no lesson explains it. The canonical answer `note("<[d4 f#4 a4 d5] [c#5 b4 a4@2]>")` needs `<>`, `[]` and `@`, but the waveforms lesson teaches only `<>` (waveforms.md:15). (4) `!` is explained only in a solution note (amp-envelope.v05:30). U1, which teaches mini-notation, comes after U3a. | Add one or two sentences to the waveforms lesson covering `[ ]` (fit a group into one step), `*n` (repeat n times in a step) and `@n` (weight/length), or add an `@`-free accepted alternative such as `note("<[d4 f#4 a4 d5] [c#5 b4 a4 ~]>")`. That alternative is not hap-identical, so the better fix is to teach `@`. Update the ADR list to include `[ ]`. |
| F03 | `content/skills.yaml:56-59` (amp-envelope `prereqs: [snd.waveforms]`); `exercises/snd.amp-envelope.v03.yaml:2,9-13,17`; `lessons/amp-envelope.md:20,23` | **major** | The skill graph allows `snd.amp-envelope` straight after `snd.waveforms`. | `snd.amp-envelope.v03` is a *primary* variant of amp-envelope (first skill), and the app serves primary variants for a new skill (`apps/web/src/session/builder.ts:38-39`). Its prompt asks the learner to write a low-pass ("cutoff 800–1500 Hz"; solution `.lpf(1200)`). Both lesson compare snippets also use `.lpf(1500)`. A learner who reaches amp-envelope before lowpass (allowed by the DAG; the builder picks any skill whose prereqs are met) gets an exercise on vocabulary that hasn't been taught. | Make `snd.amp-envelope` depend on `snd.lowpass` (and update the DOT graph in `docs/curriculum.md`), or remove `lpf` from v03 and from the lesson compares. |
| F04 | `content/units/u3a/lessons/lowpass.md:20-24` (`:::filter` q: 10) together with `apps/web/src/ui/plotMath.ts:23-28` (WS-B) | **major** | The filter plot illustrates the resonance of `lpq` 10. | `filterDb` treats `q` as a *linear* Q (peak ≈ 20·log10(q) = **20 dB** for q 10). Strudel passes `lpq` straight to `BiquadFilterNode.Q` (`superdough.mjs:663` maps `q: 'resonance'`; `helpers.mjs:245-246` sets `filter.Q`), and for lowpass/highpass the Web Audio spec reads Q **in dB**: "For lowpass and highpass filters the Q value is interpreted to be in dB" (fetched https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q). The real peak for `lpq(10)` is about **10 dB**, so the plot exaggerates it twofold in dB. With `q: 0` (a valid `lpq`) the plot clamps to 0.01 and draws a deeply sagging corner, whereas Web Audio Q 0 dB is linear Q 1, a small bump. The lesson's own text (line 18) says Q is in dB, so text and picture disagree. | Fix in WS-B: for lowpass/highpass, convert `qLin = 10 ** (q / 20)` before computing (bandpass stays linear). Document the semantics of the `q` field in `docs/content-authoring.md` §2 ("same units as `lpq`/`hpq`: dB for lowpass/highpass"). |
| F05 | `exercises/snd.waveforms.v01.yaml:18` | minor | listen_for: "A hollow, reedy tone with **no buzz in the top end** (odd harmonics only)". | A square's odd harmonics fall off as 1/n, the same rate as a sawtooth's, so its top end extends just as far. The waveforms lesson says so itself ("square: odd harmonics only, also 1/n", waveforms.md:21). Sievers, cited in the lexicon, says a square is "not quite as buzzy as a sawtooth wave" (fetched http://beausievers.com/synth/synthbasics/), not "no buzz". At c4–c5 a raw square is clearly bright and edgy, so a learner checking this item would doubt a correct answer. | "Hollow and reedy; still bright, but less buzzy than a sawtooth (no even harmonics)". This matches v03's wording. |
| F06 | `exercises/snd.amp-envelope.v02.yaml:8,13-20` | minor | The prompt requires all four stages "set in a single method call", yet the four separate calls are listed as an accepted alternative. | The alternative does not meet a stated constraint of the prompt, even though its haps are identical. Self-graders get mixed signals. | Either drop "in a single method call" from the prompt (then it's a plain spec), or keep the constraint and move the four-call version into a note ("equivalent, but not what was asked"). |
| F07 | `exercises/snd.amp-envelope.v05.yaml:8-9` | minor | "The accents (>) mean gain **1**. **Every other note** has gain **0.6**." | In English "every other note" usually means *alternate* notes, which here contradicts the accent pattern (positions 1, 4, 7). The ABC disambiguates, but the prose is ambiguous. | "All unaccented notes have gain 0.6." |
| F08 | `exercises/snd.filter-sweep.v03.yaml:8,17`; `lessons/filter-sweep.md:32` | minor | "the low-pass cutoff **climbs steadily** from 200 to 4000 Hz"; "Smooth motion, because eight notes per bar each read a new cutoff"; "Eighths or sixteenths give a smooth glide". | `saw.range(200, 4000)` is linear in Hz. The harness shows eighth-note steps of 118.75 Hz (`cutoff:200, 318.75, 437.5, …`), so the first steps are about 0.67 and 0.46 octaves. Perceptually, bar 1 covers 200→1150 Hz (≈2.5 octaves) and bar 4 covers 3050→4000 Hz (≈0.4 octave). The rise is strongly front-loaded and audibly stepped at the low end, not "steady". | Either note in the lesson that a linear range sounds front-loaded, and mention `rangex` (doc.json: "following an exponential curve", exists at the pin) for perceptually even sweeps, or soften the wording to "climbs from 200 to 4000 Hz (fastest-sounding at the start)". Don't add `rangex` to the canonical answer without updating vocabulary. |
| F09 | `content/glossary/timbre-lexicon.yaml:6` (rule) vs exercises and lessons | minor | "Every qualitative word used in a prompt, listen_for item or lesson must have an entry here." | Words used with no lexicon entry: **reedy** (waveforms.v01:18, v03:17), **small** / **radio** / **mid-heavy** (highpass.v02:5,8,20), **percussive** / **blip** (amp-envelope.v04:5,15), **rounded** (amp-envelope.v03:22), **distant** (highpass.md:18), **body** / **weight** (highpass.v01:14, v02:8,19, v03:15, v04:16; lowpass.v02:8), **ringing** (lowpass.v03; only mentioned in the `resonant` notes). | Add entries (or explicit synonyms in existing entries' `notes`, e.g. reedy→hollow, rounded→warm/dark, body/weight→low-register energy), or reword. |
| F10 | `exercises/*.yaml` `sources:` | minor | content-authoring §1: "Every qualitative word in the prompt or `listen_for` needs a `lexicon:` source." | Missing lexicon sources for words that *do* have entries: waveforms.v01 (buzzy); waveforms.v03 (bright); lowpass.v01 (dark, buzzy, resonant: it has no lexicon source at all); lowpass.v02 (buzzy); highpass.v02 (bright, buzzy); highpass.v04 (buzzy); amp-envelope.v03 (buzzy); filter-sweep.v01 (buzzy, resonant); filter-sweep.v03 (dark); filter-sweep.v04 (dark, bright). | Add the `lexicon:` keys, and make L8d (or L0) enforce this mechanically. |
| F11 | `lessons/amp-envelope.md:17-24` | minor | `:::compare{diff="envelope: pluck → pad"}`. The authoring rule says compare snippets differ "in **exactly one** parameter". | The two snippets differ in all four ADSR values: one call, four parameters. The pluck side also models `adsr` with explicit attack and release for a pluck, against the lesson's own advice two paragraphs later ("To make a pluck obvious to readers, write `.decay(0.2).sustain(0)`") and the skill's idiom_note ("Set only the envelope stages you mean"). | Accept `adsr` as the "one parameter" explicitly in content-authoring, or make the compare `.decay(0.2).sustain(0)` versus `.attack(0.4).release(1)` (labelled "envelope"). At least make the pluck side idiomatic. |
| F12 | `lessons/waveforms.md:22` | minor | "triangle: … sounds soft, **like a flute or ocarina**." | The source the lesson links for this list says the opposite: Tillman calls the triangle "a mellow hollow clarinet sound" (fetched https://till.com/articles/wavepalette/). Acoustically a flute is an open pipe with significant even harmonics, which a triangle lacks entirely. An ocarina (a Helmholtz resonator) is close to a sine. The lexicon's `pure` entry uses the flute as its sine example (timbre-lexicon.yaml:128-130), so the content is inconsistent with itself. | "soft and mellow, a muted clarinet" (supported by the cited source), or "soft, close to a recorder or soft flute stop" with a source. |
| F13 | `lessons/waveforms.md:18-22` | nit | The 1/n and 1/n² roll-offs are presented as supported by the till.com link. | Tillman gives no exponents ("fall off in strength much faster"). The facts are correct (Web Audio spec Fourier series; Reid/SOS for the sawtooth), but the link doesn't support them. | Link the Web Audio spec's OscillatorNode waveform definitions, or Reid's "What's in a sound" for the 1/n figure. |
| F14 | `exercises/snd.lowpass.v01.yaml:21` | nit | "A **slight** resonant peak around the cutoff" for `lpq(8)`. | Q is in dB for lowpass (W3C spec), so `lpq(8)` is a peak of about 8 dB. That is clearly audible, not slight. The lesson's own default, Q 1, is the "no obvious peak" case. | "A moderate resonant peak at the cutoff". |
| F15 | `exercises/snd.highpass.v03.yaml:17` | nit | "By bar 4 the low C is almost gone". | At `hpf(1600)` the 130.8 Hz fundamental is about 43 dB down, but c3's partials above 1600 Hz remain and the pitch persists (missing fundamental), and c4 doubles it. "The low C" is ambiguous. | "By bar 4 the chord has lost its low fundamentals; only the upper partials remain." |
| F16 | `exercises/snd.amp-envelope.v05.yaml:9` | nit | "The 3+3+2 grouping is **the** synth-pop staple." | Overstated: tresillo/3+3+2 is common across pop, Latin and dance music, and is one staple among several. No source is given. | "a synth-pop staple". |
| F17 | `lessons/filter-sweep.md:35` | nit | "`"<...>"` is the Baroque approach … A signal is the Romantic hairpin." | An advanced classical musician will know that "terraced dynamics" as *the* Baroque practice is a contested generalisation, and that hairpins predate Romanticism. A sine also crescendos *and* diminuendos, so it isn't a single hairpin. | "like terraced dynamics … like a hairpin (or a hairpin pair)". |
| F18 | `lessons/lowpass.md:18` | nit | "`lpq` … raises a peak **right at** the cutoff." | In the RBJ/Web Audio biquad the peak sits at or slightly below the cutoff and approaches it as Q rises. FabFilter (cited in the lexicon) says "just before the filter cut-off frequency". | "a peak at (just below) the cutoff". |
| F19 | `lessons/lowpass.md:30` | nit | For a sine, "`lpf` changes little unless the cutoff drops below the note itself, and then the note just gets quieter." | With the default Q of 1 dB, a sine just below the cutoff is slightly *boosted* (about 1–2 dB) before it is cut. The claim is practically fine but not literally true. | Optional: "changes little until the cutoff approaches the note". |
| F20 | `lessons/lowpass.md:33` | nit | "Resonance behaves like a sung vowel: a formant emphasizes one region…" | Vowels are identified by at least two formants (F1/F2). A single resonant peak gives a wah-like, *vowel-ish* colour, not a vowel. A choral conductor will know this. | "Resonance is like one formant of a sung vowel…". |
| F21 | `lessons/amp-envelope.md:37` | nit | "An organ pipe is a gate: instant on, full sustain, instant off." | Flue pipes have audible speech transients (chiff) of tens of ms, and the room supplies the release. "Instant" is an idealisation. | "close to a gate: quick onset (with a little chiff), full sustain, quick cut-off." |
| F22 | `lessons/waveforms.md:13` | nit | "c4 is middle C, MIDI 60 … {cite doc=note}". | doc.json `note` states only "69 is mapped to A4 440Hz". c4 = 60 is implied by the doc examples (`note("c4 a4 f4 e4")` beside `note("60 69 65 64")`) and is in `packages/core/util.mjs:31-38` (`(oct+1)*12 + chroma`). | Add `{cite src="packages/core/util.mjs#L31-L38"}`. |
| F23 | `lessons/highpass.md:20` | nit | "The oscillator and its amplitude envelope come first …" cited only to `superdough.mjs#L651-L721`. | The envelope is in `synth.mjs:65-68`, which the cited range does not cover (idiom §5 cites both). | Add `{cite src="packages/superdough/synth.mjs#L65-L68"}`. |
| F24 | `content/glossary/timbre-lexicon.yaml:41-43` (`dark`) | nit | Siedenburg et al. ch. 1: "The dull-bright pole; dark sits at the dull end." | The fetched chapter (comma.eecs.qmul.ac.uk/assets/pdf/Timbre_chapter1.pdf) never uses the word "dark" (0 hits). Equating dark with dull is the author's inference, so `confidence: high` rests on Sievers, a beginner guide. | Mark the note as an inference, or add a source that uses "dark", or lower confidence to medium. |
| F25 | `content/glossary/timbre-lexicon.yaml:55-57` (`muffled`) | nit | FabFilter is cited for "muffled". | The FabFilter page says "duller or warmer", not "muffled". It supports `dull`, which the entry lists as a synonym. | Keep it, but say it supports the "dull" synonym. |
| F26 | `content/glossary/timbre-lexicon.yaml:108` (`hollow`) | nit | The header says "Quotes in `note` are verbatim." | The SOS original reads "…associate with square waves**…** the only common synthesizer waveform…". The lexicon replaces the ellipsis with a comma. | Restore the ellipsis. |
| F27 | `content/glossary/timbre-lexicon.yaml:48` vs `exercises/snd.filter-sweep.v01.yaml:15,22` | nit | `muffled`: "low lpf cutoff, close to the fundamentals being played". v01 calls `lpf(400)` on a1 (55 Hz) "muffled". | 400 Hz is about 2.9 octaves above the fundamental (the 7th harmonic still passes), so it isn't "close to the fundamentals". | Loosen the tendency ("a few harmonics above the fundamental"), or use `dark` in v01. |
| F28 | `exercises/snd.amp-envelope.v04.yaml:12-13` | nit | Only `[c5 g4 e4 c4]*2` is listed. | waveforms.v01 accepts the written-out eight notes as an alternative, and the same reasoning applies here (identical haps). | Add the written-out alternative for consistency, or drop it from waveforms.v01. |

No **blockers** were found. Every solution evaluates, matches its prompt and ABC, and is hap-identical to its accepted alternatives.

## Claims I tried to refute and confirmed correct

**Source citations (all line ranges are correct at the pin):**
- `synth.mjs#L23-L29`: the waveforms list `triangle, square, sawtooth, sine` and the aliases `tri, sqr, saw, sin`.
- `synth.mjs#L47-L51`: the default envelope is 0.001/0.05/0.6/0.01.
- `synth.mjs#L63-L69` and `#L65-L68`: `holdEnd = t + duration`, then `getParamADSR(…, 'linear')`. The envelope is linear and holds until the note's end, then releases.
- `synth.mjs#L521-L525`: stock `OscillatorNode` with `o.type = s`, when no partials are given.
- `helpers.mjs#L80-L83`: if attack > duration, the ramp ends below full level.
- `helpers.mjs#L167-L178`: sustain inference is 1 if only attack is set (or neither attack nor decay), 0.001 if decay is set without sustain. The minimums are 0.001/0.001/0.01, so `.adsr("0:0.15:0:0")` clamps to 0.001 attack and 0.01 release, as idiom 6 says.
- `helpers.mjs#L219-L227`: default `q = 1`. `#L241-L248`: a BiquadFilterNode whose Q and frequency are set once (no filter envelope or LFO unless the `lp*` parameters are set, `#L250-L287`). The amplitude `attack`/`decay` do **not** drive the filter: `lpMap` uses `lpattack` and so on (`superdough.mjs:664-667`).
- `superdough.mjs#L180-L182`: default `s: 'triangle'` and `gain: 0.8`. Applied via `getDefaultValue('s')` at L470 and `getDefaultValue('gain')` at L593.
- `superdough.mjs#L65-L69`, `#L606-L611`: the gain curve is the identity. `setGainCurve` is never called anywhere in the pinned repo (grep), including the website REPL. So "linear, despite doc.json's 'exponential'" is correct.
- `superdough.mjs#L360-L364`: `ftype` defaults to `'12db'`, a single biquad. The W3C spec confirms the biquad lowpass is "second-order resonant … 12dB/octave".
- `superdough.mjs#L651-L721`: the gain → lpf → hpf order. `#L696-L721`: hpf is a biquad of type `highpass`.
- `controls.mjs#L2572-L2576`: `adsr` sets exactly `attack, decay, sustain, release`. `#L1190-L1204`: `lpf` registers `['cutoff','resonance','lpenv']`, so `lpf("600:8")` sets cutoff and resonance.
- `signal.mjs#L18-L21`: signals sample at `state.span.begin`. Confirmed with a partial query to mean the hap's onset (the fragment from 0.05 to 0.125 reports `cutoff:0`).
- `signal.mjs#L23-L35`: `saw = t % 1`, starting at its minimum. `#L70-L80`: `sine = fromBipolar(sin 2πt)`, starting at its midpoint and rising.
- Workshop `first-effects.mdx#L284-L293` really does say "8 cycles". The pattern and the `sine…slow(4)` sweep both repeat every 4 cycles, so the erratum in idiom 3 and ADR 0200 is correct. `synths.mdx#L24` (default triangle) and `#L35-L39` (`.decay(.04).sustain(0)`) are as quoted.

**doc.json:** `lpf` "audible between 0 and 20000"; `lpq` "between 0 and 50", synonym `resonance`; `hpf` synonyms `hp, hcutoff`; `attack`/`decay`/`release` in seconds; `sustain` 0–1; `sine`/`saw` 0–1; `range`, `slow`; `gain` "exponential amount"; `bpf` (`bandf`, `bp`) and `bpq` for the worked example. Every vocabulary entry in `skills.yaml` is a primary name.

**Snippets and solutions (haps read individually):** all 20 variants match their prompts in pitch, rhythm, values and cycles. Highlights:
- filter-sweep.v01 steps 3200/1600/800/400 down, one value per bar, with resonance 5.
- filter-sweep.v02 starts at 1650 (the midpoint) and rises, peaks exactly at bar 3's downbeat (cycle 2), and reaches its minimum at bar 7's downbeat.
- filter-sweep.v03 resets to 200 at cycle 4.
- filter-sweep.v04 ramps 300→2500 every 2 cycles.
- highpass.v03 steps 200/400/800/1600.
- amp-envelope.v05 accents fall at eighths 1, 4 and 7 (3+3+2).
- The lesson play "Accent on each beat" (`[1 0.5]*4`) really accents each quarter.

**Accepted alternatives:** amp-envelope.v02, amp-envelope.v05, lowpass.v01, waveforms.v01 and waveforms.v02 are all hap-identical to their canonicals.

**ABC (abcjs setUpAudio):**
- waveforms.v02 `K:D`: [62, 66, 69, 74 | 73, 71, 69(½)] = d4 f#4 a4 d5 | c#5 b4 a4@2. ✓
- amp-envelope.v05 `K:Am`: [69 72 76 69 72 76 67 71 | 65 69 72 65 69 72 64 68], all eighths = a4 c5 e5 a4 c5 e5 g4 b4 | f4 a4 c5 f4 a4 c5 e4 g#4. ✓

The key signature, `^G`, octaves, and whole note = 1 cycle all agree.

**House style:** Prettier-clean, double quotes only, primary names only, leading zeros, and no default-valued parameters except where the lesson is about them.

**Lessons:** prose word counts (bridges included, code and directive bodies excluded) are 253, 216, 192, 208 and 249, all ≤ 300. Every lesson has a bridge, at least one visual and at least one playable snippet. Directive YAML bodies parse.

**Acoustics:** sawtooth = all harmonics at 1/n; square = odd harmonics at 1/n; triangle = odd harmonics at 1/n²; sine = fundamental only (matches the Web Audio OscillatorNode definitions). The square has no octave partial, hence "hollow". NES APU: "two pulse wave generators, a triangle wave, noise, and a delta modulation channel" (nesdev.org/wiki/APU), and a square is a 50% pulse. Q is in dB for lowpass/highpass (W3C). The default tempo is 0.5 cps (harness `cps: 0.5`), so a quarter note is 0.5 s.

**Lexicon URLs:** all 16 load (HTTP 200), and these quotes were found verbatim:
- Caetano ch. 11: "brassy trombone note", "xylophone … short attack times with sharp onsets", "tuba … longer attack times".
- Sievers: "darker" or muffled; "muffled"; "very strong, clear, buzzing sound"; "not quite as buzzy as a sawtooth"; "most basic, pure waveform".
- FabFilter: "duller or warmer", "brighter or thinner", "the thinner the resulting sound", "emphasizes the frequencies just before", "more pronounced this bump".
- Stables et al.: the warm cluster "boost around 500 Hz with a high-frequency roll-off"; the thin cluster with a high-frequency boost.
- Enderby & Stables: 54% / 74%.
- SOS Reid: saw 1/n; clarinet 'hollow'; "still attenuates the frequencies far above the cutoff"; "how percussive a sound is"; "rapid but smooth attack, and a gentle release".
- Wolfe: chalumeau "characteristic 'hollow' timbre".
- EIU: flute "very pure tone".
- Tillman: saw "bright waveform with all harmonics", square "distinctly hollow", triangle "much mellower", sine "no harmonic content".

**Status and confidence** are honest for warm, buzzy, soft, plucky and pad-like. The pad-like entry openly says its source supports a *fast* attack, not a slow one. See F24 for `dark`.

**Curriculum:** the type counts in `docs/curriculum.md` (4/4/5/4/2/1, 20 variants) are correct. The DOT graph matches `skills.yaml`. Every skill has at least 3 variants. The M1 rule (at least one dictation, describe-to-code, match-by-ear and sweep) is met.

**Match-by-ear targets** are recoverable from the prompts: waveform choice, LP versus HP, saw versus sine and period, and the cutoff/Q search starting from `.lpf(1000).lpq(1)`.

**ATTRIBUTION.md** records the workshop idiom used by filter-sweep.v02.

## Counts

| Severity | Count |
|---|---|
| blocker | 0 |
| major | 4 (F01–F04) |
| minor | 8 (F05–F12) |
| nit | 16 (F13–F28) |

## Resolutions (WS-C, 2026-10-05)

Every snippet was re-checked afterwards with the WS-C checker (eval, Prettier, names, L5, ABC, cite ranges, and a new lexicon-source rule for F10) and with `pnpm verify`, which is all green. `pnpm verify --update` was run after the edits. The snapshot diffs were reviewed, and they are limited to the five intended items: amp-envelope v02 (alternative removed), v03 (key order only), v04 (alternative added), and the amp-envelope and waveforms lessons (new compare; new play).

| ID | Resolution |
|---|---|
| F01 | **Fixed.** The order is now framed as a readability convention matching the corrected house style: note, `s`, envelope, filters, gain. Changes: the `snd.highpass` idiom_note, idioms §5 (rewritten, citing synth.mjs L63-68 and superdough.mjs L651-721), highpass lesson prose (no "signal order" claim, plus the convention), the amp-envelope lesson compare and `snd.amp-envelope.v03` (envelope moved before `lpf`), and content-authoring §1. Each reordered snippet is Prettier-clean, and its haps differ only in key order. |
| F02 | **Fixed.** The waveforms lesson, the DAG root, now has a mini-notation paragraph covering spaces, `[ ]`, `*n`, `@n`, `!n`, `,` and `<a b>`, plus a play example `note("c4 [e4 g4] c5@2")`. ADR 0200 §3 now lists `[ ]` and names the waveforms lesson as the place where these are taught. docs/curriculum.md was updated to match. |
| F03 | **Fixed** by adding a prereq: `snd.amp-envelope` now requires `snd.lowpass` (skills.yaml and the DOT graph in curriculum.md). Justification (ADR 0200 amendments): pads and plucks are idiomatically shaped on a filtered rich source, so removing `lpf` would make the envelope examples less musical. The cost is one step later in a 5-skill DAG. |
| F04 | **Noted (WS-B owns the plot).** content-authoring §2 now documents that the `filter` directive's `q` uses `lpq`/`hpq` units, which Web Audio reads in dB for lowpass and highpass and as linear for bandpass. The lesson's `q: 10` means `lpq(10)`, a peak of about 10 dB. The plot needs `qLin = 10 ** (q / 20)` for lowpass and highpass. |
| F05 | **Fixed.** waveforms.v01: "A hollow tone, still bright, but less buzzy than a sawtooth (no even harmonics)". |
| F06 | **Fixed.** The constraint is kept, and the four-call alternative was removed from `solutions`. The prompt says four calls would sound identical but the drill is about the shorthand, and a listen_for "code check" item says the same. |
| F07 | **Fixed.** "All unaccented notes have gain 0.6." |
| F08 | **Fixed.** filter-sweep.v03 now says the cutoff climbs "at an even rate in hertz". Its listen_for says most of the audible change comes in bar 1 and describes the motion as "many small steps … most audible at the dark end". The sweep lesson explains that `range` is linear in Hz, so wide sweeps sound front-loaded, and mentions `rangex` (cited to doc.json) for U4. "Smooth glide" became "near-smooth". |
| F09 | **Fixed.** Removed or reworded: reedy, small, mid-heavy, rounded, distant. Synonyms are now documented in lexicon `notes`: "body"/"weight" under `thin` (as its opposite), "percussive"/"blip" under `plucky`. ringing, whistling and squelchy were already there under `resonant`, and swelling and blooming under `pad-like`. The rule that synonyms count as their entry is stated in content-authoring §1 and ADR 0200. |
| F10 | **Fixed.** All missing `lexicon:` sources were added (30 additions). The WS-C checker now enforces the rule mechanically over title, prompt and listen_for, using terms and synonyms. Recommendation for WS-A: add the same check to L8d. |
| F11 | **Fixed.** The compare is now `.decay(0.2).sustain(0)` versus `.attack(0.4).release(1)`, with `diff` spelling out every changed value. The envelope plot uses the inferred pluck values (0.001/0.2/0/0.01). content-authoring §2 documents the "whole envelope as one control" exception. |
| F12 | **Fixed.** Triangle: "soft and mellow, like a muted clarinet", linked to Tillman. The sine line no longer mentions a flute. |
| F13 | **Fixed.** The bridge now links the Web Audio spec's oscillator Fourier coefficients (`https://www.w3.org/TR/webaudio/#oscillator-coefficients`, verified to contain b[n] for square, sawtooth and triangle). |
| F14 | **Fixed.** "A moderate resonant peak at the cutoff". |
| F15 | **Fixed.** "By bar 4 the chord has lost its low fundamentals; only the upper partials remain". |
| F16 | **Fixed.** "The 3+3+2 grouping is common in pop and dance music." |
| F17 | **Fixed.** "works like terraced dynamics … like a hairpin … A sine is a pair of them, crescendo then diminuendo." |
| F18 | **Fixed.** "a peak at, or just below, the cutoff". |
| F19 | **Fixed.** "changes little until the cutoff approaches the note itself". |
| F20 | **Fixed.** "Resonance is like one formant of a sung vowel … a vowel-ish ooo-aaa colour." |
| F21 | **Fixed.** "close to a gate: a quick onset (with a little chiff), full sustain, a quick cut-off." |
| F22 | **Fixed.** Added `{cite src="packages/core/util.mjs#L31-L38"}`. |
| F23 | **Fixed.** Added `{cite src="packages/superdough/synth.mjs#L65-L68"}` for the envelope stage. |
| F24 | **Fixed.** `dark` confidence lowered to medium. The Siedenburg note now says that equating dark with dull is an inference, and the entry notes explain why. |
| F25 | **Fixed.** The FabFilter note now says it supports the synonym "dull", not the word "muffled". |
| F26 | **Fixed.** The verbatim ellipsis is restored ("square waves... the only"), checked against the live SOS page. |
| F27 | **Fixed** by loosening the tendency: "low lpf cutoff, letting only the fundamental and the first few harmonics through". `lpf(400)` on a1 passes about 7 harmonics, which fits "first few". v01 keeps "muffled". |
| F28 | **Fixed.** amp-envelope.v04 now accepts the written-out eight notes, which are hap-identical (L5 passes), with the same note as waveforms.v01. |
| L8a (gate run) | **Fixed.** The `"lowpass"`/`"highpass"` code spans in the lowpass and highpass lessons are now plain words. |
