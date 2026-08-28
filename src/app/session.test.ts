import { beforeEach, describe, expect, it } from 'vitest';
import { useSession } from './session';
import { DEFAULT_TONE_INTENSITY } from '../data/tones';
import type { StickerPlacement } from './types';

function placement(overrides: Partial<StickerPlacement> = {}): StickerPlacement {
  return {
    id: 's1',
    itemId: 'rabbit-rose-front',
    x: 0.5,
    y: 0.5,
    scale: 0.24,
    rotation: 0,
    flipX: false,
    flipY: false,
    z: 0,
    opacity: 1,
    visible: true,
    ...overrides,
  };
}

describe('session store', () => {
  beforeEach(() => {
    useSession.setState({
      layoutId: 'grid',
      templateId: null,
      toneId: 'original',
      toneIntensity: DEFAULT_TONE_INTENSITY,
      shots: [],
      photoTransforms: [],
      stickers: [],
      past: [],
      future: [],
    });
  });

  it('adds a sticker with a monotonically increasing z', () => {
    const first = useSession.getState().addSticker('rabbit-rose-front');
    const second = useSession.getState().addSticker('rabbit-rose-front');
    const stickers = useSession.getState().stickers;
    expect(first).not.toBe(second);
    expect(stickers[0].z).toBe(0);
    expect(stickers[1].z).toBe(1);
  });

  it('uses the requested relative position when adding a sticker', () => {
    useSession.getState().addSticker('rabbit-rose-front', { x: 0.25, y: 0.75 });
    expect(useSession.getState().stickers[0]).toMatchObject({ x: 0.25, y: 0.75 });
  });

  it('undoes the previous high-level sticker change', () => {
    useSession.setState({ stickers: [placement()] });
    useSession.getState().removeStickers(['s1']);
    expect(useSession.getState().stickers).toHaveLength(0);
    useSession.getState().undoStickers();
    expect(useSession.getState().stickers).toHaveLength(1);
  });

  it('swaps z values when moving a sticker between layers', () => {
    useSession.setState({
      stickers: [placement({ id: 'bottom', z: 0 }), placement({ id: 'top', z: 1 })],
    });
    useSession.getState().moveStickerLayer('bottom', 'forward');
    expect(useSession.getState().stickers.find((s) => s.id === 'bottom')?.z).toBe(1);
    expect(useSession.getState().stickers.find((s) => s.id === 'top')?.z).toBe(0);
  });

  it('creates a duplicate above all current stickers', () => {
    useSession.setState({ stickers: [placement()] });
    useSession.getState().duplicateSticker('s1');
    const stickers = useSession.getState().stickers;
    expect(stickers).toHaveLength(2);
    expect(stickers[1].z).toBe(1);
    expect(stickers[1].id).not.toBe('s1');
  });

  it('initializes and updates photo transforms', () => {
    useSession.getState().setShots([
      { id: '1', dataUrl: '', width: 1, height: 1, source: 'upload' },
      { id: '2', dataUrl: '', width: 1, height: 1, source: 'upload' },
    ]);
    expect(useSession.getState().photoTransforms).toHaveLength(2);

    useSession.getState().setPhotoTransform(1, { scale: 1.4, offsetX: 0.2 });
    expect(useSession.getState().photoTransforms[1]).toMatchObject({
      scale: 1.4,
      offsetX: 0.2,
    });

    useSession.getState().resetPhotoTransform(1);
    expect(useSession.getState().photoTransforms[1]).toMatchObject({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it('stores template and tone selections and resets them with the layout', () => {
    useSession.getState().setFrameTemplate('template-grid-demo');
    useSession.getState().setTone('pastel');
    useSession.getState().setToneIntensity(0.35);
    expect(useSession.getState().templateId).toBe('template-grid-demo');
    expect(useSession.getState().toneId).toBe('pastel');
    expect(useSession.getState().toneIntensity).toBe(0.35);

    useSession.getState().setFrameTemplate(null);
    expect(useSession.getState().toneId).toBe('pastel');
    expect(useSession.getState().toneIntensity).toBe(0.35);

    useSession.getState().setLayout('square');
    expect(useSession.getState().templateId).toBeNull();
    expect(useSession.getState().toneId).toBe('original');
    expect(useSession.getState().toneIntensity).toBe(DEFAULT_TONE_INTENSITY);
  });
});
