/**
 * Gate results. Every gate records one entry per check it performs, keyed by the item it
 * checked (a variant id, lesson id, skill id, or a file-level item such as `skills.yaml`).
 * A gate passes only if it has no failing entries.
 */
export type GateId = 'L0' | 'L1' | 'L2' | 'L2b' | 'L3' | 'L4' | 'L5' | 'L7' | 'L8' | 'BUILD';

export const GATE_TITLES: Record<GateId, string> = {
  L0: 'Schema and skill graph',
  L1: 'Evaluate',
  L2: 'Vocabulary',
  L2b: 'Sound names',
  L3: 'Snapshots',
  L4: 'Notation agreement',
  L5: 'Solution equivalence',
  L7: 'House style',
  L8: 'Prose claims',
  BUILD: 'Compile bundle',
};

export interface GateEntry {
  item: string;
  ok: boolean;
  /** What was checked (pass) or why it failed (fail). */
  message: string;
  /** Location inside the item, e.g. `solutions[1]` or `lesson.md:12`. */
  where?: string;
}

export class GateResult {
  readonly entries: GateEntry[] = [];
  constructor(readonly gate: GateId) {}

  pass(item: string, message: string, where?: string) {
    this.entries.push({ item, ok: true, message, where });
  }
  fail(item: string, message: string, where?: string) {
    this.entries.push({ item, ok: false, message, where });
  }
  get failures() {
    return this.entries.filter((e) => !e.ok);
  }
  get ok() {
    return this.failures.length === 0;
  }
  itemFailed(item: string) {
    return this.entries.some((e) => e.item === item && !e.ok);
  }
}
