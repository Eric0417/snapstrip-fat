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
- `pnpm test`：7 files / 35 tests 通過。
- `pnpm test:e2e`：6 tests 通過，包含桌面/手機 upload flow、fake camera flow、
  直式 stage fit，以及切換三種版型專屬風格後仍保留玉桂狗。
- `pnpm build`：通過，本機 dist 包含 core + fan-ip，且 template manifest 為 320 筆。
- `pnpm build:public`：通過，public dist 排除 fan-ip 與 templates。
- 8 個 layout 的首個版型專屬風格均以實際四張照片渲染並檢查非空白。
- 13 個 IP 在 grid `grid-pastel` 模板逐一渲染，確認角色可載入且每張只含單一 IP。
- 以實際 PNG/WebP alpha 內容硬檢查全部 936 個 style decorations（156 張不同角色素材）：
  0 個越過安全區；檢查同時覆蓋 `flipX`、`flipY` 與 rotation。
- mobile 390×844 檢查 13 個角色系列按鈕與 page 無水平 overflow。
- `snapstrip-fat.onrender.com` 桌面 1440×900 與手機 390×844 已走完
  8 個 layout → 3 styles × 13 IP → Editor → PNG export，無 console error、
  pageerror 或水平 overflow；live manifest 為 320 筆。

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
- frame-template loader、每個 layout 的 3 styles × 13 IP + 1 blank、單一 IP
  decorations、sticker reference、film 只侷限在長條 layout
  與 id 唯一性
- capture 倒數狀態
- camera track cleanup
- sticker hit testing/transform
- history undo/redo
- canvas export 的 slot geometry 與貼圖 transform
- canvas template 圖層順序：background → photos → frame → decorations
- template decoration 的實際 alpha bounds、rotation、flip 與 frameSafeRect 邊界

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
- 3 styles × 13 IP 的 style/layout 組合逐一檢查非空白 canvas、單一 IP、
  page overflow 與 console error。
- 每個 layout 在 1440×900 與 390×844 檢查 3 個 style 選項、色票與 page 不水平溢出。
- `grid`/`square`/`bento`/`portrait-grid` 不得出現 film style；
  `vertical`/`classic`/`horizontal`/`wide` 必須出現 film style。
- `/frame` 切換風格時保留目前 IP；`mono` 模板的 3 張角色貼圖為灰階。
- 所有模板 render 後重新量測角色可見 alpha AABB，確認沒有貼圖被畫布或相框裁切。
- E2E 流程必須經過 `/frame` 後才進入 `/editor`。
- `pnpm build` 包含 `dist/packs/templates`；`pnpm build:public` 不包含。
