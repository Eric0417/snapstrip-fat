import { ArrowLeft, Languages, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const MOBILE_FLOW = {
  '/layout': { step: 1, back: '/', title: 'layoutTitle' },
  '/capture': { step: 2, back: '/layout', title: 'captureTitle' },
  '/frame': { step: 3, back: '/capture', title: 'frameTitle' },
} as const;

function MobileFlowHeader({ path }: { path: string }) {
  const { locale, setLocale, t } = useLanguage();
  const navigate = useNavigate();
  const flow = MOBILE_FLOW[path as keyof typeof MOBILE_FLOW];

  return (
    <header className="mobile-flow-header" aria-label={t('photoBooth')}>
      <button
        className="mobile-flow-back"
        type="button"
        onClick={() => navigate(flow.back)}
        aria-label={t('back')}
        title={t('back')}
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </button>
      <div className="mobile-flow-copy">
        <span>{t('flowStep', { current: flow.step, total: 4 })}</span>
        <strong className="mobile-flow-title">{t(flow.title)}</strong>
      </div>
      <button
        className="mobile-flow-language"
        type="button"
        onClick={() => setLocale(locale === 'zh-Hant' ? 'en' : 'zh-Hant')}
        aria-label={`${t('language')}: ${locale === 'zh-Hant' ? 'English' : '繁體中文'}`}
      >
        <Languages size={14} aria-hidden="true" />
        <span>{locale === 'zh-Hant' ? 'EN' : '中'}</span>
      </button>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { locale, setLocale, t } = useLanguage();
  const location = useLocation();
  const isEditor = location.pathname === '/editor';
  const isFlowPage = location.pathname in MOBILE_FLOW;
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div
      className={`app-shell${isEditor ? ' is-editor-page' : ''}${isFlowPage ? ' is-flow-page' : ''}${isHomePage ? ' is-home-page' : ''}`}
    >
      {isFlowPage ? <MobileFlowHeader path={location.pathname} /> : null}
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
