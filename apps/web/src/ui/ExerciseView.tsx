import { useEffect, useRef, useState } from 'react';
import type { BundleVariant } from '@tutor/content-schema';
import { content } from '../content';
import { engine } from '../engine';
import { AbcNotation } from '../notation/Abc';
import { fluencyElapsed } from '../session';
import type { RatingValue } from '../store/events';
import { useApp, useAppend } from './appContext';
import { Blocks } from './Blocks';
import { CodeBlock, LivePianoRoll, PlayControls, StaticPianoRoll } from './components';
import { OverridesMenu } from './OverridesMenu';
import { href } from './router';
import { useGuard } from './useGuard';

export const EAR_TYPES = new Set(['ear-dictation', 'match-by-ear']);
/** Types whose reference audio is part of the prompt (playable before reveal). */
const AUDIO_PROMPT_TYPES = new Set(['ear-dictation', 'match-by-ear', 'read-the-code']);

const RATING_LABEL: Record<RatingValue, string> = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };

const RATINGS: { value: RatingValue; label: string; hint: string }[] = [
  { value: 1, label: 'Again', hint: 'Could not do it' },
  { value: 2, label: 'Hard', hint: 'Got there, with effort' },
  { value: 3, label: 'Good', hint: 'Correct with some thought' },
  { value: 4, label: 'Easy', hint: 'Fluent' },
];

const TYPE_LABEL: Record<string, string> = {
  dictation: 'Dictation', 'ear-dictation': 'Ear dictation', 'spec-to-code': 'Spec to code', 'describe-to-code': 'Describe to code',
  'match-by-ear': 'Match by ear', transform: 'Transform', sweep: 'Sweep', recall: 'Recall', 'read-the-code': 'Read the code',
  refactor: 'Refactor', creative: 'Creative', arrange: 'Arrange', project: 'Project',
};

export interface ExerciseViewProps {
  variant: BundleVariant;
  sessionId: string | null;
  step: number | null;
  /** From replay: already revealed (resume). */
  revealed: boolean;
  /** From replay: when the variant was first shown in this step (null = log it now). */
  shownAt: number | null;
  /** Called after the rating is persisted. */
  onRated?: (r: RatingValue) => void;
  /** Out of session: after the one rating per view, offer "Practise again" (starts a new view). */
  onPractiseAgain?: () => void;
}

export function ExerciseView({ variant: v, sessionId, step, revealed: revealedFromLog, shownAt, onRated, onPractiseAgain }: ExerciseViewProps) {
  const append = useAppend();
  const { clock } = useApp();
  const [localRevealed, setLocalRevealed] = useState(false);
  const [rated, setRated] = useState<RatingValue | null>(null);
  const [busy, guard] = useGuard();
  // Fluency clock: starts when this view is mounted in this page lifetime (see fluencyElapsed).
  const mountedAt = useRef<number | null>(null);
  if (mountedAt.current === null) mountedAt.current = clock();
  const revealed = revealedFromLog || localRevealed;
  const skillId = v.skills[0]!;
  const skill = content.skill(skillId);
  const lesson = content.lessonForSkill(skillId);
  const ear = EAR_TYPES.has(v.type);
  const canonical = v.solutions[0]!;

  const loggedShow = useRef(false);
  useEffect(() => {
    if (shownAt !== null || loggedShow.current) return;
    loggedShow.current = true;
    void append({ type: 'variant_shown', sessionId, step, variantId: v.id, skillId });
    // log once per mount of this variant/step
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.id, sessionId, step]);

  useEffect(() => () => engine.stop(), []);

  const reveal = () =>
    guard(async () => {
      const elapsed = fluencyElapsed(shownAt, mountedAt.current!, clock());
      await append({ type: 'revealed', sessionId, step, variantId: v.id, elapsedMs: elapsed });
      setLocalRevealed(true);
    });

  const rate = (r: RatingValue) =>
    guard(async () => {
      engine.stop();
      await append({ type: 'rated', sessionId, step, variantId: v.id, skillId, rating: r });
      setRated(r);
      onRated?.(r);
    });

  return (
    <article className="exercise" data-testid="exercise" data-variant={v.id}>
      <header className="exercise-head">
        <div className="eyebrow">
          {TYPE_LABEL[v.type] ?? v.type} · {skill?.title ?? skillId} · difficulty {v.difficulty}
        </div>
        <h2>{v.title}</h2>
      </header>

      <section className="prompt">
        <Blocks blocks={v.prompt} idPrefix={`${v.id}:prompt`} cycles={v.cycles} />
      </section>

      {v.abc && <AbcNotation abc={v.abc} />}

      {v.starter && <CodeBlock snippet={v.starter} caption="Starter code" />}

      {!revealed && AUDIO_PROMPT_TYPES.has(v.type) && (
        <section className="target-audio">
          <div className="section-label">{ear ? 'Target sound' : 'Play it to check your prediction'}</div>
          <PlayControls code={canonical.snippet.code} ownerId={`${v.id}:target`} label="Play target" cycles={v.cycles} needsNetwork={canonical.snippet.needsNetwork} slowable={ear} />
        </section>
      )}

      {!revealed && !v.hideReferenceCodeUntilReveal && <CodeBlock snippet={canonical.snippet} caption="Code" />}

      {!revealed && (
        <div className="reveal-row">
          <p className="muted">Write it in your own Strudel setup, then reveal the reference and compare by ear and by eye.</p>
          <button type="button" className="btn btn-primary" data-testid="reveal" disabled={busy} onClick={() => void reveal()}>
            Reveal reference
          </button>
        </div>
      )}

      {revealed && (
        <section className="reveal" data-testid="revealed">
          <div className="section-label">Reference solution</div>
          <CodeBlock snippet={canonical.snippet} caption={canonical.note} />
          <PlayControls code={canonical.snippet.code} ownerId={`${v.id}:reference`} label="Play reference" cycles={v.cycles} needsNetwork={canonical.snippet.needsNetwork} slowable={ear} />
          <div className="roll-caption">Live piano roll (while playing)</div>
          <LivePianoRoll />
          {v.roll.length > 0 && <div className="roll-caption">Reference over {v.cycles} cycle{v.cycles === 1 ? '' : 's'} (bars)</div>}
          <StaticPianoRoll roll={v.roll} cycles={v.cycles} />

          {v.solutions.length > 1 && (
            <div className="alternatives">
              <div className="section-label">Also accepted</div>
              {v.solutions.slice(1).map((s, i) => (
                <div key={i} className="alternative">
                  <CodeBlock snippet={s.snippet} caption={s.note} />
                  <PlayControls code={s.snippet.code} ownerId={`${v.id}:alt${i}`} cycles={v.cycles} needsNetwork={s.snippet.needsNetwork} />
                </div>
              ))}
            </div>
          )}

          {v.listenFor.length > 0 && (
            <Checklist title="Listen for" items={v.listenFor} />
          )}
          {v.rubric && v.rubric.length > 0 && <Checklist title="Rubric: check your version against" items={v.rubric} />}

          <div className="rating" data-testid="rating">
            <div className="section-label">How did it go?</div>
            {rated !== null && sessionId === null ? (
              // Out of session: one rating per view. A new view is needed to rate again.
              <div className="rated-confirm">
                <p data-testid="rated-note">
                  Rated: <strong>{RATING_LABEL[rated]}</strong>. This updates the skill’s schedule.
                </p>
                {onPractiseAgain && (
                  <button type="button" className="btn" data-testid="practise-again" onClick={onPractiseAgain}>
                    Practise again
                  </button>
                )}
              </div>
            ) : (
              <div className="rating-buttons">
                {RATINGS.map((r) => (
                  <button key={r.value} type="button" className={`btn btn-rate rate-${r.value} ${rated === r.value ? 'selected' : ''}`} disabled={busy || rated !== null} data-testid={`rate-${r.label.toLowerCase()}`} onClick={() => void rate(r.value)} title={r.hint}>
                    {r.label}
                    <small>{r.hint}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="exercise-foot">
        {lesson && (
          <details className="lesson-peek">
            <summary>Reopen lesson: {lesson.title}</summary>
            <Blocks blocks={lesson.blocks} idPrefix={`${v.id}:lesson`} />
          </details>
        )}
        <div className="foot-row">
          <OverridesMenu skillId={skillId} compact />
          <a href={href('library', 'skill', skillId)} className="muted-link">
            Skill in library
          </a>
        </div>
      </footer>
    </article>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="checklist" data-testid="checklist">
      <div className="section-label">{title}</div>
      <ul>
        {items.map((it, i) => (
          <li key={i}>
            <label>
              <input type="checkbox" /> {it}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
