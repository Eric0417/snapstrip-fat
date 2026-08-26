import type { StickerPlacement } from '../../app/types';

export type GestureMode = 'move' | 'scale' | 'rotate' | 'pinch';

export interface GestureState {
  mode: GestureMode;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  startScale: number;
  startRotation: number;
  startDistance: number;
  startAngle: number;
  centerX: number;
  centerY: number;
  pinchStartDistance: number;
  pinchStartAngle: number;
  pinchStartMidX: number;
  pinchStartMidY: number;
  pinchOriginX: number;
  pinchOriginY: number;
  pinchStartScale: number;
  pinchStartRotation: number;
}

export interface GesturePointer {
  clientX: number;
  clientY: number;
}

export interface GesturePoint {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeRotation(rotation: number) {
  return (rotation + 360) % 360;
}

export function calculateGesturePatch(
  gesture: GestureState,
  pointer: GesturePointer,
  points: readonly GesturePoint[],
  stageWidth: number,
  stageHeight: number,
): Partial<StickerPlacement> | null {
  if (stageWidth <= 0 || stageHeight <= 0) return null;

  if (gesture.mode === 'pinch') {
    if (points.length < 2) return null;
    const [first, second] = points;
    const midX = (first.x + second.x) / 2;
    const midY = (first.y + second.y) / 2;
    const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
    const angle = Math.atan2(second.y - first.y, second.x - first.x);

    return {
      x: clamp(
        gesture.pinchOriginX + (midX - gesture.pinchStartMidX) / stageWidth,
        0,
        1,
      ),
      y: clamp(
        gesture.pinchOriginY + (midY - gesture.pinchStartMidY) / stageHeight,
        0,
        1,
      ),
      scale: clamp(
        gesture.pinchStartScale * (distance / gesture.pinchStartDistance),
        0.06,
        0.9,
      ),
      rotation: normalizeRotation(
        gesture.pinchStartRotation +
          ((angle - gesture.pinchStartAngle) * 180) / Math.PI,
      ),
    };
  }

  if (gesture.mode === 'move') {
    return {
      x: clamp(
        gesture.originX + (pointer.clientX - gesture.startX) / stageWidth,
        0,
        1,
      ),
      y: clamp(
        gesture.originY + (pointer.clientY - gesture.startY) / stageHeight,
        0,
        1,
      ),
    };
  }

  const distance = Math.hypot(
    pointer.clientX - gesture.centerX,
    pointer.clientY - gesture.centerY,
  );
  const angle = Math.atan2(pointer.clientY - gesture.centerY, pointer.clientX - gesture.centerX);

  if (gesture.mode === 'scale') {
    return {
      scale: clamp(
        gesture.startScale * (distance / Math.max(1, gesture.startDistance)),
        0.06,
        0.9,
      ),
    };
  }

  return {
    rotation: normalizeRotation(
      gesture.startRotation + ((angle - gesture.startAngle) * 180) / Math.PI,
    ),
  };
}
