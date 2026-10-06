/**
 * The event log: an in-memory, append-only copy of the IndexedDB store. `append()` resolves only after
 * the event is durably written, and only then updates the in-memory list and notifies subscribers, so
 * the UI never shows state that isn't persisted. See ADR 0101.
 */
import { LogEvent, stamp, type NewEvent } from './events';
import { migrateEvent, needsMigration } from './migrations';
import { openEventDb, type EventDb } from './db';

export interface LoadReport {
  migrated: number;
  /** Stored events that failed validation; kept in storage but ignored by replay. */
  invalid: number;
}

export class EventLog {
  private events: LogEvent[] = [];
  private listeners = new Set<() => void>();
  private queue: Promise<unknown> = Promise.resolve();

  private constructor(
    private db: EventDb,
    private clock: () => number,
  ) {}

  static async open(opts: { dbName?: string; clock?: () => number; factory?: IDBFactory } = {}): Promise<{ log: EventLog; report: LoadReport }> {
    const db = await openEventDb(opts.dbName, opts.factory);
    const log = new EventLog(db, opts.clock ?? Date.now);
    const report = await log.load();
    return { log, report };
  }

  private async load(): Promise<LoadReport> {
    const raw = await this.db.getAll();
    let migrated = 0;
    let invalid = 0;
    const upgraded: Record<string, unknown>[] = [];
    const valid: LogEvent[] = [];
    raw.forEach((e, i) => {
      let cur = e;
      if (needsMigration(e)) {
        try {
          cur = migrateEvent(e, i);
          migrated++;
        } catch {
          invalid++;
          upgraded.push(e);
          return;
        }
      }
      upgraded.push(cur);
      const r = LogEvent.safeParse(cur);
      if (r.success) valid.push(r.data);
      else invalid++;
    });
    if (migrated > 0) await this.db.replaceAll(upgraded);
    this.events = valid;
    return { migrated, invalid };
  }

  /** Current events (same array identity until the next change; safe for useSyncExternalStore). */
  getEvents = (): readonly LogEvent[] => this.events;

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emit() {
    for (const l of this.listeners) l();
  }

  /** Durably append one event, then update state. Appends are serialized in call order. */
  append(e: NewEvent): Promise<LogEvent> {
    const run = async () => {
      const ts = Math.max(this.clock(), this.events.at(-1)?.ts ?? 0);
      const event = stamp(e, ts);
      const parsed = LogEvent.parse(event);
      await this.db.append(parsed);
      this.events = [...this.events, parsed];
      this.emit();
      return parsed;
    };
    const p = this.queue.then(run, run);
    this.queue = p.catch(() => {});
    return p;
  }

  /** Replace the whole log (import). Events must already be validated. */
  async replaceAll(events: LogEvent[]): Promise<void> {
    await this.queue;
    await this.db.replaceAll(events);
    this.events = [...events];
    this.emit();
  }

  close() {
    this.db.close();
  }
}
