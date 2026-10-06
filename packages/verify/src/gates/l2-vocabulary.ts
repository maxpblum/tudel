/**
 * Gate L2: vocabulary. Every free identifier and every called method in every snippet must
 * be a Strudel name in the pinned doc.json (primary name or synonym), or be on the allowlist
 * (src/gates/allowlist.json), where every entry cites an ADR under docs/decisions/.
 *
 * This is independent of L1: a name can evaluate fine (e.g. a repl-injected helper, or a
 * method some runtime mocks away) and still not be documented Strudel vocabulary.
 *
 * Also checks each skill's `vocabulary` list: entries must be primary doc.json names
 * (synonyms are rejected, per house style).
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Skill } from '@tutor/content-schema';
import type { Snippet } from '../content/snippets.js';
import { analyzeCode } from '../code/ast.js';
import { isKnownName, type Reference } from '../ref/reference.js';
import { GateResult } from './result.js';

export function checkAllowlist(ref: Reference, repoRoot: string, r: GateResult) {
  for (const e of ref.allowlist.values()) {
    if (!/^docs\/decisions\/\d{4}-[\w.-]+\.md$/.test(e.adr)) r.fail('allowlist', `allowlist entry "${e.name}" must cite an ADR path docs/decisions/NNNN-*.md (got "${e.adr}")`);
    else if (!existsSync(path.join(repoRoot, e.adr))) r.fail('allowlist', `allowlist entry "${e.name}" cites ${e.adr}, which does not exist`);
    else if (ref.names.has(e.name)) r.fail('allowlist', `allowlist entry "${e.name}" is redundant: doc.json documents it now; remove it`);
    else r.pass('allowlist', `"${e.name}" justified by ${e.adr}`);
  }
}

export function gateL2(snippets: Snippet[], skills: Skill[], ref: Reference, repoRoot: string): GateResult {
  const r = new GateResult('L2');
  checkAllowlist(ref, repoRoot, r);
  for (const s of snippets) {
    const where = `${s.key} (${s.where})`;
    const a = analyzeCode(s.code);
    if (!a.ok) {
      r.fail(s.owner, a.error!, where);
      continue;
    }
    let bad = 0;
    for (const ref_ of a.refs) {
      if (ref_.kind === 'method' && a.registered.has(ref_.name)) continue;
      if (isKnownName(ref, ref_.name)) continue;
      bad++;
      const what = ref_.kind === 'method' ? `method .${ref_.name}()` : ref_.called ? `function ${ref_.name}()` : `identifier ${ref_.name}`;
      const hint = ref.sounds.has(ref_.name.toLowerCase()) ? ` ("${ref_.name}" is a sound name: use s("${ref_.name}"))` : '';
      r.fail(s.owner, `${what} at ${ref_.line}:${ref_.col} is not in the pinned doc.json or the allowlist${hint}`, where);
    }
    if (!bad) r.pass(s.owner, `${a.refs.length} names all documented`, where);
  }
  for (const sk of skills) {
    for (const v of sk.vocabulary) {
      if (ref.names.has(v) || ref.allowlist.has(v)) r.pass(sk.id, `vocabulary "${v}" documented`);
      else if (ref.synonyms.has(v)) r.fail(sk.id, `vocabulary "${v}" is a synonym; list the primary name "${ref.synonyms.get(v)}"`);
      else {
        const hint = ref.sounds.has(v.toLowerCase()) ? ' (it is a sound name, not a function; list "s" instead)' : '';
        r.fail(sk.id, `vocabulary "${v}" is not in the pinned doc.json${hint}`);
      }
    }
  }
  return r;
}
