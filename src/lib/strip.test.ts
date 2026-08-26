import { describe, expect, it } from 'vitest';
import { slotRects, stripSize } from './strip';

describe('strip geometry', () => {
  it('keeps the grid layout landscape because its slots are 4:3', () => {
    const size = stripSize('grid');
    expect(size.width).toBe(1200);
    expect(size.height).toBeLessThan(size.width);
  });

  it('keeps the vertical layout tall', () => {
    const size = stripSize('vertical');
    expect(size.height).toBeGreaterThan(size.width);
  });

  it('returns four slot rectangles in reading order', () => {
    const size = stripSize('grid');
    const rects = slotRects('grid', size);
    expect(rects).toHaveLength(4);
    expect(rects[0].x).toBe(rects[2].x);
    expect(rects[0].y).toBe(rects[1].y);
    expect(rects[1].x).toBeGreaterThan(rects[0].x);
    expect(rects[2].y).toBeGreaterThan(rects[0].y);
  });

  it('creates a wide canvas for the horizontal layout', () => {
    const size = stripSize('horizontal');
    expect(size.width).toBeGreaterThan(size.height);
    expect(size.height).toBeGreaterThan(0);
  });

  it('supports the non-uniform bento layout without extra slots', () => {
    const size = stripSize('bento');
    const rects = slotRects('bento', size);
    expect(rects).toHaveLength(4);
    expect(rects[0].height).toBeGreaterThan(rects[1].height);
  });
});
