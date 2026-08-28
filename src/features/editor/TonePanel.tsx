import type { ToneId } from '../../app/types';
import { useSession } from '../../app/session';
import { TONE_PRESETS } from '../../data/tones';
import { useLanguage } from '../../i18n/LanguageContext';

function toneKey(toneId: ToneId) {
  switch (toneId) {
    case 'original':
      return 'toneOriginal' as const;
    case 'pastel':
      return 'tonePastel' as const;
    case 'warm':
      return 'toneWarm' as const;
    case 'cool':
      return 'toneCool' as const;
    case 'cream':
      return 'toneCream' as const;
    case 'mono':
      return 'toneMono' as const;
  }
}

export function TonePanel() {
  const { t } = useLanguage();
  const toneId = useSession((state) => state.toneId);
  const toneIntensity = useSession((state) => state.toneIntensity);
  const setTone = useSession((state) => state.setTone);
  const setToneIntensity = useSession((state) => state.setToneIntensity);

  return (
    <section className="tone-panel" aria-label={t('toneTitle')}>
      <div className="photo-panel-heading">
        <h2>{t('toneTitle')}</h2>
      </div>

      <div className="tone-preset-row" aria-label={t('toneTitle')}>
        {TONE_PRESETS.map((preset) => (
          <button
            className={`tone-preset${toneId === preset ? ' is-active' : ''}`}
            type="button"
            key={preset}
            onClick={() => setTone(preset)}
            aria-pressed={toneId === preset}
          >
            {t(toneKey(preset))}
          </button>
        ))}
      </div>

      <label className="tone-intensity">
        <span>{t('toneIntensity')}</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(toneIntensity * 100)}
          disabled={toneId === 'original'}
          onChange={(event) => setToneIntensity(Number(event.target.value) / 100)}
        />
        <span>{Math.round(toneIntensity * 100)}%</span>
      </label>
    </section>
  );
}
