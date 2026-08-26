import { describe, expect, it } from 'vitest';
import {
  calculateGesturePatch,
  type GesturePointer,
  type GestureState,
} from './gestureMath';

function gesture(overrides: Partial<GestureState> = {}): GestureState {
  return {
    mode: 'move',
    pointerId: 1,
    startX: 100,
    startY: 100,
    originX: 0.5,
    originY: 0.5,
    startScale: 0.24,
    startRotation: 0,
    startDistance: 100,
    startAngle: Math.PI / 2,
    centerX: 500,
    centerY: 500,
    pinchStartDistance: 100,
    pinchStartAngle: Math.PI / 2,
    pinchStartMidX: 100,
    pinchStartMidY: 100,
    pinchOriginX: 0.5,
    pinchOriginY: 0.5,
    pinchStartScale: 0.24,
    pinchStartRotation: 0,
    ...overrides,
  };
}

function pointer(x: number, y: number): GesturePointer {
  return { clientX: x, clientY: y };
}

describe('calculateGesturePatch', () => {
  it('calculates move from the pointerdown origin', () => {
    expect(calculateGesturePatch(gesture(), pointer(140, 180), [], 400, 800)).toEqual({
      x: 0.6,
      y: 0.6,
    });
  });

  it('calculates scale from the pointerdown ratio', () => {
    expect(
      calculateGesturePatch(gesture({ mode: 'scale' }), pointer(700, 500), [], 1000, 1000),
    ).toEqual({ scale: 0.48 });
  });

  it('calculates rotation from the pointerdown angle', () => {
    expect(
      calculateGesturePatch(gesture({ mode: 'rotate' }), pointer(500, 400), [], 1000, 1000),
    ).toEqual({ rotation: 180 });
  });

  it('calculates pinch transform from the two-finger baseline', () => {
    expect(
      calculateGesturePatch(
        gesture({
          mode: 'pinch',
          pinchStartMidX: 100,
          pinchStartMidY: 100,
          pinchStartDistance: 100,
          pinchStartAngle: Math.PI / 2,
        }),
        pointer(0, 0),
        [
          { x: 125, y: 125 },
          { x: 175, y: 125 },
        ],
        1000,
        1000,
      ),
    ).toEqual({
      x: 0.55,
      y: 0.525,
      scale: 0.12,
      rotation: 270,
    });
  });
});
