/**
 * Export/import file format. Export = the whole log as a versioned JSON document; import validates
 * (after migrating older versions) and the caller replaces the log. See ADR 0101.
 */
import { LOG_VERSION, LogEvent } from './events';
import { migrateEvent } from './migrations';

export const FILE_FORMAT = 'strudel-tutor-log';

export interface ExportFile {
  format: typeof FILE_FORMAT;
  version: number;
  exportedAt: string;
  events: LogEvent[];
}

export function serializeLog(events: LogEvent[], now: Date): string {
  const file: ExportFile = { format: FILE_FORMAT, version: LOG_VERSION, exportedAt: now.toISOString(), events };
  return JSON.stringify(file, null, 1);
}

export function exportFileName(now: Date): string {
  return `strudel-tutor-progress-${now.toISOString().slice(0, 10)}.json`;
}

export type ParseResult = { ok: true; events: LogEvent[]; fromVersion: number } | { ok: false; error: string };

/**
 * Parse an export file of any supported version. Version 0 files are `{version: 0, log: [...]}`;
 * version ≥ 1 files are `{format, version, events}`.
 */
export function parseExport(text: string): ParseResult {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not a JSON file.' };
  }
  if (!doc || typeof doc !== 'object') return { ok: false, error: 'Not a progress file.' };
  const d = doc as Record<string, unknown>;
  const version = typeof d.version === 'number' ? d.version : NaN;
  let rawEvents: unknown;
  if (version === 0) rawEvents = d.log;
  else if (d.format === FILE_FORMAT && version >= 1) rawEvents = d.events;
  else return { ok: false, error: 'Not a Strudel Tutor progress file.' };
  if (version > LOG_VERSION)
    return { ok: false, error: `This file is from a newer app version (${version}); this app reads up to ${LOG_VERSION}.` };
  if (!Array.isArray(rawEvents)) return { ok: false, error: 'The file has no event list.' };

  const events: LogEvent[] = [];
  for (let i = 0; i < rawEvents.length; i++) {
    const raw = rawEvents[i];
    if (!raw || typeof raw !== 'object') return { ok: false, error: `Event ${i} is not an object.` };
    let migrated: unknown;
    try {
      // file-level version applies to events that don't carry their own `v`
      const withV = 'v' in raw ? raw : { ...raw, v: version };
      migrated = migrateEvent(withV as Record<string, unknown>, i);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const r = LogEvent.safeParse(migrated);
    if (!r.success) return { ok: false, error: `Event ${i} is invalid: ${r.error.issues[0]?.message ?? 'unknown'}` };
    events.push(r.data);
  }
  const ids = new Set<string>();
  for (const e of events) {
    if (ids.has(e.id)) return { ok: false, error: `Duplicate event id ${e.id}.` };
    ids.add(e.id);
  }
  return { ok: true, events, fromVersion: version };
}
