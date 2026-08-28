# SnapStrip v2 Architecture

更新時間：2026-08-28

## 目錄

```text
src/
  app/                  domain types, layout geometry, Zustand session
  components/           app shell and shared components
  data/                 sticker and frame-template runtime loading
  features/
    showcase/           welcome demo strip
    capture/            capture/upload flow
    editor/             sticker editor, tone panel, gesture math, export
    templates/          real-photo frame-template preview
  i18n/                 lightweight zh-Hant/en provider
  lib/                  pure helpers and shared canvas renderer
  pages/                route pages
  test/                 Vitest setup
packs/
  core-kawaii/          copied from v1, included in every build
  core-effects/         generated original SVG effects, included in every build
  fan-ip/               local-only popular IP packs, excluded from public build
  templates/demo/       original full-canvas PNG templates, included every build
public/
  author/eric.jpg       author avatar
  icons/icon.svg        favicon
docs/memory/            long-term handoff memory
```

## 核心型別

見 `src/app/types.ts`：

- `Locale = 'zh-Hant' | 'en'`
- `LayoutId = 'grid' | 'square' | 'bento' | 'portrait-grid' | 'vertical' |
  'classic' | 'horizontal' | 'wide'`
- `PhotoShot`：`id`、`dataUrl`、`width`、`height`、`source`
- `PhotoTransform`：`scale`、`offsetX`、`offsetY`
- `StickerPlacement`：正規化座標與變換
  - `x/y`：0–1，以完整畫布為基準
  - `scale`：以 `displaySize` 為基準
  - `rotation`：度數
  - `z`：越大越上層
- `ToneId`：`original`、`pastel`、`warm`、`cool`、`cream`、`mono`
- `FrameTemplate`：`id`、`layoutId`、`name`、`src`

## 版型

`src/app/layouts.ts` 提供 8 個四格版型：

| Layout | 形狀 |
| --- | --- |
| `grid` | 2×2，4:3 |
| `square` | 2×2，1:1 |
| `bento` | 左大右三的非均勻混搭 |
| `portrait-grid` | 2×2，3:4 |
| `vertical` | 1×4，4:3 |
| `classic` | 1×4，3:4 |
| `horizontal` | 4×1，3:4 |
| `wide` | 4×1，16:9 |

同一份 geometry 同時供版型卡預覽、相機裁切、模板 PNG 與 canvas 匯出使用。
模板不再重複宣告 slot geometry。

## 狀態

`src/app/session.ts` 使用 Zustand：

- `layoutId`
- `templateId: string | null`
- `toneId`
- `toneIntensity`
- `shots`
- `photoTransforms`
- `stickers`
- `past` / `future`

Actions：

- `setLayout()`：重置 template、tone、shots、photoTransforms、stickers 與 history。
- `setFrameTemplate(templateId)`：只更新模板，不重置 tone。
- `setTone(toneId)` 與 `setToneIntensity(value)`：獨立更新色調。
- `setShots()`：初始化四張照片的 photos transforms。
- 貼圖 add/update/duplicate/remove/layer/undo/redo。

## 模板載入

`src/data/templates.ts` 使用：

```ts
import.meta.glob<string>('../../packs/templates/*/templates/template-*.png', {
  eager: true,
  import: 'default',
});
```

標準檔名：

```text
template-<layoutId>-<slug>.png
```

例如：

```text
packs/templates/demo/templates/template-grid-demo.png
```

Loader：

- 從檔名解析 layoutId。
- 只接受 `layoutId` 屬於 8 個現有版型的檔名。
- 忽略不支援的字元、未知版型與非 PNG 檔案。
- 依 template id 去重。
- slug 自動產生繁中/英文名稱。
- 不需要 manifest、註冊表或 UI 修改。

`buildFrameTemplates()` 是純函式，可由測試注入假來源。
`getFrameTemplatesForLayout()` 與 `getFrameTemplate()` 供頁面和 renderer 查詢。

## 色調

`src/data/tones.ts`：

- `TONE_PRESETS`：6 種預設。
- `DEFAULT_TONE_INTENSITY = 0.8`
- `toneCss(toneId, intensity)`：唯一色調定義。
- `original` 回傳 `none`。
- 強度會 clamp 到 `0–1`。

色調只作用於最終合成影像。Editor canvas 與每張使用者貼圖使用相同 CSS filter；
選取框、旋轉/縮放 handle 不套 filter。PNG export 在照片、模板、貼圖全部畫完後，
把 tone filter 套到輸出 canvas。

## Render Pipeline

`src/lib/strip.ts` 提供共用 canvas pipeline：

```text
白色底
  → 照片 slot 底色
  → 四張照片（含 photoTransforms）
  → 透明模板 PNG
  → 使用者貼圖（依 z 排序）
  → 最終色調
```

- `stripSize()` 與 `slotRects()`：決定整張畫布與照片位置。
- `loadImageCached()`：快取照片、模板與貼圖 image。
- `drawStripBase()`：白底、照片與模板。
- `drawSticker()`：使用者貼圖。
- `renderStrip()`：完整合成並套用 tone。
- `paintStripBaseToCanvas()`：Editor stage 底圖使用，避免每幀重設 full canvas。

模板只疊在照片上方。模板 PNG 內的裝飾不是 user sticker，不可選取、不可編輯，
也不會進入 sticker history。

## 模板 PNG 規範

模板必須是：

- `packs/templates/<pack>/templates/template-<layoutId>-<slug>.png`
- 完整畫布、RGBA、透明底。
- 1440px 寬，高度依版型表。
- 所有照片 slot 區域 alpha 為 0。
- 裝飾只繪在 slot 外圍與完整畫布留白區。
- 內容縮放到整張畫布，不加入自己的固定尺寸或照片 slot 定義。

每種版型高度：

| layout | height |
| --- | --- |
| grid | 1131 |
| square | 1440 |
| bento | 1440 |
| portrait-grid | 1853 |
| vertical | 4237 |
| classic | 7294 |
| horizontal | 508 |
| wide | 289 |

`tools/generate-demo-template-pngs.mjs` 使用 Playwright canvas 生成並驗證 8 張
示範 PNG；若 slot 有任何非透明像素即失敗。

## 貼圖載入

`src/data/stickers.ts` 用 `import.meta.glob` 載入 core 與 fan-ip manifest。
`__VITE_PUBLIC_BUILD__` 為 true 時 fan-ip manifest 不進入 bundle。
`assetUrl()` 將 repo-relative manifest path 轉為公開 URL。

## Build 分離

`vite.config.ts`：

- `pnpm build`：複製 core、effects、templates 與 fan-ip。
- `pnpm build:public`：只複製 core、effects 與 templates；不複製 fan-ip。
- 模板現在是原創資產，因此兩個 build 都包含。

## 路由

`src/App.tsx` 使用 `BrowserRouter`：

- `/`：Welcome
- `/about`：作者簡介
- `/layout`：版型選擇
- `/capture`：相機連拍/上傳
- `/frame`：模板選擇
- `/editor`：色調、照片調整與貼圖編輯
- `*`：NotFound
