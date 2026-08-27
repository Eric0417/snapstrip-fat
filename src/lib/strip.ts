import { getLayout, layoutBounds } from '../app/layouts';
import type {
  FrameTemplate,
  PhotoShot,
  PhotoTransform,
  StickerPlacement,
} from '../app/types';
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

export interface TemplateStickerRenderData extends StickerRenderData {
  image: HTMLImageElement;
}

export interface LoadedFrameTemplate {
  backgroundColor?: string;
  backgroundImage?: HTMLImageElement;
  frameImage?: HTMLImageElement;
  decorations: readonly TemplateStickerRenderData[];
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

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImageCached(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const loading = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    if (image.decode) {
      image
        .decode()
        .then(() => resolve(image))
        .catch(() => reject(new Error(`Failed to load image: ${src}`)));
    } else {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    }
  });
  imageCache.set(src, loading);
  return loading;
}

export const loadImage = loadImageCached;

export function drawStripBase(
  context: CanvasRenderingContext2D,
  layoutId: string,
  size: StripSize,
  shots: readonly PhotoShot[],
  shotImages: readonly HTMLImageElement[],
  photoTransforms: readonly PhotoTransform[] = [],
  template?: LoadedFrameTemplate,
) {
  context.fillStyle = template?.backgroundColor ?? '#ffffff';
  context.fillRect(0, 0, size.width, size.height);

  if (template?.backgroundImage) {
    context.drawImage(
      template.backgroundImage,
      0,
      0,
      size.width,
      size.height,
    );
  }

  const rects = slotRects(layoutId, size);
  for (let index = 0; index < rects.length; index += 1) {
    const rect = rects[index];
    context.fillStyle = index % 2 === 0 ? '#fff2f6' : '#fff8f0';
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    if (shots[index] && shotImages[index]) {
      const transform = photoTransforms[index] ?? { scale: 1, offsetX: 0, offsetY: 0 };
      context.save();
      context.beginPath();
      context.rect(rect.x, rect.y, rect.width, rect.height);
      context.clip();
      context.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
      context.scale(transform.scale, transform.scale);
      context.translate(transform.offsetX * rect.width, transform.offsetY * rect.height);
      drawCoverImage(
        context,
        shotImages[index],
        shotImages[index].naturalWidth,
        shotImages[index].naturalHeight,
        -rect.width / 2,
        -rect.height / 2,
        rect.width,
        rect.height,
      );
      context.restore();
    }
  }

  if (template?.frameImage) {
    context.drawImage(template.frameImage, 0, 0, size.width, size.height);
  }

  for (const decoration of template?.decorations ?? []) {
    drawSticker(context, size, decoration, decoration.image);
  }
}

export function resolveTemplateDecorations(
  template: FrameTemplate,
  stickerAssets: ReadonlyMap<string, StickerAsset>,
): readonly StickerRenderData[] {
  const output: StickerRenderData[] = [];

  for (const decoration of template.decorations) {
    const asset = stickerAssets.get(decoration.itemId);
    if (!asset) continue;
    output.push({
      placement: {
        id: `template-${template.id}-${decoration.itemId}`,
        itemId: decoration.itemId,
        x: decoration.x,
        y: decoration.y,
        scale: decoration.scale,
        rotation: decoration.rotation,
        flipX: decoration.flipX,
        flipY: decoration.flipY,
        z: 0,
        opacity: decoration.opacity,
        visible: true,
      },
      asset,
    });
  }

  return output;
}

export async function loadFrameTemplate(
  template: FrameTemplate | undefined,
  stickerAssets: ReadonlyMap<string, StickerAsset>,
  templateColor?: string | null,
): Promise<LoadedFrameTemplate | undefined> {
  if (!template) return undefined;

  const [backgroundImage, frameImage] = await Promise.all([
    template.background ? loadImageCached(template.background) : null,
    template.frame ? loadImageCached(template.frame) : null,
  ]);
  const decorations = await Promise.all(
    resolveTemplateDecorations(template, stickerAssets).map(async (decoration) => ({
      ...decoration,
      image: await loadImageCached(decoration.asset.src),
    })),
  );

  return {
    backgroundColor:
      templateColor && template.kind === 'blank'
        ? templateColor
        : template.backgroundColor,
    backgroundImage: backgroundImage ?? undefined,
    frameImage: frameImage ?? undefined,
    decorations,
  };
}

export async function drawStripBaseToCanvas(
  canvas: HTMLCanvasElement,
  layoutId: string,
  shots: readonly PhotoShot[],
  photoTransforms: readonly PhotoTransform[],
  template?: FrameTemplate,
  stickerAssets?: ReadonlyMap<string, StickerAsset>,
  templateColor?: string | null,
  targetWidth = 1440,
) {
  const size = stripSize(layoutId, targetWidth);
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable');
  const [shotImages, loadedTemplate] = await Promise.all([
    Promise.all(shots.map((shot) => loadImage(shot.dataUrl))),
    loadFrameTemplate(template, stickerAssets ?? new Map(), templateColor),
  ]);
  drawStripBase(
    context,
    layoutId,
    size,
    shots,
    shotImages,
    photoTransforms,
    loadedTemplate,
  );
}

export async function paintStripBaseToCanvas(
  canvas: HTMLCanvasElement,
  layoutId: string,
  shots: readonly PhotoShot[],
  photoTransforms: readonly PhotoTransform[],
  template?: FrameTemplate,
  stickerAssets?: ReadonlyMap<string, StickerAsset>,
  templateColor?: string | null,
) {
  const size = stripSize(layoutId, 1440);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable');
  const [shotImages, loadedTemplate] = await Promise.all([
    Promise.all(shots.map((shot) => loadImageCached(shot.dataUrl))),
    loadFrameTemplate(template, stickerAssets ?? new Map(), templateColor),
  ]);
  drawStripBase(
    context,
    layoutId,
    size,
    shots,
    shotImages,
    photoTransforms,
    loadedTemplate,
  );
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
  photoTransforms: readonly PhotoTransform[];
  template?: FrameTemplate;
  templateStickerAssets?: ReadonlyMap<string, StickerAsset>;
  templateColor?: string | null;
  targetWidth?: number;
}) {
  const { canvas, size } = createStripCanvas(options.layoutId, options.targetWidth);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable');

  const [shotImages, loadedTemplate] = await Promise.all([
    Promise.all(options.shots.map((shot) => loadImageCached(shot.dataUrl))),
    loadFrameTemplate(
      options.template,
      options.templateStickerAssets ?? new Map(),
      options.templateColor,
    ),
  ]);
  drawStripBase(
    context,
    options.layoutId,
    size,
    options.shots,
    shotImages,
    options.photoTransforms,
    loadedTemplate,
  );

  const ordered = [...options.stickerData].sort((a, b) => a.placement.z - b.placement.z);
  for (const data of ordered) {
    const image = await loadImage(data.asset.src);
    drawSticker(context, size, data, image);
  }

  return canvas;
}
