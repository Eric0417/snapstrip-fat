# SnapStrip v2 Tasks

更新時間：2026-08-28

## 完成

- [x] 專案 scaffold
- [x] 安裝依賴
- [x] TypeScript typecheck
- [x] 繁中/英文 i18n
- [x] Welcome / About / NotFound
- [x] Layout selection
- [x] Capture page with camera and upload fallback
- [x] Editor with stickers, photo adjustment, undo/redo
- [x] PNG export
- [x] 8 layout slot geometry
- [x] auto-discovery frame-template PNG loader
- [x] 8 original demo templates, one per layout
- [x] 8 blank design templates in `docs/memory/blank_for_design`
- [x] detailed 1440px photo-slot coordinates in `TEMPLATE_FORMAT.md`
- [x] 6 tone presets and intensity slider
- [x] shared render pipeline for preview, editor and export
- [x] desktop and mobile E2E
- [x] local and public build verification
- [x] remove old 320-template manifest system

## 尚未開始

- [ ] 真實手機相機測試
- [ ] 使用者最終視覺審核 8 張示範模板
- [ ] 部署本次四步模板/色調版本到 Render
- [ ] 若需要，Editor/Capture lazy route 與 manifest 拆 chunk

## Flow Acceptance

1. `Layout → Capture → Frame → Editor`。
2. Capture 完成後進入 `/frame`。
3. `/frame` 選「不套模板」或一張模板後進入 Editor。
4. Editor 不再有獨立 `/style` route；畫面風格在 Editor 側欄。
5. 切換版型時重置 template、tone、照片、貼圖與 history。
6. 切換模板不重置 tone。

## Template Acceptance

1. 每種版型至少有一張可用模板，首批 8 張。
2. 模板是完整畫布 RGBA PNG，照片 slot 區域全透明。
3. 模板名稱由 `template-<layoutId>-<slug>.png` 自動產生。
4. 無效 layoutId、非 PNG、重複 id 會被 loader 過濾。
5. 加入新 PNG 不需要 manifest、註冊表或 UI 修改。
6. 模板固定畫在照片之上、使用者貼圖之下。
7. 模板不寫入 user sticker history，也不可被選取或編輯。
8. 留空 `templateId` 代表「不套模板」。

## Tone Acceptance

1. 有 `original / pastel / warm / cool / cream / mono` 六種預設。
2. `original` 不套任何 filter。
3. 強度值為 0–100%，預設 80%。
4. 色調只改變最終顏色，不改變照片 slot、模板或貼圖座標。
5. Editor canvas、貼圖與 PNG export 使用同一組 toneCss 規則。
6. 色調切換後 export 與畫面一致。

## Editor Acceptance

1. 沒有 shots 時不允許匯出。
2. 四個照片 slot 以所選版型正確顯示。
3. 貼圖搜尋、分類、縮圖與「載入更多」可用。
4. 貼圖可新增、拖曳、縮放、旋轉、翻轉、刪除。
5. 可調整 z-order。
6. undo/redo 不重複記錄拖曳中間狀態。
7. 匯出 PNG 與預覽共用 render pipeline。
8. 貼圖面板在 1024+ 筆資產下不能一次全載入。

## 完成定義

- `pnpm typecheck` 通過。
- `pnpm test` 通過。
- `pnpm test:e2e` 桌面與手機通過。
- `pnpm build` 通過。
- `pnpm build:public` 通過，且 `dist/packs/fan-ip` 不存在。
- 桌面 1440px 與手機 390px 可走完
  `Layout → Capture/Upload → Frame → Editor → tone → sticker → Export`。
- 無已知 console error 或 pageerror。
- `tools/generate-demo-template-pngs.mjs` 可重新生成並通過 slot 透明檢查。
