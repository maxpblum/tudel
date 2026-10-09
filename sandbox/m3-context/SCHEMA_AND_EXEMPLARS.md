# Content Schema & Verified Exemplars

This document defines the strict schemas enforced by Gate **L0** and presents working exemplars from M1 and M2.

---

## 1. Schema Specifications (`packages/content-schema/src/index.ts`)

### Unit (`content/skills.yaml` under `units:`)
```yaml
id: u5
title: "Advanced harmony & voicing"
milestone: M3
order: 6
summary: >-
  Voicing dictionaries, voice leading, slash chords, sus and add9 chords,
  modal mixture, and genre-typical progressions.
```

### Skill (`content/skills.yaml` under `skills:`)
```yaml
id: pit.voicing-controls
unit: u5
title: "Voicing controls: anchor, mode and offset"
prereqs: [pit.chord-voicing]
summary: >-
  Control vertical spacing and voice-leading using anchor, mode, and offset.
vocabulary: [voicing, anchor, mode, offset]
lesson: pit.voicing-controls.lesson
idiom_note: >-
  Keep voices close across changes with anchor: voicing aligns each chord
  independently to the same reference pitch.
```

### Lesson Markdown (`content/units/<unit>/lessons/<lesson-id>.md`)
- Must begin with YAML frontmatter:
  ```markdown
  ---
  id: pit.voicing-controls.lesson
  title: Voicing controls: anchor, mode and offset
  skill: pit.voicing-controls
  ---
  ```
- **Custom Block Directives:**
  - `:::play{label="..."}`: Playable code block snippet.
  - `:::abc`: ABC staff notation snippet.
  - `:::code`: Highlighted non-playable code block.
  - `:::bridge{title="..."}`: Classical analogy or bridge callout.
  - `:::compare`: Compare two snippets differing by one parameter.
  - `:::diagram`: Graphviz/DOT diagram.
  - `:::filter`, `:::signal`, `:::envelope`: Visual plots.
- **Citations in Prose:**
  - `{cite doc=NAME}`: Must exist in `tools/strudel-ref/doc.json`.
  - `{cite src="path/to/file.mjs#L10-L20"}`: Pinned clone line range.

### Exercise Variant YAML (`content/units/<unit>/exercises/<variant-id>.yaml`)
- One file per variant. Filename must match `id` + `.yaml`.
- **Field Requirements by Exercise Type:**
  - `dictation`: Requires non-null `abc` string AND non-null `verify.abc_agreement`.
  - `transform` and `refactor`: Requires non-null `starter` code string.
  - `creative` and `project`: Requires non-null `rubric` array (strings).
- **Core Fields:**
  ```yaml
  id: pit.voicing-controls.v01
  skills: [pit.voicing-controls]
  type: spec-to-code           # one of the 13 exercise types
  difficulty: 2                # 1–5
  title: Smooth top line with anchor
  prompt: |                    # Markdown
    Shape a chord progression...
  abc: null                    # non-null string if type == dictation
  starter: null                # non-null string if type in [transform, refactor]
  hide_reference_code_until_reveal: true
  solutions:                   # ≥1 solutions; first is canonical
    - code: |
        chord("<Cmaj7 Am7 Dm7 G7>").voicing().s("sawtooth").lpf(1000)
  listen_for:                  # checklist shown on reveal
    - "Top voice stays within a minor third below C5"
    - "Smooth stepwise voice leading without leaps"
  rubric: null                 # required if type in [creative, project]
  verify:
    cycles: 4                  # number of cycles to query (1–64)
    snapshot: true             # snapshot golden test
    abc_agreement: null        # non-null for dictation
    equivalent_solutions: true # all solutions must produce identical events
  sources:
    - strudel-doc: voicing
    - strudel-doc: chord
  ```

---

## 2. Working Exemplars

### Exemplar 1: Lesson (`content/units/u2/lessons/progressions.md`)
```markdown
---
id: pit.progressions.lesson
title: Simple diatonic progressions
skill: pit.progressions
---

A progression in Roman numerals becomes chord symbols once you name the key. In C major, I ii iii IV V vi vii° are C, Dm, Em, F, G, Am and Bo, and V7 is G7. Put one symbol per bar inside `< >`, and `voicing` realises each bar {cite doc=chord} {cite doc=voicing}.

:::play{label="I IV V7 I in C major: C, F, G7, C"}
chord("<C F G7 C>").voicing().s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
V:1
[CEGc]4 | [CFAc]4 | [DFGB]4 | [CEGc]4 |
V:2 clef=bass
E,4 | F,4 | G,4 | E,4 |
:::

The soprano runs C, C, B, C: a held common tone, then the leading tone and its resolution. `voicing` has no memory of the chord before. It places each chord on its own, against the same anchor {cite src="packages/tonal/voicings.mjs#L196-L215"} {cite src="packages/tonal/tonleiter.mjs#L139-L179"}.

:::bridge{title="Numerals travel, symbols don't"}
Roman numerals describe a progression in any key. Chord symbols name one key's chords. I IV V7 I is C F G7 C in C major and F Bb C7 F in F major. To move a `chord` line to a new key, rewrite the symbols.
:::
```

### Exemplar 2: Spec-to-Code (`content/units/u2/exercises/pit.progressions.v01.yaml`)
```yaml
id: pit.progressions.v01
skills: [pit.progressions]
type: spec-to-code
difficulty: 2
title: I vi ii V7 in F major
prompt: |
  Play the progression **I, vi, ii, V7** in F major, one chord per bar, as
  chord symbols with `chord` and `.voicing()` on `"triangle"`, with the
  default settings. First turn each numeral into a symbol: the key decides
  whether each triad is major or minor, and V7 adds a minor seventh above the
  root of V.
hide_reference_code_until_reveal: true
solutions:
  - code: |
      chord("<F Dm Gm C7>").voicing().s("triangle")
listen_for:
  - "I, vi, ii, V7 in F major: F, Dm, Gm, C7"
  - "The top note moves C5, A4, B flat 4, C5"
verify:
  cycles: 4
sources:
  - strudel-doc: chord
  - strudel-doc: voicing
```

### Exemplar 3: Transform with Starter (`content/units/u2/exercises/pit.parallel.v01.yaml`)
```yaml
id: pit.parallel.v01
skills: [pit.parallel]
type: transform
difficulty: 2
title: Parallel thirds in D dorian
prompt: |
  Add a second voice a third above the melody using `.add(2)`. The original line
  is given below in D dorian.
starter: |
  n("0 1 2 4 3 2 1 0").scale("D4:dorian").s("triangle")
hide_reference_code_until_reveal: true
solutions:
  - code: |
      n("0 1 2 4 3 2 1 0")
        .add("<0 2>")
        .scale("D4:dorian")
        .s("triangle")
listen_for:
  - "Two parallel voices moving strictly in thirds within D dorian"
verify:
  cycles: 2
sources:
  - strudel-doc: add
  - strudel-doc: scale
```

### Exemplar 4: Capstone Song Project (`type: project`)
```yaml
id: gen.synthwave-project.v01
skills: [gen.synthwave-track]
type: project
difficulty: 4
title: "Synthwave Capstone: Driving Night Run"
prompt: |
  Compose a complete 16-bar synthwave arrangement featuring:
  1. **Bassline:** Driving rolling eighth-note bass on `"sawtooth"` or `"supersaw"`.
  2. **Harmonic Bed:** Detuned chords or lush pad with slow filter modulation.
  3. **Lead Melody:** Arpeggiated hook or melodic lead with stereo delay.
  4. **Structure:** A clear dramatic arc using `arrange` or section layering.
hide_reference_code_until_reveal: true
solutions:
  - code: |
      setcpm(110 / 4)
      stack(
        // Bass: driving rolling bass
        note("c3*8").s("sawtooth").lpf(800).gain(0.8),
        // Chords: detuned pad
        chord("<Cm7 Abmaj7 Fm7 Gm7>").voicing().s("supersaw").detune(0.3).lpf(1400).gain(0.6),
        // Lead: syncopated arpeggio with delay
        note("g4 eb4 c4 g4 bb4 g4 eb4 f4").s("square").lpf(2000).delay(0.5).delaysync(3 / 16).gain(0.7)
      )
listen_for:
  - "Driving 110 BPM groove with rhythmic forward momentum"
  - "Wide stereo field between the centered bass and delayed lead"
  - "Warm, saturated synthwave timbre"
rubric:
  - "Includes a rolling bassline with steady eighth-note energy at or above C3"
  - "Includes a polyphonic chordal bed or voiced pad"
  - "Features a distinct melodic or arpeggiated lead line"
  - "Uses tempo-synced delay (delaysync) or chorus/detune for width"
verify:
  cycles: 4
sources:
  - strudel-doc: chord
  - strudel-doc: voicing
  - strudel-doc: supersaw
  - strudel-doc: delaysync
```
