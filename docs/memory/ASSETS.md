# SnapStrip v2 Asset Policy

更新時間：2026-08-26 01:54 CST

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

### Author avatar

- 路徑：`public/author/eric.jpg`
- 原始來源：使用者提供的剪貼簿圖片。
- 解析度：696×747 JPEG。
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
