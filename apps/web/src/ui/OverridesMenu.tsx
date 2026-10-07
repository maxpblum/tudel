import { content } from '../content';
import { nextNewSkill, unmetPrereqs } from '../session';
import { statusOf } from '../srs';
import type { OverrideAction } from '../store/events';
import { useAppend, useDerived } from './appContext';

const LABELS: Record<OverrideAction, { label: string; hint: string }> = {
  again_soon: { label: 'Show again soon', hint: 'Make this skill due now (or next, if not started yet).' },
  suspend: { label: 'Suspend', hint: 'Pause this skill: never new, due or in practice until restored. It counts as a met prerequisite only if you have already started it.' },
  retire: { label: 'Retire (mastered)', hint: 'Stop reviewing this skill.' },
  mark_known: { label: 'Mark known / skip ahead', hint: 'Skip this skill; it counts as a met prerequisite.' },
  restore: { label: 'Restore', hint: 'Undo retire / mark known / suspend.' },
};

/** Learner overrides for a skill (R-SRS). Each writes an `override` event before the UI updates. */
export function OverridesMenu({ skillId, compact }: { skillId: string; compact?: boolean }) {
  const { srs, focusUnit } = useDerived();
  const append = useAppend();
  const status = statusOf(srs.get(skillId));
  // "Show again soon" on a not-started skill queues it as the next new skill. If its prerequisites
  // are not introduced yet it cannot be offered, so say so instead of silently waiting (ADR 0100).
  const queued = status === 'new' && !!srs.get(skillId)?.prioritized;
  const missing = queued ? unmetPrereqs(content, srs, skillId) : [];
  const title = (id: string) => content.skill(id)?.title ?? id;
  const actions: OverrideAction[] =
    status === 'suspended' ? ['restore'] : status === 'retired' || status === 'known' ? ['restore', 'again_soon'] : ['again_soon', 'suspend', 'retire', 'mark_known'];
  return (
    <>
    <details className={`overrides ${compact ? 'compact' : ''}`} data-testid="overrides">
      <summary>Overrides{status === 'retired' ? ' · retired' : status === 'known' ? ' · marked known' : status === 'suspended' ? ' · suspended' : queued ? ' · queued' : ''}</summary>
      <div className="overrides-body">
        {actions.map((a) => (
          <button key={a} type="button" className="btn btn-small" title={LABELS[a].hint} data-testid={`override-${a}`} onClick={() => void append({ type: 'override', skillId, action: a })}>
            {LABELS[a].label}
          </button>
        ))}
      </div>
    </details>
    {queued && (
      <p className="muted small override-note" data-testid="override-note">
        {missing.length === 0
          ? nextNewSkill(content, srs, focusUnit) === skillId
            ? 'Queued: this is the next new skill in Today.'
            : 'Queued: Today will offer it ahead of curriculum order, after other queued skills.'
          : `Queued: this will come up as a new skill once its prerequisites are met (${missing.map(title).join(', ')}). You can still practise it from the library now.`}
      </p>
    )}
    </>
  );
}
