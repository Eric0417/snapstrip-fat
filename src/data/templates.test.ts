import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../app/layouts';
import { STICKERS } from './stickers';
import {
  FRAME_TEMPLATES,
  getFrameTemplate,
  getFrameTemplatesForLayout,
} from './templates';

const IP_COLLECTIONS = [
  'hello-kitty',
  'cinnamoroll',
  'my-melody',
  'kuromi',
  'pompompurin',
  'little-twin-stars',
  'miffy',
  'rilakkuma',
  'sumikko-gurashi',
  'pusheen',
  'kirby',
  'snoopy',
  'mickey-mouse',
];

describe('frame template loader', () => {
  it('loads a blank template and every IP for every layout', () => {
    expect(FRAME_TEMPLATES).toHaveLength(
      LAYOUTS.length + LAYOUTS.length * IP_COLLECTIONS.length,
    );

    for (const layout of LAYOUTS) {
      const templates = getFrameTemplatesForLayout(layout.id);
      expect(templates).toHaveLength(1 + IP_COLLECTIONS.length);
      expect(templates.filter((template) => template.kind === 'blank')).toHaveLength(1);
      expect(
        templates.filter((template) => template.kind === 'ip'),
      ).toHaveLength(IP_COLLECTIONS.length);
    }
  });

  it('keeps template ids unique and exposes clean frame metadata', () => {
    const ids = FRAME_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const template of FRAME_TEMPLATES) {
      expect(template.name['zh-Hant']).toBeTruthy();
      expect(template.name.en).toBeTruthy();
      expect(template.frame).toBeTruthy();

      if (template.kind === 'blank') {
        expect(template.collection).toBe('blank');
        expect(template.decorations).toHaveLength(0);
      } else {
        expect(template.background).toBeTruthy();
        expect(template.accentColor).toBeTruthy();
        expect(template.decorations).toHaveLength(3);
      }
    }
  });

  it('references existing sticker assets only', () => {
    const stickerIds = new Set(STICKERS.map((sticker) => sticker.id));

    for (const template of FRAME_TEMPLATES) {
      for (const decoration of template.decorations) {
        expect(stickerIds.has(decoration.itemId)).toBe(true);
      }
    }
  });

  it('returns the requested template or undefined', () => {
    expect(getFrameTemplate('blank-grid')?.kind).toBe('blank');
    expect(getFrameTemplate('ip-hello-kitty-grid')?.collection).toBe('hello-kitty');
    expect(getFrameTemplate('missing')).toBeUndefined();
    expect(getFrameTemplate(null)).toBeUndefined();
  });
});
