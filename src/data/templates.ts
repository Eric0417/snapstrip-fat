import { LAYOUTS } from '../app/layouts';
import type {
  FrameTemplate,
  LayoutId,
  TemplateDecoration,
} from '../app/types';

interface FrameTemplateManifestEntry {
  id?: unknown;
  layoutId?: unknown;
  name?: unknown;
  collectionName?: unknown;
  styleName?: unknown;
  background?: unknown;
  frame?: unknown;
  decorations?: unknown;
  kind?: unknown;
  collection?: unknown;
  collectionOrder?: unknown;
  styleId?: unknown;
  styleFamily?: unknown;
  monochrome?: unknown;
  order?: unknown;
  collections?: unknown;
  backgroundColor?: unknown;
  accentColor?: unknown;
}

const LAYOUT_IDS = new Set<string>(LAYOUTS.map((layout) => layout.id));

const templateManifests = __VITE_PUBLIC_BUILD__
  ? {}
  : import.meta.glob<Record<string, unknown>>(
      '../../packs/templates/**/templates/manifest.json',
      {
        eager: true,
        import: 'default',
      },
    );

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function toNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function toNameMap(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const nameMap = Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] =>
      typeof entry[1] === 'string',
    ),
  );
  return Object.keys(nameMap).length > 0 ? nameMap : undefined;
}

function toDecoration(value: unknown): TemplateDecoration | null {
  if (!value || typeof value !== 'object') return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.itemId !== 'string' || !entry.itemId) return null;

  return {
    itemId: entry.itemId,
    x: clamp(toNumber(entry.x, 0.5), 0, 1),
    y: clamp(toNumber(entry.y, 0.5), 0, 1),
    scale: Math.max(0.001, toNumber(entry.scale, 0.24)),
    rotation: toNumber(entry.rotation, 0),
    flipX: toBoolean(entry.flipX, false),
    flipY: toBoolean(entry.flipY, false),
    opacity: clamp(toNumber(entry.opacity, 1), 0, 1),
  };
}

function toTemplates(manifests: Record<string, unknown>): FrameTemplate[] {
  const output: FrameTemplate[] = [];
  const seen = new Set<string>();
  const entries = Object.entries(manifests).sort(([a], [b]) => a.localeCompare(b));

  for (const [path, manifest] of entries) {
    if (!Array.isArray(manifest)) continue;

    for (const value of manifest as FrameTemplateManifestEntry[]) {
      if (
        !value ||
        typeof value.id !== 'string' ||
        typeof value.layoutId !== 'string' ||
        !LAYOUT_IDS.has(value.layoutId) ||
        !value.name ||
        typeof value.name !== 'object' ||
        seen.has(value.id)
      ) {
        continue;
      }

      const name = toNameMap(value.name);
      if (!name) continue;

      seen.add(value.id);
      output.push({
        id: value.id,
        layoutId: value.layoutId as LayoutId,
        name,
        collectionName: toNameMap(value.collectionName),
        styleName: toNameMap(value.styleName),
        background:
          typeof value.background === 'string' && value.background
            ? value.background
            : undefined,
        frame:
          typeof value.frame === 'string' && value.frame ? value.frame : undefined,
        decorations: Array.isArray(value.decorations)
          ? value.decorations
              .map(toDecoration)
              .filter((decoration): decoration is TemplateDecoration => Boolean(decoration))
          : [],
        pack: path.includes('/fan-ip/') ? 'fan' : 'core',
        kind: value.kind === 'blank' ? 'blank' : 'style',
        collection:
          typeof value.collection === 'string' && value.collection
            ? value.collection
            : undefined,
        collectionOrder: toNumber(value.collectionOrder, 0),
        styleId:
          typeof value.styleId === 'string' && value.styleId
            ? value.styleId
            : undefined,
        styleFamily:
          typeof value.styleFamily === 'string' && value.styleFamily
            ? value.styleFamily
            : undefined,
        monochrome:
          typeof value.monochrome === 'boolean' ? value.monochrome : undefined,
        order: toNumber(value.order, 0),
        collections: Array.isArray(value.collections)
          ? value.collections.filter(
              (collection): collection is string =>
                typeof collection === 'string' && Boolean(collection),
            )
          : undefined,
        backgroundColor:
          typeof value.backgroundColor === 'string' && value.backgroundColor
            ? value.backgroundColor
            : undefined,
        accentColor:
          typeof value.accentColor === 'string' && value.accentColor
            ? value.accentColor
            : undefined,
      });
    }
  }

  return output.sort(
    (a, b) =>
      (a.order ?? 0) - (b.order ?? 0) ||
      (a.collectionOrder ?? 0) - (b.collectionOrder ?? 0) ||
      a.id.localeCompare(b.id),
  );
}

export const FRAME_TEMPLATES: readonly FrameTemplate[] = toTemplates(
  templateManifests,
);

export function getFrameTemplatesForLayout(
  layoutId: string,
): readonly FrameTemplate[] {
  return FRAME_TEMPLATES.filter((template) => template.layoutId === layoutId);
}

export function getFrameTemplate(templateId: string | null | undefined) {
  return FRAME_TEMPLATES.find((template) => template.id === templateId);
}

export function frameTemplateName(
  template: FrameTemplate,
  locale: string,
): string {
  return template.name[locale] ?? template.name['zh-Hant'] ?? template.name.en ?? template.id;
}
