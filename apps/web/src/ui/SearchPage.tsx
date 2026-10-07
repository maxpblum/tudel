import { useMemo, useState } from 'react';
import { bundle } from '../content';
import { buildSearchIndex, search, type SearchResult } from '../content/search';
import { href, navigate } from './router';

let cached: ReturnType<typeof buildSearchIndex> | undefined;
const searchIndex = () => (cached ??= buildSearchIndex(bundle));

export function resultHref(r: SearchResult): string {
  switch (r.kind) {
    case 'skill':
      return href('library', 'skill', r.id);
    case 'lesson':
      return href('lesson', r.id);
    case 'variant':
      return href('variant', r.id);
    case 'term':
      return href('glossary', 'terms', r.id);
    case 'lexicon':
      return href('glossary', 'lexicon');
    case 'chord':
      return href('glossary', 'chords');
  }
}

/** A search box that goes to `#/search/:q`. */
export function SearchBox({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  return (
    <form
      className="search-form"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate('search', q.trim());
      }}
    >
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills, lessons, exercises, glossary…" aria-label="Search" data-testid="search-input" />
      <button type="submit" className="btn" data-testid="search-submit">
        Search
      </button>
    </form>
  );
}

export function SearchPage({ query }: { query: string }) {
  const results = useMemo(() => search(searchIndex(), query), [query]);
  return (
    <div className="page" data-testid="search-page">
      <h1>Search</h1>
      <SearchBox key={query} initial={query} />
      {query && (
        <p className="muted" data-testid="search-count">
          {results.length} result{results.length === 1 ? '' : 's'} for “{query}”
        </p>
      )}
      <ul className="variant-list">
        {results.map((r) => (
          <li key={`${r.kind}:${r.id}`}>
            <span className="result-kind">{r.kind}</span>
            <a href={resultHref(r)} data-testid="search-result" data-kind={r.kind} data-id={r.id}>
              {r.title}
            </a>
            {r.snippet && <div className="muted small">{r.snippet}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
