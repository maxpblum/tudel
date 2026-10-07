# VALIDATE_M2.md — instructions for the validating model

You are validating milestone M2 of this repository. Your ONLY job is to run one script and hand back its output **exactly**. Follow these steps in order. Do not skip, reorder, or add steps.

## Rules (read all five before starting)

1. **Do NOT edit, create, move, or delete any file** in this repository. Not even to "fix" something. The script creates its own output files; that is fine.
2. **Do NOT run any other command** than the ones written below. In particular, do not run `git commit`, `git checkout`, `git stash`, `git clean`, `pnpm pages`, or anything with `--force`.
3. **Do NOT summarize, shorten, interpret, or explain** the output. Copy it character for character. If you are unsure whether to include something, include it.
4. **Do NOT try to make failures go away.** A FAIL in the report is useful information, not your problem to solve.
5. If something happens that these instructions do not cover, stop and report it using the template in "If the script itself breaks" below.

## Step 1 — check the tools exist

Run these three commands from the repository root (the folder that contains this file):

```sh
node -v
pnpm -v
git --version
```

- If `node -v` prints a version starting with `v22` or higher, and `pnpm -v` prints a version starting with `10`, go to Step 2.
- Otherwise, stop. Your whole answer is the template below, filled in:

```text
VALIDATION NOT RUN: missing tools
node -v output: <paste>
pnpm -v output: <paste>
git --version output: <paste>
```

## Step 2 — run the validation script

Run exactly this one command from the repository root:

```sh
bash validation/run-m2-validation.sh
```

- It takes a long time (often 10–40 minutes). It prints lines starting with `==>` as it goes. Wait until it prints the line beginning with `Done.`
- Do not interrupt it, even if a step looks slow or prints errors.
- It needs internet access (it downloads packages, a Strudel source checkout, a Chromium browser and drum samples).

## Step 3 — hand back the output

Your answer must consist of **exactly these parts, in this order, with nothing before or after them**:

````text
=== REPORT.md ===
<the ENTIRE contents of the file validation/out/REPORT.md, copied exactly>
=== SNAPSHOT-REVIEW.md ===
<the ENTIRE contents of the file validation/out/SNAPSHOT-REVIEW.md, copied exactly>
=== END ===
````

To get the contents, run `cat validation/out/REPORT.md` and `cat validation/out/SNAPSHOT-REVIEW.md` and copy what they print.

- If `SNAPSHOT-REVIEW.md` is longer than about 3000 lines, copy only its first 3000 lines and its last line, and write `[TRUNCATED BY VALIDATOR AFTER LINE 3000]` where you cut.
- Never paste file contents from anywhere else, and never add your own comments inside the copied text.

## If the script itself breaks

"Breaks" means: it stops without printing `Done.`, or `validation/out/REPORT.md` does not exist. Then your whole answer is this template, filled in:

````text
VALIDATION SCRIPT BROKE
Last 80 lines printed in the terminal:
```
<paste the last 80 lines the terminal showed>
```
Contents of validation/out/REPORT.md (or "FILE MISSING"):
```
<paste>
```
````

## Do NOT do any of the following

- Do not say whether the project is "good" or "ready". Just return the files.
- Do not re-run the script a second time unless the first run "broke" (see above) because of a network error; in that case run it once more and return only the second run's output, adding the line `RE-RUN AFTER NETWORK ERROR` as the very first line of your answer.
- Do not open, read, or quote the files in `validation/out/logs/` unless the template above asks for them.

---

## Notes for humans and capable models (the validating model may ignore this section)

- The script mirrors `ci/run-all.sh` plus the extra checks in `docs/plan/M2-plan.md` § Verification: install → pinned clone → typecheck → `pnpm verify --update` → `pnpm verify` → `pnpm test` (with coverage thresholds) → `pnpm e2e` (including L6) → `generate-doc-json.sh --check` → `ci/drift.sh` (informational).
- `pnpm verify --update` is expected to **create** snapshots for the new U2 and U3b items and to **change** a few U1/U4 snapshots whose reference code was corrected during review. Every new or changed snapshot is printed in `SNAPSHOT-REVIEW.md` so it can be read as code (AGENTS.md: "read the diff"). After validation is green, the regenerated `packages/verify/__snapshots__/` files are part of the M2 change and must be committed.
- Status of M2 and what remains (manual learner walkthrough, deploy) is in `docs/plan/M2-status.md`.
