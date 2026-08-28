# SnapStrip v2 交接記憶

更新時間：2026-08-28

## 專案目標

在 `/Users/eric/script/snapstrip_v2` 從零打造 SnapStrip v2：

- 參考 `https://picapicabooth.com/picapica-welcome` 的歡迎頁風格。
- v2 是實際可用的拍貼機，不是個人作品展示頁。
- 保留 v1 的貼圖系統：原始 1024 個貼圖、分類搜尋、拖曳/縮放/旋轉/翻轉編輯。
- Fan IP 貼圖只在受密碼保護的本機/Render fat 構建中使用；公開版不包含。
- 首頁底部只有一個「Made by Eric」按鈕，導航到作者簡介頁。
- 作者是 Eric，中學生，GitHub `Eric0417`。頭像只允許出現在作者簡介頁。

## 已確認的決定

1. v2 使用全新精簡專案，不沿用 v1 主程式碼，只沿用原創貼圖資產。
2. 語言只有繁體中文與英文。
3. 照片只在本機處理、無後端、無廣告。
4. 流程固定為 `Layout → Capture → 選擇模板 → Editor`。
5. 模板只是一張完整畫布、透明照片 slot 的 PNG，沒有 manifest、IP 裝飾或可編輯
   的 template sticker。
6. 使用者自行新增的貼圖永遠位於模板之上。
7. 畫面風格只是最終色調，不改變版型、照片位置、模板或貼圖座標。
8. 首批 8 張模板使用原創中性示範設計，不使用受版權保護的角色資產。
9. 保留「不套模板」選項。

## 目前進度

### 已完成

- 建立 React 19 + Vite 6 + TypeScript + Tailwind 4 專案骨架。
- 完成 Welcome、作者頁、版型選擇、相機連拍、上傳 fallback、貼圖編輯器與 PNG 匯出。
- 8 個版型使用明確 slot geometry；預覽、相機裁切與 export 共用同一組座標。
- 完成 1024 core 貼圖 + 206 fan-ip 貼圖的載入、搜尋、分頁與編輯功能。
- 完成照片縮放和平移，以及貼圖拖曳、縮放、旋轉、翻轉、圖層與 undo/redo。
- 完成四步模板流程：
  - 「不套模板」可直接進入 Editor。
  - 模板卡片使用當前四張照片即時合成預覽。
  - 模板 PNG 固定疊在照片上方、使用者貼圖下方。
  - 模板不會寫入 user sticker history，也不能被使用者選取或編輯。
- 完成資料夾自動載入模板介面：
  - 路徑：`packs/templates/<pack>/templates/template-<layoutId>-<slug>.png`。
  - 目前使用 `packs/templates/demo/templates/`。
  - loader 驗證 layoutId、去重、忽略不支援檔名，slug 自動產生顯示名稱。
  - 不需要 manifest，重新 build 後即自動出現。
- 完成 8 張原創示範模板 PNG：
  - grid、square、bento、portrait-grid、vertical、classic、horizontal、wide。
  - 每張 1440px 寬、RGBA、照片 slot 區域全透明。
  - 只繪製外框、slot 外圍裝飾、膠卷打孔、小星/愛心/日期等元素。
  - 新增 `tools/generate-demo-template-pngs.mjs`，生成時硬檢查尺寸、RGBA、
    slot 全透明與邊框內容。
- 完成空白設計模板：
  - 8 張全透明 RGBA PNG 放在 `docs/memory/blank_for_design/`。
  - 檔名為 `template-<layoutId>-blank.png`，只供設計參考，不進入 runtime build。
  - 新增 `tools/generate-blank-template-pngs.mjs` 可重新生成。
  - `TEMPLATE_FORMAT.md` 已加入每個版型 4 個照片槽位的 1440px 像素座標、
    right/bottom、外框與 slot 外框建議位置。
- 完成色調系統：
  - 6 種預設：`original / pastel / warm / cool / cream / mono`。
  - 強度 0–100%，預設 80%，`original` 不套濾鏡。
  - `src/data/tones.ts` 的 `toneCss()` 同時供 Editor 預覽與 PNG export。
- 完成渲染順序：
  - 白底 → 照片 slot → 照片 → 透明模板 PNG → 使用者貼圖 → 最終色調。
- 完成 build 分離：
  - `pnpm build` 包含 core、effects、templates，以及 fan-ip。
  - `pnpm build:public` 包含 core、effects、templates，但不包含 fan-ip。
- 已完成驗證：
  - `pnpm typecheck` 通過。
  - `pnpm test`：8 files / 33 tests 通過。
  - `pnpm test:e2e`：桌面與手機共 6/6 通過。
  - `pnpm build` 與 `pnpm build:public` 通過。

### 目前狀態

- 本地功能已完成；沒有已知的模板或色調 product bug。
- 拍照頁「Back」仍會讓使用者誤以為是返回導航，實際是切換鏡頭，且拍照中會
  disabled；這項問題與本次模板/色調變更無關。
- 本次四步流程、8 張模板與色調功能尚未部署到 Render；目前工作區在
  `deploy...fat/deploy` branch，線上站點仍是舊版模板系統。
- `template_refrence/`、`template_preview/` 與
  `tools/export-template-previews.mjs` 屬於使用者本地資料，未納入本次提交，
  後續不要刪除或改寫。
- 舊 `packs/templates/fan-ip` 與 `tools/generate-frame-templates.mjs` 已刪除。

## 下一步優先順序

1. 確認拍照頁「Back」按鈕的預期行為。
2. 在真實手機與桌面上手動走一次相機流程。
3. 在真機上人工審核 8 張版型專屬示範模板的比例、留白與外框細節。
4. 使用者確認新流程及模板視覺後，再將目前 branch 部署到 Render。
5. 若首包效能重要，可把 Editor/Capture 改成 lazy route 或拆 manifest chunk。
6. 寄出版權申請前，先把線上舊版 `snapstrip-fat` 下線或改為密碼保護。
7. 依各權利人回覆，取得正式素材與使用規範後再重新整理 fan-ip。

## 已知風險

- 拍照頁「Back」文字容易誤導；目前它是鏡頭切換按鈕。
- `packs/core-kawaii` 很大，`vite build` 會複製整個 pack 到 dist。
- `template_refrence/` 與 `template_preview/` 是未追蹤的本地素材，可能很大；
  不要把整批檔案複製進 `packs/templates` 或提交到 Render。
- Vite build 對 1.1–1.3MB 的單一 JS chunk 發出 warning；目前功能正常，非 bug。
- Fan IP 素材來源不是官方授權檔案；`private-personal-use` 只是內部分類，不具法律
  授權效力。模板系統本身已不再依賴 fan-ip 角色。
- `snapstrip2026` 是前端審查密碼，不等於伺服器端保護；若直接 URL 仍可取得
  fan-ip，就不應宣稱素材已完整鎖住。
- 相機權限只能由使用者實機測試，headless 測試只證明非相機流程。
- 新增模板 PNG 必須符合 `docs/memory/TEMPLATE_FORMAT.md` 的畫布尺寸，且照片
  slot 區域保持透明；否則會遮住人物或在使用者調整照片後歪斜。

## 交接指令

接手時先執行：

```bash
cd /Users/eric/script/snapstrip_v2
cat AGENTS.md
pnpm typecheck
pnpm dev
```

不要重複安裝或重新複製 `packs/core-kawaii`，除非使用者明確要求。
