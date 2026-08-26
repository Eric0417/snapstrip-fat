import type { LayoutDefinition, LayoutSlot } from './types';

function grid(
  id: LayoutDefinition['id'],
  columns: number,
  rows: number,
  slotAspectRatio: number,
  gapRatio: number,
  captureAspectRatio = slotAspectRatio,
): LayoutDefinition {
  const gapX = columns - 1;
  const gapY = rows - 1;
  const slotWidth = (1 - gapX * gapRatio) / columns;
  const slotHeight = slotWidth / slotAspectRatio;
  const slots: LayoutSlot[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      slots.push({
        x: column * (slotWidth + gapRatio),
        y: row * (slotHeight + gapRatio),
        width: slotWidth,
        height: slotHeight,
      });
    }
  }

  return { id, slots, captureAspectRatio };
}

function bento(): LayoutDefinition {
  const gap = 0.025;
  const leftWidth = 0.58;
  const rightWidth = 1 - gap - leftWidth;
  const rightHeight = (1 - gap * 2) / 3;

  return {
    id: 'bento',
    captureAspectRatio: 3 / 4,
    slots: [
      { x: 0, y: 0, width: leftWidth, height: 1 },
      { x: leftWidth + gap, y: 0, width: rightWidth, height: rightHeight },
      { x: leftWidth + gap, y: rightHeight + gap, width: rightWidth, height: rightHeight },
      { x: leftWidth + gap, y: (rightHeight + gap) * 2, width: rightWidth, height: rightHeight },
    ],
  };
}

export const LAYOUTS: readonly LayoutDefinition[] = [
  grid('grid', 2, 2, 4 / 3, 0.055),
  grid('square', 2, 2, 1, 0.055),
  bento(),
  grid('portrait-grid', 2, 2, 3 / 4, 0.055),
  grid('vertical', 1, 4, 4 / 3, 0.045),
  grid('classic', 1, 4, 3 / 4, 0.045),
  grid('horizontal', 4, 1, 3 / 4, 0.045),
  grid('wide', 4, 1, 16 / 9, 0.045),
];

export function getLayout(id: string): LayoutDefinition {
  return LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[0];
}

export function layoutBounds(layout: LayoutDefinition) {
  const height = layout.slots.reduce(
    (max, slot) => Math.max(max, slot.y + slot.height),
    0,
  );
  return { width: 1, height };
}
