/**
 * The single import point for Strudel packages in the verifier.
 *
 * Every other module imports Strudel from here, never from `@strudel/*` directly. That keeps
 * one shared instance of `@strudel/core` and lets the Vitest config swap this file for an
 * esbuild-bundled copy (see vitest.config.ts and docs/decisions/0002-esbuild-bundled-harness.md).
 */
export * as core from '@strudel/core';
export { mini, m, mini2ast } from '@strudel/mini';
export * as tonal from '@strudel/tonal';
export * as webaudio from '@strudel/webaudio';
export { transpiler } from '@strudel/transpiler';
