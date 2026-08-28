import { expect, test } from '@playwright/test';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nGQAAAAASUVORK5CYII=',
  'base64',
);

const files = [
  { name: 'photo-1.png', mimeType: 'image/png', buffer: png },
  { name: 'photo-2.png', mimeType: 'image/png', buffer: png },
  { name: 'photo-3.png', mimeType: 'image/png', buffer: png },
  { name: 'photo-4.png', mimeType: 'image/png', buffer: png },
];

test('completes the upload, sticker editor, and export flow', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.addInitScript(() => {
    window.sessionStorage.setItem('snapstrip-authorized', '1');
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true,
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        (window as unknown as { __sharedData?: ShareData }).__sharedData = data;
      },
    });
    Object.defineProperty(window, '__sharedData', {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });
  await page.goto('/layout');
  await expect(page.getByRole('heading', { name: '選擇你的版型' })).toBeVisible();
  await page.getByRole('button', { name: '繼續' }).click();
  await expect(page).toHaveURL(/\/capture$/);

  await page.setInputFiles('input[type="file"]', files);
  await expect(page).toHaveURL(/\/frame$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: '選擇你的相框' })).toBeVisible();
  await expect
    .poll(() =>
      page.locator('.template-option-canvas').nth(1).evaluate((canvas) => {
        const context = (canvas as HTMLCanvasElement).getContext('2d');
        if (!context) return 0;
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        return Array.from(pixels).filter(
          (value, index) => index % 4 !== 3 && value < 245,
        ).length;
      }),
    )
    .toBeGreaterThan(0);

  await page.getByRole('button', { name: '示範相框' }).click();
  await page.getByRole('button', { name: '繼續' }).click();
  await expect(page).toHaveURL(/\/editor$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: '裝飾你的拍貼' })).toBeVisible();
  await expect(page.locator('.sticker-thumb')).toHaveCount(96);

  await page.getByRole('button', { name: '暖色' }).click();
  await expect(page.locator('.strip-canvas')).toHaveCSS(
    'filter',
    /sepia/,
  );

  await page.locator('.sticker-thumb').first().click();
  await expect(page.locator('.sticker-selection')).toHaveCount(1);
  await expect(page.locator('.sticker-selection.is-selected')).toHaveCount(1);

  await page.getByRole('button', { name: '分享' }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __sharedData?: ShareData }).__sharedData,
      ),
    )
    .toBeTruthy();
  const sharedData = await page.evaluate(
    () => (window as unknown as { __sharedData?: ShareData }).__sharedData,
  );
  expect(sharedData?.files).toHaveLength(1);
  const sharedFile = await page.evaluate(() => {
    const file = (window as unknown as { __sharedData?: ShareData }).__sharedData
      ?.files?.[0];
    return file ? { name: file.name, type: file.type } : null;
  });
  expect(sharedFile?.type).toBe('image/png');
  expect(sharedFile?.name).toMatch(/^snapstrip-.*\.png$/);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /下載 PNG/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^snapstrip-.*\.png$/);
  expect(errors).toEqual([]);
});
