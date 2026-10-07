import type { Bundle } from '@tudel/content-schema';
import { blocksText, variantText } from './text';

export type ResultKind = 'skill' | 'lesson' | 'variant' | 'term' | 'lexicon' | 'chord';

export interface SearchResult {
  kind: ResultKind;
  id: string;
  title: string;
  snippet: string;
}

interface Doc extends SearchResult {
  /** Original body text (for snippets). */
  body: string;
  /** Lowercased title and body, searched separately so title matches rank first. */
  t: string;
  b: string;
}

export type SearchIndex = Doc[];

const norm = (s: string) => s.toLowerCase();
export const tokenize = (q: string): string[] => norm(q).split(/[^\p{L}\p{N}#.]+/u).filter(Boolean);

/** Index every searchable text field (ids included, so `snd.lowpass` finds itself) of the bundle (pure; build once per bundle). */
export function buildSearchIndex(bundle: Bundle): SearchIndex {
  const docs: SearchIndex = [];
  const add = (kind: ResultKind, id: string, title: string, body: string) =>
    docs.push({ kind, id, title, snippet: '', body, t: norm(title), b: norm(body) });
  for (const s of bundle.skills) add('skill', s.id, s.title, `${s.id} ${s.summary} ${s.vocabulary.join(' ')}`);
  for (const l of bundle.lessons) add('lesson', l.id, l.title, `${l.id} ${l.text || blocksText(l.blocks)}`);
  for (const v of bundle.variants) add('variant', v.id, v.title, `${v.id} ${variantText(v)}`);
  for (const t of bundle.terms) add('term', t.name, t.name, `${t.synopsis} ${t.synonyms.join(' ')}`);
  for (const e of bundle.lexicon) add('lexicon', e.term, e.term, `${e.tendencies.join(' ')} ${e.notes ?? ''}`);
  for (const c of bundle.chords) add('chord', c.symbol, `${c.symbol} (${c.name})`, c.tones.join(' '));
  return docs;
}

function snippetOf(body: string, tokens: string[]): string {
  const lower = norm(body);
  const found = tokens.map((t) => lower.indexOf(t)).filter((i) => i >= 0);
  const at = found.length ? Math.min(...found) : 0;
  const start = Math.max(0, at - 30);
  const text = body.slice(start, start + 120).trim();
  return `${start > 0 ? '…' : ''}${text}${start + 120 < body.length ? '…' : ''}`;
}

/** AND-match every query token (substring, case-insensitive) over title + body; title matches rank first. */
export function search(index: SearchIndex, query: string, limit = 50): SearchResult[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const hits: { d: Doc; rank: number; i: number }[] = [];
  index.forEach((d, i) => {
    const hay = `${d.t} ${d.b}`;
    if (!tokens.every((t) => hay.includes(t))) return;
    const inTitle = tokens.filter((t) => d.t.includes(t)).length;
    hits.push({ d, rank: tokens.every((t) => d.t.includes(t)) ? 0 : inTitle > 0 ? 1 : 2, i });
  });
  hits.sort((a, b) => a.rank - b.rank || a.i - b.i);
  return hits.slice(0, limit).map(({ d }) => ({
    kind: d.kind,
    id: d.id,
    title: d.title,
    snippet: snippetOf(d.body, tokens),
  }));
}
