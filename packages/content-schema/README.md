# @tudel/content-schema

zod schemas and TypeScript types shared by the verifier (Node) and the app (browser). This is the contract between the planes.

- **Source layer:** what authors write: `SkillsFile`, `LessonFrontmatter`, `Variant`, `LexiconFile`. The verifier's gate L0 also rejects unknown keys.
- **Bundle layer:** what the app reads: `Bundle`, with `Block` (the rendered lesson and prompt pieces), `CodeSnippet`, and `RollHap`.

Changing the bundle shape means updating the compiler (`packages/verify/src/compile/`) and the app's renderers (`apps/web/src/ui/`) together. Bump `schemaVersion` for incompatible changes.
