import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../app/layouts';
import {
  FRAME_TEMPLATES,
  buildFrameTemplates,
  getFrameTemplate,
  getFrameTemplatesForLayout,
} from './templates';

describe('frame template loader', () => {
  it('loads one auto-discovered template for every layout', () => {
    expect(FRAME_TEMPLATES).toHaveLength(LAYOUTS.length);

    for (const layout of LAYOUTS) {
      const templates = getFrameTemplatesForLayout(layout.id);
      expect(templates).toHaveLength(1);
      expect(templates[0].layoutId).toBe(layout.id);
      expect(templates[0].src).toBeTruthy();
      expect(templates[0].name['zh-Hant']).toBeTruthy();
      expect(templates[0].name.en).toBeTruthy();
    }
  });

  it('keeps template ids unique and exposes the selected template', () => {
    const ids = FRAME_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getFrameTemplate('template-grid-demo')?.layoutId).toBe('grid');
    expect(getFrameTemplate('template-wide-demo')?.layoutId).toBe('wide');
    expect(getFrameTemplate('template-missing')).toBeUndefined();
    expect(getFrameTemplate(null)).toBeUndefined();
  });

  it('ignores unsupported names and duplicate ids', () => {
    const templates = buildFrameTemplates({
      'packs/templates/demo/templates/template-grid-demo.png': '/demo/grid.png',
      'packs/templates/other/templates/template-grid-demo.png': '/demo/grid-copy.png',
      'packs/templates/demo/templates/template-invalid-demo.png': '/demo/invalid.png',
      'packs/templates/demo/templates/template-nope-demo.png': '/demo/unknown.png',
      'packs/templates/demo/templates/template-Demo.png': '/demo/case.png',
    });

    expect(templates).toHaveLength(1);
    expect(templates[0]).toMatchObject({
      id: 'template-grid-demo',
      layoutId: 'grid',
    });
  });
});
