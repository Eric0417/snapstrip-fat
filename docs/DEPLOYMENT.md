# SnapStrip v2 Deployment

## 素材與 Git 的關係

- `main` 只放應用程式程式碼，`packs/` 被 `.gitignore` 排除。
- 本機 `packs/` 內有：
  - `core-kawaii/`：1024 個原創貼圖，公開部署需要。
  - `core-effects/`：20 個原創特效，公開部署需要。
  - `fan-ip/`：Sanrio 等私人貼圖，不得放進公開網站。
- 本機 build 會包含所有 pack；公開 build 使用 `pnpm build:public`，
 只複製 `core-kawaii` 與 `core-effects`。

## Render 公開部署

Render Static Site 會從 Git branch build，所以公開需要的原創貼圖必須放進一個
deploy branch。

### 1. 建立 deploy branch

```bash
cd /Users/eric/script/snapstrip_v2
git checkout -b deploy origin/main
```

### 2. 只放開原創貼圖資料夾

把 `.gitignore` 的 `packs/` 規則改成：

```gitignore
packs/*
!packs/core-kawaii/
!packs/core-effects/
```

### 3. 分批提交並推送

```bash
git add .gitignore packs/core-effects
git commit -m "chore: add deploy sticker assets"

git add packs/core-kawaii/stickers/manifest.json
git add packs/core-kawaii/stickers/contact-sheets
git commit -m "chore: add core sticker metadata"

# 每種貼圖元素分一個 commit，避免單次 push 過大
for dir in packs/core-kawaii/stickers/*/; do
  git add "$dir"
  git commit -m "chore: add $(basename "$dir") stickers"
done

git push -u origin deploy
```

若 push 遇到 HTTP 408，先提高 buffer 後重試：

```bash
git config http.postBuffer 1073741824
git config http.version HTTP/1.1
git push origin deploy
```

### 4. Render 設定

- Repository：`Eric0417/snapstrip-v2`
- Branch：`deploy`
- Build command：

```bash
pnpm install --frozen-lockfile && pnpm build:public
```

- Publish directory：`dist`

### 5. 設定 SPA fallback

Render 的 redirect/rewrite 規則目前在 Dashboard 設定，無法只靠 repo 檔案完成。
在 Static Site 的 Settings → Redirects/Rewrites 新增：

- Action：`Rewrite`
- Source：`/*`
- Destination：`/index.html`

這樣直接開啟 `/layout`、`/editor` 或重新整理時，Render 會回傳 SPA 首頁，
而實際存在的貼圖、JS、CSS 檔案仍會優先直接提供。

`snapstrip-fat.onrender.com` 已透過 Render API 完成此規則設定。

## 私人 Sanrio 版本

Sanrio/fan-ip 只能放在本機或受密碼保護的私人環境，不要放進 Render 公開 deploy。
若要部署私人版，另建一個 private branch，包含 `packs/fan-ip`，並使用
`pnpm build`，同時在 Render 前端加入自己的登入/密碼保護。

## 不使用 Git 的替代方式

如果目標平台支援直接上傳靜態檔案，例如 Cloudflare Pages 或 Netlify，可本機執行：

```bash
pnpm build:public
```

再把 `dist/` 上傳到平台。這樣不需要把貼圖 pack 放進 Git。
