import { expect, test } from '@playwright/test';

test('library: units → skills → lesson and any variant, out of session', async ({ page }) => {
  await page.goto('./#/library');
  await expect(page.getByTestId('unit').first()).toBeVisible();
  const skillLinks = page.getByTestId('skill-link');
  await expect(skillLinks.first()).toBeVisible();
  // open the LAST skill (likely locked in Today by prerequisites): library lets you jump anywhere
  await skillLinks.last().click();
  await expect(page.getByTestId('skill-page')).toBeVisible();
  await page.getByTestId('lesson-link').click();
  await expect(page.getByTestId('lesson')).toBeVisible();
  await expect(page.getByTestId('idiom')).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId('skill-page')).toBeVisible();
  const variants = page.getByTestId('variant-link');
  await expect(variants.first()).toBeVisible();
  await variants.first().click();
  await expect(page.getByTestId('exercise')).toBeVisible();
  await page.getByTestId('reveal').click();
  await page.getByTestId('rate-good').click();
  await expect(page.getByTestId('rated-note')).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId('skill-status')).not.toHaveText('not started');
});

test('every lesson renders all its blocks without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('./#/library');
  await expect(page.getByTestId('skill-link').first()).toBeVisible();
  const hrefs = await page.getByTestId('skill-link').evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')!));
  for (const h of hrefs) {
    await page.goto(`./${h}`);
    await expect(page.getByTestId('skill-page')).toBeVisible();
    const lesson = page.getByTestId('lesson-link');
    if (await lesson.count()) {
      await lesson.click();
      await expect(page.getByTestId('lesson')).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test('offline banner appears when the browser goes offline', async ({ page, context }) => {
  await page.goto('./#/library');
  await expect(page.getByTestId('offline-banner')).toHaveCount(0);
  await context.setOffline(true);
  await expect(page.getByTestId('offline-banner')).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByTestId('offline-banner')).toHaveCount(0);
});

test('skill map: nodes link to skill pages and edges follow prerequisites', async ({ page }) => {
  await page.goto('./#/map');
  await expect(page.getByTestId('map-svg')).toBeVisible();
  const lowpass = page.locator('[data-testid="map-node"][data-skill="snd.lowpass"]');
  await expect(lowpass).toHaveAttribute('data-status', 'new');
  await expect(page.locator('[data-testid="map-node"][data-skill="snd.waveforms"]')).toBeVisible();
  expect(await page.getByTestId('map-edge').count()).toBeGreaterThan(0);
  await lowpass.click();
  await expect(page).toHaveURL(/#\/library\/skill\/snd\.lowpass$/);
  await expect(page.getByTestId('skill-page')).toBeVisible();
});

test('skill map stays usable at a 390px width (scrolls sideways)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('./#/map');
  await expect(page.getByTestId('map-svg')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.locator('[data-testid="map-node"][data-skill="snd.waveforms"]').click();
  await expect(page.getByTestId('skill-page')).toBeVisible();
});

test('search finds skills, lessons and exercises by any word', async ({ page }) => {
  await page.goto('./#/library');
  await page.getByTestId('search-input').fill('lowpass');
  await page.getByTestId('search-submit').click();
  await expect(page).toHaveURL(/#\/search\/lowpass$/);
  const hit = page.locator('[data-testid="search-result"][data-id="snd.lowpass"]').first();
  await expect(hit).toBeVisible();
  await hit.click();
  await expect(page.getByTestId('skill-page')).toBeVisible();

  // U1: "euclid" finds the Euclidean-rhythms skill (title and id match)
  await page.goto('./#/search/euclid');
  await expect(page.locator('[data-testid="search-result"][data-kind="skill"][data-id="rhy.euclid"]')).toBeVisible();

  await page.goto('./#/search/zzzzqqqq');
  await expect(page.getByTestId('search-count')).toHaveText(/^0 results/);
  await expect(page.getByTestId('search-result')).toHaveCount(0);
});

test('glossary: terms, lexicon and chords render, and entries link to skills', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#/glossary/terms');
  await expect(page.getByTestId('glossary-terms')).toBeVisible();
  await expect(page.getByTestId('glossary-entry').first()).toBeVisible();
  await page.getByTestId('glossary-skill-link').first().click();
  await expect(page.getByTestId('skill-page')).toBeVisible();

  // the skill page's vocabulary links back to its glossary term
  await page.goto('./#/library/skill/snd.lowpass');
  await page.getByTestId('vocab-link').first().click();
  await expect(page.getByTestId('glossary-terms')).toBeVisible();
  await expect(page.getByTestId('glossary-entry')).toHaveCount(1);

  await page.goto('./#/glossary/lexicon');
  await expect(page.getByTestId('glossary-lexicon')).toBeVisible();
  await expect(page.getByTestId('glossary-entry').first()).toContainText('confidence');
  expect(await page.getByTestId('glossary-entry').first().locator('a[target="_blank"]').count()).toBeGreaterThan(0);
  // at least one lexicon entry links to a skill that mentions it
  await expect(page.getByTestId('glossary-skill-link').first()).toBeVisible();
  await page.getByTestId('glossary-skill-link').first().click();
  await expect(page.getByTestId('skill-page')).toBeVisible();

  // the chord glossary may be empty until chord content exists; it must still render
  await page.goto('./#/glossary/chords');
  await expect(page.getByTestId('glossary-chords')).toBeVisible();
  if (await page.getByTestId('glossary-entry').count()) {
    await expect(page.getByTestId('glossary-entry').first()).toContainText('Tones:');
    await expect(page.getByTestId('glossary-skill-link').first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});
