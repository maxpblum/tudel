# AGENTS.md: orientation for LLM contributors

Read this first (`CLAUDE.md` and `GEMINI.md` import it). Then read `PROPOSAL.md` §2 (binding requirements) and `ARCHITECTURE.md`. Everything here runs with standard open tools (Node, pnpm, git, Chromium). Nothing depends on any company's internal infrastructure.

## Invariants (never break these)

1. **The milestones are gated.** M1, then M2, then M3. Work on a milestone starts only after the learner approves the previous one. M1 was approved by the learner on 2026-10-06; M2 is in progress.
2. **No editor or REPL in the app** (R-NO-EDITOR). There is a copy button on every code display. **No auto-grading** (R-GRADE).
3. **The app reads only the verified bundle.** It never reads `content/`, and the verifier never imports app code.
4. **Every Strudel snippet passes the gates.** Never present a Strudel function as existing unless `tools/strudel-ref/doc.json` (or an ADR-backed allowlist entry) says it does. Don't trust that something evaluated: the gates check names separately.
5. **The Strudel version is pinned** (`tools/strudel-ref/pin.json`, exact npm versions). Bumping it is a deliberate, reviewed change (see `tools/strudel-ref/README.md`).
6. **Behavioral claims carry a `{cite …}`** pointing at `doc.json` or pinned source lines. Lexicon entries cite real sources you have opened. Never invent citations.
7. **Every user action is persisted before the UI proceeds.** State is derived by replaying the event log. Changing the event format needs a migration and a test.

## How to…

| Task | Do this |
|---|---|
| Add a skill, lesson, or exercise | Follow the worked example in `docs/content-authoring.md`. Then run `pnpm verify` (and `pnpm verify --update` for new snapshots; read the diff) |
| Check one snippet's events | `cd packages/verify && node scripts/run.mjs eval 'note("c3").s("sawtooth")' 4` |
| See why an item fails | `pnpm verify --explain <variant-or-lesson-id>` |
| Check a Strudel name or its signature | Query `tools/strudel-ref/doc.json`. Read source at `tools/strudel-ref/.cache/strudel` (set up with `bash tools/strudel-ref/generate-doc-json.sh --setup-only`) |
| Change app behavior | Edit `apps/web/src/*` (each folder has a README). Keep ≥90% line coverage on `srs/`, `store/`, `session/` |
| Run unit tests / coverage | `pnpm test` for fast parallel unit tests; `pnpm test:coverage` to check the ≥90% line coverage threshold |
| Run everything | `bash ci/run-all.sh` (install, typecheck, verify, test:coverage, e2e) |
| Update the live site (gh-pages) | `pnpm pages` (builds from a clean tree, force-pushes `gh-pages`) |
| Record a decision | Add an ADR in `docs/decisions/` in the right number block |

## Writing prose (lessons, prompts, listen-for lists, lexicon notes)

1. **Follow `content/STYLE_TIPS.md`.** It defines who the reader is and what makes prose clear for them: demos that are easy to hear, terms defined before use, concrete simplifications, explicit inferences, units, plots of what's described, and analogies from the learner's own experience.
2. **Run a style QA pass after writing or editing prose.** Go through the QA checklist at the end of `STYLE_TIPS.md`, sentence by sentence, reading as the learner. For larger batches, have a reviewer who did not write the prose do this, such as a fresh subagent. Report how well each tip was followed, with the failures you found and fixed. The gates check facts and code, not clarity, so this pass is not optional.
3. Then run `pnpm verify` so the edited prose still parses and its claims and code are still correct.

## Style

- **Strudel code:** `docs/house-style.md`. In Strudel, double quotes mean mini-notation, so single-quoted strings are banned in references.
- **Musical time:** `docs/time-conventions.md` (1 bar = 1 cycle, `setcpm(BPM / 4)`).
- **TypeScript:** strict mode, small pure functions for anything stateful, with tests next to the folder (`apps/web/src/**/*.test.ts`, `packages/verify/test/`).

## Before you call work done

`bash ci/run-all.sh` is green. If the change affects commands, status, milestones, the deploy flow, or the live URL, update `README.md` in the same change. For content changes, the style QA pass is done and an adversarial review is recorded in `docs/qa/reviews/`. For milestones, `docs/qa/release-checklist.md` passes.
