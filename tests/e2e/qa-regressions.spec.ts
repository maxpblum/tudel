import { expect, test } from '@playwright/test';

/** Regression tests for bugs found in the M1 exploratory QA pass (docs/qa/M1-exploratory.md). */

/** Relative luminance contrast ratio of two `rgb(r, g, b)` strings. */
function contrast(a: string, b: string): number {
  const lum = (c: string) => {
    const [r, g, bl] = c.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

test.describe('dark mode', () => {
  test.use({ colorScheme: 'dark' });

  test('highlighted code tokens stay readable on the dark code background', async ({ page }) => {
    await page.goto('./#/lesson/snd.waveforms.lesson');
    const block = page.getByTestId('code-block').first();
    await expect(block).toBeVisible();
    const bg = await block.evaluate((e) => getComputedStyle(e).backgroundColor);
    const colors = await block.locator('.code-html span[style]').evaluateAll((els) => els.map((e) => getComputedStyle(e).color));
    expect(colors.length).toBeGreaterThan(0);
    for (const c of colors) expect(contrast(c, bg), `token color ${c} on ${bg}`).toBeGreaterThan(4.5);
  });
});

/** All stored events, read straight from IndexedDB. */
async function storedEvents(page: import('@playwright/test').Page): Promise<{ type: string; step?: number | null }[]> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const r = indexedDB.open('strudel-tutor');
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const db = r.result;
          const store = db.objectStoreNames[0]!;
          const g = db.transaction(store).objectStore(store).getAll();
          g.onsuccess = () => {
            resolve(g.result);
            db.close();
          };
          g.onerror = () => reject(g.error);
        };
      }),
  );
}

/** Two clicks dispatched in the same task, before React can re-render the button as disabled. */
async function doubleDispatch(page: import('@playwright/test').Page, testId: string) {
  await page.getByTestId(testId).waitFor();
  await page.evaluate((t) => {
    const b = document.querySelector<HTMLButtonElement>(`[data-testid="${t}"]`)!;
    b.click();
    b.click();
  }, testId);
}

test('same-task double clicks on start / continue / reveal / rate log each action once and skip no step', async ({ page }) => {
  await page.goto('./#/');
  await doubleDispatch(page, 'start-session');
  await expect(page.getByTestId('lesson-continue')).toBeVisible();
  await doubleDispatch(page, 'lesson-continue');
  await expect(page.getByTestId('session')).toHaveAttribute('data-step', '1');
  await doubleDispatch(page, 'reveal');
  await doubleDispatch(page, 'rate-good');
  await expect(page.getByTestId('session')).toHaveAttribute('data-step', '2');
  await expect(page.getByTestId('reveal')).toBeVisible();
  // two different ratings in one task: only the first counts
  await page.getByTestId('reveal').click();
  await page.getByTestId('rate-again').waitFor();
  await page.evaluate(() => {
    document.querySelector<HTMLButtonElement>('[data-testid="rate-again"]')!.click();
    document.querySelector<HTMLButtonElement>('[data-testid="rate-easy"]')!.click();
  });
  await expect(page.getByTestId('session')).toHaveAttribute('data-step', '3');
  const ev = await storedEvents(page);
  const count = (type: string) => ev.filter((e) => e.type === type).length;
  expect(count('session_started')).toBe(1);
  expect(count('lesson_completed')).toBe(1);
  expect(count('revealed')).toBe(2);
  expect(ev.filter((e) => e.type === 'rated').map((e) => (e as { rating?: number }).rating)).toEqual([3, 1]);
});

/** Tap every node connected to the audio destination into an analyser; `window.__qaRms(ms)` = max RMS. */
async function installAudioTap(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const orig = AudioNode.prototype.connect as (this: AudioNode, ...args: unknown[]) => unknown;
    let analyser: AnalyserNode | null = null;
    (AudioNode.prototype as unknown as { connect: unknown }).connect = function (this: AudioNode, dest: unknown, ...rest: unknown[]) {
      const r = orig.call(this, dest, ...rest);
      if (dest instanceof AudioDestinationNode) {
        analyser ??= Object.assign(this.context.createAnalyser(), { fftSize: 2048 });
        orig.call(this, analyser);
      }
      return r;
    };
    (window as unknown as { __qaRms: (ms: number) => Promise<number> }).__qaRms = async (ms: number) => {
      if (!analyser) return 0;
      const buf = new Float32Array(analyser.fftSize);
      let max = 0;
      for (const end = performance.now() + ms; performance.now() < end; ) {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        max = Math.max(max, Math.sqrt(sum / buf.length));
        await new Promise((res) => setTimeout(res, 30));
      }
      return max;
    };
  });
}
const outputRms = (page: import('@playwright/test').Page, ms = 800) =>
  page.evaluate((m) => (window as unknown as { __qaRms: (ms: number) => Promise<number> }).__qaRms(m), ms);

test('looping playback stops when its page is left (no orphaned audio without a Stop button)', async ({ page }) => {
  await installAudioTap(page);
  await page.goto('./#/lesson/snd.waveforms.lesson');
  const block = page.getByTestId('play-block').first();
  await block.getByRole('checkbox', { name: 'Loop' }).check();
  await block.getByTestId('play').click();
  await expect(block.getByTestId('stop')).toHaveText('■ Stop', { timeout: 20_000 });
  expect(await outputRms(page)).toBeGreaterThan(0.01);
  await page.getByRole('link', { name: 'Today' }).click();
  await expect(page.getByTestId('today')).toBeVisible();
  await page.waitForTimeout(2000); // notes already triggered ring out (up to a half note = 1 s)
  expect(await outputRms(page)).toBeLessThan(0.001);
  await page.goBack();
  await expect(page.getByTestId('lesson')).toBeVisible();
  // before the fix the engine was still playing, so the button came back as "Stop"
  await expect(page.getByTestId('stop')).toHaveCount(0);
  await expect(page.getByTestId('play-block').first().getByTestId('play')).toBeVisible();
});

test('a lesson snippet stops when the session moves on to the drills', async ({ page }) => {
  await installAudioTap(page);
  await page.goto('./#/');
  await page.getByTestId('start-session').click();
  const block = page.getByTestId('play-block').first();
  await block.getByRole('checkbox', { name: 'Loop' }).check();
  await block.getByTestId('play').click();
  await expect(block.getByTestId('stop')).toHaveText('■ Stop', { timeout: 20_000 });
  expect(await outputRms(page)).toBeGreaterThan(0.01);
  await page.getByTestId('lesson-continue').click();
  await expect(page.getByTestId('exercise')).toBeVisible();
  await page.waitForTimeout(2000); // notes already triggered ring out (up to a half note = 1 s)
  expect(await outputRms(page)).toBeLessThan(0.001);
});

test('offline after first load: dictation staff notation still renders (abcjs is preloaded)', async ({ page, context }) => {
  await page.goto('./#/');
  await expect(page.getByTestId('today')).toBeVisible();
  // wait for the idle-time preload of the notation chunk
  await expect
    .poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/abcjs-[^/]*\.js$/.test(r.name))), { timeout: 15_000 })
    .toBe(true);
  await context.setOffline(true);
  await page.goto('./#/variant/snd.waveforms.v02');
  await expect(page.getByTestId('offline-banner')).toBeVisible();
  await expect(page.locator('.abc-render svg')).toHaveCount(1);
  await expect(page.getByTestId('abc').locator('.error-note')).toHaveCount(0);
  await context.setOffline(false);
});
