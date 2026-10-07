# store/

An append-only event log in IndexedDB (ADR 0101).

- `events.ts`: the zod schema for every event type (`LOG_VERSION = 2`). Version 2 added the `suspend` override action and the `focus_changed {unitId | null}` event. Every event has `id`, `ts` (epoch ms) and `v`.
- `db.ts`: an IndexedDB wrapper. One `events` store with auto-increment keys, so key order is append order. A write resolves only after its transaction commits (`durability: 'strict'`).
- `log.ts`: `EventLog`, an in-memory mirror of the store. `append()` validates the event, writes it durably, and only then updates memory and notifies subscribers, so the UI never shows unpersisted state. Appends are serialized, and timestamps are kept monotonic.
- `migrations.ts`: per-event migrations `v → v+1`, applied on load (and the store is rewritten) and on import. Version 0 is a fake older format that exists only to test the framework. `migrations[1]` (v1 → v2) is a version bump only, because v2 only added things.
- `exportImport.ts`: the versioned export file `{format: 'tudel-log', version, exportedAt, events}`. `parseExport` migrates and validates. The caller confirms, then calls `log.replaceAll`.

All state is derived elsewhere by pure replay functions: `srs/replaySrs` and `session/replaySessions`, `variantHistory`, `replayMinutes`, `replayFocus` and `fluencyBySkill`.
