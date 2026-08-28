import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../app/session';
import {
  frameTemplateName,
  getFrameTemplatesForLayout,
} from '../data/templates';
import { FrameTemplatePreview } from '../features/templates/FrameTemplatePreview';
import { useLanguage } from '../i18n/LanguageContext';

export function FrameTemplatePage() {
  const { locale, t } = useLanguage();
  const navigate = useNavigate();
  const layoutId = useSession((state) => state.layoutId);
  const templateId = useSession((state) => state.templateId);
  const shots = useSession((state) => state.shots);
  const photoTransforms = useSession((state) => state.photoTransforms);
  const setFrameTemplate = useSession((state) => state.setFrameTemplate);
  const templates = useMemo(
    () => getFrameTemplatesForLayout(layoutId),
    [layoutId],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (templateId && templates.some((template) => template.id === templateId)) {
      setSelectedId(templateId);
    }
  }, [templateId, templates]);

  if (shots.length !== 4) {
    return <Navigate to="/capture" replace />;
  }
  if (templates.length === 0) {
    return <Navigate to="/editor" replace />;
  }

  function continueToEditor() {
    setFrameTemplate(selectedId);
    void navigate('/editor');
  }

  const options = [
    {
      id: null,
      name: t('noFrameTemplate'),
      template: undefined,
    },
    ...templates.map((template) => ({
      id: template.id,
      name: frameTemplateName(template, locale),
      template,
    })),
  ];

  return (
    <main className="content-page">
      <section className="page-intro">
        <h1>{t('frameTitle')}</h1>
        <p>{t('frameBody')}</p>
      </section>

      <section className="template-gallery" aria-label={t('frameTitle')}>
        {options.map((option) => {
          const selected = selectedId === option.id;
          return (
            <button
              className={`template-option${selected ? ' is-selected' : ''}`}
              type="button"
              key={option.id ?? 'none'}
              onClick={() => setSelectedId(option.id)}
              aria-pressed={selected}
              aria-label={option.name}
            >
              <span className="template-option-preview">
                <FrameTemplatePreview
                  layoutId={layoutId}
                  template={option.template}
                  shots={shots}
                  photoTransforms={photoTransforms}
                  className="template-option-canvas"
                />
              </span>
              <span className="template-option-label">
                {option.name}
                {selected ? <Check size={17} aria-hidden="true" /> : null}
              </span>
            </button>
          );
        })}
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
