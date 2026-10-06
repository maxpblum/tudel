import { expect, test } from '@playwright/test';

test('copy buttons put the exact code on the clipboard', async ({ page }) => {
  await page.goto('./#/library');
  await page.getByTestId('skill-link').first().click();
  await page.getByTestId('lesson-link').click();
  const blocks = page.getByTestId('lesson').getByTestId('code-block');
  await expect(blocks.first()).toBeVisible();
  const n = await blocks.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const block = blocks.nth(i);
    const shown = (await block.locator('.code-html').innerText()).trim();
    await block.getByTestId('copy').click();
    await expect(block.getByTestId('copy')).toHaveText('Copied');
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip.trim()).toBe(shown);
  }

  // reveal an exercise and copy the reference
  await page.goBack();
  await page.getByTestId('variant-link').first().click();
  await page.getByTestId('reveal').click();
  const ref = page.getByTestId('revealed').getByTestId('code-block').first();
  await ref.getByTestId('copy').click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip.trim()).toBe((await ref.locator('.code-html').innerText()).trim());
});

test('every code display has a copy button', async ({ page }) => {
  await page.goto('./#/library');
  await expect(page.getByTestId('skill-link').first()).toBeVisible();
  const hrefs = await page.getByTestId('skill-link').evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')!));
  for (const h of hrefs) {
    await page.goto(`./${h}`);
    await expect(page.getByTestId('skill-page')).toBeVisible();
    await page.getByTestId('lesson-link').click();
    await expect(page.getByTestId('lesson')).toBeVisible();
    const blocks = page.getByTestId('code-block');
    const n = await blocks.count();
    for (let i = 0; i < n; i++) await expect(blocks.nth(i).getByTestId('copy')).toHaveCount(1);
  }
});
