import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <main className="content-page">
      <h1>{t('notFound')}</h1>
      <Link className="pill-button" to="/">
        {t('backHome')}
      </Link>
    </main>
  );
}
