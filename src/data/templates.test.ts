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

const LAYOUT_STYLES = {
  grid: ['grid-pastel', 'grid-diary', 'grid-mono'],
  square: ['square-sky', 'square-plaid', 'square-doodle'],
  bento: ['bento-story', 'bento-cream', 'bento-mono'],
  'portrait-grid': ['portrait-vintage', 'portrait-pastel', 'portrait-mono'],
  vertical: ['vertical-film', 'vertical-diary', 'vertical-sweet'],
  classic: ['classic-film', 'classic-plaid', 'classic-mono'],
  horizontal: ['horizontal-film', 'horizontal-sky', 'horizontal-doodle'],
  wide: ['wide-film', 'wide-ticket', 'wide-mono'],
} as const;

const LONG_LAYOUTS = new Set(['vertical', 'classic', 'horizontal', 'wide']);

describe('frame template loader', () => {
  it('loads a blank template, three layout-specific styles, and every IP for each layout', () => {
    expect(FRAME_TEMPLATES).toHaveLength(
      LAYOUTS.length +
        LAYOUTS.length * 3 * IP_COLLECTIONS.length,
    );

    for (const layout of LAYOUTS) {
      const templates = getFrameTemplatesForLayout(layout.id);
      expect(templates.filter((template) => template.kind === 'blank')).toHaveLength(1);
      expect(
        templates.filter((template) => template.kind === 'style'),
      ).toHaveLength(3 * IP_COLLECTIONS.length);
      expect(
        new Set(
          templates
            .filter((template) => template.kind === 'style')
            .map((template) => template.styleId),
        ),
      ).toEqual(new Set(LAYOUT_STYLES[layout.id]));

      const collections = new Set(
        templates
          .filter((template) => template.kind === 'style')
          .map((template) => template.collection),
      );
      expect([...collections].sort()).toEqual([...IP_COLLECTIONS].sort());

      for (const style of LAYOUT_STYLES[layout.id]) {
        const ipTemplates = templates.filter(
          (template) =>
            template.kind === 'style' && template.styleId === style,
        );
        expect(ipTemplates).toHaveLength(IP_COLLECTIONS.length);
        expect(
          new Set(ipTemplates.map((template) => template.collection)),
        ).toEqual(new Set(IP_COLLECTIONS));
      }

      const filmTemplates = templates.filter(
        (template) => template.styleFamily === 'film',
      );
      expect(filmTemplates.length > 0).toBe(LONG_LAYOUTS.has(layout.id));
    }
  });

  it('keeps template ids unique and exposes clean single-IP metadata', () => {
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
        expect(template.styleId).toBeTruthy();
        expect(template.styleFamily).toBeTruthy();
        expect(template.styleName).toBeTruthy();
        expect(template.collection).toBeTruthy();
        expect(template.collectionName).toBeTruthy();
        expect(template.collections).toEqual([template.collection]);
        expect(template.monochrome).toBe(template.styleFamily === 'mono');
        expect(
          template.decorations.every((decoration) =>
            decoration.itemId.startsWith(`${template.collection}-sticker-`),
          ),
        ).toBe(true);
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
    expect(getFrameTemplate('style-grid-pastel-hello-kitty')?.kind).toBe('style');
    expect(getFrameTemplate('style-grid-pastel-hello-kitty')?.collection).toBe(
      'hello-kitty',
    );
    expect(getFrameTemplate('style-grid-pastel')).toBeUndefined();
    expect(getFrameTemplate('missing')).toBeUndefined();
    expect(getFrameTemplate(null)).toBeUndefined();
  });
});
