import { expect, type Page } from '@playwright/test';

/** Errors printed to the console or thrown on the page, collected for assertions. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

/** Complete the current session step generically (any content): lesson → continue; exercise → reveal + rate. */
export async function completeStep(page: Page, rating: 'again' | 'hard' | 'good' | 'easy' = 'good'): Promise<'lesson' | 'exercise'> {
  const before = await stepIndex(page);
  const kind = await doStep(page, rating);
  await expect
    .poll(async () => ((await page.getByTestId('session-done').isVisible()) ? Infinity : await stepIndex(page)))
    .toBeGreaterThan(before);
  return kind;
}

async function doStep(page: Page, rating: string): Promise<'lesson' | 'exercise'> {
  const lesson = page.getByTestId('lesson-continue');
  const reveal = page.getByTestId('reveal');
  const rate = page.getByTestId(`rate-${rating}`);
  await expect(lesson.or(reveal).or(rate).first()).toBeVisible();
  if (await lesson.isVisible()) {
    await lesson.click();
    return 'lesson';
  }
  if (await reveal.isVisible()) await reveal.click();
  await rate.click();
  return 'exercise';
}

export async function stepIndex(page: Page): Promise<number> {
  // non-waiting read: the session element disappears when the last step completes
  const v = await page.evaluate(() => document.querySelector('[data-testid="session"]')?.getAttribute('data-step') ?? null);
  return v === null ? Infinity : Number(v);
}

export async function startSession(page: Page) {
  await page.goto('./#/');
  await page.getByTestId('start-session').click();
  await expect(page.getByTestId('session')).toBeVisible();
}

/** Run the active session to completion; returns the kinds of steps done. */
export async function finishSession(page: Page): Promise<string[]> {
  const kinds: string[] = [];
  for (let guard = 0; guard < 50; guard++) {
    if (await page.getByTestId('session-done').isVisible()) return kinds;
    kinds.push(await completeStep(page));
  }
  throw new Error('session did not finish');
}
