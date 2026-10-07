import { describe, expect, it } from 'vitest';
import { layoutDag } from './dag';

const S = (id: string, unit: string, ...prereqs: string[]) => ({ id, unit, prereqs });

describe('layoutDag', () => {
  it('puts each skill in the column of its longest prerequisite chain', () => {
    const l = layoutDag([S('a', 'u1'), S('b', 'u1', 'a'), S('c', 'u1', 'a', 'b'), S('d', 'u2')]);
    const col = Object.fromEntries(l.nodes.map((n) => [n.id, n.col]));
    expect(col).toEqual({ a: 0, b: 1, c: 2, d: 0 });
    expect(l.cols).toBe(3);
    expect(l.edges).toEqual([
      { from: 'a', to: 'b' },
      { from: 'a', to: 'c' },
      { from: 'b', to: 'c' },
    ]);
  });

  it('orders rows in a column by unit order, then skill order', () => {
    const l = layoutDag([S('x2', 'u2'), S('x1', 'u1'), S('y1', 'u1')], ['u1', 'u2']);
    const row = Object.fromEntries(l.nodes.map((n) => [n.id, n.row]));
    expect(row).toEqual({ x1: 0, y1: 1, x2: 2 });
    expect(l.rows).toBe(3);
  });

  it('follows curriculum order when no unit order is given, ignores unknown prereqs and survives cycles', () => {
    const l = layoutDag([S('a', 'u', 'ghost'), S('b', 'u', 'c'), S('c', 'u', 'b')]);
    expect(l.nodes.find((n) => n.id === 'a')).toMatchObject({ col: 0, row: 0 });
    expect(l.edges.some((e) => e.from === 'ghost')).toBe(false);
    expect(l.nodes).toHaveLength(3);
    expect(layoutDag([])).toEqual({ nodes: [], edges: [], cols: 0, rows: 0 });
  });
});
