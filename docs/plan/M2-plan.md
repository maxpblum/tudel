# M2 implementation plan: foundation (units U1, U2, U3b, U4 and app features)

This is the working plan for milestone M2 of [PROPOSAL.md](../../PROPOSAL.md), which is binding. Content conventions are in [ADR 0201](../decisions/0201-m2-content-conventions.md).

## Context
The learner has approved M1. PROPOSAL §16 defines M2 as four units (U1 Time & rhythm, U2 Pitch/voices/harmony, U3b Sound continued, U4 Time & modulation) plus these app features: skill map, search, full overrides, relearning, fluency tracking, and glossaries. The user chose the full scope, at fine-grained density (about 7 skills per unit).

**What already exists:**
- Relearning: refresher lessons after repeated Again, in `session/builder.ts:122` and `srs/index.ts:101`.
- Fluency recording: `revealed.elapsedMs`, plus `revealTimes()` in `session/progress.ts:166`.
- Chord-symbol validation: L0 and L8c already check `content/glossary/chord-symbols.yaml` if it exists.

**What's missing:**
- The UI for fluency.
- Two overrides: suspend and focus-on-unit.
- Skill map, search, and glossary pages.
- Chords and Strudel terms in the bundle.
- All the M2 content.

The work splits in two:
- **App and verifier changes.** These are logic, so they get unit and e2e tests.
- **Content.** This goes through gates L0–L8, the style QA pass, and the adversarial review.

## Phase 0: housekeeping
- In `AGENTS.md` invariant 1, `README.md` status, and `docs/curriculum.md`, record "M1 approved 2026-10-06; M2 in progress".
- Add `docs/plan/M2-plan.md`: a short copy of this plan, matching `docs/plan/M1-plan.md`.

## Phase 1: verifier and bundle (packages/content-schema, packages/verify)
1. **Chords in the bundle.**
   - Extend the chord-symbols schema to `{symbol, tones[], name, skills[]}`. Move it from the loose L0 schema into `content-schema` beside `LexiconEntry`.
   - L0 checks that each entry in `skills` exists.
   - The bundle gains `chords`.
2. **Strudel terms, derived instead of hand-written.**
   - The bundle compiler (`packages/verify/src/compile/bundle.ts`) emits `terms: [{name, synopsis, synonyms, skills[]}]` for every name in any skill's `vocabulary`.
   - `synopsis` is the first sentence of that name's `doc.json` description, and `skills` is every skill that lists the name.
   - This makes the terms correct by construction and avoids a new class of prose that would need citations.
3. Bump the bundle `schemaVersion`.
4. Regenerate the fixture with `scripts/make-fixture.mjs` and add one chord entry to it.
5. Update the verify and schema READMEs.

## Phase 2: app features (apps/web/src)
Small pure functions with tests next to them, and ≥90% coverage kept on srs, store and session.

1. **Event log v2** (`store/events.ts`, `store/migrations.ts`), per invariant 7.
   - Add the `'suspend'` override action. The existing `restore` undoes it.
   - Add a new event, `focus_changed {unitId: string | null}`.
   - Set `LOG_VERSION = 2` and add `migrations[1]` (v1→v2 is a version bump only).
   - Update `store.test.ts`: the migration-key assertion, the v1 literals, and a v1-log load test.
2. **SRS** (`srs/index.ts`).
   - `parked` gains `'suspended'`, so `statusOf` and `describeDue` handle it.
   - A suspended skill satisfies prerequisites only if it already has a card. This keeps `isIntroduced` card-based.
3. **Session builder** (`session/builder.ts`).
   - `BuildInput.focusUnit` restricts the new-skill pick and the practice pool to that unit.
   - Due reviews from every unit still come first, so focusing never lets cards go overdue. This is documented in `session/README.md`.
   - Add `replayFocus(events)` to `progress.ts`, next to `replayMinutes`, and wire it in `appContext.tsx`.
4. **Fluency** (`session/progress.ts`).
   - Add `fluencyBySkill(events, content)`, which maps each variant to its first skill and returns a chronological `{ts, ms}[]` plus a median per skill.
   - `SkillPage` shows a small trend (sparkline, last and median), labelled "informational, not used for scheduling".
5. **Overrides UI** (`ui/OverridesMenu.tsx`).
   - Add a suspend button. The restore button also shows for suspended skills.
   - Add a "Focus on this unit / Clear focus" control on the unit header in the Library, and a focus chip on Today.
6. **New pages**, added as `else if` branches in `ui/App.tsx` with links from Library and the nav.
   - `#/map`: SVG skill DAG. A pure `layoutDag(skills)` in `ui/` (with a test) assigns columns by longest-prereq depth and groups rows by unit. Nodes are coloured by status and link to the skill page.
   - `#/search?q=`: a pure `buildSearchIndex` / `search` in `content/` (with a test). It does case-insensitive token matching over skill titles, summaries, vocabulary, lesson text, variant titles and prompts, and glossary entries. It returns typed results that link to their pages. There's no extra dependency.
   - `#/glossary/terms|lexicon|chords`: three lists cross-linked to skills.
     - Terms use `terms[].skills`, and chords use `chords[].skills`.
     - Lexicon terms link to every skill whose lesson or variant text uses the term. This uses a pure `lexiconLinks()` in `content/` with a test.
   - `content/indexBundle.ts` gains accessors for lexicon, chords and terms.
7. **E2E** (`tests/e2e`).
   - Extend `overrides.spec` (suspend and restore; focus changes Today's new skill).
   - Extend `library.spec` (map nodes link correctly; a search for "euclid" finds the U1 skill; each glossary renders and cross-links).
   - Add one fluency-trend assertion to `session-gaps.spec`.
8. Update the READMEs in `ui/`, `store/`, `srs/`, `session/`, `content/` and `tests/e2e/`.

## Phase 3: content
**New conventions ADR**, `docs/decisions/0201-m2-content-conventions.md`, recorded before authoring:
- **Network policy.** U1 drums use `s`/`bank` samples. They are tagged `needsNetwork`, show the existing offline banner, and are skipped by L6 when `L6_OFFLINE=1`. Every other unit stays synth-only, with noise as the offline synths `white`, `pink` and `brown`.
- **Drum dictation.** Use `abc_agreement.compare: [onset, duration]`, with `clef=perc` and one ABC voice per checked line. Split stacked kits with `only_sounds`.
- **Verified names.** FM is taught as `fmi`, because `fm` is only a synonym. Neither `dict` nor `delaytime` is primary in `doc.json`, so we don't teach them unless the pinned source justifies it. Delay time is checked in source, and otherwise we teach only `delay` and `delayfeedback`.
- **Id prefixes.** `rhy.` (U1), `pit.` (U2), `snd.` (U3b, continuing U3a), `mod.` (U4).

**Skill list (29 skills).** All four unit entries and every skill stub go into `content/skills.yaml` first, so the DAG is settled before authoring.
- **U1:**
  - `rhy.cycles-tempo`: cycles, `setcpm`, 1 bar = 1 cycle.
  - `rhy.drums`: `s`, `bank`.
  - `rhy.subdivide`: `[]` and `*`.
  - `rhy.rests-lengths`: `~`, `@` and `!`.
  - `rhy.alternate`: `<>` and `/`.
  - `rhy.layers`: `,` and `stack`.
  - `rhy.euclid`: `(k,n,r)` and `euclid`.
  - Drum dictation runs across these skills.
- **U2:**
  - `pit.scale-degrees`: `n` and `scale`.
  - `pit.modes`: scale names, changing the scale per bar.
  - `pit.chords-mini`: `,` in `note`.
  - `pit.parallel`: one line plus an interval offset via `add`.
  - `pit.polyphony`: independent `stack` parts.
  - `pit.chord-voicing`: `chord` and `voicing`.
  - `pit.register-inversion`: `anchor` and `mode`.
  - `pit.progressions`: diatonic progressions, plus `chord-symbols.yaml`.
- **U3b:**
  - `snd.filter-envelope`: `lpenv`, `lpattack`, `lpdecay` and similar, plus resonance (`lpq`).
  - `snd.bandpass`: the worked example in `docs/content-authoring.md`.
  - `snd.fm`: `fmi` and `fmh`.
  - `snd.fm-envelope`: `fmenv`, `fmattack` and `fmdecay`.
  - `snd.noise`: noise sources and `noise`.
  - `snd.room`: `room` and `roomsize`.
  - `snd.delay`: `delay` and `delayfeedback`.
  - The lexicon gains entries as needed (e.g. nasal, metallic, airy, wet), each with sources.
- **U4:**
  - `mod.signals`: `sine`, `saw`, `tri` and `square` as parameters.
  - `mod.range`.
  - `mod.slow-signals`: tying a sweep to N bars.
  - `mod.segment`.
  - `mod.perlin`: `perlin` and `rand` drift.
  - `mod.signal-melody`: `n(sine.segment(8).range(…)).scale(…)`.
  - `mod.phrase-sweeps`: sweeps aligned to 4- and 8-bar verses.

**Per skill:**
- One lesson (≤300 words, one `:::bridge`, `{cite}` on every behavioural sentence).
- 3–4 variants across dictation (or ear-dictation), describe-to-code, match-by-ear and sweep, with spec-to-code, transform and read-the-code where they fit.
- That comes to about 100 variants.
- Every solution is checked through `scripts/run.mjs eval`.
- Snapshots go through `pnpm verify --update`, and I read the diffs.

**How the work runs (token-frugal, quality-preserving):**
1. I write the ADR, the skeleton `skills.yaml`, and `chord-symbols.yaml` stubs.
2. Four author subagents run in parallel, one per unit. Each owns only its own `content/units/<unit>/` directory. The U3b author also owns the lexicon file, and the U2 author owns the chord symbols. Each gets the same brief: AGENTS.md, `STYLE_TIPS.md`, `content-authoring.md`, ADRs 0200 and 0201, and one representative U3a lesson plus two of its variants as the pattern. Each must finish with its unit passing `pnpm verify` and a self-run style QA.
3. Four fresh reviewer subagents, one per unit, each with the batch plus the pinned source. Each does the adversarial refutation and an independent `STYLE_TIPS.md` QA pass. They write `docs/qa/reviews/M2-<unit>-content.md` and `M2-<unit>-prose-style.md` in the M1 format (Findings F01…, confirmed claims, counts, resolutions).
4. I resolve the findings, re-run `pnpm verify`, and record the resolutions.

## Token management (added after review)

**Who does what, and on which model:**

| Work | Who | Model |
|---|---|---|
| Phase 0, ADR 0201, `skills.yaml` skeleton, orchestration, merging findings | Me | — |
| Phase 1 (verifier and bundle) | One subagent, working to a precise spec | sonnet |
| Phase 2 (app features, unit and e2e tests) | One subagent, working to a precise spec | sonnet |
| Phase 3 unit authors (one per unit, 4 in parallel) | Thinking-heavy: prose, musical judgment, citations | opus |
| Phase 3 reviewers (4, fresh) | Adversarial refutation and style QA | opus |
| Fixes from review: mechanical edits | Subagent | sonnet |
| Fixes from review: prose rewrites | The original author, resumed with SendMessage so its context is reused | opus |
| Phase 4 exploratory Playwright pass and screenshots | Subagent | sonnet |
| `M2-walkthrough.md` | Subagent | opus |

**Sub-subagents.** Each opus author hands mechanical loops to sonnet or haiku sub-subagents, and gets back only pass/fail plus diffs to read. Those loops are: running `eval` on candidate solutions, running `pnpm verify --update`, and reformatting with Prettier.

**Keeping my context small:**
- Every subagent returns a summary of at most 300 words: files touched, gate status, open issues. No file dumps.
- I never read subagent transcripts.
- Each subagent's brief points to files rather than inlining them.
- Authors share one brief template, so each fresh context needs only the files it requires.

**Ordering, to avoid clashes:**
- Phase 1 runs first, while I do Phase 0, the ADR, and the skeleton.
- Then Phase 2 (app) and the 4 authors run in parallel. They touch disjoint files.
- Authors judge only their own unit's gate results. A concurrent `pnpm verify` may show other units half-done.

## Phase 4: release
- Add new items to `docs/qa/release-checklist.md` §3: skill map, search, suspend, focus, fluency trend, glossaries, and drums with the offline banner.
- Run the scripted exploratory pass with Playwright screenshots in `docs/qa/screenshots/M2/`. Record the results in `docs/qa/M2-exploratory.md`, and write `docs/qa/M2-walkthrough.md`, including the drift report.
- Update `README.md` (status and commands).
- **I'll ask before running `pnpm pages`,** because it force-pushes the live site.

## Verification
- `bash ci/run-all.sh` is green: install, typecheck, `pnpm verify` L0–L8, `pnpm test` with the 90% coverage threshold, and `pnpm e2e` including L6.
- `bash tools/strudel-ref/generate-doc-json.sh --check`, and `bash ci/drift.sh` (report attached).
- `pnpm verify --explain <id>` on a sample of the new variants, including one drum dictation and one chord progression.
- Manual check in `pnpm build && pnpm --filter @tudel/web preview`: load an M1-era (v1) export and confirm it migrates. Check that focus and suspend change Today, and that search, the map and the glossaries navigate.
