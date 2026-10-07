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

test('suspend takes a skill out of Today until restored', async ({ page }) => {
  // U3a: snd.waveforms is the first new skill for a fresh learner
  await page.goto('./#/');
  await expect(page.getByTestId('plan-new-skill')).toBeVisible();
  const first = await page.getByTestId('plan-new-skill').innerText();

  await page.goto('./#/library/skill/snd.waveforms');
  await page.getByTestId('overrides').locator('summary').click();
  await expect(page.getByTestId('override-restore')).toHaveCount(0);
  await page.getByTestId('override-suspend').click();
  await expect(page.getByTestId('skill-status')).toHaveText('suspended');
  await expect(page.getByTestId('overrides').locator('summary')).toContainText('suspended');
  // a suspended skill offers only Restore
  await expect(page.getByTestId('override-restore')).toBeVisible();
  await expect(page.getByTestId('override-retire')).toHaveCount(0);

  // never new in Today (nothing is introduced, so its dependants are locked too)
  await page.goto('./#/');
  await expect(page.getByTestId('due-snd.waveforms')).toHaveText('suspended');
  await expect(page.getByTestId('plan-new-skill')).toHaveCount(0);

  await page.goto('./#/library/skill/snd.waveforms');
  await page.getByTestId('overrides').locator('summary').click();
  await page.getByTestId('override-restore').click();
  await expect(page.getByTestId('skill-status')).toHaveText('not started');
  await page.goto('./#/');
  await expect(page.getByTestId('plan-new-skill')).toHaveText(first);
});

test('focusing a unit restricts Today’s new skill to it; clearing restores the default', async ({ page }) => {
  await page.goto('./#/');
  await expect(page.getByTestId('focus-chip')).toHaveCount(0);

  await page.goto('./#/library');
  // the last unit shown (U3a is the only one until M2 content lands)
  const unit = page.getByTestId('unit').last();
  const titles = await unit.getByTestId('skill-link').allInnerTexts();
  await unit.getByTestId('focus-unit').click();
  await expect(unit.getByTestId('clear-focus')).toHaveText('Clear focus');

  await page.goto('./#/');
  await expect(page.getByTestId('focus-chip')).toBeVisible();
  const plan = page.getByTestId('plan-new-skill');
  if (await plan.count()) expect(titles).toContain(await plan.innerText());
  // the focus survives a reload (it is derived from the log)
  await page.reload();
  await expect(page.getByTestId('focus-chip')).toBeVisible();

  await page.getByTestId('clear-focus').click();
  await expect(page.getByTestId('focus-chip')).toHaveCount(0);
});
