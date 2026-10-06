import { expect, test } from '@playwright/test';
import { completeStep, startSession, stepIndex } from './helpers';

test('closing the tab mid-session loses nothing: resume at the exact step, still revealed', async ({ context }) => {
  const page = await context.newPage();
  await startSession(page);
  await completeStep(page); // lesson
  await expect(page.getByTestId('exercise')).toBeVisible();
  const variant = await page.getByTestId('exercise').getAttribute('data-variant');
  await page.getByTestId('reveal').click();
  await expect(page.getByTestId('revealed')).toBeVisible();
  const step = await stepIndex(page);
  await page.close();

  // a brand-new page in the same browser profile (same IndexedDB)
  const page2 = await context.newPage();
  await page2.goto('./#/');
  await expect(page2.getByTestId('continue-session')).toBeVisible();
  await page2.getByTestId('continue-session').click();
  await expect(page2.getByTestId('session')).toBeVisible();
  expect(await stepIndex(page2)).toBe(step);
  await expect(page2.getByTestId('exercise')).toHaveAttribute('data-variant', variant!);
  await expect(page2.getByTestId('revealed')).toBeVisible();

  // rate, close again, and the next step is current after reopening
  await page2.getByTestId('rate-good').click();
  await expect.poll(() => stepIndex(page2).catch(() => Infinity)).toBeGreaterThan(step);
  await page2.close();
  const page3 = await context.newPage();
  await page3.goto('./#/session');
  await expect(page3.getByTestId('session').or(page3.getByTestId('session-done'))).toBeVisible();
  if (await page3.getByTestId('session').isVisible()) expect(await stepIndex(page3)).toBe(step + 1);
});
