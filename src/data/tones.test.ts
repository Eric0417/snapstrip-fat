import { describe, expect, it } from 'vitest';
import { TONE_PRESETS, toneCss } from './tones';

describe('tone styles', () => {
  it('exposes six presets and keeps original untouched', () => {
    expect(TONE_PRESETS).toEqual([
      'original',
      'pastel',
      'warm',
      'cool',
      'cream',
      'mono',
    ]);
    expect(toneCss('original', 1)).toBe('none');
  });

  it('scales each filter by intensity without changing preset identity', () => {
    expect(toneCss('warm', 0)).toBe(
      'sepia(0) saturate(1) brightness(1)',
    );
    expect(toneCss('mono', 0.5)).toBe('grayscale(0.5) contrast(1.04)');
    expect(toneCss('cool', 0.25)).toContain('hue-rotate(3deg)');
  });
});
