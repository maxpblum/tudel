/**
 * Versioned migrations for the event log and export files. See ADR 0101.
 *
 * - Every stored event carries `v`. On load, events with `v < LOG_VERSION` are migrated in steps
 *   (v0 → v1 → …) and rewritten.
 * - Export files carry `version`. Importing an older file migrates every event the same way.
 *
 * Version 0 never shipped: it is a deliberately different, older-looking shape used to test the
 * framework (ISO `at` strings instead of `ts`, `kind` instead of `type`, word ratings, no ids).
 */
import { LOG_VERSION, type LogEvent } from './events';

type AnyEvent = Record<string, unknown>;
type Migration = (e: AnyEvent, index: number) => AnyEvent;

const WORD_RATINGS: Record<string, number> = { again: 1, hard: 2, good: 3, easy: 4 };

/** migrations[n] upgrades an event from version n to n + 1. */
export const migrations: Record<number, Migration> = {
  0: (e, index) => {
    const { kind, at, ...rest } = e as { kind: string; at: string } & AnyEvent;
    const ts = Date.parse(at);
    if (!Number.isFinite(ts)) throw new Error(`v0 event ${index}: unparseable 'at' ${String(at)}`);
    const out: AnyEvent = { ...rest, type: kind, ts, id: `v0-${index}-${ts.toString(36)}`, v: 1 };
    if (typeof out.rating === 'string') out.rating = WORD_RATINGS[out.rating];
    for (const k of ['sessionId', 'step'] as const)
      if (out[k] === undefined && ['lesson_viewed', 'variant_shown', 'revealed', 'rated'].includes(kind)) out[k] = null;
    if (kind === 'revealed' && out.elapsedMs === undefined) out.elapsedMs = null;
    return out;
  },
};

export function eventVersion(e: AnyEvent): number {
  return typeof e.v === 'number' ? e.v : 0;
}

/** Upgrade one event to LOG_VERSION (no validation). */
export function migrateEvent(e: AnyEvent, index: number, table: Record<number, Migration> = migrations): AnyEvent {
  let cur = e;
  let v = eventVersion(cur);
  if (v > LOG_VERSION) throw new Error(`event ${index} has version ${v}, newer than this app (${LOG_VERSION})`);
  while (v < LOG_VERSION) {
    const m = table[v];
    if (!m) throw new Error(`no migration from version ${v}`);
    cur = m(cur, index);
    v = eventVersion(cur);
  }
  return cur;
}

export function needsMigration(e: AnyEvent): boolean {
  return eventVersion(e) < LOG_VERSION;
}

export type { LogEvent };
