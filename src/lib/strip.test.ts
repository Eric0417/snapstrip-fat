import { describe, expect, it } from 'vitest';
import type { PhotoShot, StickerPlacement } from '../app/types';
import type { StickerAsset } from '../data/stickers';
import { toneCss } from '../data/tones';
import {
  drawStripBase,
  drawSticker,
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
      calls.push({ image, args });
    },
  };

  return {
    context: context as unknown as CanvasRenderingContext2D,
    calls,
    fills,
  };
}

function shot(id: string): PhotoShot {
  return { id, dataUrl: '', width: 100, height: 100, source: 'upload' };
}

function placement(): StickerPlacement {
  return {
    id: 's1',
    itemId: 'rabbit-rose-front',
    x: 0.5,
    y: 0.5,
    scale: 0.2,
    rotation: 0,
    flipX: false,
    flipY: false,
    z: 0,
    opacity: 1,
    visible: true,
  };
}

const asset: StickerAsset = {
  id: 'rabbit-rose-front',
  name: { en: 'Rabbit' },
  category: 'animal',
  src: 'packs/rabbit.png',
  thumb: 'packs/rabbit.png',
  displaySize: { w: 100, h: 100 },
  tags: [],
  pack: 'core',
};

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

describe('strip rendering', () => {
  it('draws photos, the template overlay, then user stickers', () => {
    const photo = fakeImage('photo');
    const overlay = fakeImage('overlay');
    const sticker = fakeImage('sticker');
    const size = stripSize('grid');
    const loadedTemplate: LoadedFrameTemplate = { image: overlay };
    const { context, calls } = fakeContext();

    drawStripBase(
      context,
      'grid',
      size,
      [shot('1')],
      [photo],
      [],
      loadedTemplate,
    );
    drawSticker(
      context,
      size,
      { placement: placement(), asset },
      sticker,
    );

    expect(calls.map((call) => call.image.id)).toEqual([
      'photo',
      'overlay',
      'sticker',
    ]);
  });

  it('keeps the base canvas white when no template is selected', () => {
    const { context, fills } = fakeContext();
    drawStripBase(
      context,
      'grid',
      stripSize('grid'),
      [],
      [],
      [],
    );
    expect(fills[0]).toBe('#ffffff');
  });

  it('uses the shared tone filter for final export styling', () => {
    expect(toneCss('original', 1)).toBe('none');
    expect(toneCss('mono', 0.5)).toContain('grayscale(0.5)');
    expect(toneCss('warm', 1)).toContain('sepia');
  });

});
