# ADR 0003: L2 allowlist entry `p`

- **Status:** accepted
- **Date:** 2026-10-05
- **Workstream:** A (verification)

## Context

Gate L2 requires every function and method name in content code to be in the pinned `doc.json`, or on an allowlist (`packages/verify/src/gates/allowlist.json`) where **each entry cites its own ADR**. Allowlisted names still have to evaluate under gate L1 and play in the browser under L6. They are only exempt from the "documented" requirement.

`p` is not in `doc.json`. It is the method behind `$:` labels:

- `@strudel/core`'s repl defines `Pattern.prototype.p` when a repl is created (`packages/core/repl.mjs`, lines 171-200 at the pinned commit).
- The transpiler rewrites each label `x: pattern` to `pattern.p('x')` (`packages/transpiler/transpiler.mjs`, line 468).

Content uses `$:` labels for parallel parts (house style). If a snippet is ever written with an explicit `.p("name")`, L2 would reject it without this entry.

## Decision

Allow `p`. The justification is that it's part of the repl that the learner's tool (and our harness) runs, not a user-facing pattern function, which is why jsdoc doesn't document it.

## Consequences

- `$:` labels and explicit `.p(...)` both pass L2.
- If a Strudel bump adds `p` to `doc.json`, L2 reports the entry as redundant. Then remove it and mark this ADR superseded.
