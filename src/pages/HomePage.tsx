import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { DemoStrip } from '../features/showcase/DemoStrip';

export function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="welcome-page">
      <section className="welcome-content" aria-labelledby="welcome-title">
        <p className="eyebrow">SnapStrip · 4 cuts</p>
        <h1 id="welcome-title">{t('welcomeTitle')}</h1>
        <p className="welcome-copy">{t('welcomeBody')}</p>
        <DemoStrip />
        <Link className="pill-button pill-button-primary" to="/layout">
          {t('start')}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <footer className="welcome-footer">
        <div className="footer-stack">
          <Link className="made-by-button" to="/about">
            {t('madeBy')}
          </Link>
          <p>{t('privacyNote')}</p>
        </div>
      </footer>
    </main>
  );
}
