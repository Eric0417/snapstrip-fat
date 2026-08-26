import { renderStrip } from '../../lib/strip';
import type { StickerAsset } from '../../data/stickers';
import type { PhotoShot, StickerPlacement } from '../../app/types';

interface ExportStripOptions {
  layoutId: string;
  shots: PhotoShot[];
  stickers: StickerPlacement[];
  stickerAssets: Map<string, StickerAsset>;
}

export async function exportStripPng(options: ExportStripOptions) {
  const stickerData = options.stickers
    .map((placement) => ({ placement, asset: options.stickerAssets.get(placement.itemId) }))
    .filter(
      (
        item,
      ): item is {
        placement: StickerPlacement;
        asset: StickerAsset;
      } => Boolean(item.asset),
    );

  const canvas = await renderStrip({
    layoutId: options.layoutId,
    shots: options.shots,
    stickerData,
    targetWidth: 1440,
  });
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value);
      else reject(new Error('PNG encoding failed'));
    }, 'image/png');
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `snapstrip-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
