# Authoring Prompt: Batch 3 (Unit U12: Form, Arc & Zen)

You are authoring **Batch 3 of Milestone 3** for **tudel**, the final unit that consolidates the entire curriculum.

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

## Scope for Batch 3: Unit U12 (Form, Arc & Zen)

Author the unit, skills, lessons, and exercise variants (minimum 3 variants per skill) for:

### Unit `u12`: Form, arc & zen (order: 13)
- **Objectives:**
  - **Section composition:** Writing multi-section pieces using `arrange` and `seqPLoop` rather than sprawling monoliths.
  - **Architectural shape:** Code whose visual structure mirrors the musical arc (Intro, A section, B section / Chorus, Breakdown, Outro).
  - **Large-scale readability:** Clean part naming (`$:`), avoiding deeply nested unreadable closures, balancing patterns.
  - **Zen of Strudel consolidation:** Bringing together idioms from U1–U11 into unified principles of clean, expressive live coding.
- **Target Skills (suggested 5–6 skills):**
  - `zen.section-arrange`: sequential arrangement with `arrange`
  - `zen.loop-layering`: overlapping loops with `seqPLoop`
  - `zen.dramatic-arc`: building and releasing tension across sections
  - `zen.readability-refactor`: refactoring sprawling code into clean architectural forms
  - `zen.consolidated-idioms`: principles of idiomatic live coding
- **Exercise Types to Exercise:**
  - `arrange`: Providing distinct section stems to assemble into structured song form.
  - `refactor`: Taking poorly factored, redundant multi-bar code and refactoring it cleanly.
  - `read-the-code`: Predicting sectional transitions and tension arcs.
  - `creative`: Constructing a complete 3-section piece following an architectural brief.

---

## Deliverables & Output Layout
Write all authored files into `output/batch3/`:
```
output/batch3/
├── skills.yaml                             # Additions to units: and skills:
└── units/
    └── u12/
        ├── lessons/                        # *.md
        └── exercises/                      # *.yaml
```

---

## Self-QA Checklist Before Submitting
- [ ] **Pitch floor check:** Are ALL notes in snippets/solutions at or above C3 (MIDI 48)?
- [ ] **Double quotes only:** Did you use only `"..."` (never single quotes) in Strudel mini-notation and code?
- [ ] **Primary names only:** Use `.s(...)` (never `.sound(...)`).
- [ ] **Directive attributes:** In `:::compare{diff="..."}`, do not nest unescaped double quotes inside the `diff` string.
- [ ] **Prose citations (Gate L8):**
  - Bare words in backticks (like ` `minor` `, ` `maj7` `, ` `x` `) trigger Gate L8 identifier checks. Write them as plain text or quoted text without backticks unless they are real Strudel functions/methods in `doc.json`.
  - In exercise `sources:`, use primary names from `doc.json` (e.g. `strudel-doc: arrange`, `strudel-doc: seqPLoop`, `strudel-doc: s`).
- [ ] **Line wrapping (Gate L7 Prettier):** Keep lines within 80 characters. Wrap long method chains and long argument strings across lines.
- [ ] **Style tips check:** Does every number have units? Are analogies drawn from classical/brass/choral/piano practice?
