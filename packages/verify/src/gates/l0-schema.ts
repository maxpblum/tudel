/**
 * Gate L0: schema validation (zod, from @tutor/content-schema) and skill-graph integrity.
 *
 * Checks: every file parses and matches its schema; ids are unique; units, prereqs, lessons,
 * and variant skills all resolve; the prerequisite graph has no cycles; variant file names
 * equal variant ids and ids follow `<first-skill>.vNN`; files sit under the right unit;
 * every skill has at least 3 variants in its pool; directive syntax and directive bodies
 * are valid.
 */
import path from 'node:path';
import { z } from 'zod';
import { LessonFrontmatter, LexiconFile, SkillsFile, Variant, type Skill } from '@tutor/content-schema';
import type { RawContent } from '../content/load.js';
import { parseDirectives, type Segment } from '../content/directives.js';
import { BODY_SCHEMAS, formatZodError, parseBody } from '../content/directive-bodies.js';
import type { ChordSymbolEntry, ValidContent, ValidLesson, ValidVariant } from '../content/model.js';
import { GateResult } from './result.js';

export const MIN_VARIANTS_PER_SKILL = 3;

export const ChordSymbolsFile = z.object({
  entries: z.array(z.looseObject({ symbol: z.string().min(1), tones: z.array(z.string().min(1)).min(1) })),
});

/**
 * Keys present in the input but dropped by zod's parse (zod objects strip unknown keys).
 * A stripped key is almost always a typo that would otherwise silently fall back to a default.
 */
export function strippedKeys(input: unknown, output: unknown, at = ''): string[] {
  const out: string[] = [];
  if (Array.isArray(input) && Array.isArray(output)) {
    input.forEach((x, i) => out.push(...strippedKeys(x, output[i], `${at}[${i}]`)));
  } else if (input && output && typeof input === 'object' && typeof output === 'object') {
    for (const k of Object.keys(input)) {
      const p = at ? `${at}.${k}` : k;
      if (!(k in output)) out.push(p);
      else out.push(...strippedKeys((input as any)[k], (output as any)[k], p));
    }
  }
  return out;
}

function checkSegments(r: GateResult, item: string, file: string, segments: Segment[]) {
  for (const s of segments) {
    if (s.kind !== 'directive') continue;
    if (s.name in BODY_SCHEMAS) {
      const p = parseBody(s.name as keyof typeof BODY_SCHEMAS, s.body);
      if (!p.ok) r.fail(item, `:::${s.name} body is invalid: ${p.error}`, `${file}:${s.line}`);
    }
  }
}

function parseMarkdown(r: GateResult, item: string, file: string, src: string, lineOffset: number): Segment[] {
  const { segments, issues } = parseDirectives(src, lineOffset);
  for (const i of issues) r.fail(item, i.message, `${file}:${i.line}`);
  checkSegments(r, item, file, segments);
  return segments;
}

export function gateL0(raw: RawContent): { result: GateResult; content: ValidContent } {
  const r = new GateResult('L0');
  const content: ValidContent = { root: raw.root, files: raw.files, units: [], skills: [], lessons: [], variants: [], lexicon: [], chords: [] };

  for (const s of raw.stray) r.fail(s.file, s.message, s.file);

  // skills.yaml
  if (!raw.skills) r.fail('skills.yaml', 'content/skills.yaml is missing');
  else if (raw.skills.error) r.fail('skills.yaml', raw.skills.error, 'skills.yaml');
  else {
    const p = SkillsFile.safeParse(raw.skills.data);
    if (!p.success) r.fail('skills.yaml', `schema: ${formatZodError(p.error)}`, 'skills.yaml');
    else {
      for (const k of strippedKeys(raw.skills.data, p.data)) r.fail('skills.yaml', `unknown field "${k}" (typo?)`, 'skills.yaml');
      content.units = p.data.units;
      content.skills = p.data.skills;
      r.pass('skills.yaml', `schema ok (${p.data.units.length} units, ${p.data.skills.length} skills)`);
    }
  }

  // lexicon
  if (!raw.lexicon) r.fail('lexicon', 'content/glossary/timbre-lexicon.yaml is missing');
  else if (raw.lexicon.error) r.fail('lexicon', raw.lexicon.error, raw.lexicon.file);
  else {
    const p = LexiconFile.safeParse(raw.lexicon.data);
    if (!p.success) r.fail('lexicon', `schema: ${formatZodError(p.error)}`, raw.lexicon.file);
    else {
      for (const k of strippedKeys(raw.lexicon.data, p.data)) r.fail('lexicon', `unknown field "${k}" (typo?)`, raw.lexicon.file);
      content.lexicon = p.data.entries;
      const seen = new Set<string>();
      for (const e of p.data.entries) {
        if (seen.has(e.term)) r.fail('lexicon', `duplicate lexicon term "${e.term}"`, raw.lexicon.file);
        seen.add(e.term);
      }
      r.pass('lexicon', `schema ok (${p.data.entries.length} entries)`);
    }
  }

  // chord symbols (optional in M1)
  if (raw.chords) {
    if (raw.chords.error) r.fail('chord-symbols', raw.chords.error, raw.chords.file);
    else {
      const p = ChordSymbolsFile.safeParse(raw.chords.data);
      if (!p.success) r.fail('chord-symbols', `schema: ${formatZodError(p.error)}`, raw.chords.file);
      else content.chords = p.data.entries as ChordSymbolEntry[];
    }
  }

  // lessons
  for (const l of raw.lessons) {
    const fallbackId = path.basename(l.file, '.md');
    if (l.error) {
      r.fail(fallbackId, l.error, l.file);
      continue;
    }
    const p = LessonFrontmatter.strict().safeParse(l.frontmatter);
    if (!p.success) {
      r.fail(fallbackId, `frontmatter schema: ${formatZodError(p.error)}`, l.file);
      continue;
    }
    const segments = parseMarkdown(r, p.data.id, l.file, l.body, l.bodyLineOffset);
    content.lessons.push({ file: l.file, unit: l.unit, ...p.data, segments });
    r.pass(p.data.id, 'frontmatter schema ok', l.file);
  }

  // variants
  for (const v of raw.variants) {
    const fileId = path.basename(v.file, '.yaml');
    if (v.error) {
      r.fail(fileId, v.error, v.file);
      continue;
    }
    const p = (Variant as any).safeParse(v.data) as ReturnType<typeof Variant.safeParse>;
    if (!p.success) {
      r.fail(fileId, `schema: ${formatZodError(p.error)}`, v.file);
      continue;
    }
    for (const k of strippedKeys(v.data, p.data)) r.fail(p.data.id, `unknown field "${k}" (typo?)`, v.file);
    if (p.data.id !== fileId) r.fail(p.data.id, `file name "${fileId}.yaml" must equal the variant id "${p.data.id}"`, v.file);
    const idRe = new RegExp(`^${p.data.skills[0]!.replace(/[.]/g, '\\.')}\\.v\\d{2}$`);
    if (!idRe.test(p.data.id)) r.fail(p.data.id, `variant id must be "<first skill>.vNN", i.e. ${p.data.skills[0]}.v01, .v02, ...`, v.file);
    const promptSegments = parseMarkdown(r, p.data.id, v.file, p.data.prompt, 0);
    content.variants.push({ file: v.file, unit: v.unit, v: p.data, promptSegments });
    r.pass(p.data.id, 'schema ok', v.file);
  }

  integrity(r, content);
  return { result: r, content };
}

function integrity(r: GateResult, c: ValidContent) {
  const dupes = <T>(items: T[], key: (t: T) => string, what: string, item: (t: T) => string) => {
    const seen = new Set<string>();
    for (const t of items) {
      const k = key(t);
      if (seen.has(k)) r.fail(item(t), `duplicate ${what} id "${k}"`);
      seen.add(k);
    }
  };
  dupes(c.units, (u) => u.id, 'unit', () => 'skills.yaml');
  dupes(c.skills, (s) => s.id, 'skill', (s) => s.id);
  dupes(c.lessons, (l) => l.id, 'lesson', (l) => l.id);
  dupes(c.variants, (v) => v.v.id, 'variant', (v) => v.v.id);
  const lessonIds = new Set(c.lessons.map((l) => l.id));
  for (const v of c.variants) if (lessonIds.has(v.v.id)) r.fail(v.v.id, `variant id "${v.v.id}" collides with a lesson id (snapshot files would clash)`);

  const units = new Set(c.units.map((u) => u.id));
  const skills = new Map(c.skills.map((s) => [s.id, s] as const));
  const lessons = new Map(c.lessons.map((l) => [l.id, l] as const));

  for (const s of c.skills) {
    if (!units.has(s.unit)) r.fail(s.id, `unit "${s.unit}" is not defined in skills.yaml units`);
    for (const p of s.prereqs) {
      if (p === s.id) r.fail(s.id, 'skill lists itself as a prerequisite');
      else if (!skills.has(p)) r.fail(s.id, `prerequisite "${p}" does not exist`);
    }
    const l = lessons.get(s.lesson);
    if (!l) r.fail(s.id, `lesson "${s.lesson}" does not exist (no lesson file has that frontmatter id)`);
    else {
      if (l.skill !== s.id) r.fail(s.id, `lesson "${l.id}" has skill "${l.skill}" in its frontmatter, but skill "${s.id}" points to it`);
      if (l.unit !== s.unit) r.fail(l.id, `lesson file is under units/${l.unit}/ but its skill's unit is "${s.unit}"`, l.file);
    }
  }
  for (const l of c.lessons) {
    const s = skills.get(l.skill);
    if (!s) r.fail(l.id, `frontmatter skill "${l.skill}" does not exist`, l.file);
    else if (s.lesson !== l.id) r.fail(l.id, `skill "${s.id}" points to lesson "${s.lesson}", not to this lesson (orphan lesson)`, l.file);
  }

  // cycles in the prerequisite graph
  const state = new Map<string, 1 | 2>();
  const stack: string[] = [];
  const reported = new Set<string>();
  const visit = (id: string) => {
    state.set(id, 1);
    stack.push(id);
    for (const p of skills.get(id)?.prereqs ?? []) {
      if (!skills.has(p)) continue;
      if (state.get(p) === 1) {
        const cyc = [...stack.slice(stack.indexOf(p)), p];
        const key = [...cyc].sort().join(',');
        if (!reported.has(key)) {
          reported.add(key);
          r.fail(p, `prerequisite cycle: ${cyc.join(' -> ')}`);
        }
      } else if (!state.has(p)) visit(p);
    }
    stack.pop();
    state.set(id, 2);
  };
  for (const s of c.skills) if (!state.has(s.id)) visit(s.id);

  // variant skill references, placement, pool sizes
  const pool = new Map<string, string[]>(c.skills.map((s) => [s.id, []]));
  for (const v of c.variants) {
    for (const sid of v.v.skills) {
      if (!skills.has(sid)) r.fail(v.v.id, `skill "${sid}" does not exist`, v.file);
      else pool.get(sid)!.push(v.v.id);
    }
    const first: Skill | undefined = skills.get(v.v.skills[0]!);
    if (first && first.unit !== v.unit) r.fail(v.v.id, `variant file is under units/${v.unit}/ but its first skill's unit is "${first.unit}"`, v.file);
    if (new Set(v.v.skills).size !== v.v.skills.length) r.fail(v.v.id, 'skills list has duplicates', v.file);
  }
  for (const [sid, ids] of pool) {
    if (ids.length < MIN_VARIANTS_PER_SKILL) r.fail(sid, `has ${ids.length} variant(s); every skill needs at least ${MIN_VARIANTS_PER_SKILL}`);
    else r.pass(sid, `${ids.length} variants`);
  }
}
