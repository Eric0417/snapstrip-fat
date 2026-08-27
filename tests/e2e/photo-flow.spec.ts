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
      page.locator('.frame-studio-canvas').evaluate((canvas) => {
        const context = (canvas as HTMLCanvasElement).getContext('2d');
        if (!context) return 0;
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        return Array.from(pixels).filter(
          (value, index) => index % 4 !== 3 && value < 245,
        ).length;
      }),
    )
    .toBeGreaterThan(0);
  await page.locator('.frame-ip-button').first().click();
  await page.getByRole('button', { name: '繼續' }).click();
  await expect(page).toHaveURL(/\/editor$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: '裝飾你的拍貼' })).toBeVisible();
  await expect(page.locator('.sticker-thumb')).toHaveCount(96);

  await page.locator('.sticker-thumb').first().click();
  await expect(page.locator('.sticker-selection')).toHaveCount(1);
  await expect(page.locator('.sticker-selection.is-selected')).toHaveCount(1);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /下載 PNG/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^snapstrip-.*\.png$/);
  expect(errors).toEqual([]);
});
