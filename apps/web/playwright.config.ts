import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * E2E tests (tests/e2e) run against a production build served by `vite preview`, so they exercise
 * exactly what ships. Chromium is launched with autoplay allowed so gate L6 can measure real audio.
 *
 * Env:
 *   L6_OFFLINE=1          run L6 offline: skip needsNetwork snippets and block all non-localhost requests
 *   L6_RMS_THRESHOLD=…    minimum max-RMS per snippet (default 0.001 ≈ -60 dBFS)
 *   PW_REUSE=1            reuse an already running preview server on :4173 (local iteration)
 */
export default defineConfig({
  testDir: '../../tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['clipboard-read', 'clipboard-write'],
        launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
      },
    },
  ],
  webServer: {
    command: `node ./node_modules/vite/bin/vite.js build && node ./node_modules/vite/bin/vite.js preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !!process.env.PW_REUSE,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
