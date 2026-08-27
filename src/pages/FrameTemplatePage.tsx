import { ArrowRight, Check, Paintbrush } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../app/session';
import {
  frameTemplateName,
  getFrameTemplate,
  getFrameTemplatesForLayout,
} from '../data/templates';
import { FrameTemplatePreview } from '../features/templates/FrameTemplatePreview';
import { useLanguage } from '../i18n/LanguageContext';

const BLANK_COLORS = [
  '#fff2f6',
  '#eaf7ff',
  '#f7f2ff',
  '#fff8df',
  '#edfbf2',
  '#f7f4f0',
  '#f8edf7',
  '#eef6f7',
];

function localizedName(
  name: Record<string, string> | undefined,
  locale: string,
) {
  return (
    name?.[locale] ??
    name?.['zh-Hant'] ??
    name?.en ??
    ''
  );
}

export function FrameTemplatePage() {
  const { locale, t } = useLanguage();
  const navigate = useNavigate();
  const layoutId = useSession((state) => state.layoutId);
  const templateId = useSession((state) => state.templateId);
  const templateColor = useSession((state) => state.templateColor);
  const shots = useSession((state) => state.shots);
  const photoTransforms = useSession((state) => state.photoTransforms);
  const setFrameTemplate = useSession((state) => state.setFrameTemplate);
  const templates = useMemo(
    () => getFrameTemplatesForLayout(layoutId),
    [layoutId],
  );
  const blankTemplate = templates.find((template) => template.kind === 'blank');
  const styleTemplates = useMemo(
    () => templates.filter((template) => template.kind === 'style'),
    [templates],
  );
  const styleIds = useMemo(
    () =>
      Array.from(
        new Set(
          styleTemplates
            .map((template) => template.styleId)
            .filter((styleId): styleId is string => Boolean(styleId)),
        ),
      ),
    [styleTemplates],
  );
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [color, setColor] = useState(templateColor ?? BLANK_COLORS[0]);

  useEffect(() => {
    const saved = templateId
      ? templates.find((template) => template.id === templateId)
      : undefined;
    const nextStyle =
      saved?.styleId && styleIds.includes(saved.styleId)
        ? saved.styleId
        : styleIds[0] ?? null;
    const available = styleTemplates.filter(
      (template) => template.styleId === nextStyle,
    );
    const nextSelected =
      saved && saved.styleId === nextStyle
        ? saved.id
        : available[0]?.id ?? blankTemplate?.id ?? null;

    setSelectedStyle(nextStyle);
    setSelected(nextSelected);
  }, [blankTemplate, styleIds, styleTemplates, templateId, templates]);

  useEffect(() => {
    if (templateColor) setColor(templateColor);
  }, [templateColor]);

  const ipTemplates = useMemo(
    () =>
      styleTemplates
        .filter((template) => template.styleId === selectedStyle)
        .sort(
          (a, b) =>
            (a.collectionOrder ?? Number.MAX_SAFE_INTEGER) -
              (b.collectionOrder ?? Number.MAX_SAFE_INTEGER) ||
            localizedName(a.collectionName, locale).localeCompare(
              localizedName(b.collectionName, locale),
            ),
        ),
    [locale, selectedStyle, styleTemplates],
  );

  if (shots.length !== 4) {
    return <Navigate to="/capture" replace />;
  }
  if (!blankTemplate || styleTemplates.length === 0) {
    return <Navigate to="/editor" replace />;
  }

  const selectedTemplate = getFrameTemplate(selected) ?? blankTemplate;

  function continueToEditor() {
    setFrameTemplate(
      selectedTemplate.id,
      selectedTemplate.kind === 'blank' ? color : null,
    );
    void navigate('/editor');
  }

  function selectStyle(styleId: string) {
    const currentCollection =
      selectedTemplate.kind === 'style'
        ? selectedTemplate.collection
        : undefined;
    const sameIp =
      currentCollection
        ? styleTemplates.find(
            (template) =>
              template.styleId === styleId &&
              template.collection === currentCollection,
          )
        : undefined;
    const first =
      styleTemplates.find(
        (template) =>
          template.styleId === styleId && template.collectionOrder === 1,
      ) ?? styleTemplates.find((template) => template.styleId === styleId);
    setSelectedStyle(styleId);
    setSelected(sameIp?.id ?? first?.id ?? null);
  }

  return (
    <main className="content-page">
      <section className="page-intro">
        <h1>{t('frameTitle')}</h1>
        <p>{t('frameBody')}</p>
      </section>

      <section className="frame-studio" aria-label={t('frameTitle')}>
        <div className="frame-studio-preview">
          <FrameTemplatePreview
            className="frame-studio-canvas"
            template={selectedTemplate}
            shots={shots}
            photoTransforms={photoTransforms}
            templateColor={
              selectedTemplate.kind === 'blank' ? color : undefined
            }
          />
        </div>

        <div className="frame-studio-controls">
          <div className="frame-control-group">
            <span className="frame-control-title">{t('blankFrame')}</span>
            <button
              className={`frame-blank-button${selectedTemplate.kind === 'blank' ? ' is-selected' : ''}`}
              type="button"
              onClick={() => setSelected(blankTemplate.id)}
              aria-pressed={selectedTemplate.kind === 'blank'}
            >
              <Paintbrush size={18} aria-hidden="true" />
              <span>{frameTemplateName(blankTemplate, locale)}</span>
              {selectedTemplate.kind === 'blank' ? (
                <Check size={18} aria-hidden="true" />
              ) : null}
            </button>

            {selectedTemplate.kind === 'blank' ? (
              <div className="frame-color-row" aria-label={t('customColor')}>
                {BLANK_COLORS.map((swatch) => (
                  <button
                    className={`frame-color-swatch${color === swatch ? ' is-selected' : ''}`}
                    style={{ backgroundColor: swatch }}
                    type="button"
                    key={swatch}
                    onClick={() => setColor(swatch)}
                    aria-label={swatch}
                    aria-pressed={color === swatch}
                  />
                ))}
                <label className="frame-color-input">
                  <input
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    aria-label={t('customColor')}
                  />
                  <span>{t('customColor')}</span>
                </label>
              </div>
            ) : null}
          </div>

          <div className="frame-control-group">
            <span className="frame-control-title">{t('frameStyles')}</span>
            <div className="frame-style-strip">
              {styleIds.map((styleId) => {
                const representative = styleTemplates.find(
                  (template) => template.styleId === styleId,
                );
                return (
                  <button
                    className={`frame-style-button${selectedStyle === styleId ? ' is-selected' : ''}`}
                    type="button"
                    key={styleId}
                    onClick={() => selectStyle(styleId)}
                    aria-pressed={selectedStyle === styleId}
                  >
                    <span
                      className="frame-style-dot"
                      style={{ backgroundColor: representative?.accentColor }}
                    />
                    <span>
                      {localizedName(representative?.styleName, locale) ||
                        styleId}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="frame-control-group">
            <span className="frame-control-title">{t('frameIpTitle')}</span>
            <div className="frame-ip-strip">
              {ipTemplates.map((template) => {
                const active =
                  selectedTemplate.id === template.id &&
                  selectedTemplate.styleId === selectedStyle;
                return (
                  <button
                    className={`frame-ip-button${active ? ' is-selected' : ''}`}
                    type="button"
                    key={template.id}
                    onClick={() => {
                      setSelectedStyle(template.styleId ?? null);
                      setSelected(template.id);
                    }}
                    aria-pressed={active}
                  >
                    <span>{localizedName(template.collectionName, locale)}</span>
                    {active ? <Check size={15} aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <button
        className="pill-button pill-button-primary"
        type="button"
        onClick={continueToEditor}
      >
        {t('continue')}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </main>
  );
}
