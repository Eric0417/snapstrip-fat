import { expect, test } from '@playwright/test';

test('mobile flow shell keeps the next action reachable and resets scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    window.sessionStorage.setItem('snapstrip-authorized', '1');
  });

  await page.goto('/layout');
  await expect(page.locator('.mobile-flow-header')).toBeVisible();
  await expect(page.locator('.app-nav')).toHaveCSS('display', 'none');
  await expect(page.locator('.layout-card')).toHaveCount(8);

  const layout = await page.evaluate(() => {
    const cta = document.querySelector('.flow-next-button')?.getBoundingClientRect();
    const grid = document.querySelector('.layout-grid');
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      cta: cta
        ? {
            top: cta.top,
            bottom: cta.bottom,
            left: cta.left,
            right: cta.right,
          }
        : null,
      columns: grid
        ? getComputedStyle(grid).gridTemplateColumns.split(' ').length
        : 0,
    };
  });

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth);
  expect(layout.cta).not.toBeNull();
  expect(layout.cta!.top).toBeGreaterThanOrEqual(0);
  expect(layout.cta!.bottom).toBeLessThanOrEqual(568);
  expect(layout.columns).toBe(2);

  await page.getByRole('button', { name: /English/ }).click();
  await expect(page.locator('.mobile-flow-copy strong')).toHaveText(
    'Choose your layout',
  );
  await expect(page.locator('.mobile-flow-copy span')).toHaveText('Step 1 of 4');
  await page.getByRole('button', { name: /繁體中文/ }).click();
  await expect(page.locator('.mobile-flow-copy strong')).toHaveText('選擇你的版型');

  const flowTargets = await page.evaluate(() => {
    const targets = [
      ...document.querySelectorAll('.mobile-flow-header button'),
      ...document.querySelectorAll('.layout-card'),
      ...document.querySelectorAll('.flow-next-button'),
    ];
    return targets
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      })
      .filter((rect) => rect.width < 44 || rect.height < 44);
  });
  expect(flowTargets).toEqual([]);

  await page.locator('.flow-next-button').click();
  await expect(page).toHaveURL(/\/capture$/);
  await expect(page.locator('.capture-page h1')).toBeVisible();
  const capturePosition = await page.evaluate(() => {
    const heading = document.querySelector('.capture-page h1')?.getBoundingClientRect();
    const header = document.querySelector('.mobile-flow-header')?.getBoundingClientRect();
    return {
      scrollY,
      headingTop: heading?.top,
      headerBottom: header?.bottom,
    };
  });
  expect(capturePosition.scrollY).toBe(0);
  expect(capturePosition.headingTop).toBeGreaterThanOrEqual(
    capturePosition.headerBottom ?? 0,
  );

  await page.locator('.mobile-flow-back').click();
  await expect(page).toHaveURL(/\/layout$/);
});

test('camera capture can be cancelled before it navigates', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    window.sessionStorage.setItem('snapstrip-authorized', '1');
  });
  await page.goto('/layout');
  await page.locator('.flow-next-button').click();
  await expect(page).toHaveURL(/\/capture$/);
  await page.getByRole('button', { name: '開始拍照' }).click();
  await expect(page.locator('.capture-progress')).toBeVisible();
  await page.getByRole('button', { name: '停止拍照' }).click();
  await expect(page.locator('.capture-progress')).toHaveCount(0);
  await expect(page).toHaveURL(/\/capture$/);
  await expect(page.getByRole('button', { name: '開始拍照' })).toBeVisible();
  await page.waitForTimeout(4500);
  await expect(page).toHaveURL(/\/capture$/);
  await expect(page.getByRole('button', { name: '開始拍照' })).toBeVisible();
  expect(errors).toEqual([]);
});
