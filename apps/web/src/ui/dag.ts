/** Layout of the skill prerequisite DAG for the `#/map` page. Pure. */
export interface DagSkill {
  id: string;
  unit: string;
  prereqs: readonly string[];
}

export interface DagNode {
  id: string;
  /** Longest prerequisite chain below this skill (0 = no prerequisites). */
  col: number;
  /** Index within the column: grouped by unit order, then skill order. */
  row: number;
}

export interface DagLayout {
  nodes: DagNode[];
  /** `from` is the prerequisite, `to` the skill that builds on it. */
  edges: { from: string; to: string }[];
  cols: number;
  rows: number;
}

/**
 * `skills` are in curriculum order (unit order, then authoring order); `unitOrder` (optional) ranks
 * units explicitly. Prerequisites that are not in `skills` are ignored; cycles cannot hang it.
 */
export function layoutDag(skills: readonly DagSkill[], unitOrder: readonly string[] = []): DagLayout {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const depth = new Map<string, number>();
  const visiting = new Set<string>();
  const depthOf = (id: string): number => {
    const known = depth.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const d = Math.max(-1, ...(byId.get(id)?.prereqs ?? []).filter((p) => byId.has(p)).map(depthOf)) + 1;
    visiting.delete(id);
    depth.set(id, d);
    return d;
  };
  const unitRank = new Map(unitOrder.map((u, i) => [u, i]));
  const rank = (u: string) => unitRank.get(u) ?? unitOrder.length;
  const order = skills.map((s, i) => ({ s, i })).sort((a, b) => rank(a.s.unit) - rank(b.s.unit) || a.i - b.i);
  const next = new Map<number, number>();
  const nodes: DagNode[] = [];
  // Rows depend on sorted order within a column, so visit in (unit rank, skill order).
  for (const { s } of order) {
    const col = depthOf(s.id);
    const row = next.get(col) ?? 0;
    next.set(col, row + 1);
    nodes.push({ id: s.id, col, row });
  }
  const edges = skills.flatMap((s) => s.prereqs.filter((p) => byId.has(p)).map((p) => ({ from: p, to: s.id })));
  return { nodes, edges, cols: Math.max(0, ...nodes.map((n) => n.col + 1)), rows: Math.max(0, ...next.values()) };
}
