import { describe, expect, it } from 'vitest';
import type { StickerAsset } from '../data/stickers';
import {
  drawStripBase,
  slotRects,
  stripSize,
  type LoadedFrameTemplate,
} from './strip';

function fakeImage(id: string) {
  return {
    id,
    naturalWidth: 100,
    naturalHeight: 100,
  } as unknown as HTMLImageElement;
}

function fakeContext() {
  const calls: Array<{ image: HTMLImageElement; args: unknown[] }> = [];
  const fills: string[] = [];
  const filters: string[] = [];
  const context = {
    fillStyle: '',
    globalAlpha: 1,
    filter: 'none',
    fillRect: () => {
      fills.push(context.fillStyle);
    },
    save: () => undefined,
    restore: () => undefined,
    beginPath: () => undefined,
    rect: () => undefined,
    clip: () => undefined,
    translate: () => undefined,
    scale: () => undefined,
    rotate: () => undefined,
    drawImage: (image: HTMLImageElement, ...args: unknown[]) => {
      filters.push(context.filter);
      calls.push({ image, args });
    },
  };

  return {
    context: context as unknown as CanvasRenderingContext2D,
    calls,
    fills,
    filters,
  };
}

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

  it('draws template background, frame, and decorations in that order', () => {
    const background = fakeImage('background');
    const frame = fakeImage('frame');
    const sticker = fakeImage('sticker');
    const asset = {
      id: 'template-sticker',
      name: { en: 'Template sticker' },
      category: 'effect',
      src: 'packs/template-sticker.png',
      thumb: 'packs/template-sticker.png',
      displaySize: { w: 100, h: 100 },
      tags: [],
      pack: 'core',
    } satisfies StickerAsset;
    const loadedTemplate: LoadedFrameTemplate = {
      backgroundColor: '#eaf7ff',
      backgroundImage: background,
      frameImage: frame,
      decorations: [
        {
          placement: {
            id: 'decoration',
            itemId: 'template-sticker',
            x: 0.2,
            y: 0.3,
            scale: 0.1,
            rotation: 12,
            flipX: false,
            flipY: false,
            z: 0,
            opacity: 1,
            visible: true,
          },
          asset,
          image: sticker,
        },
      ],
      monochrome: true,
    };
    const { context, calls, fills, filters } = fakeContext();

    drawStripBase(context, 'grid', stripSize('grid'), [], [], [], loadedTemplate);

    expect(calls.map((call) => call.image.id)).toEqual([
      'background',
      'frame',
      'sticker',
    ]);
    expect(fills[0]).toBe('#eaf7ff');
    expect(filters[filters.length - 1]).toBe('grayscale(1) contrast(1.15)');
  });
});
