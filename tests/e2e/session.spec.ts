import { expect, test } from '@playwright/test';
import { collectErrors, completeStep, finishSession, startSession, stepIndex } from './helpers';

test('full Today flow: lesson, drills, ratings, completion', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('./#/');
  await expect(page.getByTestId('plan-summary')).toBeVisible();
  await expect(page.getByTestId('plan-summary')).toContainText('New skill');
  await startSession(page);
  // a new learner starts with a lesson, then 2–3 drills, plus up to the skill's remaining variants to
  // fill the session length when nothing else is introduced yet (ADR 0100 amendment 1)
  await expect(page.getByTestId('lesson')).toBeVisible();
  const kinds = await finishSession(page);
  expect(kinds[0]).toBe('lesson');
  const drills = kinds.filter((k) => k === 'exercise').length;
  expect(drills).toBeGreaterThanOrEqual(2);
  expect(drills).toBeLessThanOrEqual(4);
  await expect(page.getByTestId('session-done')).toContainText(`${drills} exercises rated`);

  // Today now offers the next session (next new skill), and the first skill has a schedule
  await page.goto('./#/');
  await expect(page.getByTestId('start-session').or(page.getByTestId('caught-up'))).toBeVisible();
  expect(errors).toEqual([]);
});

test('exercise view: reveal shows reference, copy, checklist and rating', async ({ page }) => {
  await startSession(page);
  await completeStep(page); // lesson
  await expect(page.getByTestId('exercise')).toBeVisible();
  await expect(page.getByTestId('rating')).toHaveCount(0);
  await page.getByTestId('reveal').click();
  const revealed = page.getByTestId('revealed');
  await expect(revealed).toBeVisible();
  await expect(revealed.getByTestId('code-block').first()).toBeVisible();
  await expect(revealed.getByTestId('copy').first()).toBeVisible();
  await expect(revealed.getByTestId('play').first()).toBeVisible();
  await expect(revealed.getByTestId('live-roll')).toBeVisible();
  await expect(page.getByTestId('rate-again')).toBeVisible();
  await expect(page.getByTestId('rate-easy')).toBeVisible();
  // no editor anywhere (R-NO-EDITOR)
  await expect(page.locator('textarea, [contenteditable="true"], .cm-editor')).toHaveCount(0);
  const before = await stepIndex(page);
  await page.getByTestId('rate-hard').click();
  await expect.poll(() => stepIndex(page).catch(() => Infinity)).toBeGreaterThan(before);
});

test('skip step advances and is recorded', async ({ page }) => {
  await startSession(page);
  const before = await stepIndex(page);
  await page.getByTestId('skip-step').click();
  await expect.poll(() => stepIndex(page)).toBe(before + 1);
  await page.reload();
  await expect.poll(() => stepIndex(page)).toBe(before + 1);
});
