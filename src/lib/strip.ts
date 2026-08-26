import { getLayout, layoutBounds } from '../app/layouts';
import type { PhotoShot, StickerPlacement } from '../app/types';
import type { StickerAsset } from '../data/stickers';
import { drawCoverImage } from './crop';

export interface StripSize {
  width: number;
  height: number;
  padding: number;
  innerWidth: number;
}

export interface SlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StickerRenderData {
  placement: StickerPlacement;
  asset: StickerAsset;
}

export function stripSize(layoutId: string, targetWidth = 1200): StripSize {
  const layout = getLayout(layoutId);
  const bounds = layoutBounds(layout);
  const padding = Math.round(targetWidth * 0.045);
  const innerWidth = targetWidth - padding * 2;
  const innerHeight = innerWidth * bounds.height;

  return {
    width: targetWidth,
    height: Math.round(innerHeight + padding * 2),
    padding,
    innerWidth,
  };
}

export function slotRects(layoutId: string, size: StripSize): SlotRect[] {
  const layout = getLayout(layoutId);
  const scale = size.innerWidth;
  const rects: SlotRect[] = [];

  for (const slot of layout.slots) {
    rects.push({
      x: Math.round(size.padding + slot.x * scale),
      y: Math.round(size.padding + slot.y * scale),
      width: Math.round(slot.width * scale),
      height: Math.round(slot.height * scale),
    });
  }

  return rects;
}

export function createStripCanvas(layoutId: string, targetWidth = 1200) {
  const size = stripSize(layoutId, targetWidth);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  return { canvas, size };
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  if (image.decode) await image.decode();
  else await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
  return image;
}

export function drawStripBase(
  context: CanvasRenderingContext2D,
  layoutId: string,
  size: StripSize,
  shots: readonly PhotoShot[],
  shotImages: readonly HTMLImageElement[],
) {
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size.width, size.height);

  const rects = slotRects(layoutId, size);
  for (let index = 0; index < rects.length; index += 1) {
    const rect = rects[index];
    context.fillStyle = index % 2 === 0 ? '#fff2f6' : '#fff8f0';
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    if (shots[index] && shotImages[index]) {
      drawCoverImage(
        context,
        shotImages[index],
        shotImages[index].naturalWidth,
        shotImages[index].naturalHeight,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
      );
    }
  }
}

export async function drawStripBaseToCanvas(
  canvas: HTMLCanvasElement,
  layoutId: string,
  shots: readonly PhotoShot[],
  targetWidth = 1440,
) {
  const size = stripSize(layoutId, targetWidth);
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable');
  const shotImages = await Promise.all(shots.map((shot) => loadImage(shot.dataUrl)));
  drawStripBase(context, layoutId, size, shots, shotImages);
}

export function stickerWidth(size: StripSize, placement: StickerPlacement) {
  return Math.max(12, placement.scale * size.innerWidth);
}

export function drawSticker(
  context: CanvasRenderingContext2D,
  size: StripSize,
  data: StickerRenderData,
  image: HTMLImageElement,
) {
  const { placement } = data;
  if (!placement.visible || placement.opacity <= 0) return;

  const width = stickerWidth(size, placement);
  const height = width * (image.naturalHeight / Math.max(1, image.naturalWidth));
  const x = placement.x * size.width;
  const y = placement.y * size.height;

  context.save();
  context.translate(x, y);
  context.rotate((placement.rotation * Math.PI) / 180);
  context.scale(placement.flipX ? -1 : 1, placement.flipY ? -1 : 1);
  context.globalAlpha = placement.opacity;
  context.drawImage(image, -width / 2, -height / 2, width, height);
  context.restore();
}

export async function renderStrip(options: {
  layoutId: string;
  shots: readonly PhotoShot[];
  stickerData: readonly StickerRenderData[];
  targetWidth?: number;
}) {
  const { canvas, size } = createStripCanvas(options.layoutId, options.targetWidth);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable');

  const shotImages = await Promise.all(options.shots.map((shot) => loadImage(shot.dataUrl)));
  drawStripBase(context, options.layoutId, size, options.shots, shotImages);

  const ordered = [...options.stickerData].sort((a, b) => a.placement.z - b.placement.z);
  for (const data of ordered) {
    const image = await loadImage(data.asset.src);
    drawSticker(context, size, data, image);
  }

  return canvas;
}
