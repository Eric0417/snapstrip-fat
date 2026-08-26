import { Languages, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export function AppShell({ children }: { children: ReactNode }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="app-shell">
      <header className="app-nav" aria-label="Site navigation">
        <Link className="brand" to="/" aria-label={t('brand')}>
          <Sparkles size={14} aria-hidden="true" />
          <span>{t('brand')}</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/" end>
            {t('home')}
          </NavLink>
          <NavLink to="/layout">{t('photoBooth')}</NavLink>
        </nav>
        <button
          className="icon-button"
          type="button"
          onClick={() => setLocale(locale === 'zh-Hant' ? 'en' : 'zh-Hant')}
          aria-label={`${t('language')}: ${locale === 'zh-Hant' ? 'English' : '繁體中文'}`}
        >
          <Languages size={14} aria-hidden="true" />
          <span>{locale === 'zh-Hant' ? 'EN' : '中'}</span>
        </button>
      </header>
      {children}
    </div>
  );
}
