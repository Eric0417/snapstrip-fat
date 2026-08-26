import { LockKeyhole } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { ACCESS_PASSWORD, ACCESS_STORAGE_KEY } from '../app/access';
import { useLanguage } from '../i18n/LanguageContext';

interface PasswordGateProps {
  onAuthorized: () => void;
}

export function PasswordGate({ onAuthorized }: PasswordGateProps) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === ACCESS_PASSWORD) {
      window.sessionStorage.setItem(ACCESS_STORAGE_KEY, '1');
      onAuthorized();
      return;
    }
    setError(true);
  }

  return (
    <main className="password-gate">
      <form className="password-gate-form" onSubmit={submit}>
        <div className="password-gate-icon" aria-hidden="true">
          <LockKeyhole size={26} />
        </div>
        <h1>snapstrip</h1>
        <label className="password-field">
          <span>{t('passwordTitle')}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(false);
            }}
            placeholder={t('passwordPlaceholder')}
            autoComplete="current-password"
            aria-label={t('passwordPlaceholder')}
            autoFocus
          />
        </label>
        {error ? <p className="password-error" role="alert">{t('wrongPassword')}</p> : null}
        <button className="pill-button pill-button-primary" type="submit">
          {t('enter')}
        </button>
      </form>
    </main>
  );
}
