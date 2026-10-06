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
