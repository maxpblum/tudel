# tudel M3 Context Sandbox

Welcome to the **tudel** M3 authoring sandbox. This directory provides an isolated, token-efficient workspace containing all the specifications, APIs, schemas, pedagogy rules, and exemplars required to author Milestone 3 (Units U5 through U12) of the curriculum.

---

## Your Role as Author (Claude)
- You are responsible for **deep understanding of the music pedagogy, Strudel APIs, and learner context**, and for **authoring all user-facing content** (skills, lessons, exercise variants, and glossary additions).
- The tutor assistant (Gemini) will handle ingesting your files, running verification (`pnpm verify`), generating golden snapshots, running automated tests, and handling any minor syntactic adjustments.

---

## Crucial Operating Guidelines

### 1. Working Directory (PWD)
Open and run Claude directly inside the sandbox directory:
```
/home/blampo/Projects/tudel/sandbox/m3-context
```
This guarantees an isolated workspace where Claude will **never** scan or ingest unrelated repo code (`apps/web`, `packages/`, `node_modules`, etc.), keeping token usage minimal.

### 2. Primary Source of Truth: Local Sandbox First
- The sandbox is completely self-contained. All APIs, schemas, pedagogy rules, and exemplars are in this directory.
- Prioritize these local files. Use web search only as a fallback for ambiguous questions not answered here.

### 3. Deliverables Location
Write all deliverables into the `output/` directory within this sandbox:
- Batch 1: `output/batch1/`
- Batch 2: `output/batch2/`
- Batch 3: `output/batch3/`

The tutor assistant (Gemini) will monitor and ingest these files into the main project's `content/` tree and run verification.

---

## Sandbox Index

| File | What it contains |
|---|---|
| [`PROPOSAL_M3.md`](./PROPOSAL_M3.md) | M3 curriculum specifications, requirements, and exercise types |
| [`STYLE_AND_PEDAGOGY.md`](./STYLE_AND_PEDAGOGY.md) | Learner persona, classical bridges, house style, time conventions, and idioms |
| [`STRUDEL_API_M3.md`](./STRUDEL_API_M3.md) | Verified Strudel APIs for voicing, pattern transforms, buses, detune, and arrangement |
| [`SCHEMA_AND_EXEMPLARS.md`](./SCHEMA_AND_EXEMPLARS.md) | Zod schemas, directives syntax, YAML formats, and working exemplars |
| [`CURRENT_SKILL_GRAPH.yaml`](./CURRENT_SKILL_GRAPH.yaml) | Units and skills currently in `content/skills.yaml` to reference as prerequisites |
| [`prompts/PROMPT_BATCH_1.md`](./prompts/PROMPT_BATCH_1.md) | Instructions and deliverable specification for Batch 1 (Units U5–U8) |
| [`prompts/PROMPT_BATCH_2.md`](./prompts/PROMPT_BATCH_2.md) | Instructions and deliverable specification for Batch 2 (Units U9–U11 + Song Projects) |
| [`prompts/PROMPT_BATCH_3.md`](./prompts/PROMPT_BATCH_3.md) | Instructions and deliverable specification for Batch 3 (Unit U12 + Idiom consolidation) |
