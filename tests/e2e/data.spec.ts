import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { completeStep, startSession } from './helpers';

test('export → import round trip into a fresh profile restores identical state', async ({ browser }) => {
  const ctxA = await browser.newContext();
  const a = await ctxA.newPage();
  await startSession(a);
  await completeStep(a);
  await completeStep(a, 'easy');
  await a.goto('./#/data');
  const count = await a.getByTestId('event-count').textContent();
  expect(Number(count)).toBeGreaterThan(3);
  const [download] = await Promise.all([a.waitForEvent('download'), a.getByTestId('export').click()]);
  expect(download.suggestedFilename()).toMatch(/^tudel-progress-\d{4}-\d{2}-\d{2}\.json$/);
  const file = await download.path();
  const text = readFileSync(file, 'utf8');
  const doc = JSON.parse(text);
  expect(doc.format).toBe('tudel-log');
  expect(doc.version).toBe(1);
  expect(doc.events).toHaveLength(Number(count));
  await a.goto('./#/');
  const todayA = await a.getByTestId('today').innerText();
  await ctxA.close();

  const ctxB = await browser.newContext();
  const b = await ctxB.newPage();
  await b.goto('./#/data');
  await expect(b.getByTestId('event-count')).toHaveText('0');
  b.once('dialog', (d) => void d.accept());
  await b.getByTestId('import-file').setInputFiles({ name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(text) });
  await expect(b.getByTestId('import-message')).toContainText(`Imported ${count} events`);
  await expect(b.getByTestId('event-count')).toHaveText(count!);
  await b.goto('./#/');
  expect(await b.getByTestId('today').innerText()).toBe(todayA);
  // the imported log persists across reload
  await b.reload();
  await b.goto('./#/data');
  await expect(b.getByTestId('event-count')).toHaveText(count!);

  // invalid files are rejected without touching the log
  await b.getByTestId('import-file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"nope":1}') });
  await expect(b.getByTestId('import-message')).toContainText('Import failed');
  await expect(b.getByTestId('event-count')).toHaveText(count!);
  // declining the confirmation keeps the log
  b.once('dialog', (d) => void d.dismiss());
  await b.getByTestId('import-file').setInputFiles({ name: 'p.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...doc, events: [] })) });
  await expect(b.getByTestId('import-message')).toContainText('cancelled');
  await expect(b.getByTestId('event-count')).toHaveText(count!);
  await ctxB.close();
});
