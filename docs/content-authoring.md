# Content authoring

How to write lessons, exercise variants and lexicon entries for the Strudel tutor, whether you are a human or an LLM. Read `PROPOSAL.md` §1, §2, §10–§13 first. Then read `docs/house-style.md` (how reference code must look) and `docs/time-conventions.md` (what "a bar" means).

**The one rule above all others is accuracy (R-ACCURACY).** Every function name must exist in the pinned `doc.json`. Every behavioural claim is cited to `doc.json` or to pinned source lines. Every snippet is run, and you look at its events before you commit it. When you are unsure, cut the claim or soften it. Never guess.

## 1. Where things live

| Path | What | Schema (`packages/content-schema/src/index.ts`) |
|---|---|---|
| `content/skills.yaml` | units and skills (the skill graph) | `SkillsFile` |
| `content/units/<unit>/lessons/<name>.md` | one lesson per skill: YAML frontmatter `{id, title, skill}`, then a Markdown body with directives | `LessonFrontmatter` |
| `content/units/<unit>/exercises/<variant-id>.yaml` | one variant per file; the file name equals the id | `Variant` |
| `content/glossary/timbre-lexicon.yaml` | qualitative timbre words, with sources | `LexiconFile` |
| `docs/curriculum.md` | the skill graph as DOT, plus unit goals | keep in sync with `skills.yaml` |
| `docs/strudel-idioms.md` | the "zen of Strudel" list that `idiom_note`s summarise | — |

### Ids

Ids are lowercase and dot- or dash-separated: `snd.lowpass`, `snd.amp-envelope`. Lesson ids are `<skill-id>.lesson`. Variant ids are `<first-skill-id>.v01`, `.v02`, …, numbered after the variant's *first* skill.

### Skill fields

- `prereqs`: must form a DAG, with no cycles and no dangling ids (gate L0).
- `vocabulary`: the functions the skill teaches, using **primary** doc.json names only. For example `lpf`, not `cutoff`. Sound names like `"sawtooth"` are not functions and do not go here.
- `idiom_note`: one line, and it should match an entry in `docs/strudel-idioms.md`.

### Variant fields that are easy to get wrong

- `solutions[0]` is canonical. Further solutions are *accepted alternatives* and must produce **identical haps** (gate L5). Add one only after you have run both and compared the events. Give each alternative a `note` explaining why it is equivalent and why the canonical form is preferred.
- `hide_reference_code_until_reveal`: `true` for every type in U3a. It is mandatory for `match-by-ear`.
- `dictation` needs `abc` and `verify.abc_agreement` (gate L4). One ABC bar in `M:4/4` is one cycle. A whole note is 1 cycle, whatever `L:` says.
- `verify.cycles` must cover one full repetition: 1 for a one-bar loop, 2 for a two-bar `<a b>`, 4 or more for a phrase-long sweep, and 8 to show that a 4-bar ramp resets.
- **Method order:** note, `s`, envelope, filters, then `gain` and effects (`docs/house-style.md`, idiom 5). The order is for readability only, because superdough's chain is fixed.
- `sources`: one key per entry, chosen from `strudel-doc`, `strudel-src` (`path#Lx-Ly`), `lexicon`, `url`, `workshop` and `breathofstrudle`. **Every qualitative word in the title, prompt or `listen_for` needs a `lexicon:` source**, and that term must exist in the lexicon. A word listed as a synonym in an entry's `notes` counts as that entry; for example, "body" and "weight" cite `thin`. If a word isn't there, reword it or add the entry first.
- `listen_for`: 2–4 concrete, checkable items: what changes, where in the bar, and in which direction. Add a hint where useful ("If yours rings less, raise lpq").

## 2. Directives

Directives are fenced blocks. Each starts on its own line with `:::name{attrs}` and ends on a line containing only `:::`. They don't nest. The body is raw text, except in `bridge`, where it is Markdown. Attributes are `key="value"` or a bare `flag`.

| Directive | Body | Notes |
|---|---|---|
| `play{label="…"}` | Strudel code | Play button plus code. Add `hidecode` to hide the code. |
| `code` | Strudel code | No play button. Add `antipattern` to exempt it from L7. |
| `abc` | ABC text | Staff notation. |
| `diagram` | Graphviz DOT | Rendered to SVG at build time. |
| `envelope` | YAML `{attack, decay, sustain, release, hold?}` | ADSR plot. `hold` is the note length in seconds. |
| `filter` | YAML `{type: lowpass\|highpass\|bandpass, cutoff, q}` | Response plot. `q` uses the same units as `lpq`/`hpq`/`bpq`, so it goes straight to Web Audio's `Q`. For lowpass and highpass that is **dB** ([W3C](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q)), and for bandpass it is linear. U3a's only plot uses `q: 10`, meaning `lpq(10)`, a peak of about 10 dB. |
| `signal` | YAML `{shape, min, max, period, cycles, label?}` | `period` is the `.slow(n)` value in cycles. |
| `bridge{title="…"}` | Markdown | Classical-to-Strudel callout. |
| `compare{diff="…"}` | YAML `{a: {label, code}, b: {label, code}}` | The two snippets must differ in **exactly one** parameter, and `diff` names it. The one exception is a single conceptual control: the amplitude envelope may change as a whole (pluck versus pad) if `diff` spells out every value that changes. Both sides must still be idiomatic code. |

**Inline citations** (gate L8b) go right after the claim: `{cite doc=lpf}` for a doc.json entry, or `{cite src="packages/superdough/helpers.mjs#L219-L227"}` for lines in the pinned clone, always as a `#Lx-Ly` range. Cite **behaviour**: units, defaults, ranges, what a function sets, the order of processing. You don't need to cite the meaning of a musical term. External acoustics facts get a Markdown link to a source you have actually read.

**Inline code spans** that look like a Strudel identifier or call (`` `lpf` ``, `` `.lpf(800)` ``) are checked against doc.json (gate L8a). Don't put non-Strudel identifiers (Web Audio class names, note names like c4) in backticks. Quoted strings such as `` `"sawtooth"` `` are fine.

## 3. Pedagogy rules

1. **The learner** is an advanced classical musician (piano, choral conducting, trombone and tuba) who knows Web Audio graphs. Skip beginner theory. Don't explain what a triad or an octave is.
2. **Build a bridge** from a classical concept in every lesson: registration, orchestration, articulation, dynamics, vowels, form. Use one `:::bridge`, and keep it short.
3. **A lesson is at most 300 words** of prose (bridges included, code excluded). It has one or two visuals (`compare`, `envelope`, `filter`, `signal`, `diagram`) and **at least one thing to hear** (`play` or `compare`).
4. **Teach by doing.** The lesson shows the idea once. The variants make the learner type it in several contexts.
5. **Each skill gets at least 3 variants across several types.** Each unit should cover dictation, describe-to-code, match-by-ear and sweep where they make sense.
6. **Qualitative words** come from the timbre lexicon. If a word isn't there, add an entry with real sources first (§5). When a description admits a range of values, say so in the prompt ("any cutoff from about 500 to 1000 Hz fits") and pick one value for the reference.
7. **Use Strudel's own vocabulary.** Write `lpf`, not "the VCF". Introduce general synth terms only alongside the Strudel name.
8. **Copyright:** use original melodies or public-domain material only. If you adapt from the Strudel workshop (AGPL-3.0) or BreathOfStrudle (CC BY 4.0), add a `workshop:` or `breathofstrudle:` source and record it for `ATTRIBUTION.md`.
9. **Synths only in U3a,** so everything works offline. Sample banks need the network (risk K2).

## 4. How to check a snippet

Until `pnpm verify` (WS-A) is complete, check every snippet by hand. Afterwards, `pnpm verify` and `pnpm verify --explain <id>` do all of the following.

1. **Names exist and are primary.**

   ```sh
   node -e 'const d=require("./tools/strudel-ref/doc.json").docs;
     const e=d.find(x=>x.name==="lpq"); console.log(e.synonyms, e.params, e.examples)'
   ```

   If the name you want shows up only as someone else's synonym, use that entry's name.
2. **It evaluates, and the events are what you meant.**

   ```sh
   cd packages/verify
   node scripts/run.mjs eval 'note("c2*8").s("sawtooth").lpf(600).lpq(8)' 1
   echo 'note("c3")' | node scripts/run.mjs eval - 4
   ```

   Read the haps. Check the onsets (`0/1 → 1/8`), the control keys (`lpf` shows up as `cutoff`, `lpq` as `resonance`, `hpf` as `hcutoff`) and the values. The output caught a real mistake while U3a was being written: `gain("1 0.5")` accents half-bars, not beats. `gain("[1 0.5]*4")` was meant.
3. **Alternatives are identical.** Run every solution and diff the outputs.
4. **Prettier-clean, double quotes only.** Format with the house-style config and make sure nothing changes:

   ```sh
   cd packages/verify && node -e '
     import("prettier").then(async p => process.stdout.write(await p.format(
       require("fs").readFileSync(0,"utf8"),
       {parser:"babel",semi:false,singleQuote:false,printWidth:80,trailingComma:"all"})))' < snippet.js
   ```

   Lines over 80 characters are broken into one method per line. Copy Prettier's output into the YAML.
5. **ABC agrees with the haps.** abcjs `C` is MIDI 60, the same as Strudel's `c4`. The key signature applies, so in `K:D` an ABC `c` is `c#5`. Every note's onset and duration in cycles must match: a quarter note is ¼, and `a4@2` in a four-step bar is ½.
6. **Behavioural claims match the source.** Open the cited lines in `tools/strudel-ref/.cache/strudel` and read them. Line numbers are against the pinned commit. Facts checked for U3a, in case you need them again:
   - Synth names `triangle`, `square`, `sawtooth` and `sine` (aliases `tri`, `sqr`, `saw`, `sin`): `packages/superdough/synth.mjs#L23-L29`.
   - Default synth envelope 0.001/0.05/0.6/0.01, a linear amplitude envelope: `synth.mjs#L47-L68`.
   - Envelope inference when only some stages are set: `packages/superdough/helpers.mjs#L167-L178`.
   - Filters are BiquadFilterNodes with default Q 1 and a 12 dB type unless `ftype` says otherwise: `helpers.mjs#L219-L248`, `superdough.mjs#L360-L364`.
   - Gain defaults to 0.8 and is linear in this version: `superdough.mjs#L65-L69`, `#L180-L182`, `#L606-L611`.
   - Signals are sampled at the start of the query span, which is the note's onset: `packages/core/signal.mjs#L18-L21`.

## 5. Timbre lexicon entries

Each entry has a `term`, `tendencies` written in Strudel vocabulary (`higher lpf cutoff`, `s("square")`), a `status` and a `confidence`, plus at least one source with a `title`, a `url` and ideally a verbatim `note`.

- **Fetch every URL** and confirm that it loads and that it says what you claim. Quote it in `note`. Never cite from memory. If a paper is paywalled, cite an open chapter or page that you could read, and say so.
- `canonical` means there is broad agreement in the timbre-semantics literature or in standard synthesis teaching, as with *bright* or *hollow*. `subjective` means listeners or genres disagree, or the word is colloquial, as with *warm*, *soft*, *pad-like* or *squelchy*.
- Lower the confidence whenever the sources support only part of a tendency, and use `notes` to say which part is this course's own convention.
- Quote YAML titles that contain `: `.

## 6. Worked example: adding a skill end to end

Suppose you are adding `snd.bandpass`, "Band-pass filter", to U3b.

1. **Check the vocabulary.** `node -e` on doc.json shows that `bpf` exists, with the synonyms `bandf` and `bp`, and that `bpq` exists. Primary names: `bpf`, `bpq`.
2. **Read the source.** In `packages/superdough/superdough.mjs`, find the `fx.bandf` branch after the high-pass branch. Note that it creates a biquad of type `bandpass` through `createFilter` (`helpers.mjs`). For band-pass, the Web Audio spec treats Q as linear rather than in dB. Write down the line ranges you will cite.
3. **Add the skill** to `content/skills.yaml`:

   ```yaml
   - id: snd.bandpass
     unit: u3b
     title: Band-pass filter
     prereqs: [snd.highpass]
     summary: Keep one region of the spectrum with bpf; narrow it with bpq.
     vocabulary: [bpf, bpq]
     lesson: snd.bandpass.lesson
     idiom_note: >-
       One bpf is clearer than an lpf and hpf pair when you mean "only this band".
   ```

   Add the node and edge to the DOT graph in `docs/curriculum.md`, and add the idiom to `docs/strudel-idioms.md` with its citation.
4. **Write the lesson** `content/units/u3b/lessons/bandpass.md`. Give it frontmatter `{id: snd.bandpass.lesson, title, skill: snd.bandpass}`, at most 300 words, a `:::compare{diff="bpf 500 → 2000"}`, a `:::filter` plot with `type: bandpass`, a `:::bridge` (vowel formants, or the band of a choir section), and a `{cite}` on every behavioural sentence.
5. **Write three or more variants**, `snd.bandpass.v01.yaml` and on: for example a spec-to-code, a describe-to-code that uses lexicon terms (add a *nasal* entry first, with sources), and a match-by-ear. Run each solution through `eval` and read the haps. Format it with Prettier, and write the `listen_for` items.
6. **Run the gates:** `pnpm verify`, then `pnpm verify --explain snd.bandpass.v01` for anything red. Review the new L3 snapshot diff (`pnpm verify --update`) as if it were code.
7. **Ask for an adversarial review** of the batch (PROPOSAL §13). Give the reviewer the files plus the pinned clone and ask them to refute every claim.
