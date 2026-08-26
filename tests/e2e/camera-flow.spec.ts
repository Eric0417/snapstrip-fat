import { expect, test } from '@playwright/test';

test('captures four camera shots and opens the editor', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/layout');
  await page.getByRole('button', { name: '繼續' }).click();
  await expect(page).toHaveURL(/\/capture$/);
  await page.getByRole('button', { name: '開始拍照' }).click();
  await expect(page).toHaveURL(/\/editor$/, { timeout: 35_000 });
  await expect(page.getByRole('heading', { name: '裝飾你的拍貼' })).toBeVisible();
  await expect(page.locator('.sticker-thumb')).toHaveCount(96);
  expect(errors).toEqual([]);
});
