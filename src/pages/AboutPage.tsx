import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="about-page">
      <section className="about-content" aria-labelledby="about-title">
        <div className="author-avatar">
          <img src="/author/eric.jpg" alt={t('aboutName')} />
        </div>
        <h1 id="about-title">{t('aboutName')}</h1>
        <p className="about-role">{t('aboutRole')}</p>
        <p className="about-bio">{t('aboutBio')}</p>
        <a
          className="pill-button pill-button-primary"
          href="https://github.com/Eric0417"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={18} aria-hidden="true" />
          {t('github')}
        </a>
        <Link className="text-link" to="/">
          {t('backHome')}
        </Link>
      </section>
    </main>
  );
}
