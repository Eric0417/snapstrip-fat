import { RotateCcw } from 'lucide-react';
import { useSession } from '../../app/session';
import { useLanguage } from '../../i18n/LanguageContext';

interface PhotoAdjustPanelProps {
  selectedPhotoIndex: number | null;
  onSelectPhoto: (index: number | null) => void;
}

export function PhotoAdjustPanel({
  selectedPhotoIndex,
  onSelectPhoto,
}: PhotoAdjustPanelProps) {
  const { t } = useLanguage();
  const shots = useSession((state) => state.shots);
  const photoTransforms = useSession((state) => state.photoTransforms);
  const setPhotoTransform = useSession((state) => state.setPhotoTransform);
  const resetPhotoTransform = useSession((state) => state.resetPhotoTransform);
  const selectedTransform =
    selectedPhotoIndex === null ? null : photoTransforms[selectedPhotoIndex] ?? null;

  return (
    <section className="photo-adjust-panel" aria-label="Photo adjustments">
      <div className="photo-panel-heading">
        <h2>{t('photos')}</h2>
        <div className="photo-picker">
          {shots.map((shot, index) => (
            <button
              type="button"
              className={selectedPhotoIndex === index ? 'is-active' : ''}
              onClick={() => onSelectPhoto(index)}
              aria-pressed={selectedPhotoIndex === index}
              aria-label={`Photo ${index + 1}`}
              key={shot.id}
            >
              <img src={shot.dataUrl} alt="" />
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedTransform ? (
        <div className="photo-adjust-controls">
          <label>
            <span>{t('zoom')}</span>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.01"
              value={selectedTransform.scale}
              onChange={(event) =>
                setPhotoTransform(selectedPhotoIndex ?? 0, {
                  scale: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            <span>{t('photoHorizontal')}</span>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.01"
              value={selectedTransform.offsetX}
              onChange={(event) =>
                setPhotoTransform(selectedPhotoIndex ?? 0, {
                  offsetX: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            <span>{t('photoVertical')}</span>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.01"
              value={selectedTransform.offsetY}
              onChange={(event) =>
                setPhotoTransform(selectedPhotoIndex ?? 0, {
                  offsetY: Number(event.target.value),
                })
              }
            />
          </label>
          <button
            className="reset-photo-button"
            type="button"
            onClick={() => resetPhotoTransform(selectedPhotoIndex ?? 0)}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {t('resetPhoto')}
          </button>
        </div>
      ) : (
        <p className="photo-panel-hint">{t('selectPhotoHint')}</p>
      )}
    </section>
  );
}
