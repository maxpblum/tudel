import { useEffect, useRef } from 'react';
import { content } from '../content';
import { wasPractised } from '../session';
import { useAppend, useDerived } from './appContext';
import { ExerciseView } from './ExerciseView';
import { LessonView } from './LessonView';
import { useGuard } from './useGuard';

export function SessionPage() {
  const { sessions } = useDerived();
  const append = useAppend();
  const s = sessions.active;
  const [busy, guard] = useGuard();
  const completing = useRef<string | null>(null);

  const allDone = !!s && s.currentStep >= s.steps.length;
  useEffect(() => {
    if (s && allDone && completing.current !== s.sessionId) {
      completing.current = s.sessionId;
      void append({ type: 'session_completed', sessionId: s.sessionId });
    }
  }, [s, allDone, append]);

  const latest = sessions.latest;
  if (!s || allDone) {
    const done = latest?.completed || allDone;
    return (
      <div className="page" data-testid={done ? 'session-done' : 'no-session'}>
        {done && latest ? (
          <section className="card hero">
            <h1>{wasPractised(latest) ? 'Session complete' : 'Session ended: all steps skipped'}</h1>
            <p>
              {latest.progress.filter((p) => p.rating !== null).length} exercises rated
              {latest.progress.some((p) => p.skipped) ? `, ${latest.progress.filter((p) => p.skipped).length} skipped` : ''}
              {latest.progress.some((p) => p.dropped) ? `, ${latest.progress.filter((p) => p.dropped).length} dropped (skill retired or marked known)` : ''}. Progress is saved.
            </p>
            <p>
              <a href="#/">Back to Today</a> · <a href="#/library">Library</a>
            </p>
          </section>
        ) : (
          <section className="card hero">
            <p>No session in progress.</p>
            <a href="#/">Go to Today</a>
          </section>
        )}
      </div>
    );
  }

  const idx = s.currentStep;
  const step = s.steps[idx]!;
  const prog = s.progress[idx]!;

  const skip = () => guard(() => append({ type: 'step_skipped', sessionId: s.sessionId, step: idx }));

  let body: React.ReactNode;
  if (step.kind === 'lesson') {
    const lesson = content.lesson(step.lessonId);
    body = lesson ? (
      <LessonStep key={`${s.sessionId}:${idx}`} sessionId={s.sessionId} step={idx} lessonId={lesson.id} skillId={step.skillId} shown={prog.shownAt !== null} refresher={step.reason === 'refresher'} />
    ) : (
      <Missing what={`lesson ${step.lessonId}`} onSkip={skip} />
    );
  } else {
    const v = content.variant(step.variantId);
    body = v ? (
      <ExerciseView key={`${s.sessionId}:${idx}`} variant={v} sessionId={s.sessionId} step={idx} revealed={prog.revealedAt !== null} shownAt={prog.shownAt} onRated={() => window.scrollTo(0, 0)} />
    ) : (
      <Missing what={`exercise ${step.variantId}`} onSkip={skip} />
    );
  }

  return (
    <div className="page session" data-testid="session" data-step={idx}>
      <div className="session-bar">
        <div className="progress" aria-label={`Step ${idx + 1} of ${s.steps.length}`}>
          {s.steps.map((st, i) => (
            <span
              key={i}
              className={`dot ${s.progress[i]!.dropped ? 'dropped' : s.progress[i]!.done ? 'done' : i === idx ? 'current' : ''} ${st.kind}`}
              title={s.progress[i]!.dropped ? 'Dropped (skill retired or marked known)' : st.kind === 'lesson' ? 'Lesson' : st.role === 'review' ? 'Review' : 'New drill'}
            />
          ))}
        </div>
        <span className="muted" data-testid="step-label">
          Step {idx + 1} of {s.steps.length} · {step.kind === 'lesson' ? 'lesson' : step.role === 'review' ? 'review' : 'new skill'}
        </span>
        <button type="button" className="btn btn-small btn-quiet" data-testid="skip-step" disabled={busy} onClick={() => void skip()}>
          Skip step
        </button>
      </div>
      {body}
    </div>
  );
}

function LessonStep({ sessionId, step, lessonId, skillId, shown, refresher }: { sessionId: string; step: number; lessonId: string; skillId: string; shown: boolean; refresher: boolean }) {
  const append = useAppend();
  const [busy, guard] = useGuard();
  const logged = useRef(false);
  useEffect(() => {
    if (shown || logged.current) return;
    logged.current = true;
    void append({ type: 'lesson_viewed', sessionId, step, lessonId, skillId });
  }, [shown, append, sessionId, step, lessonId, skillId]);
  const lesson = content.lesson(lessonId)!;
  return (
    <>
      <LessonView lesson={lesson} refresher={refresher} />
      <div className="continue-row">
        <button
          type="button"
          className="btn btn-primary btn-large"
          data-testid="lesson-continue"
          disabled={busy}
          onClick={() =>
            void guard(
              async () => {
                await append({ type: 'lesson_completed', sessionId, step, lessonId });
                window.scrollTo(0, 0);
              },
              { release: false },
            )
          }
        >
          Continue to the drills
        </button>
      </div>
    </>
  );
}

function Missing({ what, onSkip }: { what: string; onSkip: () => void }) {
  return (
    <section className="card">
      <p>This step refers to {what}, which is not in the current content bundle (content changed since the session was planned).</p>
      <button type="button" className="btn" onClick={onSkip}>
        Skip it
      </button>
    </section>
  );
}
