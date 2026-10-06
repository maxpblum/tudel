# content/

The source content for the tutor: plain YAML and Markdown, written by humans or LLMs. The app never reads this folder. `pnpm verify` checks everything here and compiles it into `apps/web/src/content/bundle.json`.

- `skills.yaml` holds the units and the skill graph.
- `units/<unit>/lessons/*.md` holds one lesson per skill.
- `units/<unit>/exercises/<variant-id>.yaml` holds one exercise variant per file.
- `glossary/timbre-lexicon.yaml` maps qualitative timbre words to Strudel parameter tendencies, with verified sources.

Read [`docs/content-authoring.md`](../docs/content-authoring.md) before you add or change anything. It covers the schema, the directives, the pedagogy rules, how to check snippets, and a worked example. The skill graph is drawn in [`docs/curriculum.md`](../docs/curriculum.md).

Write all prose (lessons, prompts, listen-for lists) to the standard in [`STYLE_TIPS.md`](STYLE_TIPS.md), and run its QA checklist after every edit.
