import { create } from 'zustand';
import type { LayoutId, PhotoShot, PhotoTransform, StickerPlacement } from './types';

const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

interface SessionState {
  layoutId: LayoutId;
  templateId: string | null;
  templateColor: string | null;
  shots: PhotoShot[];
  photoTransforms: PhotoTransform[];
  stickers: StickerPlacement[];
  past: StickerPlacement[][];
  future: StickerPlacement[][];
  setLayout: (layoutId: LayoutId) => void;
  setFrameTemplate: (templateId: string | null, templateColor?: string | null) => void;
  setShots: (shots: PhotoShot[]) => void;
  setPhotoTransform: (index: number, patch: Partial<PhotoTransform>) => void;
  resetPhotoTransform: (index: number) => void;
  addSticker: (itemId: string, position?: { x: number; y: number }) => string;
  updateSticker: (id: string, patch: Partial<StickerPlacement>) => void;
  duplicateSticker: (id: string) => void;
  removeStickers: (ids: string[]) => void;
  clearStickers: () => void;
  moveStickerLayer: (id: string, direction: 'forward' | 'backward') => void;
  snapshotStickers: () => void;
  undoStickers: () => void;
  redoStickers: () => void;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useSession = create<SessionState>((set, get) => ({
  layoutId: 'grid',
  templateId: null,
  templateColor: null,
  shots: [],
  photoTransforms: [],
  stickers: [],
  past: [],
  future: [],

  setLayout: (layoutId) =>
    set({
      layoutId,
      templateId: null,
      templateColor: null,
      shots: [],
      photoTransforms: [],
      stickers: [],
      past: [],
      future: [],
    }),

  setFrameTemplate: (templateId, templateColor = null) =>
    set({ templateId, templateColor }),

  setShots: (shots) =>
    set({
      shots,
      photoTransforms: shots.map(() => ({ ...DEFAULT_PHOTO_TRANSFORM })),
    }),

  setPhotoTransform: (index, patch) =>
    set((state) => ({
      photoTransforms: state.photoTransforms.map((transform, currentIndex) =>
        currentIndex === index ? { ...transform, ...patch } : transform,
      ),
    })),

  resetPhotoTransform: (index) =>
    set((state) => ({
      photoTransforms: state.photoTransforms.map((transform, currentIndex) =>
        currentIndex === index ? { ...DEFAULT_PHOTO_TRANSFORM } : transform,
      ),
    })),

  addSticker: (itemId, position) => {
    const id = makeId('sticker');
    const { stickers, past } = get();
    const z = stickers.reduce((max, sticker) => Math.max(max, sticker.z), -1) + 1;
    const next: StickerPlacement = {
      id,
      itemId,
      x: Math.min(0.98, Math.max(0.02, position?.x ?? 0.5)),
      y: Math.min(0.98, Math.max(0.02, position?.y ?? 0.5)),
      scale: 0.24,
      rotation: 0,
      flipX: false,
      flipY: false,
      z,
      opacity: 1,
      visible: true,
    };
    set({ stickers: [...stickers, next], past: [...past, stickers], future: [] });
    return id;
  },

  updateSticker: (id, patch) =>
    set((state) => ({
      stickers: state.stickers.map((sticker) =>
        sticker.id === id ? { ...sticker, ...patch } : sticker,
      ),
    })),

  duplicateSticker: (id) => {
    const source = get().stickers.find((sticker) => sticker.id === id);
    if (!source) return;
    const maxZ = get().stickers.reduce((max, sticker) => Math.max(max, sticker.z), -1);
    const duplicate: StickerPlacement = {
      ...source,
      id: makeId('sticker'),
      x: Math.min(0.95, source.x + 0.035),
      y: Math.min(0.95, source.y + 0.035),
      z: maxZ + 1,
    };
    set((state) => ({
      stickers: [...state.stickers, duplicate],
      past: [...state.past, state.stickers],
      future: [],
    }));
  },

  removeStickers: (ids) => {
    const removeSet = new Set(ids);
    set((state) => ({
      stickers: state.stickers.filter((sticker) => !removeSet.has(sticker.id)),
      past: [...state.past, state.stickers],
      future: [],
    }));
  },

  clearStickers: () =>
    set((state) => ({ stickers: [], past: [...state.past, state.stickers], future: [] })),

  moveStickerLayer: (id, direction) =>
    set((state) => {
      const ordered = [...state.stickers].sort((a, b) => a.z - b.z);
      const index = ordered.findIndex((sticker) => sticker.id === id);
      const swapIndex = direction === 'forward' ? index + 1 : index - 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) return state;

      const current = ordered[index];
      const target = ordered[swapIndex];
      const stickers = state.stickers.map((sticker) => {
        if (sticker.id === current.id) return { ...sticker, z: target.z };
        if (sticker.id === target.id) return { ...sticker, z: current.z };
        return sticker;
      });
      return { stickers, past: [...state.past, state.stickers], future: [] };
    }),

  snapshotStickers: () =>
    set((state) => ({ past: [...state.past, state.stickers], future: [] })),

  undoStickers: () =>
    set((state) => {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        stickers: previous,
        past: state.past.slice(0, -1),
        future: [state.stickers, ...state.future],
      };
    }),

  redoStickers: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      return {
        stickers: next,
        past: [...state.past, state.stickers],
        future: state.future.slice(1),
      };
    }),
}));
