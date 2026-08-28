import { renderStrip } from '../../lib/strip';
import type { StickerAsset } from '../../data/stickers';
import type {
  FrameTemplate,
  PhotoShot,
  PhotoTransform,
  StickerPlacement,
  ToneId,
} from '../../app/types';

interface ExportStripOptions {
  layoutId: string;
  shots: PhotoShot[];
  stickers: StickerPlacement[];
  stickerAssets: Map<string, StickerAsset>;
  photoTransforms: PhotoTransform[];
  template?: FrameTemplate;
  toneId?: ToneId;
  toneIntensity?: number;
}

function stripPngFilename() {
  return `snapstrip-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
}

async function createStripPng(options: ExportStripOptions) {
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
    photoTransforms: options.photoTransforms,
    template: options.template,
    toneId: options.toneId,
    toneIntensity: options.toneIntensity,
    targetWidth: 1440,
  });
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value);
      else reject(new Error('PNG encoding failed'));
    }, 'image/png');
  });
  return { blob, filename: stripPngFilename() };
}

export async function exportStripPng(options: ExportStripOptions) {
  const { blob, filename } = await createStripPng(options);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canShareStripPng() {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  if (typeof navigator.canShare !== 'function') return true;

  try {
    return navigator.canShare({
      files: [new File([], 'snapstrip-share-test.png', { type: 'image/png' })],
    });
  } catch {
    return false;
  }
}

export async function shareStripPng(options: ExportStripOptions) {
  const { blob, filename } = await createStripPng(options);
  const file = new File([blob], filename, { type: 'image/png' });
  const share = navigator.share;
  if (typeof share !== 'function') {
    throw new Error('Web Share API is unavailable');
  }
  if (
    typeof navigator.canShare === 'function' &&
    !navigator.canShare({ files: [file] })
  ) {
    throw new Error('Sharing PNG files is unsupported');
  }

  await share.call(navigator, {
    title: 'SnapStrip',
    files: [file],
  });
}
