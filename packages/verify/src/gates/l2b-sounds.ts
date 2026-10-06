/**
 * Gate L2b: sound names. Every sound a snippet can play must be registered by the pinned
 * prebake (tools/strudel-ref/sounds.json); otherwise superdough throws "sound X not found".
 *
 * Two complementary checks, because neither alone is complete:
 *  - static: every word in a literal mini-notation string passed to `s()` / `sound()` (and
 *    every bank in `.bank()`), parsed with Strudel's own mini-notation parser, so alternatives
 *    beyond the queried cycles (`"<a b c d e>"`) are still checked;
 *  - dynamic: the `s` (and `bank_s`, as superdough combines them) of every queried hap, which
 *    covers sounds computed by functions rather than written as literals.
 */
import type { Snippet } from '../content/snippets.js';
import type { RunCache, SnippetRun } from '../harness/evaluate.js';
import { analyzeCode } from '../code/ast.js';
import { miniWords } from '../code/mini.js';
import { DEFAULT_SOUND } from '../harness/haps.js';
import { lookupSound, type Reference } from '../ref/reference.js';
import { GateResult } from './result.js';

export interface SoundUse {
  /** Sound names used (lower-cased, bank-combined where applicable). */
  sounds: Set<string>;
  banks: Set<string>;
  problems: string[];
  /** True if any used sound needs the network (anything but a synth), or a bank is used. */
  needsNetwork: boolean;
}

export function soundUse(code: string, run: SnippetRun | undefined, ref: Reference): SoundUse {
  const use: SoundUse = { sounds: new Set(), banks: new Set(), problems: [], needsNetwork: false };
  const a = analyzeCode(code);
  if (a.ok) {
    for (const arg of a.soundArgs) {
      if (arg.value === null) continue;
      const m = miniWords(arg.value);
      if (!m.ok) {
        use.problems.push(`can't parse mini-notation ${JSON.stringify(arg.value)} at ${arg.line}:${arg.col}: ${m.error}`);
        continue;
      }
      for (const w of m.words) {
        if (arg.fn === 'bank') {
          use.banks.add(w.toLowerCase());
          if (!ref.banks.has(w.toLowerCase())) use.problems.push(`bank "${w}" (at ${arg.line}:${arg.col}) is not a registered sample bank at the pin`);
        } else {
          use.sounds.add(w.toLowerCase());
          if (!lookupSound(ref, w)) use.problems.push(`sound "${w}" (at ${arg.line}:${arg.col}) is not registered at the pin`);
        }
      }
    }
  }
  for (const h of run?.haps ?? []) {
    const v = h.value;
    if (!v || typeof v !== 'object') continue;
    let s = v.s ?? DEFAULT_SOUND;
    if (typeof s !== 'string') {
      use.problems.push(`hap has non-string s ${JSON.stringify(s)}`);
      continue;
    }
    if (['-', '~', '_'].includes(s)) continue;
    if (v.bank) {
      use.banks.add(String(v.bank).toLowerCase());
      s = `${v.bank}_${s}`;
    }
    const name = s.toLowerCase();
    if (!use.sounds.has(name) && !lookupSound(ref, name)) use.problems.push(`hap plays sound "${s}", which is not registered at the pin`);
    use.sounds.add(name);
  }
  use.problems = [...new Set(use.problems)];
  use.needsNetwork = use.banks.size > 0 || [...use.sounds].some((n) => lookupSound(ref, n)?.network ?? false);
  return use;
}

export async function gateL2b(snippets: Snippet[], cache: RunCache, ref: Reference): Promise<GateResult> {
  const r = new GateResult('L2b');
  for (const s of snippets) {
    const run = await cache.run(s.code, s.cycles);
    const use = soundUse(s.code, run.ok ? run : undefined, ref);
    const where = `${s.key} (${s.where})`;
    for (const p of use.problems) r.fail(s.owner, p, where);
    if (!use.problems.length) r.pass(s.owner, `sounds ok: ${[...use.sounds].sort().join(', ') || '(none)'}${use.needsNetwork ? ' [needs network]' : ''}`, where);
  }
  return r;
}
