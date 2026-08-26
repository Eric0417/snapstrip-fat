# SnapStrip v2 Architecture

更新時間：2026-08-26 01:54 CST

## 目錄

```text
src/
  app/                  domain types, layout geometry, Zustand session
  components/           app shell and shared components
  data/                 runtime sticker manifest loading
  features/
    showcase/           welcome demo strip
    capture/            capture logic (to be added)
    editor/             sticker editor, spawn-position helper, and compositor export
  i18n/                 lightweight zh-Hant/en provider
  lib/                  small pure helpers
  pages/                route pages
  test/                 Vitest setup
packs/
  core-kawaii/          copied from v1, included in every build
  core-effects/         generated original SVG effects, included in every build
  fan-ip/               local-only popular IP packs, excluded from public build
public/
  author/eric.jpg       author avatar
  icons/icon.svg        favicon
docs/memory/            long-term handoff memory
```

## 核心型別

見 `src/app/types.ts`：

- `Locale = 'zh-Hant' | 'en'`
- `LayoutId = 'grid' | 'vertical' | 'horizontal'`
- `PhotoShot`：`id`、`dataUrl`、`width`、`height`、`source`
- `StickerPlacement`：正規化座標與變換
  - `x/y`：0–1，以畫布中心為基準
  - `scale`：以 `displaySize` 為基準
  - `rotation`：度數
  - `z`：越大越上層

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
- `shots`
- `photoTransforms`
- `stickers`
- `past` / `future`
- actions: setLayout, setShots, setPhotoTransform, resetPhotoTransform, addSticker,
  updateSticker, removeStickers, clearStickers, snapshotStickers, undoStickers, redoStickers

拖曳動作開始前應呼叫 `snapshotStickers()`；持續更新只呼叫 `updateSticker()`；高層動作如 add/remove 會自行記錄 history。

新增貼圖時，`src/features/editor/spawn.ts` 會由 stage 與 viewport 的可見交集中心
換算成正規化座標，再交給 `addSticker(itemId, position)`。

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

特效原始素材由 `tools/generate-effects.mjs` 產生到
`packs/core-effects/stickers`。目前 20 個 SVG，都是原創 A-line assets，
可進入公開 build。

## 資產 URL

`src/lib/assetUrl.ts` 會把 manifest 內的 repo-relative path 轉成公開 URL。

## Build 分離

`vite.config.ts` 的 `copyPackAssets`：

- 一般 build 會複製 `packs/core-kawaii`、`packs/core-effects` 和 `packs/fan-ip`。
- `VITE_PUBLIC_BUILD=true` 只複製 core packs，不複製 fan-ip。
- `build:public` script 就是公開版建置。

## 路由

`src/App.tsx` 使用 `BrowserRouter`：

- `/`：Welcome
- `/about`：作者簡介
- `/layout`：版型選擇
- `/capture`：相機連拍
- `/editor`：貼圖編輯與匯出
- `*`：NotFound
