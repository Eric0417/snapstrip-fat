# SnapStrip v2 Frame Template Format

更新時間：2026-08-28

## 用途

這份文件是新增相框模板的唯一格式規範。只要符合這裡的 pack、manifest、
SVG 尺寸與 decorations 座標規則，`src/data/templates.ts` 會自動載入模板，
不需要修改 TypeScript registry 或 UI 程式碼。

## Pack 目錄

```text
packs/templates/
  <pack-kind>/
    pack.json
    templates/
      manifest.json
      <template-id>-background.svg
      <template-id>-frame.svg
```

現有範例：

- `packs/templates/fan-ip/`：私人 IP 聯名風格模板。
- 未來原創模板可放在 `packs/templates/core/`。

`pack.json`：

```json
{
  "id": "fan-ip-frames",
  "kind": "frame-template",
  "displayName": {
    "zh-Hant": "IP 主題風格相框",
    "en": "IP themed style frames"
  },
  "license": "private-personal-use"
}
```

## Manifest Schema

`templates/manifest.json` 必須是 JSON array，每個 entry 範例：

```json
{
  "id": "style-grid-pastel-hello-kitty",
  "layoutId": "grid",
  "name": {
    "zh-Hant": "粉彩方框 · Hello Kitty",
    "en": "Pastel grid · Hello Kitty"
  },
  "kind": "style",
  "collection": "hello-kitty",
  "collectionOrder": 1,
  "styleId": "grid-pastel",
  "styleFamily": "sweet",
  "monochrome": false,
  "styleName": {
    "zh-Hant": "粉彩方框",
    "en": "Pastel grid"
  },
  "order": 1,
  "background": "packs/templates/fan-ip/templates/style-grid-pastel-background.svg",
  "frame": "packs/templates/fan-ip/templates/style-grid-pastel-frame.svg",
  "accentColor": "#d46d92",
  "collections": ["hello-kitty"],
  "collectionName": {
    "zh-Hant": "Hello Kitty",
    "en": "Hello Kitty"
  },
  "decorations": [
    {
      "itemId": "hello-kitty-sticker-01",
      "x": 0.112,
      "y": 0.053,
      "scale": 0.5616,
      "rotation": -11,
      "flipX": false,
      "flipY": false,
      "opacity": 1
    }
  ],
  "license": "private-personal-use"
}
```

Blank 可換色模板範例：

```json
{
  "id": "blank-grid",
  "layoutId": "grid",
  "name": {
    "zh-Hant": "空白自訂",
    "en": "Blank custom"
  },
  "kind": "blank",
  "collection": "blank",
  "order": 0,
  "frame": "packs/templates/fan-ip/templates/frame-grid.svg",
  "decorations": [],
  "license": "original"
}
```

欄位規則：

- `id`：全域唯一 kebab-case，例如 `style-<styleId>-<collection>`。
- `layoutId`：必須是 `grid`、`square`、`bento`、`portrait-grid`、
  `vertical`、`classic`、`horizontal`、`wide` 其中之一。
- `kind`：`style` 或 `blank`。
- `collection`：blank 使用 `blank`；style 使用唯一 IP id。
- `collectionOrder`：IP 在選擇器中的順序，1–13。
- `styleId`：全域唯一的版型專屬 id，例如 `grid-pastel`、`vertical-film`。
- `styleFamily`：視覺 family：`sweet`、`diary`、`film`、`plaid`、`mono`。
- `monochrome`：`true` 時角色 decorations 在 canvas render 套用 grayscale。
- `styleName`：風格的繁中/英文顯示名稱。
- `collectionName`：IP 的繁中/英文顯示名稱。
- `order`：數值越小越先顯示；blank 為 `0`，每個 layout 的三個風格為 `1–3`。
- `collections`：只包含此模板的單一 fan-ip collection。
- `background`：full-canvas SVG，照片底下的完整背景。
- `frame`：full-canvas SVG，照片上方、template decorations 下方的邊框層。
- `accentColor`：選項 UI 的主題色，非強制，但 style 模板建議提供。
- `decorations`：只引用既有 sticker id，不複製角色 asset。
- `license`：原創為 `original`；第三方 IP 為 `private-personal-use`。

目前的 24 個 style/layout 組合都是版型專屬設計，不在 8 個 layout 之間重複：

| Layout | Style IDs |
| --- | --- |
| `grid` | `grid-pastel`、`grid-diary`、`grid-mono` |
| `square` | `square-sky`、`square-plaid`、`square-doodle` |
| `bento` | `bento-story`、`bento-cream`、`bento-mono` |
| `portrait-grid` | `portrait-vintage`、`portrait-pastel`、`portrait-mono` |
| `vertical` | `vertical-film`、`vertical-diary`、`vertical-sweet` |
| `classic` | `classic-film`、`classic-plaid`、`classic-mono` |
| `horizontal` | `horizontal-film`、`horizontal-sky`、`horizontal-doodle` |
| `wide` | `wide-film`、`wide-ticket`、`wide-mono` |

`film` 只屬於 `vertical`、`classic`、`horizontal`、`wide` 四種長條版型；
其他版型的 manifest 不得包含 `styleFamily: film`。

每個 style/layout 模板使用 3 張同一 IP 的既有 fan-ip 貼圖；不得把不同 IP
混在同一張模板中。每個 style/layout 都有全部 13 個 collection 的 entry，
所以每個版型可選到所有 IP，同時每張模板都保持單一主題。

## Decorations 座標

```ts
interface TemplateDecoration {
  itemId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
}
```

- `x/y`：完整 export canvas 的 0–1 正規化座標，不是 slot 座標。
- `scale`：角色貼圖 display width 除以 canvas `innerWidth`。
  export 時 `innerWidth` 為 `1310`，preview target 640 時為 `582`。
- `rotation`：角度，順時針為正。
- `flipX/flipY`：布林。
- `opacity`：0–1。

例如 grid `grid-pastel` 的主角色 `scale=0.5616`，在 export 1440 中約等於
`1310 × 0.5616 ≈ 735px` 的貼圖顯示寬度。角色貼圖本身常有透明留白，
因此實際可見角色會比顯示尺寸略小，建議主角色維持在 0.5 以上。

## Runtime Safe Area

模板作者仍需維持合理構圖，但不需要為了避免裁切而手動反算每張 PNG 的透明邊界。
renderer 會讀取貼圖實際 alpha 內容，再依下列規則自動避讓：

- 非 film：安全區距離完整畫布四邊各 `42px`。
- `vertical`/`classic` film：左右各 `84px`、上下各 `44px`。
- `horizontal`/`wide` film：左右各 `44px`、上下各 `74px`。
- 計算包含 rotation，並正確套用 `flipX`/`flipY`。
- 超出安全區時最多自動縮放/移動 4 次；限制只作用於 template render，不改寫 manifest。
- 批次驗證標準：936 個 style decorations 與 156 張角色素材，所有可見像素必須位於安全區內。

## 各 Layout 標準 Canvas

背景與相框 SVG 必須使用以下 `viewBox`，否則長直/橫幅模板會被拉扯：

| `layoutId` | SVG viewBox | Export width × height | Aspect ratio |
| --- | --- | --- | --- |
| `grid` | `0 0 1440 1131` | 1440 × 1131 | 1.273 |
| `square` | `0 0 1440 1440` | 1440 × 1440 | 1.000 |
| `bento` | `0 0 1440 1440` | 1440 × 1440 | 1.000 |
| `portrait-grid` | `0 0 1440 1853` | 1440 × 1853 | 0.777 |
| `vertical` | `0 0 1440 4237` | 1440 × 4237 | 0.340 |
| `classic` | `0 0 1440 7294` | 1440 × 7294 | 0.197 |
| `horizontal` | `0 0 1440 508` | 1440 × 508 | 2.835 |
| `wide` | `0 0 1440 289` | 1440 × 289 | 4.983 |

通用常數：

- export target width：`1440`
- padding：`65`
- innerWidth：`1310`
- slot geometry 由 `src/app/layouts.ts` 定義，模板 manifest 不重複宣告 slots。

### `grid`

- 2×2 橫向方格。
- Slot aspect ratio：4:3。
- 適合把主角色放在左上方，另兩個同位角色放右側邊緣。
- 建議主角色 `scale` 約 `0.50–0.54`，輔助角色約 `0.32–0.38`。

### `square`

- 2×2 正方形方格。
- 適合角落對角構圖。
- 主角色建議 `scale` 約 `0.50–0.54`。

### `bento`

- 左邊 1 個大照片，右邊 3 個小照片。
- 主角色適合放在左上方大照片邊緣。
- 主角色建議 `scale` 約 `0.48–0.52`。

### `portrait-grid`

- 2×2 直式方格。
- 適合上下對角放角色，中間保持留白。
- 主角色建議 `scale` 約 `0.48–0.52`。

### `vertical`

- 1×4 長條。
- 長條上下留白區窄，角色貼圖應放在側邊或照片之間的接縫附近。
- 主角色建議 `scale` 約 `0.40–0.44`，輔助角色約 `0.28–0.32`。

### `classic`

- 1×4 極長拍立得。
- 與 vertical 相同邏輯，角色放在兩側與照片接縫處。
- 主角色建議 `scale` 約 `0.32–0.36`，輔助角色約 `0.26–0.30`。

### `horizontal`

- 4×1 橫幅。
- 可把角色放在左右外側，避免放在照片中心。
- 主角色建議 `scale` 約 `0.30–0.34`，輔助角色約 `0.24–0.28`。

### `wide`

- 4×1 極寬電影條。
- 高度最少，角色只能放在上下邊緣或照片間隔。
- 主角色建議 `scale` 約 `0.22–0.26`，輔助角色約 `0.18–0.22`。

## SVG Asset Rules

- `background.svg` 是完整畫布背景。
- `frame.svg` 是完整畫布透明前景。
- 不要使用外連圖片或 external SVG asset。
- 角色公仔不能直接畫成精確受版權角色 SVG；只能由 manifest 的
  `decorations.itemId` 引用既有貼圖。
- 建議 border inset 至少 `28px`，避免相框壓到照片主體。
- 主角色貼圖位置應避開四格照片的中央人臉區域。

## 新增模板流程

1. 建立或使用一個 `packs/templates/<pack-kind>/templates/manifest.json`。
2. 為每個 `layoutId` 產生符合上方 `viewBox` 的 background/frame SVG。
3. 在 manifest 中填寫 `layoutId`、資產路徑與 decorations。
4. 確認所有 `itemId` 都存在於 `packs/fan-ip/**/stickers/manifest.json`。
   decorations 不需要手動預先避讓，但角色位置仍應避免壓到人臉或預期留白區域。
5. 本機執行：

```bash
pnpm typecheck
pnpm test
pnpm dev
```

6. 執行 build 驗證：

```bash
pnpm build
pnpm build:public
```

7. 在 `/layout → /capture → /frame` 手動檢查 preview。

現有 24 個版型專屬 style/layout × 13 IP 的模板可由 generator 重新生成：

```bash
node tools/generate-frame-templates.mjs
```

generator 會先清空 `packs/templates/fan-ip/templates/`，再重新寫入
`manifest.json`（8 blank + 312 style）、8 個 blank frame SVG、48 個
background SVG 與 48 個 style frame SVG。312 個 style entries 共享
這 24 組 style/layout 資產，只透過 `decorations` 與 `collectionName` 區分 IP。

## Build 行為

- `pnpm build` 會複製 `packs/templates`，供本機與 `snapstrip-fat` 使用。
- `pnpm build:public` 不會複製 `packs/templates`，也不會打包模板 manifest。
- 若公開 build 沒有任何 template，Capture 會直接跳過 `/frame` 並使用原有
  素色版型輸出。
