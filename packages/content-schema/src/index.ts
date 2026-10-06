/**
 * Content schemas shared by the verifier (Node) and the app (browser).
 *
 * Two layers:
 *  1. Source schemas — what humans/LLMs write under content/ (YAML + Markdown frontmatter).
 *  2. Bundle schema — the verified, compiled JSON the app reads (apps/web/src/content/bundle.json).
 *
 * The app must never read content/ directly; only the bundle.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Dotted lowercase ids, e.g. `snd.waveforms`, `snd.waveforms.v01`, `u3a`. */
export const Id = z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, 'ids are lowercase, dot/dash separated');

export const ExerciseType = z.enum([
  'dictation',
  'ear-dictation',
  'spec-to-code',
  'describe-to-code',
  'match-by-ear',
  'transform',
  'sweep',
  'recall',
  'read-the-code',
  'refactor',
  'creative',
  'arrange',
  'project',
]);
export type ExerciseType = z.infer<typeof ExerciseType>;

/**
 * Provenance entry. Exactly one key per entry, e.g.
 *   {strudel-doc: lpf} | {strudel-src: "packages/superdough/synth.mjs#L42"} |
 *   {lexicon: warm} | {url: "https://…"} | {workshop: "first-sounds"}
 */
export const Source = z
  .partialRecord(z.enum(['strudel-doc', 'strudel-src', 'lexicon', 'url', 'workshop', 'breathofstrudle']), z.string())
  .refine((o) => Object.keys(o).length === 1, 'each source entry has exactly one key');
export type Source = z.infer<typeof Source>;

// ---------------------------------------------------------------------------
// Source layer: content/skills.yaml
// ---------------------------------------------------------------------------

export const Unit = z.object({
  id: Id,
  title: z.string(),
  milestone: z.enum(['M1', 'M2', 'M3']),
  summary: z.string(),
  /** Display order in the library. */
  order: z.number().int(),
});
export type Unit = z.infer<typeof Unit>;

export const Skill = z.object({
  id: Id,
  unit: Id,
  title: z.string(),
  prereqs: z.array(Id).default([]),
  summary: z.string(),
  /** Strudel functions this skill teaches; each must exist in doc.json (gate L2). */
  vocabulary: z.array(z.string()).min(1),
  /** Id of the lesson (frontmatter `id` of a Markdown file under content/units/<unit>/lessons/). */
  lesson: Id,
  /** One-line "zen of Strudel" takeaway shown with the lesson. */
  idiom_note: z.string(),
});
export type Skill = z.infer<typeof Skill>;

export const SkillsFile = z.object({
  units: z.array(Unit).min(1),
  skills: z.array(Skill).min(1),
});
export type SkillsFile = z.infer<typeof SkillsFile>;

// ---------------------------------------------------------------------------
// Source layer: lesson frontmatter (Markdown body parsed separately)
// ---------------------------------------------------------------------------

export const LessonFrontmatter = z.object({
  id: Id,
  title: z.string(),
  skill: Id,
});
export type LessonFrontmatter = z.infer<typeof LessonFrontmatter>;

// ---------------------------------------------------------------------------
// Source layer: exercise variant YAML (content/units/<unit>/exercises/*.yaml, one variant per file)
// ---------------------------------------------------------------------------

export const Solution = z.object({
  code: z.string().min(1),
  /** Optional short note on why this alternative is also accepted. */
  note: z.string().optional(),
});

export const AbcAgreement = z.object({
  /** abcjs voice/track index to compare. */
  voice: z.number().int().min(0).default(0),
  compare: z.array(z.enum(['pitch', 'onset', 'duration'])).min(1).default(['pitch', 'onset', 'duration']),
  /** Optional: only compare haps whose `s` value is in this list (e.g. ignore a drone layer). */
  only_sounds: z.array(z.string()).optional(),
});

export const VerifyConfig = z.object({
  /** How many cycles L3/L4/L5 query. */
  cycles: z.number().int().min(1).max(64).default(4),
  /** L3 on/off. */
  snapshot: z.boolean().default(true),
  /** L4 config; required (non-null) for `dictation` variants. */
  abc_agreement: AbcAgreement.nullable().default(null),
  /** L5: all solutions must produce identical haps. */
  equivalent_solutions: z.boolean().default(true),
});

export const Variant = z
  .object({
    id: Id,
    skills: z.array(Id).min(1),
    type: ExerciseType,
    difficulty: z.number().int().min(1).max(5),
    /** Short title for lists. */
    title: z.string(),
    /** Markdown. May use the same directives as lessons. */
    prompt: z.string().min(1),
    /** ABC notation (dictation types). */
    abc: z.string().nullable().default(null),
    /** Given code (transform / refactor types). */
    starter: z.string().nullable().default(null),
    /** e.g. match-by-ear plays the target without showing code. */
    hide_reference_code_until_reveal: z.boolean().default(true),
    /** ≥1; first is canonical, the rest are accepted alternatives. */
    solutions: z.array(Solution).min(1),
    /** Self-assessment checklist shown on reveal. */
    listen_for: z.array(z.string()).default([]),
    /** Creative types: constraints the learner checks themselves against. */
    rubric: z.array(z.string()).nullable().default(null),
    verify: VerifyConfig.default({ cycles: 4, snapshot: true, abc_agreement: null, equivalent_solutions: true }),
    /** Provenance for L8. */
    sources: z.array(Source).default([]),
  })
  .superRefine((v, ctx) => {
    if ((v.type === 'dictation') && !v.abc) ctx.addIssue({ code: 'custom', message: 'dictation requires abc' });
    if (v.type === 'dictation' && !v.verify.abc_agreement)
      ctx.addIssue({ code: 'custom', message: 'dictation requires verify.abc_agreement' });
    if ((v.type === 'transform' || v.type === 'refactor') && !v.starter)
      ctx.addIssue({ code: 'custom', message: `${v.type} requires starter` });
    if ((v.type === 'creative' || v.type === 'project') && !v.rubric)
      ctx.addIssue({ code: 'custom', message: `${v.type} requires rubric` });
  });
export type Variant = z.infer<typeof Variant>;

// ---------------------------------------------------------------------------
// Source layer: glossary/timbre-lexicon.yaml
// ---------------------------------------------------------------------------

export const LexiconEntry = z.object({
  term: z.string(),
  /** Parameter tendencies in Strudel vocabulary, e.g. "lower lpf cutoff", "slower attack". */
  tendencies: z.array(z.string()).min(1),
  /** canonical = broad agreement in literature; subjective = varies by listener/genre. */
  status: z.enum(['canonical', 'subjective']),
  confidence: z.enum(['high', 'medium', 'low']),
  sources: z.array(z.object({ title: z.string(), url: z.string().url(), note: z.string().optional() })).min(1),
  notes: z.string().optional(),
});
export const LexiconFile = z.object({ entries: z.array(LexiconEntry) });
export type LexiconEntry = z.infer<typeof LexiconEntry>;

// ---------------------------------------------------------------------------
// Bundle layer (what the app reads)
// ---------------------------------------------------------------------------

/** A code snippet ready to display: raw code + Shiki-highlighted HTML. */
export const CodeSnippet = z.object({
  code: z.string(),
  html: z.string(),
  /** True if the code uses sample banks loaded from the CDN (needs network). */
  needsNetwork: z.boolean(),
});
export type CodeSnippet = z.infer<typeof CodeSnippet>;

/** Rendered content blocks. Lessons, prompts, and bridge callouts are sequences of these. */
export const Block: z.ZodType<Block> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('html'), html: z.string() }),
    z.object({ kind: z.literal('code'), snippet: CodeSnippet }),
    z.object({ kind: z.literal('play'), snippet: CodeSnippet, label: z.string().optional(), showCode: z.boolean() }),
    z.object({ kind: z.literal('abc'), abc: z.string() }),
    z.object({ kind: z.literal('diagram'), svg: z.string() }),
    z.object({
      kind: z.literal('envelope'),
      attack: z.number(),
      decay: z.number(),
      sustain: z.number(),
      release: z.number(),
      /** Seconds the note is held before release (for drawing). */
      hold: z.number().optional(),
    }),
    z.object({
      kind: z.literal('filter'),
      type: z.enum(['lowpass', 'highpass', 'bandpass']),
      title: z.string().optional(),
      curves: z.array(z.object({ cutoff: z.number(), q: z.number(), label: z.string().optional() })).min(1).max(6),
    }),
    z.object({
      kind: z.literal('signal'),
      shape: z.enum(['sine', 'cosine', 'saw', 'isaw', 'tri', 'square', 'perlin', 'rand']),
      min: z.number(),
      max: z.number(),
      /** Cycles per full period (i.e. `.slow(n)`). */
      period: z.number(),
      /** How many cycles to draw. */
      cycles: z.number(),
      label: z.string().optional(),
    }),
    z.object({ kind: z.literal('bridge'), title: z.string().optional(), blocks: z.array(Block) }),
    z.object({
      kind: z.literal('compare'),
      a: z.object({ label: z.string(), snippet: CodeSnippet }),
      b: z.object({ label: z.string(), snippet: CodeSnippet }),
      /** Human-readable description of the single difference, e.g. "lpf 400 → 2000". */
      diff: z.string(),
    }),
  ]),
);
export type Block =
  | { kind: 'html'; html: string }
  | { kind: 'code'; snippet: CodeSnippet }
  | { kind: 'play'; snippet: CodeSnippet; label?: string; showCode: boolean }
  | { kind: 'abc'; abc: string }
  | { kind: 'diagram'; svg: string }
  | { kind: 'envelope'; attack: number; decay: number; sustain: number; release: number; hold?: number }
  | { kind: 'filter'; type: 'lowpass' | 'highpass' | 'bandpass'; title?: string; curves: { cutoff: number; q: number; label?: string }[] }
  | {
      kind: 'signal';
      shape: 'sine' | 'cosine' | 'saw' | 'isaw' | 'tri' | 'square' | 'perlin' | 'rand';
      min: number;
      max: number;
      period: number;
      cycles: number;
      label?: string;
    }
  | { kind: 'bridge'; title?: string; blocks: Block[] }
  | {
      kind: 'compare';
      a: { label: string; snippet: CodeSnippet };
      b: { label: string; snippet: CodeSnippet };
      diff: string;
    };

/** Compact hap for static piano rolls: times in cycles (floats), midi if pitched. */
export const RollHap = z.object({
  b: z.number(),
  e: z.number(),
  midi: z.number().nullable(),
  s: z.string().nullable(),
});
export type RollHap = z.infer<typeof RollHap>;

export const BundleSolution = z.object({
  snippet: CodeSnippet,
  note: z.string().optional(),
});

export const BundleVariant = z.object({
  id: Id,
  skills: z.array(Id),
  type: ExerciseType,
  difficulty: z.number(),
  title: z.string(),
  prompt: z.array(Block),
  abc: z.string().nullable(),
  starter: CodeSnippet.nullable(),
  hideReferenceCodeUntilReveal: z.boolean(),
  solutions: z.array(BundleSolution).min(1),
  listenFor: z.array(z.string()),
  rubric: z.array(z.string()).nullable(),
  /** Cycles to loop when playing the reference. */
  cycles: z.number(),
  /** Static piano roll of the canonical solution over `cycles`. */
  roll: z.array(RollHap),
  sources: z.array(Source),
});
export type BundleVariant = z.infer<typeof BundleVariant>;

export const BundleLesson = z.object({
  id: Id,
  title: z.string(),
  skill: Id,
  blocks: z.array(Block),
  /** Plain text for search. */
  text: z.string(),
});
export type BundleLesson = z.infer<typeof BundleLesson>;

export const BundleSkill = Skill.extend({
  /** Variant ids: primary variants (this skill listed first) in id order, then secondary ones in id order. */
  variants: z.array(Id),
});
export type BundleSkill = z.infer<typeof BundleSkill>;

export const Bundle = z.object({
  schemaVersion: z.literal(1),
  strudel: z.object({ commit: z.string(), npm: z.record(z.string(), z.string()) }),
  /** Hash of all source content; changes whenever content changes. */
  contentHash: z.string(),
  units: z.array(Unit),
  skills: z.array(BundleSkill),
  lessons: z.array(BundleLesson),
  variants: z.array(BundleVariant),
  lexicon: z.array(LexiconEntry),
});
export type Bundle = z.infer<typeof Bundle>;
