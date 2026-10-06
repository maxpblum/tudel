import { useMemo } from 'react';
import { content } from '../content';
import { buildSession, wasPractised } from '../session';
import { newId } from '../store/events';
import { describeDue } from '../srs';
import { useApp, useAppend, useDerived, useNow } from './appContext';
import { navigate } from './router';
import { useGuard } from './useGuard';

export function TodayPage() {
  const { srs, sessions, history, minutes } = useDerived();
  const now = useNow();
  const append = useAppend();
  const { clock } = useApp();
  const [busy, guard] = useGuard();
  const plan = useMemo(() => buildSession({ content, srs, history, now, minutes }), [srs, history, now, minutes]);
  const active = sessions.active;
  const completedToday = sessions.all.filter((s) => s.completed && new Date(s.completedAt!).toDateString() === now.toDateString());
  // Only a session where something was actually done counts as "finished" (not an all-skipped one).
  const finishedToday = completedToday.some(wasPractised);
  const endedSkippedToday = !finishedToday && completedToday.length > 0;

  const start = () =>
    guard(
      async () => {
        const sessionId = newId(clock());
        await append({ type: 'session_started', sessionId, minutes, steps: plan.steps });
        navigate('session');
      },
      { release: false },
    );

  const newSkill = plan.newSkillId ? content.skill(plan.newSkillId) : null;

  return (
    <div className="page today" data-testid="today">
      <h1>Today</h1>
      {active && active.currentStep < active.steps.length ? (
        <section className="card hero">
          <p>
            You have a session in progress: step {active.currentStep + 1} of {active.steps.length}.
          </p>
          <div className="row">
            <button type="button" className="btn btn-primary" data-testid="continue-session" onClick={() => navigate('session')}>
              Continue session
            </button>
            <button type="button" className="btn" data-testid="restart-session" disabled={busy || plan.steps.length === 0} onClick={() => void start()}>
              Start a fresh session instead
            </button>
          </div>
        </section>
      ) : plan.steps.length === 0 ? (
        <section className="card hero" data-testid="caught-up">
          <p>All caught up: nothing is due and there is no new skill whose prerequisites are met.</p>
          <p>
            <a href="#/library">Browse the library</a> to revisit anything.
          </p>
        </section>
      ) : (
        <section className="card hero">
          {finishedToday && <p className="muted" data-testid="finished-today">You finished a session today. Another one is ready if you want it.</p>}
          {endedSkippedToday && <p className="muted" data-testid="ended-skipped-today">Your last session today ended with all steps skipped. This one is ready when you are.</p>}
          <ul className="plan-summary" data-testid="plan-summary">
            <li>
              <strong>{plan.reviewSkillIds.length}</strong> review{plan.reviewSkillIds.length === 1 ? '' : 's'} due
              {plan.deferredReviews > 0 && <span className="muted"> (+{plan.deferredReviews} more held for next time)</span>}
            </li>
            {plan.practiceSkillIds.length > 0 && (
              <li data-testid="plan-practice">
                <strong>{plan.practiceSkillIds.length}</strong> extra practice drill{plan.practiceSkillIds.length === 1 ? '' : 's'} on skills you already know
              </li>
            )}
            <li>
              {newSkill ? (
                <>
                  New skill: <strong>{newSkill.title}</strong> (lesson + {plan.steps.filter((s) => s.kind === 'variant' && s.role === 'new').length} drills)
                </>
              ) : (
                <span className="muted">No new skill today</span>
              )}
            </li>
            <li className="muted" data-testid="plan-minutes">
              About {plan.estimatedMinutes} min
              {plan.estimatedMinutes < minutes - 2 && ` (shorter than your ${minutes} min: that is all the material available right now)`}
            </li>
          </ul>
          <button type="button" className="btn btn-primary btn-large" data-testid="start-session" disabled={busy} onClick={() => void start()}>
            Start today’s session
          </button>
        </section>
      )}

      <section className="card">
        <label className="row">
          Session length{' '}
          <select
            value={minutes}
            data-testid="minutes"
            onChange={(e) => void append({ type: 'settings_changed', minutes: Number(e.target.value) })}
          >
            {[15, 20, 25, 30].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card">
        <h3>Skills</h3>
        <table className="skills-table">
          <tbody>
            {content.skills.map((s) => (
              <tr key={s.id}>
                <td>
                  <a href={`#/library/skill/${encodeURIComponent(s.id)}`}>{s.title}</a>
                </td>
                <td className="muted">{content.units.find((u) => u.id === s.unit)?.title}</td>
                <td className="muted" data-testid={`due-${s.id}`}>{describeDue(srs.get(s.id), now)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
