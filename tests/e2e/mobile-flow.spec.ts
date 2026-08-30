import { expect, test } from '@playwright/test';

test('mobile home keeps the primary entry in the first viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    window.sessionStorage.setItem('snapstrip-authorized', '1');
  });

  await page.goto('/');
  await page.getByRole('button', { name: /English/ }).click();

  const entry = await page.evaluate(() => {
    const start = document.querySelector<HTMLAnchorElement>(
      '.welcome-content a[href="/layout"]',
    )?.getBoundingClientRect();
    const navLinks = document.querySelector('.nav-links');
    return {
      startBottom: start?.bottom ?? 0,
      startHeight: start?.height ?? 0,
      navLinksDisplay: navLinks ? getComputedStyle(navLinks).display : null,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });

  expect(entry.startBottom).toBeLessThanOrEqual(568);
  expect(entry.startHeight).toBeGreaterThanOrEqual(44);
  expect(entry.navLinksDisplay).toBe('none');
  expect(entry.scrollWidth).toBeLessThanOrEqual(entry.innerWidth);
});

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
  const visibleHeadings = await page.evaluate(() =>
    [...document.querySelectorAll('h1')]
      .filter((element) => getComputedStyle(element).display !== 'none')
      .map((element) => element.textContent?.trim()),
  );
  expect(visibleHeadings).toEqual(['選擇你的版型']);

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

test('capture controls stay reachable on a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    window.sessionStorage.setItem('snapstrip-authorized', '1');
  });
  await page.goto('/layout');
  await page.locator('.flow-next-button').click();
  await expect(page).toHaveURL(/\/capture$/);
  await page.getByRole('button', { name: /English/ }).click();

  const controls = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('.capture-controls .pill-button')];
    return {
      buttons: buttons.map((button) => {
        const rect = button.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
        };
      }),
      placeholderText: document.querySelector('.camera-placeholder')?.textContent ?? '',
    };
  });

  expect(controls.buttons.length).toBe(2);
  expect(
    controls.buttons.every(
      (button) => button.top >= 0 && button.bottom <= 568 && button.height >= 44,
    ),
  ).toBe(true);
  expect(controls.placeholderText).not.toContain('camera feed');
});
