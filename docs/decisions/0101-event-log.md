# ADR 0101: Append-only event log in IndexedDB as the only persisted state

- **Status:** accepted
- **Date:** 2026-10-05
- **Workstream:** B (web app)

## Context

R-SESSION requires that closing the tab mid-session loses nothing. R-RUN requires local-only storage with lossless JSON export and import. PROPOSAL §14 asks for an append-only, versioned log with migrations.

## Decision

1. **The only persisted state is an append-only list of events** in IndexedDB (database `strudel-tutor`, store `events`, auto-increment keys, so key order is append order). Event types in version 1: `session_started` (it embeds the planned steps), `session_completed`, `lesson_viewed`, `lesson_completed`, `variant_shown`, `revealed` (with prompt-to-reveal time), `rated`, `step_skipped`, `override`, `settings_changed`. Every event has `id`, `ts` (epoch ms) and `v` (format version). Session-scoped events carry `sessionId` and `step`, which are null outside a session.
2. **Write before the UI proceeds.** `EventLog.append()` validates the event with zod, writes it in a `readwrite` transaction with `durability: 'strict'`, waits for `oncomplete`, and only then updates the in-memory list and notifies React (`useSyncExternalStore`). The UI awaits `append()` before it moves to the next step. Appends are serialized, and `ts` is kept monotonic even if the wall clock goes backwards.
3. **All state is derived by pure replay**: FSRS cards (`srs/replaySrs`), sessions and the current step (`session/replaySessions`), variant rotation history, and settings. Resuming is just replay. The session plan is frozen into `session_started`, so a resumed session shows exactly the steps that were planned, even if time has passed or content changed (missing items can be skipped).
4. **Versioning and migrations.** `LOG_VERSION = 1`. `migrations[n]` upgrades one event from version `n` to `n+1`. On load, older stored events are migrated and the store is rewritten. Stored events that fail validation are kept in storage but ignored by replay (and counted), so a bug never destroys data. Version 0 is a deliberately different fake format (ISO `at`, `kind`, word ratings, no ids), used only to test the framework end to end.
5. **Export** is a JSON file `{format: 'strudel-tutor-log', version, exportedAt, events}`. **Import** parses the file, migrates older versions, validates every event, rejects duplicate ids and files from newer versions, asks the learner to confirm, then replaces the log atomically in one transaction.

## Consequences

- Export and import are lossless by construction, and two browsers with the same log show the same state at the same "now".
- Replay cost grows with the log. For one learner (thousands of events per year) it is negligible. Snapshots can be added later without changing the format.
- Every schema change needs a `LOG_VERSION` bump and a migration with a test.
