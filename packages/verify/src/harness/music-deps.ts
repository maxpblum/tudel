/**
 * The single import point for `tonal` (music-theory checks in L8c).
 *
 * tonal 6.5.0 and its @tonaljs/* dependencies have package.json "main" entries pointing at
 * files they don't ship, so Vite/Node resolution fails on them. esbuild (which prefers
 * "module") resolves them, and vitest.config.ts swaps this file for an esbuild bundle, just
 * like strudel-deps.ts (docs/decisions/0002-esbuild-bundled-harness.md).
 */
export { Chord, Note } from 'tonal';
