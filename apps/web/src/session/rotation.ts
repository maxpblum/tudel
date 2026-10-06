/**
 * Variant rotation (R-SKILLS, PROPOSAL §14): when a skill comes up, show a variant the learner hasn't
 * seen, else the one seen longest ago.
 */
import type { BundleVariant } from '@tutor/content-schema';
import type { LogEvent } from '../store/events';

/** variantId → timestamp of the most recent `variant_shown`. */
export type VariantHistory = Map<string, number>;

export function variantHistory(events: readonly LogEvent[]): VariantHistory {
  const h: VariantHistory = new Map();
  for (const e of events) if (e.type === 'variant_shown') h.set(e.variantId, e.ts);
  return h;
}

/**
 * Pick from `candidates` (in authoring order): the first unseen one, else the least recently seen.
 * Variants in `exclude` (already planned this session) are avoided unless nothing else is left.
 */
export function pickVariant(
  candidates: readonly BundleVariant[],
  history: VariantHistory,
  exclude: ReadonlySet<string> = new Set(),
): BundleVariant | undefined {
  const pool = candidates.filter((v) => !exclude.has(v.id));
  const from = pool.length ? pool : candidates;
  const unseen = from.find((v) => !history.has(v.id));
  if (unseen) return unseen;
  let best: BundleVariant | undefined;
  let bestTs = Infinity;
  for (const v of from) {
    const ts = history.get(v.id)!;
    if (ts < bestTs) {
      best = v;
      bestTs = ts;
    }
  }
  return best;
}
