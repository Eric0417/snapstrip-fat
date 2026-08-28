# SnapStrip v2 Testing

更新時間：2026-08-28

## 指令

```bash
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm build:public
node tools/generate-demo-template-pngs.mjs
```

## 目前結果

- `pnpm typecheck`：通過。
- `pnpm test`：8 files / 33 tests 通過。
- `pnpm test:e2e`：6 tests 通過，桌面與手機各 3 個。
- `pnpm build`：通過。
- `pnpm build:public`：通過，`dist/packs/fan-ip` 不存在，`packs/templates` 存在。
- `node tools/generate-demo-template-pngs.mjs`：8 張 PNG 全部通過尺寸、RGBA、
  全 slot 透明與邊框內容檢查。

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
- `src/data/tones.ts`
- sticker manifest 篩選/分類
- capture 倒數狀態
- camera track cleanup
- sticker hit testing/transform
- history undo/redo
- canvas export 的 slot geometry 與貼圖 transform
- canvas template 圖層順序：photo → template PNG → sticker → tone

## 桌面/手機驗證

- 1440×900：完整流程。
- 390×844：完整流程。
- 320×568：檢查按鈕與文字不溢出。

## Template 驗證

- `FRAME_TEMPLATES` 長度為 8。
- 每個 layoutId 各有一張模板。
- template id 唯一。
- 不支援檔名與重複 id 被過濾。
- `/frame` 使用實際 shots 產生非空白模板預覽。
- 模板預覽、Editor 底圖與 PNG export 共用 `renderStrip()`。
- 未選模板時可直接進入 Editor。
- 選模板後模板不寫入 user sticker history。
- 所有 slot 區域 alpha 必須為 0。

## Tone 驗證

- `original` 回傳 `none`。
- 6 種 preset 都存在。
- 強度 0 與 100 的 filter 正確。
- Editor canvas 與貼圖 img 有相同 CSS filter。
- Export 使用 `renderStrip()` 的 tone 邏輯。
- 選取框與 resize/rotate handle 不套色調。

## 公開 build 檢查

```bash
pnpm build:public
test ! -d dist/packs/fan-ip
test -d dist/packs/templates/demo/templates
if rg -q 'hello-kitty|cinnamoroll|kuromi' dist/assets/*.js; then exit 1; fi
```

公開 build 也應以 Playwright 確認貼圖編輯器只顯示 core pack。
