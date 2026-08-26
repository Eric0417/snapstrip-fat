# SnapStrip v2 交接記憶

更新時間：2026-08-26 02:20 CST

## 專案目標

在 `/Users/eric/script/snapstrip_v2` 從零打造 SnapStrip v2：

- 參考 `https://picapicabooth.com/picapica-welcome` 的歡迎頁風格。
- v2 是實際可用的拍貼機，不是個人作品展示頁。
- 保留 v1 最受喜愛的貼圖系統：1024 個原創貼圖、分類搜尋、拖曳/縮放/旋轉/翻轉編輯。
- 另加入熱門 IP 貼圖，例如 Hello Kitty 與玉桂狗/Cinnamoroll。
- 首頁底部只有一個「Made by Eric」按鈕，導航到作者簡介頁。
- 作者是 Eric，中學生，GitHub `Eric0417`。頭像只允許出現在作者簡介頁。

## 已確認的決定

詳見 `DECISIONS.md`。最重要的限制：

1. v2 使用全新精簡專案，不沿用 v1 主程式碼，只沿用原創貼圖資產。
2. 第一版範圍：Welcome、作者頁、版型選擇、四格相機連拍、貼圖編輯、PNG 匯出。
3. 濾鏡、相框、PWA、8 語系、相簿先不做。
4. 語言只有繁體中文與英文。
5. 熱門 IP 貼圖放在本地專用 pack，`build:public` 時自動排除，Render 公開版不包含。
6. 照片只在本機處理、無後端、無廣告。
7. 作者頭像不得用於首頁示範圖；示範圖用原創貼圖組成。

## 目前進度

### 已完成

- 建立 React 19 + Vite 6 + TypeScript + Tailwind 4 專案骨架。
- 已執行 `pnpm install` 並通過 `pnpm typecheck`。
- 完成 Welcome、作者頁、版型選擇、相機連拍、上傳 fallback。
- 版型系統改為 8 個明確 slot geometry 的版型，版型卡使用 SVG
  `viewBox + preserveAspectRatio`，預覽比例與實際匯出比例一致。
- 完成貼圖編輯器：
  - 1024 core 貼圖 + 206 fan-ip 貼圖。
  - 分類、搜尋、分頁載入。
  - 拖曳、縮放、旋轉、翻轉、複製、刪除、圖層、undo/redo。
  - Canvas 匯出 PNG，預覽與匯出共用同一組 geometry。
- 編輯器 stage 現在會依可視高度縮放，直式長版型不再撐滿整頁高度。
- 新增貼圖時會把目前可視區域中心換算成畫布座標，而不是固定使用
  `x=0.5,y=0.5` 的絕對中心。
- 貼圖拖曳改為 `transform` 定位並用 `requestAnimationFrame` 節流，
  縮放/旋轉更新最多每幀一次。
- 已移除編輯器側邊欄的貼圖 Size/Rotate 滑桿；改為單指拖移、雙指捏合縮放與
  旋轉，並保留角落 handle。滑鼠/觸控操作仍以每幀一次更新。
- 旋轉 handle 改為直接使用「貼圖中心 → 滑鼠/手指位置」的絕對夾角，手指
  移動到哪個角度，貼圖就朝向哪個角度。
- 旋轉中心已改為加上 stage 的 viewport `left/top`，修復原先 stage 相對座標與
  滑鼠絕對座標混用造成的角度偏差。
- 新增照片選取與調整：每格照片可縮放 0.8x–2.5x，並做水平/垂直平移，
  預覽與匯出共用 `photoTransforms`。
- 照片底圖改用 image cache 與不重設 canvas 的 paint 流程，調整照片參數時
  不會重新載入圖片，減少畫面閃爍。
- 貼圖縮放/旋轉/平移計算已抽離到 `src/features/editor/gestureMath.ts`，
 以 pointerdown 鎖定的基準值計算 delta；EditorStage 只負責 Pointer Capture
  與 requestAnimationFrame 排程。
- 建立 13 個 fan-ip packs：Hello Kitty、Cinnamoroll、My Melody、Kuromi、
  Pompompurin、Little Twin Stars、Miffy、Rilakkuma、Sumikko Gurashi、
  Pusheen、Kirby、Snoopy、Mickey Mouse。
- 建立 20 個原創 `core-effects` 特效 SVG，包含貓耳、兔耳、熊耳、狐狸耳、
  花環、皇冠、光環、天使翅膀、惡魔角、巫師帽、派對帽、公主頭冠、三種眼鏡、
  鬍子、腮紅、閃亮光暈、仙子星塵與生日帽。
- 特效只作為編輯器「特效」分類中的普通貼圖，使用者可新增、拖曳、縮放、
  旋轉、翻轉或刪除，不參與相機即時預覽或自動套用。
- 完成 local/public build 分離並驗證：
  - 本機 build 包含 `packs/fan-ip`，206 張主圖。
  - `pnpm build:public` 不包含 fan-ip 檔案，也不包含 fan-ip 字串。
- 依使用者後續要求，`snapstrip-fat` Render 公開站已改為包含 fan-ip，
  build command 使用 `pnpm build`；此設定會公開第三方 IP 素材。
- 完成單元測試與 Playwright：
  - 24 個 Vitest tests。
  - 6 個 E2E tests，包含桌面/手機上傳流程、fake camera 四連拍與直式 stage fit。
- 已建立：
  - `src/app/types.ts`
  - `src/app/layouts.ts`
  - `src/app/session.ts`（Zustand 狀態）
  - `src/data/stickers.ts`（貼圖 manifest 動態載入）
  - `src/i18n/LanguageContext.tsx`（繁中/英文）
  - `src/components/AppShell.tsx`
  - `src/pages/{HomePage,LayoutPage,AboutPage,NotFoundPage}.tsx`
  - `src/pages/{CapturePage,EditorPage}.tsx`（目前是佔位）
  - `src/features/showcase/DemoStrip.tsx`
  - `src/styles.css`
- 從 v1 複製 `packs/core-kawaii/stickers`：約 122MB、2081 個檔案、1024 筆 manifest。
- 將使用者提供的頭像複製到 `public/author/eric.jpg`。
- 將 v1 的 `public/icons/icon.svg` 複製到 `public/icons/icon.svg`。
- 建立 fan-ip 本地 pack 目錄 `packs/fan-ip/`。

### 目前狀態

- 核心功能已完成，尚未發現已知 bug。
- 尚未在真實手機上測試相機權限；fake camera 已通過。
- 尚未加入 Render 部署設定。

## 下一步優先順序

1. 在真實手機與桌面上手動走一次相機流程。
2. 若要部署 Render，依 `docs/DEPLOYMENT.md` 建立只含原創素材的 deploy branch。
   熱門 IP/Sanrio pack 不得放進公開 deploy。
3. 若首包效能重要，可把 Editor/Capture 改成 lazy route 或拆 manifest chunk。

## 已知風險

- `packs/core-kawaii` 很大，`vite build` 會複製整個 pack 到 dist；不要改成在 public 內重複放置。
- Vite build 對 1.1–1.3MB 的單一 JS chunk 發出 warning；目前功能正常，非 bug。
- fan-ip 貼圖已完成格式與 alpha 自動驗證，但未做逐張人工視覺放大審核。
- Render 是公開 static site；公開 build 必須確定熱門 IP 被排除。
- 相機權限只能由使用者實機測試，headless 測試只證明非相機流程。

## 交接指令

接手時先執行：

```bash
cd /Users/eric/script/snapstrip_v2
cat AGENTS.md
pnpm typecheck
pnpm dev
```

不要重複安裝或重新複製 `packs/core-kawaii`，除非使用者明確要求。
