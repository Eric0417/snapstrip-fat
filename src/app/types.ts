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

export interface TemplateDecoration {
  itemId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
}

export type FrameTemplateKind = 'style' | 'blank';

export interface FrameTemplate {
  id: string;
  layoutId: LayoutId;
  name: Record<string, string>;
  collectionName?: Record<string, string>;
  styleName?: Record<string, string>;
  background?: string;
  frame?: string;
  decorations: readonly TemplateDecoration[];
  pack: 'core' | 'fan';
  kind: FrameTemplateKind;
  collection?: string;
  collectionOrder?: number;
  styleId?: string;
  order?: number;
  collections?: readonly string[];
  backgroundColor?: string;
  accentColor?: string;
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
