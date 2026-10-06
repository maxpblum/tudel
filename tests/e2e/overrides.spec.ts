import { expect, test } from '@playwright/test';

async function firstSkill(page: import('@playwright/test').Page) {
  await page.goto('./#/library');
  await page.getByTestId('skill-link').first().click();
  await expect(page.getByTestId('skill-page')).toBeVisible();
}

test('retire / restore / mark known / show again soon change scheduling', async ({ page }) => {
  await page.goto('./#/');
  const firstNew = await page.getByTestId('plan-summary').innerText();

  await firstSkill(page);
  await page.getByTestId('overrides').locator('summary').click();
  await page.getByTestId('override-mark_known').click();
  await expect(page.getByTestId('skill-status')).toHaveText('marked known');
  await page.goto('./#/');
  // the marked-known skill is no longer the new skill
  await expect(page.getByTestId('plan-summary').or(page.getByTestId('caught-up'))).toBeVisible();
  if (await page.getByTestId('plan-summary').isVisible()) expect(await page.getByTestId('plan-summary').innerText()).not.toBe(firstNew);

  await firstSkill(page);
  await page.getByTestId('overrides').locator('summary').click();
  await page.getByTestId('override-restore').click();
  await expect(page.getByTestId('skill-status')).toHaveText('not started');

  await page.getByTestId('override-retire').click();
  await expect(page.getByTestId('skill-status')).toHaveText('retired');
  await page.getByTestId('override-restore').click();

  // practise it once from the library, then "show again soon" makes it due now
  await page.getByTestId('variant-link').first().click();
  await page.getByTestId('reveal').click();
  await page.getByTestId('rate-easy').click();
  await page.goBack();
  await expect(page.getByTestId('skill-status')).toHaveText(/^in /);
  await page.getByTestId('overrides').locator('summary').click();
  await page.getByTestId('override-again_soon').click();
  await expect(page.getByTestId('skill-status')).toHaveText('due now');
  await page.goto('./#/');
  await expect(page.getByTestId('plan-summary')).toContainText(/1\s+review/);
});

test('overrides are available inside an exercise', async ({ page }) => {
  await page.goto('./#/library');
  await page.getByTestId('skill-link').first().click();
  await page.getByTestId('variant-link').first().click();
  await page.getByTestId('overrides').locator('summary').click();
  await expect(page.getByTestId('override-again_soon')).toBeVisible();
  await expect(page.getByTestId('override-retire')).toBeVisible();
  await expect(page.getByTestId('override-mark_known')).toBeVisible();
});
