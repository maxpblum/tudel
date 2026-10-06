/**
 * Schemas for the YAML bodies of the parameter directives (:::envelope, :::filter, :::signal,
 * :::compare). Used by gate L0 (validation) and the compiler (building Blocks).
 */
import { z } from 'zod';
import { parse as parseYaml } from 'yaml';

export const EnvelopeBody = z.strictObject({
  attack: z.number().min(0),
  decay: z.number().min(0),
  sustain: z.number().min(0).max(1),
  release: z.number().min(0),
  hold: z.number().min(0).optional(),
});
const FilterCurve = z.strictObject({
  cutoff: z.number().positive(),
  q: z.number().min(0),
  label: z.string().min(1).optional(),
});
/**
 * Either the single-curve form `{type, cutoff, q}` or the family form `{type, curves: [{cutoff, q, label}]}`
 * (1-6 curves; a label on every curve when there is more than one). Both normalise to `{type, curves}`.
 */
export const FilterBody = z
  .strictObject({
    type: z.enum(['lowpass', 'highpass', 'bandpass']),
    cutoff: z.number().positive().optional(),
    q: z.number().min(0).optional(),
    curves: z.array(FilterCurve).min(1, 'needs at least 1 curve').max(6, 'at most 6 curves are allowed').optional(),
  })
  .superRefine((b, ctx) => {
    if (b.curves) {
      if (b.cutoff !== undefined || b.q !== undefined) ctx.addIssue({ code: 'custom', message: 'use either top-level cutoff/q or curves, not both' });
      if (b.curves.length > 1 && b.curves.some((c) => !c.label)) ctx.addIssue({ code: 'custom', path: ['curves'], message: 'every curve needs a label when there is more than one curve' });
    } else {
      if (b.cutoff === undefined) ctx.addIssue({ code: 'custom', path: ['cutoff'], message: 'cutoff is required (or give a curves list)' });
      if (b.q === undefined) ctx.addIssue({ code: 'custom', path: ['q'], message: 'q is required (or give a curves list)' });
    }
  })
  .transform((b) => ({ type: b.type, curves: b.curves ?? [{ cutoff: b.cutoff!, q: b.q! }] }));
export const SignalBody = z.strictObject({
  shape: z.enum(['sine', 'cosine', 'saw', 'isaw', 'tri', 'square', 'perlin', 'rand']),
  min: z.number(),
  max: z.number(),
  period: z.number().positive(),
  cycles: z.number().positive(),
  label: z.string().optional(),
});
const CompareSide = z.strictObject({ label: z.string().min(1), code: z.string().min(1) });
export const CompareBody = z.strictObject({ a: CompareSide, b: CompareSide });

export const BODY_SCHEMAS = {
  envelope: EnvelopeBody,
  filter: FilterBody,
  signal: SignalBody,
  compare: CompareBody,
} as const;

export function formatZodError(e: z.ZodError): string {
  return e.issues.map((i) => `${i.path.length ? i.path.join('.') + ': ' : ''}${i.message}`).join('; ');
}

/** Parse and validate a YAML directive body. */
export function parseBody<K extends keyof typeof BODY_SCHEMAS>(
  name: K,
  body: string,
): { ok: true; value: z.infer<(typeof BODY_SCHEMAS)[K]> } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = parseYaml(body);
  } catch (e) {
    return { ok: false, error: `YAML parse error: ${(e as Error).message}` };
  }
  const r = BODY_SCHEMAS[name].safeParse(data);
  if (!r.success) return { ok: false, error: formatZodError(r.error) };
  return { ok: true, value: r.data as any };
}
