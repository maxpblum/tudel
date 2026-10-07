import { useMemo } from 'react';
import { bundle, content } from '../content';
import { lexiconLinks } from '../content/lexiconLinks';
import { href } from './router';

function Tabs({ active }: { active: 'terms' | 'lexicon' | 'chords' }) {
  return (
    <nav className="glossary-tabs" aria-label="Glossary">
      {(['terms', 'lexicon', 'chords'] as const).map((t) => (
        <a key={t} href={href('glossary', t)} className={t === active ? 'active' : ''} data-testid={`glossary-tab-${t}`}>
          {t === 'terms' ? 'Strudel terms' : t === 'lexicon' ? 'Timbre lexicon' : 'Chord symbols'}
        </a>
      ))}
    </nav>
  );
}

function SkillLinks({ ids }: { ids: readonly string[] }) {
  if (!ids.length) return <span className="muted small">Not used in a skill yet.</span>;
  return (
    <span className="small">
      Skills:{' '}
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ', '}
          <a href={href('library', 'skill', id)} data-testid="glossary-skill-link">
            {content.skill(id)?.title ?? id}
          </a>
        </span>
      ))}
    </span>
  );
}

export function TermsPage({ name }: { name?: string }) {
  const terms = content.terms();
  const shown = name ? terms.filter((t) => t.name === name) : terms;
  return (
    <div className="page" data-testid="glossary-terms">
      <h1>Glossary</h1>
      <Tabs active="terms" />
      {name && (
        <p>
          <a href={href('glossary', 'terms')}>All terms</a>
        </p>
      )}
      {shown.length === 0 && <p className="muted">{name ? `No glossary entry for “${name}”.` : 'No terms in this bundle.'}</p>}
      {shown.map((t) => (
        <div key={t.name} className="glossary-entry" data-testid="glossary-entry">
          <code>{t.name}</code>
          {t.synonyms.length > 0 && <span className="muted small"> · also: {t.synonyms.map((s) => <code key={s}>{s}</code>)}</span>}
          <div>{t.synopsis}</div>
          <SkillLinks ids={t.skills} />
        </div>
      ))}
    </div>
  );
}

export function LexiconPage() {
  const links = useMemo(() => lexiconLinks(bundle), []);
  const entries = content.lexicon();
  return (
    <div className="page" data-testid="glossary-lexicon">
      <h1>Glossary</h1>
      <Tabs active="lexicon" />
      <p className="muted">Words for timbre and what they tend to mean in Strudel parameters. Status and confidence say how well the sources agree.</p>
      {entries.length === 0 && <p className="muted">No lexicon entries in this bundle.</p>}
      {entries.map((e) => (
        <div key={e.term} className="glossary-entry" data-testid="glossary-entry">
          <strong>{e.term}</strong> <span className="muted small">{e.status} · confidence {e.confidence}</span>
          <ul>
            {e.tendencies.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="small">
            Sources:{' '}
            {e.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && ', '}
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              </span>
            ))}
          </div>
          <SkillLinks ids={links.get(e.term) ?? []} />
        </div>
      ))}
    </div>
  );
}

export function ChordsPage() {
  const chords = content.chords();
  return (
    <div className="page" data-testid="glossary-chords">
      <h1>Glossary</h1>
      <Tabs active="chords" />
      {chords.length === 0 && <p className="muted">No chord symbols in this bundle.</p>}
      {chords.map((c) => (
        <div key={c.symbol} className="glossary-entry" data-testid="glossary-entry">
          <code>{c.symbol}</code> <span>{c.name}</span>
          <div className="small">Tones: {c.tones.join(' ')}</div>
          <SkillLinks ids={c.skills} />
        </div>
      ))}
    </div>
  );
}
