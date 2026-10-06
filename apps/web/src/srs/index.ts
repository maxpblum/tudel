/**
 * Spaced repetition over SKILLS (R-SKILLS), using ts-fsrs. Pure: state is a function of
 * (event log, now). See ADR 0100 for the rating → skill mapping and same-session repeats.
 */
import { createEmptyCard, fsrs, generatorParameters, State, type Card, type Grade } from 'ts-fsrs';
import type { LogEvent, RatingValue } from '../store/events';

/** Fixed scheduler parameters. Fuzz off: scheduling must be deterministic and replayable. */
export const scheduler = fsrs(
  generatorParameters({
    enable_fuzz: false,
    enable_short_term: true,
    learning_steps: ['1m', '10m'],
    relearning_steps: ['10m'],
    request_retention: 0.9,
  }),
);

export type SkillStatus = 'new' | 'learning' | 'review' | 'retired' | 'known';

export interface SkillSrs {
  skillId: string;
  /** FSRS card; null until the skill's first rating. */
  card: Card | null;
  /** Ratings in order, with timestamps. */
  ratings: { ts: number; rating: RatingValue; variantId: string }[];
  /** Set by override `retire` / `mark_known`, cleared by `restore`. */
  parked: 'retired' | 'known' | null;
  /** Set by `again_soon` on a skill with no card: prefer it as the next new skill. */
  prioritized: boolean;
}

export type SrsState = Map<string, SkillSrs>;

function blank(skillId: string): SkillSrs {
  return { skillId, card: null, ratings: [], parked: null, prioritized: false };
}

/**
 * The variant's PRIMARY skill (first in `skills`) receives the rating (ADR 0100). Callers pass
 * `skillId` in the event explicitly; it is the variant's first skill at the time of rating.
 */
export function replaySrs(events: readonly LogEvent[]): SrsState {
  const state: SrsState = new Map();
  const get = (id: string) => {
    let s = state.get(id);
    if (!s) state.set(id, (s = blank(id)));
    return s;
  };
  for (const e of events) {
    if (e.type === 'rated') {
      const s = get(e.skillId);
      const now = new Date(e.ts);
      const card: Card = s.card ?? createEmptyCard(now);
      s.card = scheduler.next(card, now, e.rating as Grade).card;
      s.ratings.push({ ts: e.ts, rating: e.rating, variantId: e.variantId });
      s.prioritized = false;
    } else if (e.type === 'override') {
      const s = get(e.skillId);
      switch (e.action) {
        case 'again_soon':
          if (s.card) s.card = { ...s.card, due: new Date(e.ts) };
          else s.prioritized = true;
          s.parked = null;
          break;
        case 'retire':
          s.parked = 'retired';
          break;
        case 'mark_known':
          s.parked = 'known';
          break;
        case 'restore':
          s.parked = null;
          break;
      }
    }
  }
  return state;
}

export function statusOf(s: SkillSrs | undefined): SkillStatus {
  if (!s) return 'new';
  if (s.parked) return s.parked;
  if (!s.card) return 'new';
  return s.card.state === State.Review ? 'review' : 'learning';
}

/** A skill is due if it has a card, is not parked, and its due time is at or before `now`. */
export function isDue(s: SkillSrs | undefined, now: Date): boolean {
  return !!s && !s.parked && !!s.card && s.card.due.getTime() <= now.getTime();
}

/**
 * Prerequisite satisfaction: a prereq counts as met once it has been introduced (rated at least
 * once) or parked as retired/known (ADR 0100).
 */
export function isIntroduced(s: SkillSrs | undefined): boolean {
  return !!s && (!!s.card || s.parked !== null);
}

/** True if the last `n` ratings were all Again (relearning trigger, PROPOSAL §14). */
export function lastRatingsAllAgain(s: SkillSrs | undefined, n = 2): boolean {
  if (!s || s.ratings.length < n) return false;
  return s.ratings.slice(-n).every((r) => r.rating === 1);
}

/** Human description of when a skill is next due, relative to now. */
export function describeDue(s: SkillSrs | undefined, now: Date): string {
  const st = statusOf(s);
  if (st === 'retired') return 'retired';
  if (st === 'known') return 'marked known';
  if (!s?.card) return 'not started';
  const ms = s.card.due.getTime() - now.getTime();
  if (ms <= 0) return 'due now';
  const min = ms / 60000;
  if (min < 60) return `in ${Math.ceil(min)} min`;
  const h = min / 60;
  if (h < 24) return `in ${Math.round(h)} h`;
  return `in ${Math.round(h / 24)} d`;
}

export { State };
