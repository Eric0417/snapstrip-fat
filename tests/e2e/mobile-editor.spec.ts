import { expect, test, type Page } from '@playwright/test';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nGQAAAAASUVORK5CYII=',
  'base64',
);

const files = [1, 2, 3, 4].map((index) => ({
  name: `photo-${index}.png`,
  mimeType: 'image/png',
  buffer: png,
}));

async function enterEditor(
  page: Page,
  viewport: { width: number; height: number },
  layoutName = '四格方格',
) {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    window.sessionStorage.setItem('snapstrip-authorized', '1');
  });
  await page.goto('/layout');
  await page.getByRole('button', { name: layoutName }).click();
  await page.getByRole('button', { name: '繼續' }).click();
  await page.setInputFiles('input[type="file"]', files);
  await page.waitForURL(/\/frame$/);
  await page.locator('.template-option').first().click();
  await page.getByRole('button', { name: '繼續' }).click();
  await page.waitForURL(/\/editor$/);
  await expect(page.locator('.editor-page')).toBeVisible();
}

test('mobile editor keeps the canvas and sticker visible in small phone viewports', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    await enterEditor(page, viewport);
    await expect(page.locator('.mobile-editor-tabs')).toBeVisible();
    await expect(page.locator('.mobile-editor-drawer')).toHaveCount(0);
    await expect(page.locator('.mobile-editor-topbar')).toBeVisible();
    await expect(page.locator('.app-nav')).toHaveCSS('display', 'none');
    await page.locator('.mobile-editor-tabs').getByRole('button', { name: '貼圖' }).click();
    await expect(page.locator('.mobile-editor-drawer')).toBeVisible();

    const shell = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const bounds = element.getBoundingClientRect();
        return {
          top: bounds.top,
          bottom: bounds.bottom,
          left: bounds.left,
          right: bounds.right,
        };
      };
      const stage = rect('.editor-stage');
      const drawer = rect('.mobile-editor-drawer');
      return {
        noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth,
        noPageOverflow: document.documentElement.scrollHeight <= window.innerHeight,
        stageVisibleHeight:
          stage && drawer
            ? Math.max(0, Math.min(stage.bottom, drawer.top) - stage.top)
            : 0,
      };
    });

    expect(shell.noHorizontalOverflow).toBe(true);
    expect(shell.noPageOverflow).toBe(true);
    expect(shell.stageVisibleHeight).toBeGreaterThan(0);
    expect(shell.stageVisibleHeight).toBeGreaterThan(120);

    await page.locator('.mobile-editor-drawer .sticker-grid').scrollIntoViewIfNeeded();
    await page.locator('.sticker-thumb').first().click();
    await expect(page.locator('.sticker-selection.is-selected')).toHaveCount(1);
    await expect
      .poll(() =>
        page.locator('.mobile-editor-drawer').evaluate((element) => element.scrollTop),
      )
      .toBeLessThanOrEqual(1);

    const placed = await page.evaluate(() => {
      const sticker = document.querySelector('.sticker-selection.is-selected');
      const drawer = document.querySelector('.mobile-editor-drawer');
      if (!sticker || !drawer) return null;
      const stickerRect = sticker.getBoundingClientRect();
      const drawerRect = drawer.getBoundingClientRect();
      return {
        intersectsViewport:
          stickerRect.top < window.innerHeight &&
          stickerRect.bottom > 0 &&
          stickerRect.left < window.innerWidth &&
          stickerRect.right > 0,
        aboveDrawer: stickerRect.top < drawerRect.top,
      };
    });

    expect(placed).not.toBeNull();
    expect(placed?.intersectsViewport).toBe(true);
    expect(placed?.aboveDrawer).toBe(true);

    const touchTargets = await page.evaluate(() => {
      const selectors = [
        '.mobile-editor-tabs button',
        '.mobile-editor-close',
        '.editor-toolbar .tool-icon',
        '.category-row button',
        '.load-more-button',
        '.sticker-thumb',
        '.sticker-handle',
        '.photo-slot-hitbox',
        '.selected-sticker-controls button',
      ];
      const sizes: Array<{ selector: string; width: number; height: number }> = [];
      for (const selector of selectors) {
        for (const element of document.querySelectorAll(selector)) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            sizes.push({ selector, width: rect.width, height: rect.height });
          }
        }
      }
      return sizes.filter(
        (item) => Math.round(item.width) < 44 || Math.round(item.height) < 44,
      );
    });
    expect(touchTargets).toEqual([]);

    await page.locator('.mobile-editor-tabs').getByRole('button', { name: '風格' }).click();
    await expect(page.locator('.mobile-editor-drawer .tone-panel')).toBeVisible();

    const toneTargets = await page.evaluate(() => {
      const sizes: Array<{ selector: string; width: number; height: number }> = [];
      for (const selector of ['.tone-preset', '.tone-intensity input']) {
        for (const element of document.querySelectorAll(selector)) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            sizes.push({ selector, width: rect.width, height: rect.height });
          }
        }
      }
      return sizes.filter(
        (item) => Math.round(item.width) < 44 || Math.round(item.height) < 44,
      );
    });
    expect(toneTargets).toEqual([]);

    await page.locator('.mobile-editor-tabs').getByRole('button', { name: '照片' }).click();
    await expect(page.locator('.mobile-editor-drawer .photo-adjust-panel')).toBeVisible();
    await page.locator('.photo-picker button').first().click();
    await expect(page.locator('.reset-photo-button')).toBeVisible();

    const photoTargets = await page.evaluate(() => {
      const selectors = ['.photo-picker button', '.reset-photo-button', '.range-controls input'];
      const sizes: Array<{ selector: string; width: number; height: number }> = [];
      for (const selector of selectors) {
        for (const element of document.querySelectorAll(selector)) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            sizes.push({ selector, width: rect.width, height: rect.height });
          }
        }
      }
      return sizes.filter(
        (item) => Math.round(item.width) < 44 || Math.round(item.height) < 44,
      );
    });
    expect(photoTargets).toEqual([]);

    await page.locator('.mobile-editor-close').click();
    await expect(page.locator('.mobile-editor-drawer')).toHaveCount(0);
    const centered = await page.evaluate(() => {
      const stage = document.querySelector('.editor-stage')?.getBoundingClientRect();
      const topbar = document.querySelector('.mobile-editor-topbar')?.getBoundingClientRect();
      return Boolean(stage && topbar && stage.top > topbar.bottom + 50);
    });
    expect(centered).toBe(true);
    await page.locator('.mobile-editor-back').click();
    await expect(page).toHaveURL(/\/frame$/);
  }
});

test('desktop editor keeps the two-column sidebar', async ({ page }) => {
  await enterEditor(page, { width: 1440, height: 900 });
  await expect(page.locator('.editor-sidebar')).toBeVisible();
  await expect(page.locator('.mobile-editor-tabs')).toHaveCount(0);
  await expect(page.locator('.sticker-thumb')).toHaveCount(96);
  const grid = await page.locator('.sticker-grid').evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(grid.scrollHeight).toBeLessThanOrEqual(grid.clientHeight + 1);
});

test('mobile sticker controls stay usable on extreme layouts', async ({ page }) => {
  for (const layoutName of ['直式拍立得', '經典長條', '橫式四連拍', '寬版電影條']) {
    await enterEditor(page, { width: 320, height: 568 }, layoutName);
    await expect(page.locator('.photo-slot-hitbox')).toHaveCount(4);
    const clearance = await page.evaluate(() => {
      const tabs = document.querySelector('.mobile-editor-tabs');
      const slots = [...document.querySelectorAll('.photo-slot-hitbox')];
      if (!tabs || slots.length === 0) return null;
      const tabsTop = tabs.getBoundingClientRect().top;
      const lastSlotBottom = Math.max(
        ...slots.map((slot) => slot.getBoundingClientRect().bottom),
      );
      return { tabsTop, lastSlotBottom };
    });
    expect(clearance).not.toBeNull();
    expect(clearance!.lastSlotBottom).toBeLessThanOrEqual(clearance!.tabsTop + 1);

    await page.locator('.mobile-editor-tabs').getByRole('button', { name: '貼圖' }).click();
    await page.locator('.mobile-editor-drawer .sticker-grid').scrollIntoViewIfNeeded();
    await page.locator('.sticker-thumb').first().click();
    await expect(page.locator('.selected-sticker-controls')).toBeVisible();
    const before = await page.locator('.sticker-selection.is-selected').evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, left: rect.left };
    });

    await page.getByRole('button', { name: '向右移動' }).click();
    await expect
      .poll(() =>
        page.locator('.sticker-selection.is-selected').evaluate((element) => {
          return element.getBoundingClientRect().left;
        }),
      )
      .toBeGreaterThan(before.left);

    await page.getByRole('button', { name: '放大貼圖' }).click();
    await expect
      .poll(() =>
        page.locator('.sticker-selection.is-selected').evaluate((element) => {
          return element.getBoundingClientRect().width;
        }),
      )
      .toBeGreaterThan(before.width);

    await page.getByRole('button', { name: '向左旋轉' }).click();
    await expect(page.locator('.sticker-transform')).toHaveAttribute(
      'style',
      /rotate\(/,
    );
  }
});
