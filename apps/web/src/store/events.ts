/**
 * The append-only event log's schema (version 1). Every learner action becomes one event; all app
 * state (FSRS cards, sessions, rotation history) is derived by replaying these. See ADR 0101.
 *
 * Changing an event's shape requires bumping LOG_VERSION and adding a migration in migrations.ts.
 */
import { z } from 'zod';

export const LOG_VERSION = 1 as const;

export const Rating = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
/** 1 Again, 2 Hard, 3 Good, 4 Easy (same numbering as ts-fsrs `Rating`). */
export type RatingValue = z.infer<typeof Rating>;

export const Step = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('lesson'),
    skillId: z.string(),
    lessonId: z.string(),
    /** `new`: first introduction; `refresher`: re-shown before a review after repeated Again. */
    reason: z.enum(['new', 'refresher']),
  }),
  z.object({
    kind: z.literal('variant'),
    skillId: z.string(),
    variantId: z.string(),
    role: z.enum(['review', 'new']),
  }),
]);
export type Step = z.infer<typeof Step>;

export const OverrideAction = z.enum(['again_soon', 'retire', 'mark_known', 'restore']);
export type OverrideAction = z.infer<typeof OverrideAction>;

const base = { id: z.string().min(1), ts: z.number().finite(), v: z.literal(LOG_VERSION) };
const where = { sessionId: z.string().nullable(), step: z.number().int().min(0).nullable() };

export const LogEvent = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('session_started'), sessionId: z.string(), minutes: z.number(), steps: z.array(Step) }),
  z.object({ ...base, type: z.literal('session_completed'), sessionId: z.string() }),
  z.object({ ...base, type: z.literal('lesson_viewed'), ...where, lessonId: z.string(), skillId: z.string() }),
  z.object({ ...base, type: z.literal('lesson_completed'), sessionId: z.string(), step: z.number().int().min(0), lessonId: z.string() }),
  z.object({ ...base, type: z.literal('variant_shown'), ...where, variantId: z.string(), skillId: z.string() }),
  z.object({ ...base, type: z.literal('revealed'), ...where, variantId: z.string(), elapsedMs: z.number().nullable() }),
  z.object({ ...base, type: z.literal('rated'), ...where, variantId: z.string(), skillId: z.string(), rating: Rating }),
  z.object({ ...base, type: z.literal('step_skipped'), sessionId: z.string(), step: z.number().int().min(0) }),
  z.object({ ...base, type: z.literal('override'), skillId: z.string(), action: OverrideAction }),
  z.object({ ...base, type: z.literal('settings_changed'), minutes: z.number().min(5).max(120) }),
]);
export type LogEvent = z.infer<typeof LogEvent>;
export type EventType = LogEvent['type'];
export type EventOf<T extends EventType> = Extract<LogEvent, { type: T }>;
/** What callers pass to append(): the payload without id/ts/v. */
export type NewEvent = { [T in EventType]: Omit<EventOf<T>, 'id' | 'ts' | 'v'> }[EventType];

let counter = 0;
/** Unique, roughly time-ordered id. */
export function newId(ts: number, rand: () => number = Math.random): string {
  counter = (counter + 1) % 1_000_000;
  return `${ts.toString(36)}-${counter.toString(36)}-${Math.floor(rand() * 36 ** 6).toString(36)}`;
}

export function stamp(e: NewEvent, ts: number, id = newId(ts)): LogEvent {
  return { ...e, id, ts, v: LOG_VERSION } as LogEvent;
}
