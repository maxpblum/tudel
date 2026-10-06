import { useState } from 'react';
import { content } from '../content';
import { describeDue, statusOf } from '../srs';
import { useDerived, useNow } from './appContext';
import { ExerciseView } from './ExerciseView';
import { LessonView } from './LessonView';
import { OverridesMenu } from './OverridesMenu';
import { href } from './router';

export function LibraryPage() {
  const { srs } = useDerived();
  const now = useNow();
  return (
    <div className="page library" data-testid="library">
      <h1>Library</h1>
      {content.units.map((u) => {
        const skills = content.skills.filter((s) => s.unit === u.id);
        return (
          <section key={u.id} className="card unit" data-testid="unit">
            <h2>{u.title}</h2>
            <p className="muted">{u.summary}</p>
            <ul className="skill-list">
              {skills.map((s) => (
                <li key={s.id}>
                  <a href={href('library', 'skill', s.id)} data-testid="skill-link">
                    {s.title}
                  </a>{' '}
                  <span className={`status status-${statusOf(srs.get(s.id))}`}>{describeDue(srs.get(s.id), now)}</span>
                  <div className="muted small">{s.summary}</div>
                </li>
              ))}
              {skills.length === 0 && <li className="muted">No skills yet.</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function SkillPage({ skillId }: { skillId: string }) {
  const { srs, history } = useDerived();
  const now = useNow();
  const skill = content.skill(skillId);
  if (!skill) return <NotFound what="skill" />;
  const lesson = content.lessonForSkill(skillId);
  const variants = content.variantsForSkill(skillId);
  const st = srs.get(skillId);
  return (
    <div className="page" data-testid="skill-page">
      <nav className="crumbs">
        <a href="#/library">Library</a> › {content.units.find((u) => u.id === skill.unit)?.title}
      </nav>
      <h1>{skill.title}</h1>
      <p>{skill.summary}</p>
      <p className="muted">
        Status: <span data-testid="skill-status">{describeDue(st, now)}</span>
        {st?.ratings.length ? ` · ${st.ratings.length} rating${st.ratings.length === 1 ? '' : 's'}` : ''}
        {skill.prereqs.length > 0 && (
          <>
            {' '}
            · builds on{' '}
            {skill.prereqs.map((p, i) => (
              <span key={p}>
                {i > 0 && ', '}
                <a href={href('library', 'skill', p)}>{content.skill(p)?.title ?? p}</a>
              </span>
            ))}
          </>
        )}
      </p>
      <p className="vocab">
        Vocabulary:{' '}
        {skill.vocabulary.map((w) => (
          <code key={w}>{w}</code>
        ))}
      </p>
      <aside className="idiom">
        <span className="idiom-label">Zen of Strudel</span> {skill.idiom_note}
      </aside>
      <OverridesMenu skillId={skillId} />
      <section className="card">
        <h3>Lesson</h3>
        {lesson ? (
          <a href={href('lesson', lesson.id)} data-testid="lesson-link">
            {lesson.title}
          </a>
        ) : (
          <span className="muted">No lesson.</span>
        )}
      </section>
      <section className="card">
        <h3>Exercises</h3>
        <ul className="variant-list">
          {variants.map((v) => (
            <li key={v.id}>
              <a href={href('variant', v.id)} data-testid="variant-link">
                {v.title}
              </a>{' '}
              <span className="muted small">
                {v.type} · difficulty {v.difficulty}
                {v.skills[0] !== skillId ? ` · primary skill: ${content.skill(v.skills[0]!)?.title}` : ''}
                {history.has(v.id) ? ` · last seen ${new Date(history.get(v.id)!).toLocaleDateString()}` : ' · not seen yet'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function LessonPage({ lessonId }: { lessonId: string }) {
  const lesson = content.lesson(lessonId);
  if (!lesson) return <NotFound what="lesson" />;
  return (
    <div className="page">
      <nav className="crumbs">
        <a href="#/library">Library</a> › <a href={href('library', 'skill', lesson.skill)}>{content.skill(lesson.skill)?.title ?? lesson.skill}</a>
      </nav>
      <LessonView lesson={lesson} />
    </div>
  );
}

export function VariantPage({ variantId }: { variantId: string }) {
  const v = content.variant(variantId);
  // Each "view" allows one rating; "Practise again" starts a fresh view (new variant_shown).
  const [view, setView] = useState(0);
  if (!v) return <NotFound what="exercise" />;
  return (
    <div className="page">
      <nav className="crumbs">
        <a href="#/library">Library</a> › <a href={href('library', 'skill', v.skills[0]!)}>{content.skill(v.skills[0]!)?.title}</a>
      </nav>
      <p className="muted small">Practising outside a session. Your rating still updates the skill’s schedule.</p>
      <ExerciseView
        key={`${v.id}:${view}`}
        variant={v}
        sessionId={null}
        step={null}
        revealed={false}
        shownAt={null}
        onPractiseAgain={() => {
          setView((n) => n + 1);
          window.scrollTo(0, 0);
        }}
      />
    </div>
  );
}

function NotFound({ what }: { what: string }) {
  return (
    <div className="page">
      <p>That {what} does not exist in the current content.</p>
      <a href="#/library">Library</a>
    </div>
  );
}
