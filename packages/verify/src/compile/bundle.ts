/**
 * The content compiler: validated content → `Bundle` (packages/content-schema), the only
 * thing the app reads. Lessons and prompts become `Block[]` (plan §2.2); code is
 * pre-highlighted with Shiki and tagged with `needsNetwork`; each variant carries a static
 * piano roll of its canonical solution.
 *
 * The output is deterministic: same content + same pin → byte-identical JSON.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Bundle, type Block, type BundleVariant, type CodeSnippet, type RollHap } from '@tutor/content-schema';
import type { Segment } from '../content/directives.js';
import { parseBody } from '../content/directive-bodies.js';
import { LESSON_CYCLES, type ValidContent } from '../content/model.js';
import { normalizeCode } from '../content/snippets.js';
import type { RunCache } from '../harness/evaluate.js';
import { hapBegin, hapEnd, hapMidi, onsetHaps } from '../harness/haps.js';
import { soundUse } from '../gates/l2b-sounds.js';
import type { Reference } from '../ref/reference.js';
import { GateResult } from '../gates/result.js';
import { highlight, htmlToText, renderDot, renderMarkdown, type CiteState } from './render.js';

export function contentHash(root: string, files: string[]): string {
  const h = createHash('sha256');
  for (const f of [...files].sort()) {
    h.update(f);
    h.update('\0');
    h.update(readFileSync(path.join(root, f)));
    h.update('\0');
  }
  return h.digest('hex');
}

interface Ctx {
  ref: Reference;
  cache: RunCache;
  errors: GateResult;
}

async function snippet(ctx: Ctx, code: string, cycles: number): Promise<CodeSnippet> {
  const c = normalizeCode(code);
  const run = await ctx.cache.run(code, cycles);
  return { code: c, html: await highlight(c), needsNetwork: soundUse(code, run.ok ? run : undefined, ctx.ref).needsNetwork };
}

export async function segmentsToBlocks(ctx: Ctx, item: string, segments: Segment[], cycles: number): Promise<Block[]> {
  const cites: CiteState = { pin: ctx.ref.pin, n: 0 };
  const out: Block[] = [];
  for (const s of segments) {
    if (s.kind === 'prose') {
      const html = renderMarkdown(s.text, cites);
      if (html) out.push({ kind: 'html', html });
      continue;
    }
    const fail = (msg: string) => ctx.errors.fail(item, `:::${s.name}: ${msg}`, `line ${s.line}`);
    switch (s.name) {
      case 'play': {
        const label = typeof s.attrs.label === 'string' ? s.attrs.label : undefined;
        out.push({ kind: 'play', snippet: await snippet(ctx, s.body, cycles), ...(label ? { label } : {}), showCode: s.attrs.hidecode !== true });
        break;
      }
      case 'code':
        out.push({ kind: 'code', snippet: await snippet(ctx, s.body, cycles) });
        break;
      case 'abc':
        out.push({ kind: 'abc', abc: s.body.trim() + '\n' });
        break;
      case 'diagram': {
        const d = await renderDot(s.body);
        if (d.error) fail(`Graphviz error: ${d.error}`);
        else out.push({ kind: 'diagram', svg: d.svg! });
        break;
      }
      case 'envelope':
      case 'filter':
      case 'signal': {
        const p = parseBody(s.name, s.body);
        if (!p.ok) fail(p.error);
        else out.push({ kind: s.name, ...(p.value as any) });
        break;
      }
      case 'bridge': {
        const html = renderMarkdown(s.body, cites);
        const title = typeof s.attrs.title === 'string' ? s.attrs.title : undefined;
        out.push({ kind: 'bridge', ...(title ? { title } : {}), blocks: html ? [{ kind: 'html', html }] : [] });
        break;
      }
      case 'compare': {
        const p = parseBody('compare', s.body);
        if (!p.ok) {
          fail(p.error);
          break;
        }
        out.push({
          kind: 'compare',
          a: { label: p.value.a.label, snippet: await snippet(ctx, p.value.a.code, cycles) },
          b: { label: p.value.b.label, snippet: await snippet(ctx, p.value.b.code, cycles) },
          diff: String(s.attrs.diff),
        });
        break;
      }
    }
  }
  return out;
}

function blocksText(blocks: Block[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.kind === 'html') parts.push(htmlToText(b.html));
    else if (b.kind === 'bridge') parts.push(b.title ?? '', blocksText(b.blocks));
    else if (b.kind === 'play' && b.label) parts.push(b.label);
    else if (b.kind === 'compare') parts.push(b.a.label, b.b.label, b.diff);
  }
  return parts.filter(Boolean).join(' ');
}

export async function roll(cache: RunCache, code: string, cycles: number): Promise<RollHap[]> {
  const run = await cache.run(code, cycles);
  if (!run.ok) return [];
  return onsetHaps(run.haps).map((h) => ({
    b: hapBegin(h),
    e: hapEnd(h),
    midi: hapMidi(h.value),
    s: typeof h.value?.s === 'string' ? h.value.s : null,
  }));
}

export async function buildBundle(c: ValidContent, ref: Reference, cache: RunCache): Promise<{ bundle?: Bundle; result: GateResult }> {
  const result = new GateResult('BUILD');
  const ctx: Ctx = { ref, cache, errors: result };

  const variants: BundleVariant[] = [];
  for (const vv of [...c.variants].sort((a, b) => (a.v.id < b.v.id ? -1 : a.v.id > b.v.id ? 1 : 0))) {
    const v = vv.v;
    const cycles = v.verify.cycles;
    variants.push({
      id: v.id,
      skills: v.skills,
      type: v.type,
      difficulty: v.difficulty,
      title: v.title,
      prompt: await segmentsToBlocks(ctx, v.id, vv.promptSegments, cycles),
      abc: v.abc,
      starter: v.starter ? await snippet(ctx, v.starter, cycles) : null,
      hideReferenceCodeUntilReveal: v.hide_reference_code_until_reveal,
      solutions: await Promise.all(v.solutions.map(async (s) => ({ snippet: await snippet(ctx, s.code, cycles), ...(s.note ? { note: s.note } : {}) }))),
      listenFor: v.listen_for,
      rubric: v.rubric,
      cycles,
      roll: await roll(cache, v.solutions[0]!.code, cycles),
      sources: v.sources,
    });
  }

  const lessonById = new Map(c.lessons.map((l) => [l.id, l] as const));
  const lessons = [];
  for (const s of c.skills) {
    const l = lessonById.get(s.lesson);
    if (!l) continue;
    const blocks = await segmentsToBlocks(ctx, l.id, l.segments, LESSON_CYCLES);
    lessons.push({ id: l.id, title: l.title, skill: l.skill, blocks, text: [l.title, blocksText(blocks)].join(' ').trim() });
  }

  const bundle = {
    schemaVersion: 1 as const,
    strudel: { commit: ref.pin.commit, npm: ref.pin.npm },
    contentHash: contentHash(c.root, c.files),
    units: [...c.units].sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1)),
    // Primary variants (skill listed first) before secondary ones; id order within each group.
    skills: c.skills.map((s) => ({
      ...s,
      variants: [
        ...variants.filter((v) => v.skills[0] === s.id),
        ...variants.filter((v) => v.skills[0] !== s.id && v.skills.includes(s.id)),
      ].map((v) => v.id),
    })),
    lessons,
    variants,
    lexicon: c.lexicon,
  };
  const parsed = Bundle.safeParse(bundle);
  if (!parsed.success) {
    for (const i of parsed.error.issues.slice(0, 20)) result.fail('bundle', `bundle does not match the Bundle schema at ${i.path.join('.')}: ${i.message}`);
    return { result };
  }
  if (result.ok) result.pass('bundle', `bundle valid (${variants.length} variants, ${lessons.length} lessons)`);
  return { bundle: parsed.data, result };
}

export function serializeBundle(b: Bundle): string {
  return JSON.stringify(b, null, 2) + '\n';
}
