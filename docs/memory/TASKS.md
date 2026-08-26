# SnapStrip v2 Tasks

更新時間：2026-08-26 02:20 CST

## 完成

- [x] 專案 scaffold
- [x] 安裝依賴
- [x] TypeScript typecheck
- [x] core 1024 貼圖搬入
- [x] 貼圖 manifest 載入器
- [x] 繁中/英文 i18n
- [x] Welcome page
- [x] Layout selection page
- [x] About page
- [x] NotFound page
- [x] 作者頭像放入 public/author
- [x] CapturePage 完整流程
- [x] EditorPage 完整流程
- [x] 頁尾 Privacy 簡短說明
- [x] fan-ip 貼圖搜集
- [x] 桌面/手機 E2E
- [x] local build 與 public build 分離驗證

## 尚未開始

- [ ] 真實手機相機測試
- [ ] Render SPA rewrite / 部署設定
- [ ] 若需要，Editor/Capture lazy route 與 manifest 拆 chunk

## Capture Acceptance

1. 進入 `/capture` 後要求相機。
2. 顯示 live preview 與 3 秒倒數。
3. 每次倒數結束自動拍一張。
4. 拍滿 4 張自動進 `/editor`。
5. 拒絕相機權限時提供四張上傳 fallback。
6. 離開頁面時停止所有 media tracks。
7. 照片按所選版型 slot 比例裁切。

## Editor Acceptance

1. 沒有 shots 時不允許匯出。
2. 四個照片 slot 以所選版型正確顯示。
3. 貼圖搜尋、分類、縮圖與「載入更多」可用。
4. 貼圖可新增、拖曳、縮放、旋轉、翻轉、刪除。
5. 可調整 z-order。
6. undo/redo 不重複記錄拖曳中間狀態。
7. 匯出 PNG 與預覽一致。
8. 貼圖面板在 1024+ 筆資產下不能一次全載入。

## 完成定義

- `pnpm typecheck` 通過。
- `pnpm test` 通過。
- `pnpm build` 通過。
- `pnpm build:public` 通過，且 `dist/packs/fan-ip` 不存在。
- 桌面 1440px 與手機 390px 可走完 Welcome → Layout → Capture/Upload → Editor → Export。
- 無已知 console error 或 pageerror。
- dev server 正在本機執行，並提供 URL。
