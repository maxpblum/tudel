# @tutor/web

The Strudel Tutor app: a Vite + React + TypeScript SPA that reads only the verified content bundle.

| Command (from the repo root) | Does |
|---|---|
| `pnpm --filter @tutor/web dev` | Dev server (uses `src/content/bundle.json`, else the fixture with a banner) |
| `pnpm --filter @tutor/web build` | Static build into `dist/` (relative base, so it can be opened from any static host) |
| `pnpm --filter @tutor/web test` | Vitest with coverage; fails below 90% lines on `src/{srs,store,session}` |
| `pnpm e2e` | Builds, serves with `vite preview`, and runs Playwright (`tests/e2e`), including gate L6 |
| `L6_OFFLINE=1 pnpm e2e` | Same, with L6 run offline: snippets that need the network are skipped |

Source folders each have a README: `src/{engine,srs,store,session,notation,ui,content}`. Decisions are in `docs/decisions/0100–0199`.
