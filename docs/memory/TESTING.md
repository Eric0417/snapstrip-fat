# SnapStrip v2 Testing

更新時間：2026-08-26 02:20 CST

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
- `pnpm test`：5 files / 19 tests 通過。
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
- sticker manifest 篩選/分類
- capture 倒數狀態
- camera track cleanup
- sticker hit testing/transform
- history undo/redo
- canvas export 的 slot geometry 與貼圖 transform

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
