# Authoring Prompt: Batch 2 (Units U9, U10, U11 + 3 Song Projects)

You are authoring **Batch 2 of Milestone 3** for **tudel**, focusing on the genre tracks and capstone song projects.

---

## Operating Environment & Ground Truth
- **Working Directory (`PWD`):** `/home/blampo/Projects/tudel/sandbox/m3-context`
- **Primary Source of Truth:**
  - **Rely strictly on local sandbox files:**
    - `PROPOSAL_M3.md`
    - `STYLE_AND_PEDAGOGY.md`
    - `STRUDEL_API_M3.md`
    - `SCHEMA_AND_EXEMPLARS.md`
  - **Only use web search as a fallback** if you encounter ambiguous questions not answerable from the sandbox.

---

## Scope for Batch 2: Genre Tracks & Song Projects

Author units, skills, lessons, and exercise variants (minimum 3 variants per skill) for:

### 1. Unit `u9`: Chiptune Track (order: 10)
- **Aesthetic:** Authentic 8-bit retro arcade / game soundtrack aesthetic using built-in synths (`"square"`, `"triangle"`, `"white"` noise).
- **Techniques:**
  - 4-voice limit thinking (lead square, harmonic pulse, bass triangle, noise percussion).
  - Rapid arpeggios (pseudo-polyphony on a monophonic pulse wave via `fast`).
  - Chiptune drum synthesis (`"white"` noise bursts with fast decay envelopes for snare/hi-hat, pitch drops for kick).
  - Arcade scale progressions and ornaments.
- **Capstone Project Variant:**
  - Must include a variant with `type: project` (e.g. `chip.project.v01`), featuring:
    - Structured checkpoints in the prompt (1. Drum kit; 2. Bassline; 3. Arpeggiated lead; 4. Final multi-voice mix).
    - Canonical reference code.
    - Comprehensive `rubric: [...]` checklist.

### 2. Unit `u10`: Synth-pop Track (order: 11)
- **Aesthetic:** Early 80s synth-pop (inspired by the arrangements of Depeche Mode, New Order, Human League).
- **Techniques:**
  - Pumping 16th-note synth basslines.
  - Bright brass stabs with filter envelopes (`lpenv`).
  - Polyphonic vocal-pad or string beds.
  - Drum machine sequencing (TR-808 / TR-909 banks).
- **Capstone Project Variant:**
  - Must include a variant with `type: project` (e.g. `spop.project.v01`) with structured checkpoints and a rubric checklist.

### 3. Unit `u11`: Synthwave Track (order: 12)
- **Aesthetic:** Outrun / retrowave aesthetic: warm, driving, cinematic retro-futurism.
- **Techniques:**
  - Driving rolling basslines (steady eighth notes, filtered saw).
  - Sidechain pumping sensation (using rhythmic `gain` modulation via signals).
  - Lush detuned pad beds (`"supersaw"` with `detune`).
  - Soaring melodic lead drenched in `delaysync` and `room`.
- **Capstone Project Variant:**
  - Must include a variant with `type: project` (e.g. `swave.project.v01`) with structured checkpoints and a rubric checklist.

---

## Deliverables & Output Layout
Write all authored files into `output/batch2/`:
```
output/batch2/
├── skills.yaml                             # Additions to units: and skills:
├── units/
│   ├── u9/
│   │   ├── lessons/                        # *.md
│   │   └── exercises/                      # *.yaml (including chip.project.v01)
│   ├── u10/
│   │   ├── lessons/
│   │   └── exercises/                      # *.yaml (including spop.project.v01)
│   └── u11/
│       ├── lessons/
│       └── exercises/                      # *.yaml (including swave.project.v01)
└── glossary/
    ├── chord-symbols.yaml                  # (Optional)
    └── timbre-lexicon.yaml                 # (Optional)
```

---

## Self-QA Checklist Before Submitting
- [ ] Pitch floor check: Are ALL notes in snippets/solutions at or above C3 (MIDI 48)?
- [ ] Double quotes: Did you use only `"..."` (never single quotes) in Strudel code?
- [ ] Project rubrics: Do all 3 project variants have non-null `rubric:` lists?
- [ ] Style tips check: Does every number have units? Are analogies drawn from classical/brass/choral/piano practice?
