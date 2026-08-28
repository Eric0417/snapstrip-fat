# Blank Template Design Files

這些 PNG 是 SnapStrip v2 8 種版型的空白設計稿，不是可直接部署的模板。
每種版型都有兩組檔案：

- `template-<layoutId>-blank.png`：全透明正式空白稿，用來放最終設計。
- `template-<layoutId>-guide.png`：看得見外框、照片槽位與槽位編號的設計參考稿，
  方便對齊位置，**不能直接部署**。

## 檔案與尺寸

| Layout | 檔案 | 尺寸 |
| --- | --- | --- |
| `grid` | `template-grid-blank.png` / `template-grid-guide.png` | 1440 × 1131 |
| `square` | `template-square-blank.png` / `template-square-guide.png` | 1440 × 1440 |
| `bento` | `template-bento-blank.png` / `template-bento-guide.png` | 1440 × 1440 |
| `portrait-grid` | `template-portrait-grid-blank.png` / `template-portrait-grid-guide.png` | 1440 × 1853 |
| `vertical` | `template-vertical-blank.png` / `template-vertical-guide.png` | 1440 × 4237 |
| `classic` | `template-classic-blank.png` / `template-classic-guide.png` | 1440 × 7294 |
| `horizontal` | `template-horizontal-blank.png` / `template-horizontal-guide.png` | 1440 × 508 |
| `wide` | `template-wide-blank.png` / `template-wide-guide.png` | 1440 × 289 |

## 使用方式

1. 開啟 `template-<layoutId>-guide.png` 對齊外框與照片槽位。
2. 在 guide 上參考位置，再到 `template-<layoutId>-blank.png` 畫正式內容。
3. 正式模板的照片槽位內部 alpha 必須保持 `0`。
4. 不要使用 `*-guide.png` 當正式模板，因為參考線會出現在成品中。
5. 設計完成後，以 `template-<layoutId>-<slug>.png` 命名，放入
   `packs/templates/<pack>/templates/`。

## 設計規則

- 保持 RGBA，不要轉成 JPEG 或 RGB PNG。
- 照片 slot 區域必須保持 alpha 0，不能畫任何內容。
- 外框、紙膠帶、膠卷孔與裝飾只能畫在 slot 外圍與畫布留白區。
- 外框與裝飾都必須完整位於 `0,0,1440,height` 內，不能裁切。
- 建議外框約在畫布四周 24px 內縮；slot 外框線條必須在照片槽位外側。
- 完整座標與自動載入規則見 `../../TEMPLATE_FORMAT.md`。
