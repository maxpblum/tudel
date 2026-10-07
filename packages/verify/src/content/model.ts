/** Validated content (the output of gate L0) that the other gates and the compiler consume. */
import type { ChordSymbolEntry, LexiconEntry, Skill, Unit, Variant } from '@tudel/content-schema';
import type { Segment } from './directives.js';

export interface ValidLesson {
  file: string;
  unit: string;
  id: string;
  title: string;
  skill: string;
  segments: Segment[];
}

export interface ValidVariant {
  file: string;
  unit: string;
  v: Variant;
  promptSegments: Segment[];
}

export interface ValidContent {
  root: string;
  files: string[];
  units: Unit[];
  skills: Skill[];
  lessons: ValidLesson[];
  variants: ValidVariant[];
  lexicon: LexiconEntry[];
  /** content/glossary/chord-symbols.yaml entries, if the file exists and is valid. */
  chords: ChordSymbolEntry[];
}

/** Lesson snippets are queried over this many cycles (variants use `verify.cycles`). */
export const LESSON_CYCLES = 4;
