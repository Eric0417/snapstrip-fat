# SnapStrip v2 Frame Template Format

更新時間：2026-08-28

## 用途

這份文件是「加入/替換相框模板」的唯一格式規範。模板現在不是 manifest 組合，
也不包含角色貼圖、背景 SVG、背景色或可編輯 decoration。它只是一張完整畫布、
透明照片槽位的 RGBA PNG，疊在照片上方。

只要檔名與尺寸正確，重新 build 後 `src/data/templates.ts` 會自動讀取，不需要
修改 TypeScript registry、UI、manifest 或 routes。

## 資料夾與檔名

```text
packs/templates/
  <pack>/
    templates/
      template-<layoutId>-<slug>.png
```

現有範例：

```text
packs/templates/demo/templates/template-grid-demo.png
packs/templates/demo/templates/template-square-demo.png
packs/templates/demo/templates/template-bento-demo.png
packs/templates/demo/templates/template-portrait-grid-demo.png
packs/templates/demo/templates/template-vertical-demo.png
packs/templates/demo/templates/template-classic-demo.png
packs/templates/demo/templates/template-horizontal-demo.png
packs/templates/demo/templates/template-wide-demo.png
```

規則：

- `layoutId` 必須是：`grid`、`square`、`bento`、`portrait-grid`、
  `vertical`、`classic`、`horizontal`、`wide`。
- `slug` 只能是 `[a-z0-9][a-z0-9-]*`。
- 檔名必須是 `template-<layoutId>-<slug>.png`。
- 大小寫不合法，例如 `template-Demo.png` 會被忽略。
- 同一個 template id 若出現多次，先掃描到的由 loader 去重保留。
- `slug === 'demo'` 顯示為「示範相框 / Demo frame」；其他 slug 會自動轉為
  以空格分開的 Title Case。

## 完整畫布尺寸

模板寬度固定為 `1440px`，高度必須與該版型的 export canvas 完全一致：

| `layoutId` | PNG width | PNG height | Aspect ratio |
| --- | --- | --- | --- |
| `grid` | 1440 | 1131 | 1.273 |
| `square` | 1440 | 1440 | 1.000 |
| `bento` | 1440 | 1440 | 1.000 |
| `portrait-grid` | 1440 | 1853 | 0.777 |
| `vertical` | 1440 | 4237 | 0.340 |
| `classic` | 1440 | 7294 | 0.197 |
| `horizontal` | 1440 | 508 | 2.835 |
| `wide` | 1440 | 289 | 4.983 |

不要使用 `viewBox` 或比例近似尺寸；錯誤尺寸會被直接拉伸到畫面，造成模板與
照片錯位。

## 鏤空位置與照片槽位像素座標

模板 PNG 的「鏤空」就是照片槽位：這些矩形內的所有像素 alpha 必須等於 `0`。
以下座標是 `src/lib/strip.ts` 在 `targetWidth = 1440` 時的實際輸出，設計時
直接照抄即可，不要依賴自己的版型草圖估算。

通用常數：

```text
canvas width  = 1440
canvas padding = 65
inner width    = 1310
```

座標公式：

```text
x      = 65 + normalized.x * 1310
y      = 65 + normalized.y * 1310
width  = normalized.width * 1310
height = normalized.height * 1310
```

全部使用 `Math.round()` 後的四個角落：

| Layout | Slot | x | y | width | height | right | bottom |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `grid` | 1 | 65 | 65 | 619 | 464 | 684 | 529 |
| `grid` | 2 | 756 | 65 | 619 | 464 | 1375 | 529 |
| `grid` | 3 | 65 | 601 | 619 | 464 | 684 | 1065 |
| `grid` | 4 | 756 | 601 | 619 | 464 | 1375 | 1065 |
| `square` | 1 | 65 | 65 | 619 | 619 | 684 | 684 |
| `square` | 2 | 756 | 65 | 619 | 619 | 1375 | 684 |
| `square` | 3 | 65 | 756 | 619 | 619 | 684 | 1375 |
| `square` | 4 | 756 | 756 | 619 | 619 | 1375 | 1375 |
| `bento` | 1 | 65 | 65 | 760 | 1310 | 825 | 1375 |
| `bento` | 2 | 858 | 65 | 517 | 415 | 1375 | 480 |
| `bento` | 3 | 858 | 513 | 517 | 415 | 1375 | 928 |
| `bento` | 4 | 858 | 960 | 517 | 415 | 1375 | 1375 |
| `portrait-grid` | 1 | 65 | 65 | 619 | 825 | 684 | 890 |
| `portrait-grid` | 2 | 756 | 65 | 619 | 825 | 1375 | 890 |
| `portrait-grid` | 3 | 65 | 962 | 619 | 825 | 684 | 1787 |
| `portrait-grid` | 4 | 756 | 962 | 619 | 825 | 1375 | 1787 |
| `vertical` | 1 | 65 | 65 | 1310 | 983 | 1375 | 1048 |
| `vertical` | 2 | 65 | 1106 | 1310 | 983 | 1375 | 2089 |
| `vertical` | 3 | 65 | 2148 | 1310 | 983 | 1375 | 3131 |
| `vertical` | 4 | 65 | 3189 | 1310 | 983 | 1375 | 4172 |
| `classic` | 1 | 65 | 65 | 1310 | 1747 | 1375 | 1812 |
| `classic` | 2 | 65 | 1871 | 1310 | 1747 | 1375 | 3618 |
| `classic` | 3 | 65 | 3676 | 1310 | 1747 | 1375 | 5423 |
| `classic` | 4 | 65 | 5482 | 1310 | 1747 | 1375 | 7229 |
| `horizontal` | 1 | 65 | 65 | 283 | 378 | 348 | 443 |
| `horizontal` | 2 | 407 | 65 | 283 | 378 | 690 | 443 |
| `horizontal` | 3 | 749 | 65 | 283 | 378 | 1032 | 443 |
| `horizontal` | 4 | 1092 | 65 | 283 | 378 | 1375 | 443 |
| `wide` | 1 | 65 | 65 | 283 | 159 | 348 | 224 |
| `wide` | 2 | 407 | 65 | 283 | 159 | 690 | 224 |
| `wide` | 3 | 749 | 65 | 283 | 159 | 1032 | 224 |
| `wide` | 4 | 1092 | 65 | 283 | 159 | 1375 | 224 |

必須遵守：

- 每個矩形內每一個像素的 alpha 都必須是 `0`，包括邊緣和反鋸齒像素。
- 不要用半透明的底色、白色邊框或陰影蓋住槽位。
- 若要繪製 slot 外框，線條中心必須在槽位外側。
  建議使用 `(x - 22, y - 22, width + 44, height + 44)` 的圓角路徑，線寬約 `9px`。
- 最外層相框建議使用 `(24, 24, 1440 - 48, height - 48)` 的圓角路徑，線寬約 `18px`；
  它會完整落在畫布內，不會被裁切。
- 角落裝飾建議放在外框與照片槽位之間的 `65px` 留白帶，不要進入上面任何槽位。
- 長條版型的膠卷打孔可用 `18 × 30` 的小圓角矩形，放在左右或上下留白帶。

## 圖層語意

固定渲染順序：

```text
白色底
  → 照片 slot
  → 照片
  → 模板 PNG
  → 使用者貼圖
  → 最終色調
```

模板 PNG 的透明區域不會遮住照片；有內容的區域會蓋在照片上方。使用者後續加入的
貼圖永遠在模板之上。

## 透明與安全區

PNG 必須：

- RGBA color type，不是 RGB JPEG。
- 照片 slot 區域所有 alpha 都是 0。
- 全身完整畫布，外框與裝飾都在 `0,0,1440,height` 的邊界內。
- 不要裁切外框、膠卷孔、星點、日期或其他裝飾。
- 不要在 slot 內烘焙人物、文字、大面積底色或照片預覽。

建議：

- 外框與 slot 外框使用約 `20–28px` 的內縮。
- slot 外框線條的中心應在 slot 外側，避免線條壓到照片邊緣。
- 角位裝飾保留在外框與 slot 之間的留白帶。
- 長條版型的膠卷孔放在左右或上下側邊。
- 小裝飾可以增加辨識度，但不要遮住人物臉部。

## 版型槽位

槽位由 `src/app/layouts.ts` 和 `src/lib/strip.ts` 共同決定，模板 PNG 不重複
宣告 slot。標準畫布常數：

- target width：`1440`
- padding：`65`
- innerWidth：`1310`

slot geometry 由版型定義決定：

- `grid`：2×2 橫向方格。
- `square`：2×2 正方形方格。
- `bento`：左大右三。
- `portrait-grid`：2×2 直式方格。
- `vertical`：1×4 長條。
- `classic`：1×4 極長拍立得。
- `horizontal`：4×1 橫條。
- `wide`：4×1 極寬電影條。

## 新增或替換模板

1. 選擇或建立 `packs/templates/<pack>/templates/`。
2. 建立完整畫布 RGBA PNG。
3. 依照版型表設定 1440px 寬與正確高度。
4. 把照片 slot 全部保持透明。
5. 使用合法檔名 `template-<layoutId>-<slug>.png`。
6. 執行：

```bash
pnpm typecheck
pnpm test
pnpm build
```

7. 開發時到 `/layout → /capture → /frame` 檢查模板卡片。
8. 確認使用者在 Editor 新增的貼圖仍然位於模板之上。

## 產生與驗證

示範模板可重新生成：

```bash
node tools/generate-demo-template-pngs.mjs
```

生成器會：

- 使用 canvas 繪製 8 種版型專屬原創外框。
- 輸出 RGBA PNG 到 `packs/templates/demo/templates/`。
- 驗證 width、height、RGBA、每個 slot 全透明與邊框內容存在。
- 驗證失敗時直接以非零 exit code 停止。

## Build 行為

- `pnpm build`：複製 `packs/templates`，並由 `import.meta.glob` 打包模板 URL。
- `pnpm build:public`：也複製 `packs/templates`，因為全新模板都是原創資產。
- `packs/fan-ip` 只隨一般 build 複製，public build 不包含。

## 不支援的舊格式

下列格式已移除，不要再建立：

- `manifest.json`
- `pack.json`
- `background.svg`
- `frame.svg`
- `decorations`
- `collection`
- `styleId`
- `templateColor`
- `TemplateDecoration`
