import { describe, expect, it } from 'vitest';
import type { StickerAsset } from '../data/stickers';
import {
  constrainTemplateDecoration,
  drawStripBase,
  frameSafeRect,
  stripSize,
  slotRects,
  type LoadedFrameTemplate,
  loadFrameTemplate,
} from './strip';
import type { FrameTemplate } from '../app/types';

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

  it('keeps visible template stickers away from the frame border', () => {
    const size = stripSize('grid', 1440);
    const placement = {
      id: 'decoration',
      itemId: 'sticker',
      x: 0.05,
      y: 0.05,
      scale: 0.5,
      rotation: 12,
      flipX: false,
      flipY: false,
      z: 0,
      opacity: 1,
      visible: true,
    };
    const constrained = constrainTemplateDecoration(
      size,
      placement,
      { x: 0.25, y: 0.25, width: 0.5, height: 0.5 },
      frameSafeRect('grid', 'sweet'),
    );

    expect(constrained.x).toBeGreaterThan(placement.x);
    expect(constrained.y).toBeGreaterThan(placement.y);
  });

  it('moves template stickers away from the right and bottom frame edges', () => {
    const size = stripSize('grid', 1440);
    const placement = {
      id: 'decoration',
      itemId: 'sticker',
      x: 0.95,
      y: 0.95,
      scale: 0.4,
      rotation: -9,
      flipX: true,
      flipY: false,
      z: 0,
      opacity: 1,
      visible: true,
    };
    const constrained = constrainTemplateDecoration(
      size,
      placement,
      { x: 0.25, y: 0.3, width: 0.5, height: 0.4 },
      frameSafeRect('grid', 'sweet'),
    );

    expect(constrained.x).toBeLessThan(placement.x);
    expect(constrained.y).toBeLessThan(placement.y);
  });

  it('accounts for horizontal flips when measuring the visible sticker edge', () => {
    const size = stripSize('grid', 1440);
    const placement = {
      id: 'decoration',
      itemId: 'sticker',
      x: 0.8,
      y: 0.5,
      scale: 0.5,
      rotation: 0,
      flipX: true,
      flipY: false,
      z: 0,
      opacity: 1,
      visible: true,
    };
    const constrained = constrainTemplateDecoration(
      size,
      placement,
      { x: 0.05, y: 0.25, width: 0.2, height: 0.5 },
      frameSafeRect('grid', 'sweet'),
    );

    expect(constrained.x).toBeLessThan(0.77);
  });

  it('shrinks tall film decorations when the safe area is too small', () => {
    const size = stripSize('wide', 1440);
    const placement = {
      id: 'decoration',
      itemId: 'sticker',
      x: 0.5,
      y: 0.08,
      scale: 0.24,
      rotation: 4,
      flipX: false,
      flipY: false,
      z: 0,
      opacity: 1,
      visible: true,
    };
    const constrained = constrainTemplateDecoration(
      size,
      placement,
      { x: 0.3, y: 0.3, width: 0.55, height: 0.6 },
      frameSafeRect('wide', 'film'),
    );

    expect(constrained.scale).toBeLessThan(placement.scale);
  });

  it('keeps styleFamily mono templates monochrome during loading', async () => {
    const template: FrameTemplate = {
      id: 'grid-mono-hello-kitty',
      layoutId: 'grid',
      name: { 'zh-Hant': '黑白方塊', en: 'Monochrome grid' },
      decorations: [],
      pack: 'fan',
      kind: 'style',
      collection: 'hello-kitty',
      styleId: 'grid-mono',
      styleFamily: 'mono',
      monochrome: true,
    };

    await expect(loadFrameTemplate(template, new Map())).resolves.toMatchObject({
      monochrome: true,
      styleFamily: 'mono',
    });
  });
});
