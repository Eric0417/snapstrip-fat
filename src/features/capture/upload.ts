import { coverCropRect } from '../../lib/crop';
import type { PhotoShot } from '../../app/types';

export async function fileToShot(file: File, aspectRatio: number): Promise<PhotoShot> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const targetLongSide = 1440;
    const landscape = aspectRatio >= 1;
    const width = landscape ? targetLongSide : Math.round(targetLongSide * aspectRatio);
    const height = landscape ? Math.round(targetLongSide / aspectRatio) : targetLongSide;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context is unavailable');

    const crop = coverCropRect(image.naturalWidth, image.naturalHeight, aspectRatio);
    context.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
    return {
      id: `shot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width,
      height,
      source: 'upload',
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function filesToShots(files: FileList | File[], aspectRatio: number) {
  const selected = Array.from(files).slice(0, 4);
  return Promise.all(selected.map((file) => fileToShot(file, aspectRatio)));
}
