/**
 * Session progress, derived by replaying the log. Resuming after a closed tab is just replay: the
 * current step is the first step that is neither rated, completed, nor skipped, and a revealed
 * exercise stays revealed.
 *
 * Retiring or marking a skill known mid-session drops that skill's not-yet-started steps (never
 * shown, not done) from every open session. This is derived here from the `override` event, so a
 * resumed session shows exactly the same remaining steps. `restore` does not bring dropped steps
 * back (the session plan stays as the learner last saw it).
 */
import type { LogEvent, RatingValue, Step } from '../store/events';
import { DEFAULT_MINUTES } from './builder';

export interface StepProgress {
  shownAt: number | null;
  revealedAt: number | null;
  rating: RatingValue | null;
  skipped: boolean;
  /** Dropped because its skill was retired or marked known before the step started. */
  dropped: boolean;
  done: boolean;
}

export interface SessionProgress {
  sessionId: string;
  startedAt: number;
  minutes: number;
  steps: Step[];
  progress: StepProgress[];
  /** Index of the current step; equals steps.length when every step is done. */
  currentStep: number;
  /** A session_completed event exists. */
  completed: boolean;
  completedAt: number | null;
}

export interface SessionsState {
  /** The most recent session if not yet completed (it may have all steps done but no completion event). */
  active: SessionProgress | null;
  /** Most recent session, completed or not. */
  latest: SessionProgress | null;
  all: SessionProgress[];
}

const fresh = (): StepProgress => ({ shownAt: null, revealedAt: null, rating: null, skipped: false, dropped: false, done: false });

export function replaySessions(events: readonly LogEvent[]): SessionsState {
  const byId = new Map<string, SessionProgress>();
  const order: SessionProgress[] = [];
  const at = (sessionId: string | null, step: number | null) => {
    if (sessionId === null || step === null) return undefined;
    return byId.get(sessionId)?.progress[step];
  };
  for (const e of events) {
    switch (e.type) {
      case 'session_started': {
        const s: SessionProgress = {
          sessionId: e.sessionId,
          startedAt: e.ts,
          minutes: e.minutes,
          steps: e.steps,
          progress: e.steps.map(fresh),
          currentStep: 0,
          completed: false,
          completedAt: null,
        };
        byId.set(e.sessionId, s);
        order.push(s);
        break;
      }
      case 'variant_shown':
      case 'lesson_viewed': {
        const p = at(e.sessionId, e.step);
        if (p && p.shownAt === null) p.shownAt = e.ts;
        break;
      }
      case 'revealed': {
        const p = at(e.sessionId, e.step);
        if (p && p.revealedAt === null) p.revealedAt = e.ts;
        break;
      }
      case 'rated': {
        const p = at(e.sessionId, e.step);
        if (p) {
          p.rating = e.rating;
          p.done = true;
        }
        break;
      }
      case 'lesson_completed': {
        const p = at(e.sessionId, e.step);
        if (p) p.done = true;
        break;
      }
      case 'step_skipped': {
        const p = at(e.sessionId, e.step);
        if (p) {
          p.skipped = true;
          p.done = true;
        }
        break;
      }
      case 'override': {
        if (e.action !== 'retire' && e.action !== 'mark_known') break;
        for (const s of order) {
          if (s.completed) continue;
          s.steps.forEach((st, i) => {
            const p = s.progress[i]!;
            if (st.skillId === e.skillId && !p.done && p.shownAt === null) {
              p.dropped = true;
              p.done = true;
            }
          });
        }
        break;
      }
      case 'session_completed': {
        const s = byId.get(e.sessionId);
        if (s) {
          s.completed = true;
          s.completedAt = e.ts;
        }
        break;
      }
    }
  }
  for (const s of order) {
    const i = s.progress.findIndex((p) => !p.done);
    s.currentStep = i === -1 ? s.steps.length : i;
  }
  const latest = order.at(-1) ?? null;
  return { active: latest && !latest.completed ? latest : null, latest, all: order };
}

/**
 * True if the learner actually worked in the session: at least one exercise rated or lesson
 * completed. A session where every step was skipped (or dropped) does not count as "finished".
 */
export function wasPractised(s: SessionProgress): boolean {
  return s.progress.some((p) => p.done && !p.skipped && !p.dropped);
}

/** Session length preference from the latest settings_changed event. */
export function replayMinutes(events: readonly LogEvent[]): number {
  let m = DEFAULT_MINUTES;
  for (const e of events) if (e.type === 'settings_changed') m = e.minutes;
  return m;
}

/** The focused unit from the latest focus_changed event (null: no focus). */
export function replayFocus(events: readonly LogEvent[]): string | null {
  let f: string | null = null;
  for (const e of events) if (e.type === 'focus_changed') f = e.unitId;
  return f;
}

/**
 * Fluency (prompt → reveal) is informational only and never feeds FSRS (PROPOSAL §14). Rule:
 * time counts only within one page lifetime. The clock starts when the exercise view is mounted
 * in this page (or when the variant was first shown, if that is later), so time with the tab
 * closed, or spent elsewhere in the app, never counts. Time in other tabs does count (the learner
 * types into their own Strudel setup). Measurements above FLUENCY_MAX_MS (e.g. the laptop slept)
 * are not meaningful and are dropped (null).
 */
export const FLUENCY_MAX_MS = 30 * 60_000;

export function fluencyElapsed(shownAt: number | null, mountedAt: number, revealedAt: number): number | null {
  const start = Math.max(shownAt ?? mountedAt, mountedAt);
  const ms = revealedAt - start;
  return ms >= 0 && ms <= FLUENCY_MAX_MS ? ms : null;
}

/** Time from show to reveal per variant (fluency); old measurements above the cap are ignored. */
export function revealTimes(events: readonly LogEvent[]): { variantId: string; ms: number; ts: number }[] {
  const out: { variantId: string; ms: number; ts: number }[] = [];
  for (const e of events) {
    if (e.type === 'revealed' && e.elapsedMs !== null && e.elapsedMs <= FLUENCY_MAX_MS) out.push({ variantId: e.variantId, ms: e.elapsedMs, ts: e.ts });
  }
  return out;
}

export interface SkillFluency {
  /** Reveal times in log order. */
  points: { ts: number; ms: number }[];
  median: number;
}

/** Per skill, the chronological reveal times of its variants (primary skill) and their median. */
export function fluencyBySkill(events: readonly LogEvent[], variantToSkill: (variantId: string) => string | undefined): Map<string, SkillFluency> {
  const out = new Map<string, SkillFluency>();
  for (const r of revealTimes(events)) {
    const skillId = variantToSkill(r.variantId);
    if (!skillId) continue;
    let f = out.get(skillId);
    if (!f) out.set(skillId, (f = { points: [], median: 0 }));
    f.points.push({ ts: r.ts, ms: r.ms });
  }
  for (const f of out.values()) f.median = median(f.points.map((p) => p.ms));
  return out;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}
