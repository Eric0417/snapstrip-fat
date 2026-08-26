# SnapStrip v2 Decisions

更新時間：2026-08-26 01:54 CST

這些是使用者已確認的決定。除非使用者明確修改，否則不得變更。

## 1. 產品定位

- v2 是完整拍貼機，不是個人網站或作品展示頁。
- 第一版不推出公開個人網站。

## 2. 第一版功能

- Welcome → 選版型 → 相機連拍四張 → 貼圖編輯 → PNG 匯出。
- 保留版型選擇，但先不做進階濾鏡、相框、PWA、8 語系、相簿。
- 首頁、拍貼機、貼圖編輯器、作者簡介頁都要完成。
- 頁尾應有簡短 Privacy 說明（尚未實作，見 TASKS.md）。

## 3. 貼圖系統

- 沿用 v1 全部 1024 個原創貼圖，不挑選縮減。
- 保留搜尋、分類、拖曳、縮放、旋轉、翻轉、刪除、圖層與 undo/redo。
- 允許從網路搜集更多熱門 IP 貼圖。
- 使用者表示不會對外使用，但仍選擇 Render 部署。
- 因此採用本機/Render 雙模式：
  - 本機：包含熱門 IP。
  - `build:public` / Render：排除 `packs/fan-ip/**`。

## 4. 程式基礎

- 全新專案，不沿用 v1 主程式碼。
- 只搬移 v1 的 `packs/core-kawaii/stickers`。
- 技術棧：React 19、Vite 6、TypeScript strict、Tailwind 4、Zustand、React Router 7。
- 無後端、照片全程本機處理。

## 5. 作者資料

- 顯示名：Eric。
- GitHub：`https://github.com/Eric0417`。
- 身份：中學生、SnapStrip 創作者。
- 中文簡介：「我是 Eric，一名中學生，也是 SnapStrip 的創作者。我喜歡用程式把有趣的想法變成作品。」
- 英文簡介：「I’m Eric, a middle school student and the creator of SnapStrip. I love turning fun ideas into things I can build.」
- 頭像檔案：`public/author/eric.jpg`，只在作者頁使用，不得用於其他地方。
- 入口：僅首頁底部「Made by Eric」按鈕，點擊導航 `/about`。

## 6. 視覺方向

- 參考 Picapica welcome：白底/柔粉放射背景、置中排版、黑色描邊膠囊按鈕。
- 同時保留 v1 的粉彩貼圖與白色描邊風格。
- 預設繁中，可切換英文。
- 不加入廣告或捐款功能。

## 7. 品質標準

- 交付前必須沒有已知 bug。
- 需要桌面與手機尺寸測試。
- 相機權限部分最後需使用者在真實手機上驗證。
- 自動測試不得用假通過、`as any` 或放寬斷言來過關。
