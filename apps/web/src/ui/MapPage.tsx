import { content } from '../content';
import { statusOf, type SkillStatus } from '../srs';
import { useDerived } from './appContext';
import { layoutDag } from './dag';
import { href } from './router';

const COL_W = 200;
const ROW_H = 60;
const NODE_W = 160;
const NODE_H = 40;
const PAD = 12;
const STATUSES: SkillStatus[] = ['new', 'learning', 'review', 'known', 'retired', 'suspended'];

const clip = (s: string, n = 24) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** The skill prerequisite DAG as SVG. Scrolls horizontally on narrow screens. */
export function MapPage() {
  const { srs } = useDerived();
  const layout = layoutDag(content.skills, content.units.map((u) => u.id));
  const pos = new Map(layout.nodes.map((n) => [n.id, { x: PAD + n.col * COL_W, y: PAD + n.row * ROW_H }]));
  const width = PAD * 2 + Math.max(0, layout.cols - 1) * COL_W + NODE_W;
  const height = PAD * 2 + Math.max(0, layout.rows - 1) * ROW_H + NODE_H;
  return (
    <div className="page" data-testid="map-page">
      <h1>Skill map</h1>
      <p className="muted">Each box is a skill; lines run from a prerequisite to the skill that builds on it. Columns count the longest chain of prerequisites. Scroll sideways if needed.</p>
      <p className="map-legend">
        {STATUSES.map((s) => (
          <span key={s} className={`status-${s}`}>
            ■ {s}
          </span>
        ))}
      </p>
      <div className="map-scroll">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Skill prerequisite graph" data-testid="map-svg">
          {layout.edges.map((e) => {
            const a = pos.get(e.from)!;
            const b = pos.get(e.to)!;
            const x1 = a.x + NODE_W;
            const y1 = a.y + NODE_H / 2;
            const x2 = b.x;
            const y2 = b.y + NODE_H / 2;
            const mx = (x1 + x2) / 2;
            return <path key={`${e.from}>${e.to}`} className="map-edge" d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} data-testid="map-edge" />;
          })}
          {layout.nodes.map((n) => {
            const skill = content.skill(n.id)!;
            const p = pos.get(n.id)!;
            const status = statusOf(srs.get(n.id));
            return (
              <a key={n.id} href={href('library', 'skill', n.id)} className={`map-node status-${status}`} data-testid="map-node" data-skill={n.id} data-status={status}>
                <title>{`${skill.title} (${status})`}</title>
                <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={8} />
                <text x={p.x + 10} y={p.y + NODE_H / 2 + 4}>
                  {clip(skill.title)}
                </text>
              </a>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
