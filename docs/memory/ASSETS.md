# SnapStrip v2 Asset Policy

更新時間：2026-08-28

## 資產來源

### Core pack

- 路徑：`packs/core-kawaii/stickers`
- 來源：`/Users/eric/script/snapstrip/packs/core-kawaii/stickers`
- 內容：v1 A-line 原創貼圖。
- manifest：`packs/core-kawaii/stickers/manifest.json`
- 體積：約 122MB。
- 授權：v1 標示 `original`。
- 所有 build 都包含。

### Fan IP pack

- 路徑：`packs/fan-ip/**`
- 用途：本機個人使用的熱門 IP 貼圖。
- 版權狀態：`private-personal-use`。
- 公開 build 必須排除。
- 不得放進 `public/`。
- 不得讓 Render 公開版複製到 `dist/packs/fan-ip`。
- 已在 `.gitignore` 排除，避免將第三方 IP 資產提交到版本控制。

2026-08-26 例外：使用者明確要求 `snapstrip-fat.onrender.com` 包含 Sanrio 素材。
`snapstrip-fat` 的 `deploy` branch 已追蹤 fan-ip，Render build 改為 `pnpm build`。
`snapstrip-v2` 的 `main` 仍保持 code-only，公開 build 指令仍可排除 fan-ip。

### Frame template pack

- 路徑：`packs/templates/fan-ip`
- 48 個 style background/frame SVG 是本專案原創的版型限定主题背景與風格邊框，
  每個 layout 提供 3 個自己的 style，不再讓 8 個 layout 共用同一組通用風格。
- 8 個 `frame-<layout>.svg` 供 blank 可選色模板使用。
- `decorations.itemId` 只引用既有 `packs/fan-ip` 貼圖，不複製角色 asset。
- 每個 `layoutId` 提供 3 styles × 13 IP 的 style template，以及 1 個 blank
  可選色 template；合計 320 筆 manifest entries。
- `film` 只存在於 `vertical`、`classic`、`horizontal`、`wide` 四種長條版型；
  grid/square/bento/portrait-grid 不會出現 film。
- 每張 style template 使用 3 張同一 IP 的較大貼圖，不能混搭不同 IP。
- 每個 layout 可透過「版型專屬風格 + 角色系列」選到全部 13 個 fan-ip collection。
- `mono` style 的 template decorations 使用 grayscale render。
- normal/Render fat build 包含；`build:public` 排除整個 template pack。
- 生成參考工具：`tools/generate-frame-templates.mjs`。

### Author avatar

- 路徑：`public/author/eric.jpg`
- 原始來源：使用者提供的上傳圖片。
- 解析度：1024×1024 JPEG。
- 僅在 `/about` 使用。
- 不得用於首頁 demo strip 或產品示範。

### Favicon

- 路徑：`public/icons/icon.svg`
- 來源：v1 `public/icons/icon.svg`。

## Fan pack 品質門檻

- PNG 或 WebP 有透明 alpha。
- 主體完整，不裁切。
- 無明顯浮水印。
- 尺寸至少約 500×500，再正規化到 1024×1024。
- 每 pack id 唯一、kebab-case。
- 每筆有 sha256 與來源 URL。

## 不得做的事

- 不從 Picapica 網站直接下載素材。
- 不臨摹受版權角色造型再宣稱原創。
- 不用 AI 生成 Hello Kitty、Cinnamoroll 等精確受版權角色。
- 不把 fan-ip pack 放進 public build。
