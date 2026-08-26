export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function coverCropRect(
  sourceWidth: number,
  sourceHeight: number,
  targetAspectRatio: number,
): CropRect {
  const sourceRatio = sourceWidth / sourceHeight;
  if (sourceRatio > targetAspectRatio) {
    const sw = sourceHeight * targetAspectRatio;
    return { sx: (sourceWidth - sw) / 2, sy: 0, sw, sh: sourceHeight };
  }

  const sh = sourceWidth / targetAspectRatio;
  return { sx: 0, sy: (sourceHeight - sh) / 2, sw: sourceWidth, sh };
}

export function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
) {
  const crop = coverCropRect(sourceWidth, sourceHeight, targetWidth / targetHeight);
  context.drawImage(
    image,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
  );
}
