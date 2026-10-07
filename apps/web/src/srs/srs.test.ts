import { describe, expect, it } from 'vitest';
import { describeDue, isDue, isIntroduced, lastRatingsAllAgain, replaySrs, State, statusOf } from '.';
import { mkLog, DAY, MIN, T0 } from '../test-helpers';
import type { NewEvent, RatingValue } from '../store/events';

const rate = (skillId: string, rating: RatingValue, variantId = `${skillId}.v01`): NewEvent => ({
  type: 'rated', sessionId: null, step: null, variantId, skillId, rating,
});

describe('replaySrs', () => {
  it('creates a card on first rating and is deterministic', () => {
    const log = mkLog([[T0, rate('a', 3)]]);
    const s1 = replaySrs(log).get('a')!;
    const s2 = replaySrs(log).get('a')!;
    expect(s1.card).not.toBeNull();
    expect(s1.card!.due.getTime()).toBe(s2.card!.due.getTime());
    expect(s1.card!.state).toBe(State.Learning);
    expect(statusOf(s1)).toBe('learning');
    expect(isIntroduced(s1)).toBe(true);
  });

  it('handles same-session repeats with short-term learning steps, then graduates', () => {
    // a new skill drilled three times within minutes, as in a Today session
    const log = mkLog([
      [T0, rate('a', 3, 'a.v01')],
      [T0 + 3 * MIN, rate('a', 3, 'a.v02')],
      [T0 + 6 * MIN, rate('a', 3, 'a.v03')],
    ]);
    const s = replaySrs(log).get('a')!;
    expect(s.ratings).toHaveLength(3);
    // first Good moves through learning steps; still due within the day or graduated to ≥1 day
    const due = s.card!.due.getTime() - (T0 + 6 * MIN);
    expect(due).toBeGreaterThan(0);
    const easy = replaySrs(mkLog([[T0, rate('b', 4)]])).get('b')!;
    expect(easy.card!.state).toBe(State.Review);
    expect(statusOf(easy)).toBe('review');
    expect(easy.card!.due.getTime() - T0).toBeGreaterThanOrEqual(DAY);
  });

  it('Again schedules sooner than Easy', () => {
    const again = replaySrs(mkLog([[T0, rate('a', 1)]])).get('a')!;
    const easy = replaySrs(mkLog([[T0, rate('a', 4)]])).get('a')!;
    expect(again.card!.due.getTime()).toBeLessThan(easy.card!.due.getTime());
  });

  it('applies overrides', () => {
    const log = mkLog([
      [T0, rate('a', 4)],
      [T0 + MIN, { type: 'override', skillId: 'a', action: 'again_soon' }],
      [T0 + MIN, { type: 'override', skillId: 'n', action: 'again_soon' }],
      [T0 + MIN, { type: 'override', skillId: 'r', action: 'retire' }],
      [T0 + MIN, { type: 'override', skillId: 'k', action: 'mark_known' }],
    ]);
    const st = replaySrs(log);
    expect(st.get('a')!.card!.due.getTime()).toBe(T0 + MIN);
    expect(isDue(st.get('a'), new Date(T0 + MIN))).toBe(true);
    expect(st.get('n')!.prioritized).toBe(true);
    expect(statusOf(st.get('n'))).toBe('new');
    expect(statusOf(st.get('r'))).toBe('retired');
    expect(statusOf(st.get('k'))).toBe('known');
    expect(isIntroduced(st.get('k'))).toBe(true);

    const restored = replaySrs([...log, ...mkLog([[T0 + 2 * MIN, { type: 'override', skillId: 'r', action: 'restore' }]])]);
    expect(statusOf(restored.get('r'))).toBe('new');
    // rating clears prioritized
    const rated = replaySrs([...log, ...mkLog([[T0 + 2 * MIN, rate('n', 3)]])]);
    expect(rated.get('n')!.prioritized).toBe(false);
  });

  it('handles early (not-yet-due) reviews sensibly: extra practice to fill a session (ADR 0100 amendment 1)', () => {
    const first: [number, NewEvent] = [T0, rate('a', 4)];
    const base = replaySrs(mkLog([first])).get('a')!.card!;
    const dueAt = base.due.getTime();
    expect(dueAt - T0).toBeGreaterThan(2 * DAY);
    const onTime = replaySrs(mkLog([first, [dueAt, rate('a', 3)]])).get('a')!.card!;
    const early = replaySrs(mkLog([first, [T0 + DAY, rate('a', 3)]])).get('a')!.card!;
    const sameDay = replaySrs(mkLog([first, [T0 + 20 * MIN, rate('a', 3)]])).get('a')!.card!;
    // An early Good still counts, but gains less stability than an on-time one (higher retrievability)…
    expect(early.stability).toBeGreaterThan(base.stability);
    expect(early.stability).toBeLessThan(onTime.stability);
    // …and never pulls the next review earlier than it already was.
    expect(early.due.getTime()).toBeGreaterThanOrEqual(dueAt);
    expect(early.state).toBe(State.Review);
    // Same-day practice uses the short-term formula: Good does not lower stability.
    expect(sameDay.stability).toBeGreaterThanOrEqual(base.stability);
    expect(sameDay.due.getTime()).toBeGreaterThanOrEqual(dueAt);
    // An early Again is a real lapse (relearning, due within minutes).
    const lapse = replaySrs(mkLog([first, [T0 + DAY, rate('a', 1)]])).get('a')!.card!;
    expect(lapse.state).toBe(State.Relearning);
    expect(lapse.due.getTime() - (T0 + DAY)).toBeLessThanOrEqual(10 * MIN);
  });

  it('parked skills are never due', () => {
    const st = replaySrs(mkLog([[T0, rate('a', 1)], [T0, { type: 'override', skillId: 'a', action: 'retire' }]]));
    expect(isDue(st.get('a'), new Date(T0 + 365 * DAY))).toBe(false);
    expect(isDue(undefined, new Date(T0))).toBe(false);
  });
});

describe('suspend', () => {
  const ov = (skillId: string, action: 'suspend' | 'restore'): NewEvent => ({ type: 'override', skillId, action });
  it('parks a skill as suspended: never due, status and description say so', () => {
    const st = replaySrs(mkLog([[T0, rate('a', 1)], [T0 + MIN, ov('a', 'suspend')], [T0 + MIN, ov('n', 'suspend')]]));
    expect(statusOf(st.get('a'))).toBe('suspended');
    expect(statusOf(st.get('n'))).toBe('suspended');
    expect(isDue(st.get('a'), new Date(T0 + 365 * DAY))).toBe(false);
    expect(describeDue(st.get('a'), new Date(T0 + DAY))).toBe('suspended');
  });
  it('keeps isIntroduced card-based', () => {
    const st = replaySrs(mkLog([[T0, rate('a', 3)], [T0, ov('a', 'suspend')], [T0, ov('n', 'suspend')], [T0, { type: 'override', skillId: 'k', action: 'mark_known' }]]));
    expect(isIntroduced(st.get('a'))).toBe(true);
    expect(isIntroduced(st.get('n'))).toBe(false);
    expect(isIntroduced(st.get('k'))).toBe(true);
  });
  it('restore undoes it and the card comes back', () => {
    const st = replaySrs(mkLog([[T0, rate('a', 1)], [T0 + MIN, ov('a', 'suspend')], [T0 + 2 * MIN, ov('a', 'restore')], [T0, ov('n', 'suspend')], [T0 + MIN, ov('n', 'restore')]]));
    expect(statusOf(st.get('a'))).toBe('learning');
    expect(isDue(st.get('a'), new Date(T0 + DAY))).toBe(true);
    expect(statusOf(st.get('n'))).toBe('new');
  });
});

describe('helpers', () => {
  it('detects two Agains in a row', () => {
    const two = replaySrs(mkLog([[T0, rate('a', 3)], [T0 + DAY, rate('a', 1)], [T0 + 2 * DAY, rate('a', 1)]])).get('a');
    const one = replaySrs(mkLog([[T0, rate('a', 1)]])).get('a');
    expect(lastRatingsAllAgain(two)).toBe(true);
    expect(lastRatingsAllAgain(one)).toBe(false);
    expect(lastRatingsAllAgain(undefined)).toBe(false);
  });
  it('describes due times', () => {
    const now = new Date(T0);
    const st = replaySrs(
      mkLog([
        [T0, rate('a', 1)],
        [T0, rate('b', 4)],
        [T0, { type: 'override', skillId: 'r', action: 'retire' }],
        [T0, { type: 'override', skillId: 'k', action: 'mark_known' }],
      ]),
    );
    expect(describeDue(undefined, now)).toBe('not started');
    expect(describeDue(st.get('r'), now)).toBe('retired');
    expect(describeDue(st.get('k'), now)).toBe('marked known');
    expect(describeDue(st.get('a'), now)).toMatch(/^in \d+ min$/);
    expect(describeDue(st.get('a'), new Date(T0 + DAY))).toBe('due now');
    expect(describeDue(st.get('b'), now)).toMatch(/^in \d+ d$/);
    const hours = { ...st.get('b')!, card: { ...st.get('b')!.card!, due: new Date(T0 + 3 * 3600_000) } };
    expect(describeDue(hours, now)).toBe('in 3 h');
    expect(statusOf(undefined)).toBe('new');
  });
});
