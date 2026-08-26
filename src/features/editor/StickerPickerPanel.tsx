import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  categoryLabel,
  STICKERS,
  stickerName,
  type StickerAsset,
} from '../../data/stickers';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl } from '../../lib/assetUrl';

const PAGE_SIZE = 96;
const CATEGORY_ORDER = [
  'animal',
  'celestial',
  'decor',
  'speech',
  'torn',
  'sparkle',
  'doodle',
  'effect',
  'popular-ip',
];

interface StickerPickerPanelProps {
  onAdd: (sticker: StickerAsset) => void;
}

export function StickerPickerPanel({ onAdd }: StickerPickerPanelProps) {
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>('animal');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = useMemo(() => {
    const available = new Set(STICKERS.map((sticker) => sticker.category));
    return CATEGORY_ORDER.filter((item) => available.has(item));
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    return STICKERS.filter((sticker) => {
      if (category && sticker.category !== category) return false;
      if (!normalizedQuery) return true;
      const searchable = [
        sticker.id,
        stickerName(sticker, locale),
        stickerName(sticker, 'zh-Hant'),
        stickerName(sticker, 'en'),
        ...sticker.tags,
      ]
        .join(' ')
        .toLocaleLowerCase(locale);
      return searchable.includes(normalizedQuery);
    });
  }, [category, locale, query]);

  const visible = filtered.slice(0, visibleCount);

  function updateFilter(nextQuery = query, nextCategory = category) {
    setQuery(nextQuery);
    setCategory(nextCategory);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section className="sticker-picker" aria-label="Sticker library">
      <div className="sticker-picker-heading">
        <h2>Stickers</h2>
        <span>{filtered.length}</span>
      </div>

      <label className="search-field">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => updateFilter(event.target.value, category)}
          placeholder={t('searchStickers')}
          aria-label={t('searchStickers')}
        />
        {query ? (
          <button
            className="clear-search"
            type="button"
            onClick={() => updateFilter('', category)}
            aria-label="Clear search"
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : null}
      </label>

      <div className="category-row" aria-label="Sticker categories">
        <button
          type="button"
          className={category === null ? 'is-active' : ''}
          onClick={() => updateFilter(query, null)}
          aria-pressed={category === null}
        >
          {t('allStickers')}
        </button>
        {categories.map((item) => (
          <button
            type="button"
            className={category === item ? 'is-active' : ''}
            onClick={() => updateFilter(query, item)}
            aria-pressed={category === item}
            key={item}
          >
            {categoryLabel(item, locale)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="sticker-empty">No stickers match your search.</p>
      ) : (
        <div className="sticker-grid">
          {visible.map((sticker) => (
            <button
              className="sticker-thumb"
              type="button"
              key={sticker.id}
              onClick={() => onAdd(sticker)}
              aria-label={stickerName(sticker, locale)}
              title={stickerName(sticker, locale)}
            >
              <img
                src={assetUrl(sticker.thumb)}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {visibleCount < filtered.length ? (
        <button
          className="load-more-button"
          type="button"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          {t('loadMore')}
        </button>
      ) : null}
    </section>
  );
}
