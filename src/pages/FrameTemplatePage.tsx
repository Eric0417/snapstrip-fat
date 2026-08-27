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
  const ipTemplates = useMemo(
    () => templates.filter((template) => template.kind === 'ip'),
    [templates],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [color, setColor] = useState(templateColor ?? BLANK_COLORS[0]);

  useEffect(() => {
    setSelected(
      templateId && templates.some((template) => template.id === templateId)
        ? templateId
        : (blankTemplate?.id ?? ipTemplates[0]?.id ?? null),
    );
  }, [blankTemplate, ipTemplates, templateId, templates]);

  useEffect(() => {
    if (templateColor) setColor(templateColor);
  }, [templateColor]);

  if (shots.length !== 4) {
    return <Navigate to="/capture" replace />;
  }
  if (!blankTemplate || ipTemplates.length === 0) {
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
            <span className="frame-control-title">{t('ipFrames')}</span>
            <div className="frame-ip-strip">
              {ipTemplates.map((template) => {
                const active = selectedTemplate.id === template.id;
                return (
                  <button
                    className={`frame-ip-button${active ? ' is-selected' : ''}`}
                    type="button"
                    key={template.id}
                    onClick={() => setSelected(template.id)}
                    aria-pressed={active}
                  >
                    <span
                      className="frame-ip-dot"
                      style={{ backgroundColor: template.accentColor }}
                    />
                    <span>{frameTemplateName(template, locale)}</span>
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
