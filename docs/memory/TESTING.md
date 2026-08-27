# SnapStrip v2 Testing

更新時間：2026-08-28

## 指令

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm build:public
pnpm test:e2e
pnpm dev
```

## 目前結果

- `pnpm typecheck`：通過。
- `pnpm test`：7 files / 30 tests 通過。
- `pnpm test:e2e`：6 tests 通過，包含桌面/手機 upload flow、fake camera flow 與直式 stage fit。
- `pnpm build`：通過，本機 dist 包含 core + fan-ip。
- `pnpm build:public`：通過，public dist 排除 fan-ip。

## Fake camera

Playwright 使用 `tests/fixtures/face.y4m` 與 Chromium fake device flags。

## 測試策略

- 純邏輯：Vitest small unit tests。
- React 元件：Testing Library + jsdom。
- 關鍵使用者流程：Playwright。
- 相機流程：Playwright fake device + manual real-device test。

## 需要測試的純邏輯

- `src/app/layouts.ts`
- `src/app/session.ts`
- `src/data/templates.ts`
- sticker manifest 篩選/分類
- frame-template loader、每個 layout 的 5 styles + 1 blank、sticker reference
  與 id 唯一性
- capture 倒數狀態
- camera track cleanup
- sticker hit testing/transform
- history undo/redo
- canvas export 的 slot geometry 與貼圖 transform
- canvas template 圖層順序：background → photos → frame → decorations

## 桌面/手機驗證

- 1440×900：完整流程。
- 390×844：完整流程。
- 320×568：檢查按鈕與文字不溢出。

## 公開 build 檢查

```bash
pnpm build:public
test ! -d dist/packs/fan-ip
if rg -q 'hello-kitty|cinnamoroll|kuromi' dist/assets/*.js; then exit 1; fi
```

公開 build 也應以 Playwright 確認貼圖編輯器只顯示 core pack。

## Frame Template 驗證

- `/frame` 使用實際 shots 產生非空白 large preview，render target 為 640px。
- 空白模板在 8 個色票切換後 canvas 底色同步改變。
- 40 個 style/layout 組合逐一檢查非空白 canvas、page overflow 與 console error。
- 每個 layout 在 1440×900 與 390×844 檢查 5 個 style 選項、色票與 page 不水平溢出。
- E2E 流程必須經過 `/frame` 後才進入 `/editor`。
- `pnpm build` 包含 `dist/packs/templates`；`pnpm build:public` 不包含。
