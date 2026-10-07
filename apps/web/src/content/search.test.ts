import { describe, expect, it } from 'vitest';
import type { LexiconEntry } from '@tudel/content-schema';
import { bundle } from '.';
import { lexiconAliases, lexiconLinks, mentionsAny } from './lexiconLinks';
import { buildSearchIndex, search } from './search';
import { stripHtml } from './text';

describe('search', () => {
  const index = buildSearchIndex(bundle);

  it('returns nothing for an empty query and AND-matches tokens case-insensitively', () => {
    expect(search(index, '   ')).toEqual([]);
    expect(search(index, 'LOWPASS')[0]).toMatchObject({ kind: 'skill', id: 'fx.lowpass' });
    expect(search(index, 'lowpass zzzzqqq')).toEqual([]);
  });

  it('ranks title matches first and gives typed results with snippets', () => {
    const r = search(index, 'envelope');
    expect(r.length).toBeGreaterThan(1);
    expect(r[0]!.title.toLowerCase()).toContain('envelope');
    for (const x of r) expect(['skill', 'lesson', 'variant', 'term', 'lexicon', 'chord']).toContain(x.kind);
    expect(r.every((x) => typeof x.snippet === 'string')).toBe(true);
  });

  it('finds glossary terms, lexicon terms and chords', () => {
    expect(search(index, 'attack').some((x) => x.kind === 'term' && x.id === 'attack')).toBe(true);
    expect(search(index, 'warm').some((x) => x.kind === 'lexicon')).toBe(true);
    expect(search(index, 'cmaj7').some((x) => x.kind === 'chord')).toBe(true);
    expect(search(index, 'major seventh').some((x) => x.kind === 'chord')).toBe(true);
  });

  it('respects the limit', () => {
    expect(search(index, 'a', 2).length).toBeLessThanOrEqual(2);
  });

  it('falls back to lesson blocks when a lesson has no plain text', () => {
    const noText = buildSearchIndex({ ...bundle, lessons: bundle.lessons.map((l) => ({ ...l, text: '' })) });
    expect(search(noText, 'organ').some((x) => x.kind === 'lesson' && x.id === 'fx.waveforms.lesson')).toBe(true);
  });
});

describe('lexiconLinks', () => {
  it('matches whole words case-insensitively', () => {
    expect(mentionsAny('A Warm pad', ['warm'])).toBe(true);
    expect(mentionsAny('warmth', ['warm'])).toBe(false);
    expect(mentionsAny('x', [])).toBe(false);
  });

  it('reads synonyms from notes', () => {
    const base: LexiconEntry = { term: 'dark', tendencies: ['x'], status: 'subjective', confidence: 'low', sources: [] };
    expect(lexiconAliases({ ...base, notes: 'Also "dull" and "muffled". More.' })).toEqual(['dark', 'dull', 'muffled']);
    expect(lexiconAliases({ ...base, notes: 'Synonyms: dim, murky. Other.' })).toEqual(['dark', 'dim', 'murky']);
    expect(lexiconAliases(base)).toEqual(['dark']);
  });

  it('links a term to skills whose text mentions it', () => {
    const lessons = bundle.lessons.map((l, i) => (i === 0 ? { ...l, text: `${l.text} A WARM tone.` } : l));
    const links = lexiconLinks({ ...bundle, lessons });
    expect(links.get('warm')).toContain(bundle.lessons[0]!.skill);
    const none = lexiconLinks({ ...bundle, lessons: lessons.map((l) => ({ ...l, text: 'nothing' })), variants: [] });
    expect(none.get('warm')).toEqual([]);
  });
});

describe('stripHtml', () => {
  it('drops tags and decodes entities', () => {
    expect(stripHtml('<p>a &lt;b&gt; &amp; <code>c</code></p>')).toBe('a <b> & c');
  });
});
