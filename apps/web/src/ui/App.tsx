import { isFixtureContent } from '../content';
import { DataPage } from './DataPage';
import { LessonPage, LibraryPage, SkillPage, VariantPage } from './LibraryPages';
import { SessionPage } from './SessionPage';
import { SmokePage } from './SmokePage';
import { TodayPage } from './TodayPage';
import { useRoute } from './router';
import { useOnline } from './useEngine';

export function App() {
  const route = useRoute();
  const online = useOnline();
  const [head, a, b] = route;
  let page: React.ReactNode;
  if (!head || head === 'today') page = <TodayPage />;
  else if (head === 'session') page = <SessionPage />;
  else if (head === 'library' && a === 'skill' && b) page = <SkillPage skillId={b} />;
  else if (head === 'library') page = <LibraryPage />;
  else if (head === 'lesson' && a) page = <LessonPage lessonId={a} />;
  else if (head === 'variant' && a) page = <VariantPage variantId={a} />;
  else if (head === 'data') page = <DataPage />;
  else if (head === '__smoke') page = <SmokePage />;
  else page = <p className="page">Not found. <a href="#/">Today</a></p>;

  const nav = (to: string, label: string, match: string | undefined) => (
    <a href={to} className={head === match ? 'active' : ''}>
      {label}
    </a>
  );

  return (
    <div className="app">
      {isFixtureContent && (
        <div className="banner banner-fixture" data-testid="fixture-banner">
          FIXTURE CONTENT: the verified bundle (src/content/bundle.json) was not found; showing test fixtures. Run <code>pnpm verify</code>.
        </div>
      )}
      {!online && (
        <div className="banner banner-offline" data-testid="offline-banner">
          You are offline. Synth sounds still play; snippets that use sample banks (drums, piano, …) need the Strudel CDN.
        </div>
      )}
      <header className="topbar">
        <a href="#/" className="brand">
          <img src="./avatar.jpeg" alt="" className="brand-avatar" />
          tudel
        </a>
        <nav>
          {nav('#/', 'Today', undefined)}
          {nav('#/library', 'Library', 'library')}
          {nav('#/data', 'Data', 'data')}
          <a href="https://github.com/maxpblum/tudel">Source</a>
        </nav>
      </header>
      <main>{page}</main>
    </div>
  );
}
