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
  // suspend whatever Today offers as the first new skill (curriculum order decides which)
  await page.goto('./#/');
  await expect(page.getByTestId('plan-new-skill')).toBeVisible();
  const first = await page.getByTestId('plan-new-skill').innerText();

  await page.goto('./#/library');
  await page.getByTestId('skill-link').filter({ hasText: first }).first().click();
  await expect(page.getByTestId('skill-page')).toBeVisible();
  const skillUrl = page.url();
  const skillId = decodeURIComponent(skillUrl.split('/').pop()!);
  await page.getByTestId('overrides').locator('summary').click();
  await expect(page.getByTestId('override-restore')).toHaveCount(0);
  await page.getByTestId('override-suspend').click();
  await expect(page.getByTestId('skill-status')).toHaveText('suspended');
  await expect(page.getByTestId('overrides').locator('summary')).toContainText('suspended');
  // a suspended skill offers only Restore
  await expect(page.getByTestId('override-restore')).toBeVisible();
  await expect(page.getByTestId('override-retire')).toHaveCount(0);

  // never new in Today
  await page.goto('./#/');
  await expect(page.getByTestId(`due-${skillId}`)).toHaveText('suspended');
  const next = page.getByTestId('plan-new-skill');
  if (await next.count()) await expect(next).not.toHaveText(first);

  await page.goto(skillUrl);
  await page.getByTestId('overrides').locator('summary').click();
  await page.getByTestId('override-restore').click();
  await expect(page.getByTestId('skill-status')).toHaveText('not started');
  await page.goto('./#/');
  await expect(page.getByTestId('plan-new-skill')).toHaveText(first);
});

test('focusing a unit restricts Today’s new skill to it; clearing restores the default', async ({ page }) => {
  await page.goto('./#/');
  await expect(page.getByTestId('focus-chip')).toHaveCount(0);
  await expect(page.getByTestId('plan-new-skill')).toBeVisible();
  const unfocused = await page.getByTestId('plan-new-skill').innerText();

  // U3a (exists in the shipped bundle and the fixture) comes after U1 in curriculum order, and its
  // first skill has no prerequisites, so focusing it changes a fresh learner's new skill.
  await page.goto('./#/library');
  const unit = page.getByTestId('unit').filter({ has: page.locator('[data-unit="u3a"]') });
  const titles = await unit.getByTestId('skill-link').allInnerTexts();
  expect(titles).not.toContain(unfocused);
  await unit.getByTestId('focus-unit').click();
  await expect(unit.getByTestId('clear-focus')).toHaveText('Clear focus');

  await page.goto('./#/');
  await expect(page.getByTestId('focus-chip')).toBeVisible();
  await expect(page.getByTestId('plan-new-skill')).toBeVisible();
  const focused = await page.getByTestId('plan-new-skill').innerText();
  expect(titles).toContain(focused);
  // the focus survives a reload (it is derived from the log)
  await page.reload();
  await expect(page.getByTestId('focus-chip')).toBeVisible();

  await page.getByTestId('clear-focus').click();
  await expect(page.getByTestId('focus-chip')).toHaveCount(0);
  await expect(page.getByTestId('plan-new-skill')).toHaveText(unfocused);
});
