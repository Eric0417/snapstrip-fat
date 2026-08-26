export type Locale = 'zh-Hant' | 'en';

export type LayoutId =
  | 'grid'
  | 'square'
  | 'bento'
  | 'portrait-grid'
  | 'vertical'
  | 'classic'
  | 'horizontal'
  | 'wide';

export interface LayoutSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutDefinition {
  id: LayoutId;
  slots: readonly LayoutSlot[];
  captureAspectRatio: number;
}

export interface PhotoShot {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  source: 'camera' | 'upload';
}

export interface PhotoTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface StickerPlacement {
  id: string;
  itemId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  z: number;
  opacity: number;
  visible: boolean;
}
