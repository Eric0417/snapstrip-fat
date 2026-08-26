import type { Locale } from '../app/types';

interface StickerManifestEntry {
  id: string;
  name: Record<string, string>;
  category: string;
  src: string;
  thumb: string;
  displaySize?: { w: number; h: number };
  tags?: string[];
}

export interface StickerAsset {
  id: string;
  name: StickerManifestEntry['name'];
  category: string;
  src: string;
  thumb: string;
  displaySize: { w: number; h: number };
  tags: string[];
  pack: 'core' | 'fan';
}

const coreManifests = import.meta.glob<
  Record<string, unknown>
>('../../packs/core-*/stickers/manifest.json', {
  eager: true,
  import: 'default',
});

const fanManifests = __VITE_PUBLIC_BUILD__
  ? {}
  : import.meta.glob<Record<string, unknown>>('../../packs/fan-ip/**/stickers/manifest.json', {
      eager: true,
      import: 'default',
    });

function toAssets(
  manifests: Record<string, unknown>,
  pack: StickerAsset['pack'],
): StickerAsset[] {
  const output: StickerAsset[] = [];
  for (const value of Object.values(manifests)) {
    if (!Array.isArray(value)) continue;
    for (const entry of value as StickerManifestEntry[]) {
      if (!entry?.id || !entry?.src || !entry?.thumb) continue;
      output.push({
        id: entry.id,
        name: entry.name,
        category: entry.category,
        src: entry.src,
        thumb: entry.thumb,
        displaySize: entry.displaySize ?? { w: 256, h: 256 },
        tags: entry.tags ?? [],
        pack,
      });
    }
  }
  return output;
}

export const STICKERS: readonly StickerAsset[] = [
  ...toAssets(coreManifests, 'core'),
  ...toAssets(fanManifests, 'fan'),
].sort((a, b) => a.id.localeCompare(b.id));

export const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  animal: { 'zh-Hant': '動物', en: 'Animals' },
  celestial: { 'zh-Hant': '天體', en: 'Celestial' },
  decor: { 'zh-Hant': '裝飾', en: 'Decor' },
  speech: { 'zh-Hant': '對話框', en: 'Speech' },
  torn: { 'zh-Hant': '撕紙', en: 'Torn paper' },
  sparkle: { 'zh-Hant': '閃亮', en: 'Sparkle' },
  doodle: { 'zh-Hant': '塗鴉', en: 'Doodle' },
  effect: { 'zh-Hant': '特效', en: 'Effects' },
  'popular-ip': { 'zh-Hant': '熱門 IP', en: 'Popular IP' },
};

export function stickerName(sticker: StickerAsset, locale: Locale) {
  return sticker.name[locale] ?? sticker.name['zh-Hant'] ?? sticker.name.en ?? sticker.id;
}

export function categoryLabel(category: string, locale: Locale) {
  return CATEGORY_LABELS[category]?.[locale] ?? category;
}
