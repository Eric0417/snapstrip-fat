import { describe, expect, it } from 'vitest';
import { viewportSpawnPosition } from './spawn';

describe('viewportSpawnPosition', () => {
  it('maps the visible viewport center into stage coordinates', () => {
    const position = viewportSpawnPosition(
      { left: -100, right: 500, top: 200, bottom: 900, width: 600, height: 700 },
      400,
      800,
    );
    expect(position.x).toBeCloseTo(0.5);
    expect(position.y).toBeCloseTo((500 - 200) / 700);
  });

  it('falls back to the canvas center when the stage is not visible', () => {
    expect(
      viewportSpawnPosition(
        { left: 0, right: 100, top: 1000, bottom: 1100, width: 100, height: 100 },
        400,
        800,
      ),
    ).toEqual({ x: 0.5, y: 0.5 });
  });

  it('clamps a partially visible stage to a usable position', () => {
    const position = viewportSpawnPosition(
      { left: 0, right: 800, top: 0, bottom: 100, width: 800, height: 1000 },
      800,
      600,
    );
    expect(position.x).toBe(0.5);
    expect(position.y).toBeCloseTo(0.05);
  });

  it('uses the visible bottom when a drawer covers the lower stage', () => {
    const position = viewportSpawnPosition(
      { left: 0, right: 390, top: 0, bottom: 1000, width: 390, height: 1000 },
      390,
      844,
      250,
    );
    expect(position.x).toBe(0.5);
    expect(position.y).toBeCloseTo(0.125);
  });
});
