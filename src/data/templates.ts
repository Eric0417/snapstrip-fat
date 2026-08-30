import { LAYOUTS } from '../app/layouts';
import type { FrameTemplate, LayoutId } from '../app/types';

const TEMPLATE_NAMES: Record<string, { 'zh-Hant': string; en: string }> = {
  '01': { 'zh-Hant': '草莓甜品派對', en: 'Strawberry Sweets Party' },
  '03': { 'zh-Hant': '甜點嘉年華', en: 'Dessert Carnival' },
  '04': { 'zh-Hant': '甜蜜咖啡館', en: 'Sweet Cafe' },
  '05': { 'zh-Hant': '復古格紋 Kitty', en: 'Retro Plaid Kitty' },
  '06': { 'zh-Hant': '雲朵咖啡館', en: 'Cloud Cafe' },
  '07': { 'zh-Hant': '午茶花園', en: 'Tea Garden' },
  '09': { 'zh-Hant': '花語雲朵', en: 'Floral Cloud' },
};

const LAYOUT_IDS = new Set<string>(LAYOUTS.map((layout) => layout.id));
const LAYOUT_PATTERN = LAYOUTS.map((layout) =>
  layout.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
).join('|');
const TEMPLATE_FILE_PATTERN = new RegExp(
  `^template-(${LAYOUT_PATTERN})-([a-z0-9][a-z0-9-]*)\\.png$`,
);

const templateSources = import.meta.glob<string>(
  '../../packs/templates/*/templates/template-*.png',
  {
    eager: true,
    import: 'default',
  },
);

function displayName(slug: string): Record<string, string> {
  if (slug === 'demo') {
    return { 'zh-Hant': '示範相框', en: 'Demo frame' };
  }

  const namedTemplate = TEMPLATE_NAMES[slug];
  if (namedTemplate) return namedTemplate;

  const label = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return { 'zh-Hant': label, en: label };
}

function templateFromPath(
  path: string,
  src: string,
): FrameTemplate | null {
  const fileName = path.split('/').pop() ?? path;
  const match = TEMPLATE_FILE_PATTERN.exec(fileName);
  if (!match || !LAYOUT_IDS.has(match[1])) return null;

  const layoutId = match[1] as LayoutId;
  const slug = match[2];
  return {
    id: `template-${layoutId}-${slug}`,
    layoutId,
    name: displayName(slug),
    src,
  };
}

export function buildFrameTemplates(
  sources: Record<string, string>,
): FrameTemplate[] {
  const output: FrameTemplate[] = [];
  const seen = new Set<string>();

  for (const [path, src] of Object.entries(sources).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const template = templateFromPath(path, src);
    if (!template || seen.has(template.id)) continue;
    seen.add(template.id);
    output.push(template);
  }

  return output;
}

export const FRAME_TEMPLATES: readonly FrameTemplate[] = buildFrameTemplates(
  templateSources,
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
  return (
    template.name[locale] ??
    template.name['zh-Hant'] ??
    template.name.en ??
    template.id
  );
}
