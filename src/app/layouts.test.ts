import { describe, expect, it } from 'vitest';
import { getLayout, LAYOUTS, layoutBounds } from './layouts';

describe('layout definitions', () => {
  it('exposes eight four-slot layouts', () => {
    expect(LAYOUTS).toHaveLength(8);
    for (const layout of LAYOUTS) {
      expect(layout.slots).toHaveLength(4);
      expect(layout.captureAspectRatio).toBeGreaterThan(0);
    }
  });

  it('keeps every slot inside the normalized layout bounds', () => {
    for (const layout of LAYOUTS) {
      const bounds = layoutBounds(layout);
      for (const slot of layout.slots) {
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.y).toBeGreaterThanOrEqual(0);
        expect(slot.width).toBeGreaterThan(0);
        expect(slot.height).toBeGreaterThan(0);
        expect(slot.x + slot.width).toBeLessThanOrEqual(1.001);
        expect(slot.y + slot.height).toBeLessThanOrEqual(bounds.height + 0.001);
      }
    }
  });

  it('returns the first layout for an unknown id', () => {
    expect(getLayout('unknown').id).toBe('grid');
  });
});
