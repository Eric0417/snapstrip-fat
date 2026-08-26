import { describe, expect, it } from 'vitest';
import { coverCropRect } from './crop';

describe('coverCropRect', () => {
  it('crops a wide source to a portrait target', () => {
    expect(coverCropRect(1600, 900, 3 / 4)).toEqual({
      sx: 462.5,
      sy: 0,
      sw: 675,
      sh: 900,
    });
  });

  it('crops a tall source to a landscape target', () => {
    expect(coverCropRect(900, 1600, 4 / 3)).toEqual({
      sx: 0,
      sy: 462.5,
      sw: 900,
      sh: 675,
    });
  });

  it('uses the full source when ratios match', () => {
    expect(coverCropRect(1200, 900, 4 / 3)).toEqual({
      sx: 0,
      sy: 0,
      sw: 1200,
      sh: 900,
    });
  });
});
