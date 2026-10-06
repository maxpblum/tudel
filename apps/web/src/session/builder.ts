/**
 * The Today session builder (PROPOSAL §14). Pure: (content, SRS state, history, now, minutes) → steps.
 *
 * 1. Due reviews first: skills whose FSRS card is due, most overdue first, interleaved round-robin
 *    across units, capped by the time budget. A skill rated Again twice in a row gets its lesson
 *    again as a refresher before the drill.
 * 2. Then extra practice to fill the chosen length (ADR 0100, amendment 1): skills already
 *    introduced but not due, least recently practised first, round-robin, each round on a variant
 *    not yet in the plan. These are ordinary `review` steps and their ratings are ordinary FSRS
 *    reviews (early reviews; ts-fsrs discounts them by retrievability).
 * 3. Then one new skill whose prerequisites are met: its lesson, then 2–3 of its variants, and, only
 *    when no introduced skill has an unplanned variant left, more of its remaining variants.
 *
 * Fill steps are added only while they fit in the budget, so fill never pushes the estimate past
 * `minutes`. If the content runs out first, the estimate is simply shorter (shown honestly).
 */
import type { BundleVariant } from '@tudel/content-schema';
import type { ContentIndex } from '../content/indexBundle';
import { isDue, isIntroduced, lastRatingsAllAgain, statusOf, type SrsState } from '../srs';
import type { Step } from '../store/events';
import { pickVariant, type VariantHistory } from './rotation';

/** Rough minutes per step, used only to size the session. */
export const COST = { review: 2.5, practice: 2.5, refresher: 3, lesson: 4, newVariant: 3 } as const;
export const DEFAULT_MINUTES = 20;
export const MAX_REVIEWS = 12;

export interface BuildInput {
  content: ContentIndex;
  srs: SrsState;
  history: VariantHistory;
  now: Date;
  minutes?: number;
}

export interface SessionPlan {
  steps: Step[];
  reviewSkillIds: string[];
  /** Skills given extra (not-yet-due) practice to fill the budget, one entry per step, in order. */
  practiceSkillIds: string[];
  newSkillId: string | null;
  /** Due skills left out because of the cap. */
  deferredReviews: number;
  estimatedMinutes: number;
}

function candidatesFor(content: ContentIndex, skillId: string): BundleVariant[] {
  const primary = content.primaryVariants(skillId);
  return primary.length ? primary : content.variantsForSkill(skillId);
}

/** The next new skill: prioritized first, then curriculum order; prerequisites must be introduced. */
export function nextNewSkill(content: ContentIndex, srs: SrsState): string | null {
  const eligible = content.skills.filter(
    (s) =>
      statusOf(srs.get(s.id)) === 'new' &&
      s.prereqs.every((p) => isIntroduced(srs.get(p))) &&
      candidatesFor(content, s.id).length > 0,
  );
  const prioritized = eligible.find((s) => srs.get(s.id)?.prioritized);
  return (prioritized ?? eligible[0])?.id ?? null;
}

/** Due skills, most overdue first, interleaved across units (round-robin, by unit of first due). */
export function dueReviewOrder(content: ContentIndex, srs: SrsState, now: Date): string[] {
  const due = content.skills
    .filter((s) => isDue(srs.get(s.id), now) && candidatesFor(content, s.id).length > 0)
    .sort((a, b) => srs.get(a.id)!.card!.due.getTime() - srs.get(b.id)!.card!.due.getTime());
  const byUnit = new Map<string, string[]>();
  for (const s of due) {
    const list = byUnit.get(s.unit) ?? [];
    list.push(s.id);
    byUnit.set(s.unit, list);
  }
  const queues = [...byUnit.values()];
  const out: string[] = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!);
  return out;
}

/** Prerequisites of `skillId` that are not introduced yet (empty when it could be offered). */
export function unmetPrereqs(content: ContentIndex, srs: SrsState, skillId: string): string[] {
  return (content.skill(skillId)?.prereqs ?? []).filter((p) => !isIntroduced(srs.get(p)));
}

/**
 * Skills eligible for extra practice: introduced (has a card), not parked, not due, with variants.
 * Least recently practised (last rating) first; ties in curriculum order.
 */
export function practicePool(content: ContentIndex, srs: SrsState, now: Date, exclude: ReadonlySet<string> = new Set()): string[] {
  const last = (id: string) => srs.get(id)?.ratings.at(-1)?.ts ?? -Infinity;
  return content.skills
    .filter((s) => {
      const st = srs.get(s.id);
      return !exclude.has(s.id) && !!st?.card && !st.parked && !isDue(st, now) && candidatesFor(content, s.id).length > 0;
    })
    .map((s) => s.id)
    .sort((a, b) => last(a) - last(b));
}

export function buildSession({ content, srs, history, now, minutes = DEFAULT_MINUTES }: BuildInput): SessionPlan {
  const used = new Set<string>();
  const newSkillId = nextNewSkill(content, srs);
  const newVariantCount = minutes >= 20 ? 3 : 2;
  let newCost = 0;
  if (newSkillId) {
    const n = Math.min(newVariantCount, candidatesFor(content, newSkillId).length);
    newCost = (content.lessonForSkill(newSkillId) ? COST.lesson : 0) + n * COST.newVariant;
  }
  const reviewBudget = newSkillId ? Math.max(minutes - newCost, 2 * COST.review) : minutes;
  const cap = Math.max(1, Math.min(MAX_REVIEWS, Math.floor(reviewBudget / COST.review)));

  const dueOrder = dueReviewOrder(content, srs, now);
  const reviewSkillIds = dueOrder.slice(0, cap);
  const steps: Step[] = [];
  let estimated = 0;

  for (const skillId of reviewSkillIds) {
    const s = srs.get(skillId);
    const lesson = content.lessonForSkill(skillId);
    if (lesson && lastRatingsAllAgain(s)) {
      steps.push({ kind: 'lesson', skillId, lessonId: lesson.id, reason: 'refresher' });
      estimated += COST.refresher;
    }
    const v = pickVariant(candidatesFor(content, skillId), history, used)!;
    used.add(v.id);
    steps.push({ kind: 'variant', skillId, variantId: v.id, role: 'review' });
    estimated += COST.review;
  }

  // Extra practice from introduced skills (round-robin, variants not yet planned).
  const practiceSkillIds: string[] = [];
  const practiceSteps: Step[] = [];
  const newSteps: Step[] = [];
  let newEstimate = 0;
  if (newSkillId) {
    const lesson = content.lessonForSkill(newSkillId);
    if (lesson) {
      newSteps.push({ kind: 'lesson', skillId: newSkillId, lessonId: lesson.id, reason: 'new' });
      newEstimate += COST.lesson;
    }
    const cands = candidatesFor(content, newSkillId);
    const n = Math.min(newVariantCount, cands.length);
    for (let i = 0; i < n; i++) {
      const v = pickVariant(cands, history, used)!;
      used.add(v.id);
      newSteps.push({ kind: 'variant', skillId: newSkillId, variantId: v.id, role: 'new' });
      newEstimate += COST.newVariant;
    }
  }
  const fits = (cost: number) => estimated + newEstimate + cost <= minutes;
  const unplanned = (skillId: string) => candidatesFor(content, skillId).filter((v) => !used.has(v.id));

  let pool = practicePool(content, srs, now, new Set([...dueOrder, ...(newSkillId ? [newSkillId] : [])]));
  while (pool.length && fits(COST.practice)) {
    for (const skillId of pool) {
      if (!fits(COST.practice)) break;
      const free = unplanned(skillId);
      if (!free.length) continue;
      const v = pickVariant(free, history)!;
      used.add(v.id);
      practiceSteps.push({ kind: 'variant', skillId, variantId: v.id, role: 'review' });
      practiceSkillIds.push(skillId);
      estimated += COST.practice;
    }
    pool = pool.filter((id) => unplanned(id).length > 0);
  }

  // Only when nothing introduced is left: more drills on the new skill's remaining variants.
  if (newSkillId && pool.length === 0) {
    let free = unplanned(newSkillId);
    while (free.length && fits(COST.newVariant)) {
      const v = pickVariant(free, history)!;
      used.add(v.id);
      newSteps.push({ kind: 'variant', skillId: newSkillId, variantId: v.id, role: 'new' });
      newEstimate += COST.newVariant;
      free = unplanned(newSkillId);
    }
  }

  steps.push(...practiceSteps, ...newSteps);
  estimated += newEstimate;

  return {
    steps,
    reviewSkillIds,
    practiceSkillIds,
    newSkillId,
    deferredReviews: dueOrder.length - reviewSkillIds.length,
    estimatedMinutes: Math.round(estimated),
  };
}
