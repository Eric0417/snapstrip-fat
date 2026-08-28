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

export interface StickerContentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TemplateStickerRenderData extends StickerRenderData {
  image: HTMLImageElement;
  contentBounds?: StickerContentBounds;
}

export interface LoadedFrameTemplate {
  backgroundColor?: string;
  backgroundImage?: HTMLImageElement;
  frameImage?: HTMLImageElement;
  decorations: readonly TemplateStickerRenderData[];
  monochrome?: boolean;
  styleFamily?: string;
}

export interface SafeFrameRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
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
const contentBoundsCache = new Map<string, Promise<StickerContentBounds>>();

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

export function getImageContentBounds(
  image: HTMLImageElement,
): Promise<StickerContentBounds> {
  const key = image.src || image.id;
  const cached = contentBoundsCache.get(key);
  if (cached) return cached;

  const loading = new Promise<StickerContentBounds>((resolve) => {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height || typeof document === 'undefined') {
      resolve({ x: 0, y: 0, width: 1, height: 1 });
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      resolve({ x: 0, y: 0, width: 1, height: 1 });
      return;
    }

    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      const row = y * width * 4;
      for (let x = 0; x < width; x += 1) {
        if (pixels[row + x * 4 + 3] <= 0) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    const hasContent = maxX >= minX && maxY >= minY;
    resolve(
      hasContent
        ? {
            x: minX / width,
            y: minY / height,
            width: (maxX - minX + 1) / width,
            height: (maxY - minY + 1) / height,
          }
        : { x: 0, y: 0, width: 1, height: 1 },
    );
  });
  contentBoundsCache.set(key, loading);
  return loading;
}

export function frameSafeRect(
  layoutId: string,
  styleFamily?: string,
  targetSize?: StripSize,
): SafeFrameRect {
  const { width, height } = targetSize ?? stripSize(layoutId, 1440);
  if (styleFamily === 'film') {
    if (layoutId === 'vertical' || layoutId === 'classic') {
      return { left: 84, right: width - 84, top: 44, bottom: height - 44 };
    }
    return { left: 44, right: width - 44, top: 74, bottom: height - 74 };
  }
  return { left: 42, right: width - 42, top: 42, bottom: height - 42 };
}

export function constrainTemplateDecoration(
  size: StripSize,
  placement: StickerPlacement,
  contentBounds: StickerContentBounds,
  safe: SafeFrameRect,
  imageWidth = 1,
  imageHeight = 1,
): StickerPlacement {
  let next = { ...placement };

  function visibleBox(current: StickerPlacement) {
    const width = stickerWidth(size, current);
    const height = width * (imageHeight / Math.max(1, imageWidth));
    const contentWidth = contentBounds.width * width;
    const contentHeight = contentBounds.height * height;
    const centerX = (contentBounds.x + contentBounds.width / 2 - 0.5) * width;
    const centerY = (contentBounds.y + contentBounds.height / 2 - 0.5) * height;
    const mirrorX = current.flipX ? -1 : 1;
    const mirrorY = current.flipY ? -1 : 1;
    const radians = (current.rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const halfWidth = contentWidth / 2;
    const halfHeight = contentHeight / 2;
    const corners = [
      [-halfWidth, -halfHeight],
      [halfWidth, -halfHeight],
      [-halfWidth, halfHeight],
      [halfWidth, halfHeight],
    ].map(([x, y]) => ({
      x: mirrorX * (centerX + x) * cos - mirrorY * (centerY + y) * sin,
      y: mirrorX * (centerX + x) * sin + mirrorY * (centerY + y) * cos,
    }));
    const xs = corners.map((corner) => corner.x + current.x * size.width);
    const ys = corners.map((corner) => corner.y + current.y * size.height);
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
    };
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const box = visibleBox(next);
    const boxWidth = box.right - box.left;
    const boxHeight = box.bottom - box.top;
    const safeWidth = safe.right - safe.left;
    const safeHeight = safe.bottom - safe.top;
    const scaleX = safeWidth / Math.max(1, boxWidth);
    const scaleY = safeHeight / Math.max(1, boxHeight);

    if (scaleX < 0.999999 || scaleY < 0.999999) {
      next.scale *= Math.min(scaleX, scaleY);
      continue;
    }

    const dx = box.left < safe.left
      ? safe.left - box.left
      : box.right > safe.right
        ? safe.right - box.right
        : 0;
    const dy = box.top < safe.top
      ? safe.top - box.top
      : box.bottom > safe.bottom
        ? safe.bottom - box.bottom
        : 0;
    return {
      ...next,
      x: next.x + dx / size.width,
      y: next.y + dy / size.height,
    };
  }

  return next;
}

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

  const monochrome = template?.monochrome;
  const safeRect = template?.styleFamily
    ? frameSafeRect(layoutId, template.styleFamily, size)
    : undefined;
  for (const decoration of template?.decorations ?? []) {
    const placement = decoration.contentBounds && safeRect
      ? constrainTemplateDecoration(
          size,
          decoration.placement,
          decoration.contentBounds,
          safeRect,
          decoration.image.naturalWidth,
          decoration.image.naturalHeight,
        )
      : decoration.placement;
    drawSticker(
      context,
      size,
      { ...decoration, placement },
      decoration.image,
      monochrome ? 'grayscale(1) contrast(1.15)' : undefined,
    );
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
    resolveTemplateDecorations(template, stickerAssets).map(async (decoration) => {
      const image = await loadImageCached(decoration.asset.src);
      const contentBounds = await getImageContentBounds(image).catch(() => undefined);
      return { ...decoration, image, contentBounds };
    }),
  );

  return {
    backgroundColor:
      templateColor && template.kind === 'blank'
        ? templateColor
        : template.backgroundColor,
    backgroundImage: backgroundImage ?? undefined,
    frameImage: frameImage ?? undefined,
    decorations,
    monochrome:
      template.monochrome ?? template.styleFamily === 'mono',
    styleFamily: template.styleFamily,
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
  filter?: string,
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
  context.filter = filter ?? 'none';
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
