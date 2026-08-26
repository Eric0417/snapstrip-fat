import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LAYOUTS, layoutBounds } from '../app/layouts';
import { useSession } from '../app/session';
import type { LayoutId } from '../app/types';
import { useLanguage } from '../i18n/LanguageContext';

const LAYOUT_LABEL_KEYS = {
  grid: 'grid',
  square: 'square',
  bento: 'bento',
  'portrait-grid': 'portraitGrid',
  vertical: 'vertical',
  classic: 'classic',
  horizontal: 'horizontal',
  wide: 'wide',
} as const;

export function LayoutPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const setLayout = useSession((state) => state.setLayout);
  const [selected, setSelected] = useState<LayoutId>('grid');

  function continueToCapture() {
    setLayout(selected);
    void navigate('/capture');
  }

  return (
    <main className="content-page">
      <section className="page-intro">
        <h1>{t('layoutTitle')}</h1>
        <p>{t('layoutBody')}</p>
      </section>

      <section className="layout-grid" aria-label="Layout options">
        {LAYOUTS.map((layout) => {
          const active = selected === layout.id;
          const height = layoutBounds(layout).height;
          return (
            <button
              className={`layout-card${active ? ' is-selected' : ''}`}
              type="button"
              key={layout.id}
              onClick={() => setSelected(layout.id)}
              aria-pressed={active}
            >
              <svg
                className="layout-preview"
                viewBox={`0 0 1 ${height}`}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                {layout.slots.map((slot, index) => (
                  <rect
                    className={`slot slot-${index + 1}`}
                    x={slot.x}
                    y={slot.y}
                    width={slot.width}
                    height={slot.height}
                    rx="0.02"
                    key={index}
                  />
                ))}
              </svg>
              <span className="layout-label">{t(LAYOUT_LABEL_KEYS[layout.id])}</span>
              {active ? <Check size={18} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </section>

      <button className="pill-button pill-button-primary" type="button" onClick={continueToCapture}>
        {t('continue')}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </main>
  );
}
