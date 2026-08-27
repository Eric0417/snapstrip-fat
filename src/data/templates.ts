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
  background?: unknown;
  frame?: unknown;
  decorations?: unknown;
  kind?: unknown;
  collection?: unknown;
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

      const name = Object.fromEntries(
        Object.entries(value.name).filter((entry): entry is [string, string] =>
          typeof entry[1] === 'string',
        ),
      );
      if (Object.keys(name).length === 0) continue;

      seen.add(value.id);
      output.push({
        id: value.id,
        layoutId: value.layoutId as LayoutId,
        name,
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
        kind: value.kind === 'blank' ? 'blank' : 'ip',
        collection:
          typeof value.collection === 'string' && value.collection
            ? value.collection
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

  return output.sort((a, b) => a.id.localeCompare(b.id));
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
