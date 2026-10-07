import { expect, test, type Page } from '@playwright/test';
import { completeStep, startSession, stepIndex } from './helpers';

/** Session/scheduling gaps from the M1 QA pass (docs/qa/M1-exploratory.md U2–U7). Content-generic. */

async function storedEvents(page: Page): Promise<{ type: string; elapsedMs?: number | null; rating?: number }[]> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const r = indexedDB.open('strudel-tutor');
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const db = r.result;
          const store = db.objectStoreNames[0]!;
          const g = db.transaction(store).objectStore(store).getAll();
          g.onsuccess = () => {
            resolve(g.result);
            db.close();
          };
          g.onerror = () => reject(g.error);
        };
      }),
  );
}

test('first-run Today proposes a session within R-SESSION’s 15–30 min (default 20) when content allows', async ({ page }) => {
  await page.goto('./#/');
  const text = await page.getByTestId('plan-minutes').innerText();
  const min = Number(/About (\d+) min/.exec(text)![1]);
  expect(min).toBeLessThanOrEqual(20);
  // the shipped bundle has enough variants for the first skill to reach the band (the fixture does not)
  const fixture = await page.getByTestId('fixture-banner').count();
  if (!fixture) expect(min).toBeGreaterThanOrEqual(15);
  if (min < 18) await expect(page.getByTestId('plan-minutes')).toContainText('all the material available');
});

test('retiring the skill mid-session drops its remaining steps; the current drill stays', async ({ page }) => {
  await startSession(page);
  await completeStep(page); // lesson of the (only) new skill
  await expect(page.getByTestId('exercise')).toBeVisible();
  const step = await stepIndex(page);
  await page.getByTestId('overrides').locator('summary').click();
  await page.getByTestId('override-retire').click();
  await expect(page.getByTestId('overrides').locator('summary')).toContainText('retired');
  // the shown drill is still here
  expect(await stepIndex(page)).toBe(step);
  await page.getByTestId('reveal').click();
  await page.getByTestId('rate-good').click();
  // every later step was this skill's, so the session ends; the drops survive a reload (replay)
  await expect(page.getByTestId('session-done')).toContainText(/1 exercises rated.*dropped/);
  await page.reload();
  await expect(page.getByTestId('session-done')).toContainText('dropped');
});

test('a session where every step was skipped is not reported as finished', async ({ page }) => {
  await startSession(page);
  for (let i = 0; i < 50 && (await page.getByTestId('session').isVisible()); i++) {
    const before = await stepIndex(page);
    await page.getByTestId('skip-step').click();
    await expect.poll(async () => ((await page.getByTestId('session-done').isVisible()) ? Infinity : await stepIndex(page))).toBeGreaterThan(before);
  }
  await expect(page.getByTestId('session-done')).toContainText('Session ended: all steps skipped');
  await page.goto('./#/');
  await expect(page.getByTestId('start-session')).toBeVisible();
  await expect(page.getByTestId('finished-today')).toHaveCount(0);
  await expect(page.getByTestId('ended-skipped-today')).toBeVisible();
});

test('library practice: one rating per view, then “Practise again” starts a new view', async ({ page }) => {
  await page.goto('./#/library');
  await page.getByTestId('skill-link').first().click();
  await page.getByTestId('variant-link').first().click();
  await page.getByTestId('reveal').click();
  await page.getByTestId('rate-good').click();
  await expect(page.getByTestId('rated-note')).toContainText('Rated: Good');
  await expect(page.getByTestId('rate-good')).toHaveCount(0);
  await expect(page.getByTestId('rate-easy')).toHaveCount(0);
  await page.getByTestId('practise-again').click();
  await expect(page.getByTestId('reveal')).toBeVisible();
  await expect(page.getByTestId('rated-note')).toHaveCount(0);
  await page.getByTestId('reveal').click();
  await page.getByTestId('rate-hard').click();
  await expect(page.getByTestId('rated-note')).toContainText('Rated: Hard');
  const ev = await storedEvents(page);
  expect(ev.filter((e) => e.type === 'rated').map((e) => e.rating)).toEqual([3, 2]);
  expect(ev.filter((e) => e.type === 'variant_shown')).toHaveLength(2);
});

test('“Show again soon” on a skill with unmet prerequisites says when it will appear', async ({ page }) => {
  await page.goto('./#/library');
  await page.getByTestId('skill-link').last().click();
  await expect(page.getByTestId('override-note')).toHaveCount(0);
  await page.getByTestId('overrides').locator('summary').click();
  await page.getByTestId('override-again_soon').click();
  await expect(page.getByTestId('override-note')).toContainText('once its prerequisites are met');
  await page.reload();
  await expect(page.getByTestId('override-note')).toBeVisible();
});

test('fluency time excludes time the tab was closed', async ({ context }) => {
  const t0 = new Date('2026-10-05T09:00:00Z').getTime();
  await context.clock.install({ time: t0 });
  const page = await context.newPage();
  await startSession(page);
  await completeStep(page); // lesson
  await expect(page.getByTestId('reveal')).toBeVisible();
  await page.close();
  await context.clock.setSystemTime(t0 + 26 * 3600_000); // next day
  const page2 = await context.newPage();
  await page2.goto('./#/');
  await page2.getByTestId('continue-session').click();
  await page2.getByTestId('reveal').click();
  await expect(page2.getByTestId('revealed')).toBeVisible();
  const revealed = (await storedEvents(page2)).filter((e) => e.type === 'revealed');
  expect(revealed).toHaveLength(1);
  expect(revealed[0]!.elapsedMs).not.toBeNull();
  expect(revealed[0]!.elapsedMs!).toBeLessThan(10 * 60_000);

  // The reveal shows up as a fluency trend on its skill (U3a: the first new skill is snd.waveforms),
  // and a skill with no reveals shows none.
  await page2.goto('./#/library/skill/snd.waveforms');
  await expect(page2.getByTestId('fluency')).toContainText('informational only, not used for scheduling');
  await expect(page2.getByTestId('fluency-spark')).toBeVisible();
  await expect(page2.getByTestId('fluency-last')).toHaveText(/^\d+\.\d s$/);
  await expect(page2.getByTestId('fluency-median')).toHaveText(/^\d+\.\d s$/);
  await page2.goto('./#/library/skill/snd.lowpass');
  await expect(page2.getByTestId('skill-page')).toBeVisible();
  await expect(page2.getByTestId('fluency')).toHaveCount(0);
});
