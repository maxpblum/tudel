/**
 * Gate L6 — browser audio smoke test (PROPOSAL §13). Every variant's canonical solution and every
 * lesson/prompt play and compare snippet is played through the real engine and prebake in Chromium
 * (autoplay allowed). Each must produce no console errors and an output RMS above a threshold.
 *
 * L6_OFFLINE=1 skips snippets tagged needsNetwork and blocks every non-localhost request (the internet
 * is down; the locally served app is not) for the rest.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { smokeSnippets } from '../../apps/web/src/content/snippets';

declare global {
  interface Window {
    __smoke?: {
      snippets: { id: string }[];
      init(): Promise<{ failedLoaders: string[] }>;
      run(id: string, opts?: { ms?: number }): Promise<{ id: string; maxRms: number; meanRms: number; errors: string[] }>;
    };
  }
}

const here = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(here, '../../apps/web/src/content');
const real = path.join(contentDir, 'bundle.json');
const bundleFile = process.env.TUDEL_FIXTURE !== '1' && existsSync(real) ? real : path.join(contentDir, 'fixture.bundle.json');
const bundle = JSON.parse(readFileSync(bundleFile, 'utf8'));
const snippets = smokeSnippets(bundle);
const offline = process.env.L6_OFFLINE === '1';
const threshold = Number(process.env.L6_RMS_THRESHOLD ?? 0.001);

test.describe.configure({ mode: 'serial' });

let page: Page;
let errors: string[] = [];

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext();
  page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#/__smoke');
  await expect(page.getByTestId('smoke')).toBeVisible();
  if (offline) {
    await ctx.route('**/*', (route) => {
      const host = new URL(route.request().url()).hostname;
      return host === 'localhost' || host === '127.0.0.1' ? route.continue() : route.abort('internetdisconnected');
    });
  }
  await page.getByTestId('smoke-init').click(); // user gesture, as in the app
  const init = await page.evaluate(() => window.__smoke!.init());
  console.log(`[L6] bundle: ${path.basename(bundleFile)}; ${snippets.length} snippets; failed loaders: ${JSON.stringify(init.failedLoaders)}`);
  if (!offline) expect(init.failedLoaders, 'prebake loaders failed while online').toEqual([]);
  errors = []; // init-time network noise (offline mode) is not attributed to snippets
});

test.afterAll(async () => {
  await page?.context().close();
});

test('L6 snippet list matches the app', async () => {
  const ids = await page.evaluate(() => window.__smoke!.snippets.map((s) => s.id));
  expect(ids).toEqual(snippets.map((s) => s.id));
});

for (const s of snippets) {
  test(`L6 ${s.id}${s.needsNetwork ? ' [network]' : ''}`, async () => {
    test.skip(offline && s.needsNetwork, 'needs network (sample banks); L6_OFFLINE=1');
    errors = [];
    const r = await page.evaluate((id) => window.__smoke!.run(id, { ms: 3000 }), s.id);
    console.log(`[L6] ${s.id}: maxRms=${r.maxRms.toFixed(4)} meanRms=${r.meanRms.toFixed(4)}`);
    expect(r.errors, 'engine errors').toEqual([]);
    expect(errors, 'console errors').toEqual([]);
    expect(r.maxRms, `RMS for:\n${s.code}`).toBeGreaterThan(threshold);
  });
}
