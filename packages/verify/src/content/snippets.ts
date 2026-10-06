/**
 * Collects every piece of Strudel code in the content: variant solutions and starters, and
 * every :::play / :::code / :::compare snippet in lessons and prompts. All gates that look at
 * code iterate over this list, so no snippet can slip past a gate by living somewhere unusual.
 */
import type { Segment } from './directives.js';
import { parseBody } from './directive-bodies.js';
import { LESSON_CYCLES, type ValidContent } from './model.js';

export type SnippetRole = 'solution' | 'starter' | 'play' | 'code' | 'compare';

export interface Snippet {
  /** Variant or lesson id. */
  owner: string;
  ownerKind: 'variant' | 'lesson';
  /** Stable key within the owner (used as the L3 snapshot section name). */
  key: string;
  role: SnippetRole;
  code: string;
  /** `:::code{antipattern}`: still evaluated (L1) and checked (L2), but exempt from L7. */
  antipattern: boolean;
  /** Exempt from L7 house style (antipatterns and refactor starters, which are clumsy on purpose). */
  styleExempt: boolean;
  cycles: number;
  /** `file:line` for messages. */
  where: string;
}

function fromSegments(
  owner: string,
  ownerKind: 'variant' | 'lesson',
  file: string,
  segments: Segment[],
  cycles: number,
  prefix: string,
  out: Snippet[],
) {
  let i = 0;
  for (const s of segments) {
    if (s.kind !== 'directive') continue;
    const where = `${file}:${s.line}`;
    const base = { owner, ownerKind, cycles, where };
    if (s.name === 'play' || s.name === 'code') {
      const antipattern = s.name === 'code' && s.attrs.antipattern === true;
      out.push({ ...base, key: `${prefix}#${i++} ${s.name}`, role: s.name, code: s.body, antipattern, styleExempt: antipattern });
    } else if (s.name === 'compare') {
      const p = parseBody('compare', s.body);
      const n = i++;
      if (!p.ok) continue; // reported by L0
      out.push({ ...base, key: `${prefix}#${n} compare.a`, role: 'compare', code: p.value.a.code, antipattern: false, styleExempt: false });
      out.push({ ...base, key: `${prefix}#${n} compare.b`, role: 'compare', code: p.value.b.code, antipattern: false, styleExempt: false });
    }
  }
}

export function collectSnippets(c: ValidContent): Snippet[] {
  const out: Snippet[] = [];
  for (const v of c.variants) {
    const cycles = v.v.verify.cycles;
    const base = { owner: v.v.id, ownerKind: 'variant' as const, cycles, where: v.file, antipattern: false };
    v.v.solutions.forEach((s, i) => out.push({ ...base, key: `solution[${i}]`, role: 'solution', code: s.code, styleExempt: false }));
    if (v.v.starter) out.push({ ...base, key: 'starter', role: 'starter', code: v.v.starter, styleExempt: v.v.type === 'refactor' });
    fromSegments(v.v.id, 'variant', v.file, v.promptSegments, cycles, 'prompt', out);
  }
  for (const l of c.lessons) fromSegments(l.id, 'lesson', l.file, l.segments, LESSON_CYCLES, 'snippet', out);
  return out;
}

/** Code as stored and compared: trailing whitespace/newlines removed. */
export function normalizeCode(code: string): string {
  return code.replace(/\r\n/g, '\n').replace(/\s+$/, '');
}
