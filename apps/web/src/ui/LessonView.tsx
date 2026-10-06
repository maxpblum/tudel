import type { BundleLesson } from '@tudel/content-schema';
import { content } from '../content';
import { Blocks } from './Blocks';

export function LessonView({ lesson, refresher }: { lesson: BundleLesson; refresher?: boolean }) {
  const skill = content.skill(lesson.skill);
  return (
    <article className="lesson" data-testid="lesson" data-lesson={lesson.id}>
      <header>
        <div className="eyebrow">{refresher ? 'Refresher lesson' : 'Lesson'} · {skill?.title ?? lesson.skill}</div>
        <h2>{lesson.title}</h2>
      </header>
      <Blocks blocks={lesson.blocks} idPrefix={`lesson:${lesson.id}`} />
      {skill?.idiom_note && (
        <aside className="idiom" data-testid="idiom">
          <span className="idiom-label">Zen of Strudel</span> {skill.idiom_note}
        </aside>
      )}
    </article>
  );
}
