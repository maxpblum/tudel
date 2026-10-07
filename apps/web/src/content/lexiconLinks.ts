import type { Bundle, LexiconEntry } from '@tudel/content-schema';
import { blocksText, variantText } from './text';

/**
 * Words that stand for a lexicon entry: its term plus synonyms named in `notes`, either as
 * `Synonyms: a, b` or as `Also "a" and "b".`
 */
export function lexiconAliases(e: LexiconEntry): string[] {
  const notes = e.notes ?? '';
  const listed = /synonyms?\s*:\s*([^.\n]*)/i.exec(notes)?.[1]?.split(/[,;]/).map((x) => x.trim()) ?? [];
  const also = /\balso\s+((?:"[^"]+"(?:\s*(?:,|and|or)\s*)?)+)/i.exec(notes)?.[1];
  const quoted = also ? [...also.matchAll(/"([^"]+)"/g)].map((m) => m[1]!) : [];
  return [...new Set([e.term, ...listed, ...quoted].filter(Boolean))];
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive whole-word match of any alias in `text`. */
export function mentionsAny(text: string, aliases: readonly string[]): boolean {
  if (!aliases.length) return false;
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${aliases.map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`, 'iu');
  return re.test(text);
}

/**
 * Which skills mention each lexicon term, as a map term -> skill ids (curriculum order not implied:
 * bundle order). A skill mentions a term if the term (or a synonym from the entry's `notes`)
 * appears as a whole word in its lesson text, its variants' prompts (prose) or `listenFor`.
 * Variants count for their primary skill.
 */
export function lexiconLinks(bundle: Bundle): Map<string, string[]> {
  const texts = new Map<string, string[]>();
  const add = (skillId: string, t: string) => texts.set(skillId, [...(texts.get(skillId) ?? []), t]);
  for (const l of bundle.lessons) add(l.skill, l.text || blocksText(l.blocks));
  for (const v of bundle.variants) if (v.skills[0]) add(v.skills[0], variantText(v));
  const out = new Map<string, string[]>();
  for (const e of bundle.lexicon) {
    const aliases = lexiconAliases(e);
    out.set(
      e.term,
      bundle.skills.filter((s) => (texts.get(s.id) ?? []).some((t) => mentionsAny(t, aliases))).map((s) => s.id),
    );
  }
  return out;
}
