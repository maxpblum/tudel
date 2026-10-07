import type { Bundle, BundleLesson, ChordSymbolEntry, LexiconEntry, StrudelTerm, BundleSkill, BundleVariant, Unit } from '@tudel/content-schema';

export interface ContentIndex {
  bundle: Bundle;
  units: Unit[];
  /** Skills in curriculum order (unit order, then authoring order). */
  skills: BundleSkill[];
  skill(id: string): BundleSkill | undefined;
  variant(id: string): BundleVariant | undefined;
  lesson(id: string): BundleLesson | undefined;
  lessonForSkill(skillId: string): BundleLesson | undefined;
  /** Variants whose primary (first) skill is `skillId`, in authoring order. */
  primaryVariants(skillId: string): BundleVariant[];
  /** Variants that practise `skillId` at all: primary ones first, then secondary. */
  variantsForSkill(skillId: string): BundleVariant[];
  unitOfSkill(skillId: string): string | undefined;
  lexicon(): LexiconEntry[];
  chords(): ChordSymbolEntry[];
  terms(): StrudelTerm[];
}

export function indexBundle(bundle: Bundle): ContentIndex {
  const units = [...bundle.units].sort((a, b) => a.order - b.order);
  const unitRank = new Map(units.map((u, i) => [u.id, i]));
  const skills = bundle.skills
    .map((s, i) => ({ s, i }))
    .sort((a, b) => (unitRank.get(a.s.unit) ?? 99) - (unitRank.get(b.s.unit) ?? 99) || a.i - b.i)
    .map(({ s }) => s);
  const skillMap = new Map(bundle.skills.map((s) => [s.id, s]));
  const variantMap = new Map(bundle.variants.map((v) => [v.id, v]));
  const lessonMap = new Map(bundle.lessons.map((l) => [l.id, l]));
  const variantOrder = (skillId: string) => {
    const declared = skillMap.get(skillId)?.variants ?? [];
    const rank = new Map(declared.map((id, i) => [id, i]));
    return (a: BundleVariant, b: BundleVariant) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9);
  };
  return {
    bundle,
    units,
    skills,
    skill: (id) => skillMap.get(id),
    variant: (id) => variantMap.get(id),
    lesson: (id) => lessonMap.get(id),
    lessonForSkill: (skillId) => {
      const s = skillMap.get(skillId);
      return (s && lessonMap.get(s.lesson)) || bundle.lessons.find((l) => l.skill === skillId);
    },
    primaryVariants: (skillId) => bundle.variants.filter((v) => v.skills[0] === skillId).sort(variantOrder(skillId)),
    // primary variants first, then those that practise the skill as a secondary skill
    variantsForSkill: (skillId) => {
      const order = variantOrder(skillId);
      const all = bundle.variants.filter((v) => v.skills.includes(skillId));
      return [...all.filter((v) => v.skills[0] === skillId).sort(order), ...all.filter((v) => v.skills[0] !== skillId).sort(order)];
    },
    unitOfSkill: (skillId) => skillMap.get(skillId)?.unit,
    lexicon: () => bundle.lexicon,
    chords: () => bundle.chords,
    terms: () => bundle.terms,
  };
}
