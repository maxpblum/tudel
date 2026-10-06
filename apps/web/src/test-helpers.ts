import type { LogEvent, NewEvent } from './store/events';
import { stamp } from './store/events';

/** Build a log from payloads with explicit timestamps (ms) and deterministic ids. */
export function mkLog(items: [number, NewEvent][]): LogEvent[] {
  return items.map(([ts, e], i) => stamp(e, ts, `e${i}`));
}

export const MIN = 60_000;
export const DAY = 86_400_000;
export const T0 = Date.UTC(2026, 9, 5, 9, 0, 0);
