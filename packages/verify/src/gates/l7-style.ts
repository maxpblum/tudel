/**
 * Gate L7: house style (docs/house-style.md), for every snippet except `:::code{antipattern}`
 * blocks and `refactor` starters (which are clumsy on purpose):
 *  - Prettier with the exact config in prettier.config.json leaves the code unchanged;
 *  - no single-quoted string literals (in Strudel they are plain JS strings, not mini-notation);
 *  - no doc.json synonyms (`sound`, `cutoff`, `lp`, ...): the list is derived from doc.json;
 *  - no synth alias sound names (`saw`, `sqr`, `tri`, `sin`): derived from sounds.json aliases.
 */
import * as prettier from 'prettier';
import prettierConfig from './prettier.config.json' with { type: 'json' };
import type { Snippet } from '../content/snippets.js';
import { normalizeCode } from '../content/snippets.js';
import { analyzeCode } from '../code/ast.js';
import { miniWords } from '../code/mini.js';
import { lookupSound, type Reference } from '../ref/reference.js';
import { lineDiff } from '../util/diff.js';
import { GateResult } from './result.js';

export const PRETTIER_CONFIG = prettierConfig as prettier.Options;

export async function styleProblems(code: string, ref: Reference): Promise<string[]> {
  const problems: string[] = [];
  const src = normalizeCode(code) + '\n';
  try {
    const formatted = await prettier.format(src, PRETTIER_CONFIG);
    if (formatted !== src) problems.push(`not Prettier-formatted (- as written, + Prettier):\n${lineDiff(src.trimEnd().split('\n'), formatted.trimEnd().split('\n'))}`);
  } catch (e) {
    problems.push(`Prettier can't parse it: ${(e as Error).message.split('\n')[0]}`);
  }
  const a = analyzeCode(code);
  if (!a.ok) return problems; // L2 reports the syntax error
  for (const s of a.strings) {
    if (s.quote === "'") problems.push(`single-quoted string ${s.raw} at ${s.line}:${s.col}: use double quotes (single quotes are not mini-notation in Strudel)`);
  }
  for (const r of a.refs) {
    const primary = ref.synonyms.get(r.name);
    if (primary && !ref.names.has(r.name)) problems.push(`"${r.name}" at ${r.line}:${r.col} is a synonym; use the primary name "${primary}"`);
  }
  for (const arg of a.soundArgs) {
    if (arg.value === null || arg.fn === 'bank') continue;
    for (const w of miniWords(arg.value).words) {
      const info = lookupSound(ref, w);
      if (info?.type === 'synth' && info.aliasOf) problems.push(`sound "${w}" at ${arg.line}:${arg.col} is a short alias; write "${info.aliasOf}"`);
    }
  }
  return problems;
}

export async function gateL7(snippets: Snippet[], ref: Reference): Promise<GateResult> {
  const r = new GateResult('L7');
  for (const s of snippets) {
    const where = `${s.key} (${s.where})`;
    if (s.styleExempt) {
      r.pass(s.owner, s.antipattern ? 'antipattern block: exempt' : 'refactor starter: exempt', where);
      continue;
    }
    const problems = await styleProblems(s.code, ref);
    for (const p of problems) r.fail(s.owner, p, where);
    if (!problems.length) r.pass(s.owner, 'house style ok', where);
  }
  return r;
}
