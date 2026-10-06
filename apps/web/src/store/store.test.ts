import { describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { LOG_VERSION, LogEvent, newId, stamp } from './events';
import { migrateEvent, migrations, needsMigration, eventVersion } from './migrations';
import { exportFileName, parseExport, serializeLog, FILE_FORMAT } from './exportImport';
import { EventLog } from './log';
import { openEventDb } from './db';
import { mkLog, T0 } from '../test-helpers';

const sample = () =>
  mkLog([
    [T0, { type: 'session_started', sessionId: 's1', minutes: 20, steps: [{ kind: 'variant', skillId: 'a', variantId: 'a.v01', role: 'review' }] }],
    [T0 + 1, { type: 'variant_shown', sessionId: 's1', step: 0, variantId: 'a.v01', skillId: 'a' }],
    [T0 + 2, { type: 'revealed', sessionId: 's1', step: 0, variantId: 'a.v01', elapsedMs: 1 }],
    [T0 + 3, { type: 'rated', sessionId: 's1', step: 0, variantId: 'a.v01', skillId: 'a', rating: 3 }],
    [T0 + 4, { type: 'session_completed', sessionId: 's1' }],
  ]);

describe('events', () => {
  it('stamps with id, ts and version', () => {
    const e = stamp({ type: 'override', skillId: 'x', action: 'retire' }, 5, 'id1');
    expect(e).toEqual({ type: 'override', skillId: 'x', action: 'retire', ts: 5, id: 'id1', v: LOG_VERSION });
    expect(LogEvent.safeParse(e).success).toBe(true);
  });
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId(T0)));
    expect(ids.size).toBe(1000);
    expect(stamp({ type: 'session_completed', sessionId: 's' }, 1).id).toMatch(/^1-/);
  });
  it('rejects malformed events', () => {
    expect(LogEvent.safeParse({ type: 'rated', id: 'x', ts: 1, v: 1 }).success).toBe(false);
    expect(LogEvent.safeParse({ type: 'nope', id: 'x', ts: 1, v: 1 }).success).toBe(false);
  });
});

describe('migrations', () => {
  const v0 = { kind: 'rated', at: '2026-10-05T09:00:00.000Z', variantId: 'a.v01', skillId: 'a', rating: 'good' };
  it('upgrades a v0 event to v1', () => {
    expect(needsMigration(v0)).toBe(true);
    expect(eventVersion(v0)).toBe(0);
    const m = migrateEvent(v0, 3);
    expect(m).toEqual({
      type: 'rated', ts: T0, id: `v0-3-${T0.toString(36)}`, v: 1,
      variantId: 'a.v01', skillId: 'a', rating: 3, sessionId: null, step: null,
    });
    expect(LogEvent.safeParse(m).success).toBe(true);
  });
  it('fills elapsedMs for v0 reveals and leaves v1 alone', () => {
    const m = migrateEvent({ kind: 'revealed', at: '2026-10-05T09:00:00Z', variantId: 'a.v01' }, 0);
    expect(LogEvent.safeParse(m).success).toBe(true);
    const v1 = sample()[0]!;
    expect(migrateEvent(v1, 0)).toBe(v1);
    expect(needsMigration(v1)).toBe(false);
  });
  it('rejects bad timestamps, missing migrations and newer versions', () => {
    expect(() => migrateEvent({ kind: 'rated', at: 'never' }, 0)).toThrow(/unparseable/);
    expect(() => migrateEvent({ v: 0 }, 0, {})).toThrow(/no migration from version 0/);
    expect(() => migrateEvent({ v: 99 }, 0)).toThrow(/newer/);
    expect(Object.keys(migrations)).toEqual(['0']);
  });
});

describe('export/import', () => {
  it('round-trips the log losslessly', () => {
    const events = sample();
    const text = serializeLog(events, new Date(T0));
    const doc = JSON.parse(text);
    expect(doc.format).toBe(FILE_FORMAT);
    expect(doc.version).toBe(LOG_VERSION);
    const r = parseExport(text);
    expect(r).toEqual({ ok: true, events, fromVersion: 1 });
    expect(exportFileName(new Date(T0))).toBe('tudel-progress-2026-10-05.json');
  });
  it('imports and migrates a v0 file', () => {
    const text = JSON.stringify({
      version: 0,
      log: [
        { kind: 'override', at: '2026-10-05T09:00:00Z', skillId: 'a', action: 'retire' },
        { kind: 'rated', at: '2026-10-05T09:01:00Z', variantId: 'a.v01', skillId: 'a', rating: 'easy' },
      ],
    });
    const r = parseExport(text);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.fromVersion).toBe(0);
      expect(r.events.map((e) => e.type)).toEqual(['override', 'rated']);
      expect(r.events[1]).toMatchObject({ rating: 4, v: 1 });
    }
  });
  it('accepts the pre-rename format name', () => {
    const r = parseExport(JSON.stringify({ format: 'strudel-tutor-log', version: 1, events: [] }));
    expect(r.ok).toBe(true);
  });
  it.each([
    ['not json', '{', /Not a JSON/],
    ['null', 'null', /Not a progress file/],
    ['wrong format', JSON.stringify({ format: 'x', version: 1, events: [] }), /Not a tudel/],
    ['newer', JSON.stringify({ format: FILE_FORMAT, version: 9, events: [] }), /newer app version/],
    ['no list', JSON.stringify({ format: FILE_FORMAT, version: 1, events: 3 }), /no event list/],
    ['non-object event', JSON.stringify({ format: FILE_FORMAT, version: 1, events: [3] }), /not an object/],
    ['invalid event', JSON.stringify({ format: FILE_FORMAT, version: 1, events: [{ type: 'rated', id: 'a', ts: 1, v: 1 }] }), /invalid/],
    ['bad v0 event', JSON.stringify({ version: 0, log: [{ kind: 'rated', at: 'x' }] }), /unparseable/],
  ])('rejects %s', (_n, text, re) => {
    const r = parseExport(text);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(re);
  });
  it('rejects duplicate ids', () => {
    const [a] = sample();
    const r = parseExport(JSON.stringify({ format: FILE_FORMAT, version: 1, events: [a, a] }));
    expect(r.ok).toBe(false);
  });
});

describe('EventLog (IndexedDB)', () => {
  it('persists appends across reopen, in order, and notifies subscribers', async () => {
    const factory = new IDBFactory();
    let t = T0;
    const { log, report } = await EventLog.open({ factory, clock: () => t });
    expect(report).toEqual({ migrated: 0, invalid: 0 });
    let notified = 0;
    const unsub = log.subscribe(() => notified++);
    const before = log.getEvents();
    const [a, b] = await Promise.all([
      log.append({ type: 'override', skillId: 'x', action: 'retire' }),
      log.append({ type: 'override', skillId: 'x', action: 'restore' }),
    ]);
    t = T0 - 1000; // clock going backwards must not reorder the log
    const c = await log.append({ type: 'settings_changed', minutes: 25 });
    expect(c.ts).toBe(T0);
    expect(notified).toBe(3);
    expect(log.getEvents()).not.toBe(before);
    expect(log.getEvents().map((e) => e.id)).toEqual([a.id, b.id, c.id]);
    unsub();
    log.close();
    const { log: again } = await EventLog.open({ factory });
    expect(again.getEvents().map((e) => e.id)).toEqual([a.id, b.id, c.id]);
    again.close();
  });
  it('rejects invalid appends without writing', async () => {
    const factory = new IDBFactory();
    const { log } = await EventLog.open({ factory });
    await expect(log.append({ type: 'settings_changed', minutes: 1 })).rejects.toThrow();
    await log.append({ type: 'settings_changed', minutes: 30 });
    expect(log.getEvents()).toHaveLength(1);
  });
  it('replaces the log on import', async () => {
    const factory = new IDBFactory();
    const { log } = await EventLog.open({ factory });
    await log.append({ type: 'settings_changed', minutes: 30 });
    const events = sample();
    await log.replaceAll(events);
    expect(log.getEvents()).toEqual(events);
    log.close();
    const { log: again } = await EventLog.open({ factory });
    expect(again.getEvents()).toEqual(events);
  });
  it('migrates stored v0 events on load and ignores invalid ones', async () => {
    const factory = new IDBFactory();
    const db = await openEventDb('strudel-tutor', factory);
    await db.append({ kind: 'override', at: '2026-10-05T09:00:00Z', skillId: 'a', action: 'retire' });
    await db.append({ type: 'garbage', v: 1 });
    await db.append({ kind: 'rated', at: 'bad' });
    db.close();
    const { log, report } = await EventLog.open({ factory });
    expect(report).toEqual({ migrated: 1, invalid: 2 });
    expect(log.getEvents()).toHaveLength(1);
    expect(log.getEvents()[0]).toMatchObject({ type: 'override', v: 1 });
    log.close();
    const db2 = await openEventDb('strudel-tutor', factory);
    const raw = await db2.getAll();
    expect(raw).toHaveLength(3);
    expect(raw[0]).toMatchObject({ v: 1 });
  });
});
