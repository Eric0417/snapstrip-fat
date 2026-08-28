# SnapStrip v2 Architecture

更新時間：2026-08-28

## 目錄

```text
src/
  app/                  domain types, layout geometry, Zustand session
  components/           app shell and shared components
  data/                 runtime sticker and frame-template manifest loading
  features/
    showcase/           welcome demo strip
    capture/            capture logic (to be added)
    editor/             sticker editor, spawn-position helper, and compositor export
    templates/          real-photo frame-template preview
  i18n/                 lightweight zh-Hant/en provider
  lib/                  small pure helpers
  pages/                route pages
  test/                 Vitest setup
packs/
  core-kawaii/          copied from v1, included in every build
  core-effects/         generated original SVG effects, included in every build
  fan-ip/               local-only popular IP packs, excluded from public build
  templates/fan-ip/     first-party frame SVG assets and frame-template manifest
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
- `StickerPlacement`：正規化座標與變換
  - `x/y`：0–1，以畫布中心為基準
  - `scale`：以 `displaySize` 為基準
  - `rotation`：度數
  - `z`：越大越上層
- `FrameTemplate`：相框模板定義，綁定 `layoutId`，包含 `kind`、`collection`、
  `collectionOrder`、`collectionName`、`styleId`、`styleName`、`order`、
  `collections`、可選 `backgroundColor`/`accentColor`、`frame` 與 `decorations`
- `TemplateDecoration`：與 `StickerPlacement` 相同座標/變換語意，但只作
  template layer 使用

## 版型

`src/app/layouts.ts` 提供 8 個四格版型：

- `grid`：2×2，4:3
- `square`：2×2，1:1
- `bento`：左大右三的非均勻混搭
- `portrait-grid`：2×2，3:4
- `vertical`：1×4，4:3
- `classic`：1×4，3:4
- `horizontal`：4×1，3:4
- `wide`：4×1，16:9

每個版型使用正規化 `slots` 座標；`layoutBounds()` 回傳總寬高比例。
同一份 geometry 同時供版型卡預覽、相機裁切與 canvas 匯出使用。

## 狀態

`src/app/session.ts` 使用 Zustand：

- `layoutId`
- `templateId`
- `shots`
- `photoTransforms`
- `stickers`
- `past` / `future`
- actions: setLayout, setShots, setPhotoTransform, resetPhotoTransform, addSticker,
  updateSticker, removeStickers, clearStickers, snapshotStickers, undoStickers, redoStickers
- actions 另有 `setFrameTemplate()`；`setLayout()` 會一併清除 `templateId`、
  shots、photoTransforms 與 stickers

拖曳動作開始前應呼叫 `snapshotStickers()`；持續更新只呼叫 `updateSticker()`；高層動作如 add/remove 會自行記錄 history。

新增貼圖時，`src/features/editor/spawn.ts` 會由 stage 與 viewport 的可見交集中心
換算成正規化座標，再交給 `addSticker(itemId, position)`。

照片底圖使用 `loadImageCached()` 快取解碼後的 `HTMLImageElement`；
`paintStripBaseToCanvas()` 只重繪內容，不重設 canvas 尺寸，避免縮放/平移照片時閃爍。

## 貼圖載入

`src/data/stickers.ts`：

- `import.meta.glob('../../packs/core-*/stickers/manifest.json')` 載入 core manifest。
- 本機載入 `packs/fan-ip/**/stickers/manifest.json`。
- `__VITE_PUBLIC_BUILD__` 為 true 時 fan manifests 完全不進入 bundle。
- manifest 路徑型態與 v1 相容。
- `STICKERS` 是排序後的 `StickerAsset[]`。

fan-ip manifest 要求：

```json
[
  {
    "id": "hello-kitty-front",
    "name": {
      "zh-Hant": "Hello Kitty 正面",
      "zh-Hans": "Hello Kitty 正面",
      "en": "Hello Kitty front",
      "ja": "ハローキティ 正面"
    },
    "category": "popular-ip",
    "src": "packs/fan-ip/hello-kitty/stickers/front.png",
    "thumb": "packs/fan-ip/hello-kitty/stickers/front.thumb.webp",
    "size": {"w": 1024, "h": 1024},
    "displaySize": {"w": 256, "h": 256},
    "tags": ["hello-kitty", "popular-ip", "cute"],
    "design": {
      "element": "hello-kitty",
      "colorway": "original",
      "pose": "front",
      "outline": "#FFFFFF",
      "outlineWidth": 3
    },
    "source": "local:fan-ip:<source-url>",
    "license": "private-personal-use",
    "sha256": "<sha256>"
  }
]
```

## 相框模板載入

`src/data/templates.ts`：

- `import.meta.glob('../../packs/templates/**/templates/manifest.json')` 自動載入。
- `__VITE_PUBLIC_BUILD__` 為 true 時模板 manifest 完全不進入 bundle。
- `FRAME_TEMPLATES` 是排序後的 `FrameTemplate[]`。
- `getFrameTemplatesForLayout()` / `getFrameTemplate()` 供流程與 renderer 查詢。

模板 manifest：

- `id` 全域唯一，`layoutId` 必須對應現有 8 個版型。
- 每個 layout 有一個 `kind: blank` 與 `3 styles × 13 IP = 39` 個
  `kind: style` 模板；全專案為 8 blank + 312 style。
- `background` / `frame` 是 full-canvas SVG；每個 style/layout 組合有獨立主題背景
 與風格邊框。每種 layout 的 style asset 是版型專屬設計，`film` 只寫入四種長條
  layout，8 個 blank layout 共用細白框。
- 每個 style/layout 組合的 background/frame asset 給該組合下的 13 個 IP
  template 共用，模板只改變 `decorations`。
- `decorations.itemId` 引用既有貼圖，不複製角色 asset。
- `x/y` 使用完整 export canvas 的 0–1 座標；`scale` 相對 `innerWidth`。
- blank 模板的實際底色由 session `templateColor` 覆寫，可即時切換。
- 每張 style template 的 3 個 decorations 必須全部屬於同一 collection。
- `styleFamily === 'mono'` 的 template decorations 在 render 時套用 canvas
  `grayscale` filter；使用者自行新增的貼圖維持原色。

Canvas render order：

```text
template background
  → photo slot placeholders
  → photos
  → template frame
  → template decorations
  → user stickers
```

`loadFrameTemplate()` 會把 template 的預設 `backgroundColor` 或使用者選擇的
blank color 寫入 `LoadedFrameTemplate`，再交給同一 `drawStripBase()` pipeline。

完整的新增模板格式、每個 layout 的 SVG viewBox、decorations 座標與 scale
建議見 `docs/memory/TEMPLATE_FORMAT.md`。

特效原始素材由 `tools/generate-effects.mjs` 產生到
`packs/core-effects/stickers`。目前 20 個 SVG，都是原創 A-line assets，
可進入公開 build。

## 資產 URL

`src/lib/assetUrl.ts` 會把 manifest 內的 repo-relative path 轉成公開 URL。

## Build 分離

`vite.config.ts` 的 `copyPackAssets`：

- 一般 build 會複製 `packs/core-kawaii`、`packs/core-effects` 和 `packs/fan-ip`。
- 一般 build 另外複製 `packs/templates`；fat/Render `pnpm build` 可完整使用首批模板。
- `VITE_PUBLIC_BUILD=true` 只複製 core packs，不複製 fan-ip。
- `build:public` script 就是公開版建置。

## 路由

`src/App.tsx` 使用 `BrowserRouter`：

- `/`：Welcome
- `/about`：作者簡介
- `/layout`：版型選擇
- `/capture`：相機連拍
- `/frame`：拍照後的相框模板選擇
- `/editor`：貼圖編輯與匯出
- `*`：NotFound
