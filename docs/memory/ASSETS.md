# SnapStrip v2 Asset Policy

更新時間：2026-08-28

## Core pack

- 路徑：`packs/core-kawaii/stickers`
- 來源：`/Users/eric/script/snapstrip/packs/core-kawaii/stickers`
- 內容：v1 A-line 原創貼圖。
- manifest：`packs/core-kawaii/stickers/manifest.json`
- 體積：約 122MB。
- 授權：v1 標示 `original`。
- 所有 build 都包含。

## Fan IP pack

- 路徑：`packs/fan-ip/**`
- 用途：本機/密碼保護 Render fat build 使用的熱門 IP 貼圖。
- 版權狀態：`private-personal-use`，不是正式授權。
- 公開 build 必須排除。
- 不得放進 `public/`。
- 不得讓公開版複製到 `dist/packs/fan-ip`。
- 若 `snapstrip-fat` 採用一般 build，fan-ip 是靜態可下載檔案，前端密碼不等於
  伺服器端保護。

## Frame template pack

- 路徑：`packs/templates/demo/templates`
- 檔案：`template-<layoutId>-demo.png`
- 內容：本專案原創、低干擾的版型專屬示範模板。
- 每張都是 1440px 寬 RGBA PNG，照片 slot 區域全透明。
- 不烘焙任何 IP 角色、文字或大面積圖案。
- 是完整畫布蓋在照片上方的前景層，不是使用者可編輯的 sticker placement。
- 一般 build 與 `build:public` 都包含，因為檔案是原創資產。
- 生成與驗證工具：`tools/generate-demo-template-pngs.mjs`。

模板槽位規則：

- slot geometry 由 `src/app/layouts.ts` 決定，模板 PNG 不重複宣告。
- slot 內 alpha 必須為 0。
- 裝飾只能畫在 slot 外圍、外框邊緣與整張畫布的留白區。
- 必須符合 `docs/memory/TEMPLATE_FORMAT.md` 的每種版型高度。

## Author avatar

- 路徑：`public/author/eric.jpg`
- 原始來源：使用者提供的上傳圖片。
- 解析度：1024×1024 JPEG。
- 僅在 `/about` 使用。
- 不得用於首頁 demo strip 或產品示範。

## Favicon

- 路徑：`public/icons/icon.svg`
- 來源：v1 `public/icons/icon.svg`。

## 不得做的事

- 不從 Picapica 網站直接下載素材。
- 不臨摹受版權角色造型再宣稱原創。
- 不用 AI 生成 Hello Kitty、Cinnamoroll 等精確受版權角色。
- 不把 fan-ip pack 放進 public build。
- 不把使用者未追蹤的 `template_refrence/` 或 `template_preview/` 複製進
  `packs/templates`。
