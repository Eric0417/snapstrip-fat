import { expect, test } from '@playwright/test';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nGQAAAAASUVORK5CYII=',
  'base64',
);

const files = [1, 2, 3, 4].map((index) => ({
  name: `photo-${index}.png`,
  mimeType: 'image/png',
  buffer: png,
}));

test('fits a vertical strip into the visible editor stage', async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('snapstrip-authorized', '1');
  });
  await page.goto('/layout');
  await page.getByRole('button', { name: '直式拍立得' }).click();
  await page.getByRole('button', { name: '繼續' }).click();
  await page.setInputFiles('input[type="file"]', files);
  await expect(page).toHaveURL(/\/frame$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: '選擇你的相框' })).toBeVisible();
  await page.locator('.frame-ip-button').first().click();
  await page.getByRole('button', { name: '繼續' }).click();
  await expect(page).toHaveURL(/\/editor$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: '裝飾你的拍貼' })).toBeVisible();

  const stage = page.locator('.editor-stage');
  const panel = page.locator('.editor-stage-panel');
  await expect(stage).toBeVisible();

  const dimensions = await page.evaluate(() => {
    const stageRect = document.querySelector('.editor-stage')!.getBoundingClientRect();
    const panelElement = document.querySelector('.editor-stage-panel')!;
    return {
      stageHeight: stageRect.height,
      stageWidth: stageRect.width,
      viewportHeight: window.innerHeight,
      panelOverflow: panelElement.scrollHeight - panelElement.clientHeight,
    };
  });

  expect(dimensions.panelOverflow).toBeLessThanOrEqual(1);
  expect(dimensions.stageHeight).toBeLessThan(dimensions.viewportHeight);
  expect(dimensions.stageWidth).toBeLessThan(dimensions.viewportHeight);

  await page.getByRole('button', { name: '特效' }).click();
  await page.locator('.sticker-thumb').first().click();
  await expect(page.locator('.sticker-selection')).toHaveCount(1);
});
