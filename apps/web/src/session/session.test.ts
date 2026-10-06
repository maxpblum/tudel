import { describe, expect, it } from 'vitest';
import { content } from '../content';
import { replaySrs } from '../srs';
import type { NewEvent, RatingValue } from '../store/events';
import { mkLog, DAY, MIN, T0 } from '../test-helpers';
import {
  buildSession, dueReviewOrder, fluencyElapsed, nextNewSkill, pickVariant, practicePool, replayMinutes, replaySessions, revealTimes,
  unmetPrereqs, variantHistory, wasPractised, COST, DEFAULT_MINUTES, FLUENCY_MAX_MS,
} from '.';

const rate = (skillId: string, rating: RatingValue, variantId = `${skillId}.v01`, sessionId: string | null = null, step: number | null = null): NewEvent => ({
  type: 'rated', sessionId, step, variantId, skillId, rating,
});
const shown = (variantId: string, skillId: string): NewEvent => ({ type: 'variant_shown', sessionId: null, step: null, variantId, skillId });

function plan(items: [number, NewEvent][], now: number, minutes?: number) {
  const log = mkLog(items);
  return buildSession({ content, srs: replaySrs(log), history: variantHistory(log), now: new Date(now), minutes });
}

describe('buildSession', () => {
  it('starts a new learner with the first skill: lesson then 3 variants', () => {
    const p = plan([], T0);
    expect(p.newSkillId).toBe('fx.drums');
    expect(p.reviewSkillIds).toEqual([]);
    expect(p.steps.map((s) => s.kind)).toEqual(['lesson', 'variant', 'variant']);
    expect(p.steps[0]).toMatchObject({ kind: 'lesson', lessonId: 'fx.drums.lesson', reason: 'new' });
    expect(p.estimatedMinutes).toBeGreaterThan(0);
  });

  it('uses 3 variants when available and the budget allows, 2 for short sessions', () => {
    const items: [number, NewEvent][] = [[T0, { type: 'override', skillId: 'fx.drums', action: 'mark_known' }]];
    expect(plan(items, T0).steps.filter((s) => s.kind === 'variant')).toHaveLength(3);
    expect(plan(items, T0, 10).steps.filter((s) => s.kind === 'variant')).toHaveLength(2);
    const vs = plan(items, T0).steps.flatMap((s) => (s.kind === 'variant' ? [s.variantId] : []));
    expect(new Set(vs).size).toBe(vs.length);
  });

  it('only offers new skills whose prerequisites are introduced', () => {
    const known: [number, NewEvent][] = [[T0, { type: 'override', skillId: 'fx.drums', action: 'retire' }]];
    expect(nextNewSkill(content, replaySrs(mkLog(known)))).toBe('fx.waveforms');
    const afterWave = replaySrs(mkLog([...known, [T0, rate('fx.waveforms', 3)]]));
    expect(nextNewSkill(content, afterWave)).toBe('fx.lowpass');
    // prioritized ("show again soon" on an unstarted skill) jumps the queue among eligible ones
    const prio = replaySrs(mkLog([...known, [T0, rate('fx.waveforms', 3)], [T0, { type: 'override', skillId: 'fx.envelope', action: 'again_soon' }]]));
    expect(nextNewSkill(content, prio)).toBe('fx.envelope');
    // fx.lowpass requires fx.waveforms: not eligible when only drums is introduced
    const noWave = replaySrs(mkLog([...known, [T0, { type: 'override', skillId: 'fx.waveforms', action: 'again_soon' }]]));
    expect(nextNewSkill(content, noWave)).toBe('fx.waveforms');
  });

  it('puts due reviews first, interleaved across units, most overdue first', () => {
    const items: [number, NewEvent][] = [
      [T0, rate('fx.waveforms', 4)],
      [T0 + MIN, rate('fx.lowpass', 4)],
      [T0 + 2 * MIN, rate('fx.drums', 4)],
    ];
    const later = T0 + 60 * DAY;
    const order = dueReviewOrder(content, replaySrs(mkLog(items)), new Date(later));
    expect(order).toEqual(['fx.waveforms', 'fx.drums', 'fx.lowpass']);
    const p = plan(items, later);
    expect(p.reviewSkillIds).toEqual(order);
    expect(p.steps.slice(0, 3).every((s) => s.kind === 'variant' && s.role === 'review')).toBe(true);
    expect(p.newSkillId).toBe('fx.envelope');
    expect(p.steps.slice(3).map((s) => s.kind)).toEqual(['lesson', 'variant', 'variant']);
  });

  it('caps reviews by the time budget and reports the rest', () => {
    const items: [number, NewEvent][] = [
      [T0, rate('fx.waveforms', 4)],
      [T0, rate('fx.lowpass', 4)],
      [T0, rate('fx.drums', 4)],
      [T0, rate('fx.envelope', 4)],
    ];
    const p = plan(items, T0 + 60 * DAY, 5);
    expect(p.newSkillId).toBeNull();
    expect(p.reviewSkillIds).toHaveLength(2);
    expect(p.deferredReviews).toBe(2);
  });

  it('nothing due and nothing new gives an empty plan', () => {
    const items: [number, NewEvent][] = content.skills.map((s) => [T0, { type: 'override', skillId: s.id, action: 'retire' }]);
    const p = plan(items, T0);
    expect(p.steps).toEqual([]);
    expect(p.newSkillId).toBeNull();
  });

  it('re-shows the lesson before a review after two Agains in a row', () => {
    const items: [number, NewEvent][] = [
      [T0, rate('fx.drums', 1)],
      [T0 + 20 * MIN, rate('fx.drums', 1)],
    ];
    const p = plan(items, T0 + DAY);
    expect(p.steps[0]).toMatchObject({ kind: 'lesson', reason: 'refresher', skillId: 'fx.drums' });
    expect(p.steps[1]).toMatchObject({ kind: 'variant', role: 'review', skillId: 'fx.drums' });
  });

  it('rotates review variants: unseen first, then least recently seen', () => {
    const items: [number, NewEvent][] = [
      [T0, shown('fx.drums.v01', 'fx.drums')],
      [T0, rate('fx.drums', 4)],
    ];
    const p1 = plan(items, T0 + 60 * DAY);
    expect(p1.steps[0]).toMatchObject({ variantId: 'fx.drums.v02' });
    const items2: [number, NewEvent][] = [...items, [T0 + DAY, shown('fx.drums.v02', 'fx.drums')]];
    expect(plan(items2, T0 + 60 * DAY).steps[0]).toMatchObject({ variantId: 'fx.drums.v01' });
  });

  it('fills toward the budget with extra practice on introduced, not-due skills (least recently practised first)', () => {
    const items: [number, NewEvent][] = [
      [T0, rate('fx.drums', 4)],
      [T0 + DAY, rate('fx.waveforms', 4)],
      [T0 + 2 * DAY, rate('fx.lowpass', 4)],
    ];
    const now = T0 + 2 * DAY + 60 * MIN;
    const srs = replaySrs(mkLog(items));
    expect(dueReviewOrder(content, srs, new Date(now))).toEqual([]);
    expect(practicePool(content, srs, new Date(now))).toEqual(['fx.drums', 'fx.waveforms', 'fx.lowpass']);
    const p = plan(items, now, 20);
    expect(p.reviewSkillIds).toEqual([]);
    expect(p.newSkillId).toBe('fx.envelope');
    // round-robin, least recently practised first, then a second round on an unplanned variant
    expect(p.practiceSkillIds).toEqual(['fx.drums', 'fx.waveforms', 'fx.lowpass', 'fx.drums']);
    expect(p.steps.slice(0, 4)).toEqual([
      { kind: 'variant', skillId: 'fx.drums', variantId: 'fx.drums.v01', role: 'review' },
      { kind: 'variant', skillId: 'fx.waveforms', variantId: 'fx.waveforms.v01', role: 'review' },
      { kind: 'variant', skillId: 'fx.lowpass', variantId: 'fx.lowpass.v01', role: 'review' },
      { kind: 'variant', skillId: 'fx.drums', variantId: 'fx.drums.v02', role: 'review' },
    ]);
    // the one new skill follows: lesson then its drills
    expect(p.steps.slice(4).map((s) => (s.kind === 'lesson' ? 'lesson' : s.role))).toEqual(['lesson', 'new', 'new']);
    expect(p.estimatedMinutes).toBe(20);
    // shorter budget: fewer fill steps, never over
    const p15 = plan(items, now, 15);
    expect(p15.practiceSkillIds).toEqual(['fx.drums', 'fx.waveforms']);
    expect(p15.estimatedMinutes).toBeLessThanOrEqual(15);
  });

  it('does not use fill for due skills, parked skills, or the new skill', () => {
    const items: [number, NewEvent][] = [
      [T0, rate('fx.drums', 1)],
      [T0, rate('fx.waveforms', 4)],
      [T0, rate('fx.lowpass', 4)],
      [T0, { type: 'override', skillId: 'fx.lowpass', action: 'retire' }],
    ];
    const now = T0 + 12 * 3600_000; // drums (Again) is due, waveforms is not
    const p = plan(items, now, 30);
    expect(p.reviewSkillIds).toEqual(['fx.drums']);
    expect(p.newSkillId).toBe('fx.envelope');
    expect(new Set(p.practiceSkillIds)).toEqual(new Set(['fx.waveforms']));
    expect(p.estimatedMinutes).toBeLessThanOrEqual(30);
  });

  it('adds more drills of the new skill only when no introduced skill is available', () => {
    const known: [number, NewEvent][] = [
      [T0, { type: 'override', skillId: 'fx.drums', action: 'mark_known' }],
      [T0, { type: 'override', skillId: 'fx.waveforms', action: 'mark_known' }],
    ];
    const p = plan(known, T0, 15);
    expect(p.newSkillId).toBe('fx.lowpass');
    expect(p.practiceSkillIds).toEqual([]);
    // 15 min normally gives 2 drills; the remaining variant fills toward the budget
    expect(p.steps.filter((s) => s.kind === 'variant' && s.role === 'new')).toHaveLength(3);
    expect(p.estimatedMinutes).toBe(COST.lesson + 3 * COST.newVariant);
    // with an introduced skill available, practice is used instead
    const withPractice = plan([[T0, rate('fx.drums', 4)], known[1]!], T0 + MIN, 15);
    expect(withPractice.practiceSkillIds).toEqual(['fx.drums', 'fx.drums']);
    expect(withPractice.steps.filter((s) => s.kind === 'variant' && s.role === 'new')).toHaveLength(2);
  });

  it('never exceeds the budget through fill, and stays honest when content runs out', () => {
    const histories: [number, NewEvent][][] = [
      [],
      [[T0, rate('fx.drums', 4)]],
      [[T0, rate('fx.drums', 4)], [T0, rate('fx.waveforms', 3)], [T0 + MIN, rate('fx.lowpass', 4)]],
      content.skills.map((s, i) => [T0 + i * MIN, rate(s.id, 4)] as [number, NewEvent]),
    ];
    for (const h of histories) {
      for (const m of [15, 20, 25, 30]) {
        const p = plan(h, T0 + 2 * 3600_000, m);
        if (p.reviewSkillIds.length === 0) expect(p.estimatedMinutes).toBeLessThanOrEqual(m);
        const vs = p.steps.flatMap((s) => (s.kind === 'variant' ? [s.variantId] : []));
        expect(new Set(vs).size).toBe(vs.length);
        expect(p.steps.filter((s) => s.kind === 'lesson' && s.reason === 'new').length).toBeLessThanOrEqual(1);
      }
    }
    // first session on the fixture: only the new skill's 2 variants exist, so it is short
    expect(plan([], T0, 30).estimatedMinutes).toBe(COST.lesson + 2 * COST.newVariant);
  });

  it('reports unmet prerequisites', () => {
    expect(unmetPrereqs(content, replaySrs([]), 'fx.lowpass')).toEqual(['fx.waveforms']);
    expect(unmetPrereqs(content, replaySrs(mkLog([[T0, rate('fx.waveforms', 3)]])), 'fx.lowpass')).toEqual([]);
    expect(unmetPrereqs(content, replaySrs([]), 'nope')).toEqual([]);
  });

  it('defaults to 20 minutes', () => {
    expect(DEFAULT_MINUTES).toBe(20);
  });
});

describe('pickVariant', () => {
  const vs = content.primaryVariants('fx.waveforms');
  it('prefers unseen in authoring order', () => {
    expect(pickVariant(vs, new Map())?.id).toBe('fx.waveforms.v01');
    expect(pickVariant(vs, new Map([['fx.waveforms.v01', 1]]))?.id).toBe('fx.waveforms.v02');
  });
  it('falls back to least recently seen, avoiding excluded ones unless nothing is left', () => {
    const h = new Map([['fx.waveforms.v01', 3], ['fx.waveforms.v02', 1], ['fx.waveforms.v03', 2]]);
    expect(pickVariant(vs, h)?.id).toBe('fx.waveforms.v02');
    expect(pickVariant(vs, h, new Set(['fx.waveforms.v02']))?.id).toBe('fx.waveforms.v03');
    expect(pickVariant(vs, h, new Set(vs.map((v) => v.id)))?.id).toBe('fx.waveforms.v02');
    expect(pickVariant([], h)).toBeUndefined();
  });
  it('falls back to any variant practising the skill when none is primary', () => {
    expect(content.variantsForSkill('fx.waveforms').map((v) => v.id)).toContain('fx.lowpass.v01');
  });
});

describe('replaySessions (resume)', () => {
  const steps = [
    { kind: 'lesson' as const, skillId: 'fx.drums', lessonId: 'fx.drums.lesson', reason: 'new' as const },
    { kind: 'variant' as const, skillId: 'fx.drums', variantId: 'fx.drums.v01', role: 'new' as const },
    { kind: 'variant' as const, skillId: 'fx.drums', variantId: 'fx.drums.v02', role: 'new' as const },
  ];
  const start: [number, NewEvent] = [T0, { type: 'session_started', sessionId: 's1', minutes: 20, steps }];

  it('resumes at the first unfinished step, keeping a revealed exercise revealed', () => {
    const log = mkLog([
      start,
      [T0 + 1, { type: 'lesson_viewed', sessionId: 's1', step: 0, lessonId: 'fx.drums.lesson', skillId: 'fx.drums' }],
      [T0 + 2, { type: 'lesson_completed', sessionId: 's1', step: 0, lessonId: 'fx.drums.lesson' }],
      [T0 + 3, { type: 'variant_shown', sessionId: 's1', step: 1, variantId: 'fx.drums.v01', skillId: 'fx.drums' }],
      [T0 + 4, { type: 'variant_shown', sessionId: 's1', step: 1, variantId: 'fx.drums.v01', skillId: 'fx.drums' }],
      [T0 + 5, { type: 'revealed', sessionId: 's1', step: 1, variantId: 'fx.drums.v01', elapsedMs: 2 }],
    ]);
    const { active, latest, all } = replaySessions(log);
    expect(active?.sessionId).toBe('s1');
    expect(latest).toBe(active);
    expect(all).toHaveLength(1);
    expect(active!.currentStep).toBe(1);
    expect(active!.progress[1]).toMatchObject({ shownAt: T0 + 3, revealedAt: T0 + 5, done: false });
    expect(active!.progress[0]!.done).toBe(true);
  });

  it('counts ratings and skips as done; completion closes the session', () => {
    const log = mkLog([
      start,
      [T0 + 1, { type: 'step_skipped', sessionId: 's1', step: 0 }],
      [T0 + 2, rate('fx.drums', 3, 'fx.drums.v01', 's1', 1)],
      [T0 + 3, rate('fx.drums', 4, 'fx.drums.v02', 's1', 2)],
    ]);
    const s = replaySessions(log).active!;
    expect(s.currentStep).toBe(3);
    expect(s.progress[0]!.skipped).toBe(true);
    expect(s.progress[2]!.rating).toBe(4);
    const done = replaySessions([...log, ...mkLog([[T0 + 4, { type: 'session_completed', sessionId: 's1' }]])]);
    expect(done.active).toBeNull();
    expect(done.latest!.completed).toBe(true);
    expect(done.latest!.completedAt).toBe(T0 + 4);
  });

  it('ignores out-of-session and unknown-session events; a new session supersedes', () => {
    const log = mkLog([
      start,
      [T0 + 1, rate('fx.drums', 3)],
      [T0 + 2, { type: 'revealed', sessionId: 'nope', step: 0, variantId: 'x', elapsedMs: null }],
      [T0 + 3, { type: 'session_completed', sessionId: 'nope' }],
      [T0 + 4, { type: 'session_started', sessionId: 's2', minutes: 15, steps: [] }],
    ]);
    const r = replaySessions(log);
    expect(r.all[0]!.currentStep).toBe(0);
    expect(r.active!.sessionId).toBe('s2');
    expect(r.active!.currentStep).toBe(0);
    expect(replaySessions([]).active).toBeNull();
  });
});

describe('replaySessions: overrides mid-session', () => {
  const steps = [
    { kind: 'variant' as const, skillId: 'fx.waveforms', variantId: 'fx.waveforms.v01', role: 'review' as const },
    { kind: 'variant' as const, skillId: 'fx.drums', variantId: 'fx.drums.v01', role: 'review' as const },
    { kind: 'lesson' as const, skillId: 'fx.lowpass', lessonId: 'fx.lowpass.lesson', reason: 'new' as const },
    { kind: 'variant' as const, skillId: 'fx.lowpass', variantId: 'fx.lowpass.v02', role: 'new' as const },
    { kind: 'variant' as const, skillId: 'fx.waveforms', variantId: 'fx.waveforms.v02', role: 'review' as const },
  ];
  const start: [number, NewEvent] = [T0, { type: 'session_started', sessionId: 's1', minutes: 20, steps }];
  const show0: [number, NewEvent] = [T0 + 1, { type: 'variant_shown', sessionId: 's1', step: 0, variantId: 'fx.waveforms.v01', skillId: 'fx.waveforms' }];

  it('retire drops the skill’s not-yet-started steps; the shown step stays', () => {
    const log = mkLog([start, show0, [T0 + 2, { type: 'override', skillId: 'fx.waveforms', action: 'retire' }]]);
    const s = replaySessions(log).active!;
    expect(s.currentStep).toBe(0);
    expect(s.progress.map((p) => p.dropped)).toEqual([false, false, false, false, true]);
    expect(s.progress[4]!.done).toBe(true);
    // replay is the resume: same result every time
    expect(replaySessions(log).active!.progress).toEqual(s.progress);
  });

  it('mark known drops lesson and drills; restore does not bring them back; other actions do nothing', () => {
    const log = mkLog([
      start,
      show0,
      [T0 + 2, rate('fx.waveforms', 3, 'fx.waveforms.v01', 's1', 0)],
      [T0 + 3, { type: 'override', skillId: 'fx.lowpass', action: 'again_soon' }],
      [T0 + 4, { type: 'override', skillId: 'fx.lowpass', action: 'mark_known' }],
      [T0 + 5, { type: 'override', skillId: 'fx.lowpass', action: 'restore' }],
    ]);
    const s = replaySessions(log).active!;
    expect(s.progress.map((p) => p.dropped)).toEqual([false, false, true, true, false]);
    expect(s.currentStep).toBe(1);
  });

  it('dropping every remaining step finishes the session; completed sessions are untouched', () => {
    const one = [{ kind: 'variant' as const, skillId: 'fx.drums', variantId: 'fx.drums.v01', role: 'review' as const }];
    const log = mkLog([
      [T0, { type: 'session_started', sessionId: 'old', minutes: 20, steps: one }],
      [T0 + 1, { type: 'session_completed', sessionId: 'old' }],
      [T0 + 2, { type: 'session_started', sessionId: 's2', minutes: 20, steps: one }],
      [T0 + 3, { type: 'override', skillId: 'fx.drums', action: 'retire' }],
    ]);
    const r = replaySessions(log);
    expect(r.all[0]!.progress[0]!.dropped).toBe(false);
    expect(r.active!.currentStep).toBe(1);
    expect(wasPractised(r.active!)).toBe(false);
  });
});

describe('wasPractised', () => {
  const steps = [
    { kind: 'lesson' as const, skillId: 'fx.drums', lessonId: 'fx.drums.lesson', reason: 'new' as const },
    { kind: 'variant' as const, skillId: 'fx.drums', variantId: 'fx.drums.v01', role: 'new' as const },
  ];
  const start: [number, NewEvent] = [T0, { type: 'session_started', sessionId: 's1', minutes: 20, steps }];
  it('is false when every step was skipped, true once anything was done', () => {
    const skipped = mkLog([start, [T0 + 1, { type: 'step_skipped', sessionId: 's1', step: 0 }], [T0 + 2, { type: 'step_skipped', sessionId: 's1', step: 1 }]]);
    expect(wasPractised(replaySessions(skipped).latest!)).toBe(false);
    const lesson = mkLog([start, [T0 + 1, { type: 'lesson_completed', sessionId: 's1', step: 0, lessonId: 'fx.drums.lesson' }], [T0 + 2, { type: 'step_skipped', sessionId: 's1', step: 1 }]]);
    expect(wasPractised(replaySessions(lesson).latest!)).toBe(true);
    const rated = mkLog([start, [T0 + 1, { type: 'step_skipped', sessionId: 's1', step: 0 }], [T0 + 2, rate('fx.drums', 3, 'fx.drums.v01', 's1', 1)]]);
    expect(wasPractised(replaySessions(rated).latest!)).toBe(true);
  });
});

describe('settings and fluency replay', () => {
  it('measures fluency within one page lifetime only', () => {
    // shown and revealed in the same page lifetime
    expect(fluencyElapsed(null, T0, T0 + 40_000)).toBe(40_000);
    expect(fluencyElapsed(T0, T0, T0 + 40_000)).toBe(40_000);
    // shown yesterday, tab closed, resumed today: the clock starts at the resumed view's mount
    expect(fluencyElapsed(T0, T0 + DAY, T0 + DAY + 30_000)).toBe(30_000);
    // over the cap (e.g. the laptop slept): not a meaningful measurement
    expect(fluencyElapsed(T0, T0, T0 + FLUENCY_MAX_MS)).toBe(FLUENCY_MAX_MS);
    expect(fluencyElapsed(T0, T0, T0 + FLUENCY_MAX_MS + 1)).toBeNull();
    expect(fluencyElapsed(T0 + 5, T0 + 5, T0)).toBeNull();
  });
  it('ignores old over-cap reveal times', () => {
    const log = mkLog([[T0, { type: 'revealed', sessionId: null, step: null, variantId: 'a', elapsedMs: DAY }]]);
    expect(revealTimes(log)).toEqual([]);
  });
  it('reads the latest session length', () => {
    expect(replayMinutes([])).toBe(20);
    expect(replayMinutes(mkLog([[T0, { type: 'settings_changed', minutes: 25 }], [T0, { type: 'settings_changed', minutes: 30 }]]))).toBe(30);
  });
  it('collects reveal times', () => {
    const log = mkLog([
      [T0, { type: 'revealed', sessionId: null, step: null, variantId: 'a', elapsedMs: 1200 }],
      [T0, { type: 'revealed', sessionId: null, step: null, variantId: 'b', elapsedMs: null }],
    ]);
    expect(revealTimes(log)).toEqual([{ variantId: 'a', ms: 1200, ts: T0 }]);
  });
});

describe('content index', () => {
  it('lists primary variants before secondary ones', () => {
    const ids = content.variantsForSkill('fx.waveforms').map((v) => v.id);
    expect(ids.slice(0, 3)).toEqual(['fx.waveforms.v01', 'fx.waveforms.v02', 'fx.waveforms.v03']);
    expect(ids.at(-1)).toBe('fx.lowpass.v01');
  });
});
