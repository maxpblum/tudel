/**
 * Strudel terms for the app's glossary, derived (nothing authored): one per distinct name in
 * any skill's `vocabulary`, with the first sentence of its doc.json description as synopsis.
 * Names without a doc.json entry (allowlisted ones; L2 governs names) get an empty synopsis.
 */
import type { Skill, StrudelTerm } from '@tudel/content-schema';
import type { Reference } from '../ref/reference.js';
import { htmlToText } from './render.js';

/** First sentence of a doc.json description (HTML), as plain text. */
export function firstSentence(html: string): string {
  const text = htmlToText(html).replace(/[`*_]/g, '');
  // A sentence ends at . ! or ? followed by whitespace, except after "e.g." and "i.e.".
  const m = /^(?:.*?)(?<!\be\.g|\bi\.e)[.!?](?=\s|$)/.exec(text);
  return (m ? m[0] : text).trim();
}

export function deriveTerms(skills: Skill[], ref: Reference): StrudelTerm[] {
  const byName = new Map<string, string[]>();
  for (const s of skills) {
    for (const n of new Set(s.vocabulary)) {
      const ids = byName.get(n) ?? [];
      ids.push(s.id);
      byName.set(n, ids);
    }
  }
  return [...byName.keys()]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((name) => {
      const doc = ref.docs.get(name) ?? ref.docs.get(ref.synonyms.get(name) ?? '');
      return {
        name,
        synopsis: doc ? firstSentence(doc.description) : '',
        synonyms: doc ? doc.synonyms.filter((x) => x !== name) : [],
        skills: byName.get(name)!,
      };
    });
}
