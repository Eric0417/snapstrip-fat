import {
  ArrowDown,
  ArrowUp,
  Copy,
  FlipHorizontal2,
  FlipVertical2,
  Redo2,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useSession } from '../../app/session';
import { useLanguage } from '../../i18n/LanguageContext';

interface EditorToolbarProps {
  selectedId: string | null;
}

export function EditorToolbar({ selectedId }: EditorToolbarProps) {
  const { t } = useLanguage();
  const stickers = useSession((state) => state.stickers);
  const past = useSession((state) => state.past);
  const future = useSession((state) => state.future);
  const updateSticker = useSession((state) => state.updateSticker);
  const duplicateSticker = useSession((state) => state.duplicateSticker);
  const removeStickers = useSession((state) => state.removeStickers);
  const moveStickerLayer = useSession((state) => state.moveStickerLayer);
  const undoStickers = useSession((state) => state.undoStickers);
  const redoStickers = useSession((state) => state.redoStickers);
  const snapshotStickers = useSession((state) => state.snapshotStickers);
  const selected = stickers.find((sticker) => sticker.id === selectedId) ?? null;

  function commitBeforeUpdate(action: () => void) {
    snapshotStickers();
    action();
  }

  return (
    <section className="editor-toolbar" aria-label="Sticker controls">
      <div className="toolbar-actions">
        <button
          className="tool-icon"
          type="button"
          onClick={undoStickers}
          disabled={past.length === 0}
          aria-label={t('undo')}
          title={t('undo')}
        >
          <Undo2 size={18} aria-hidden="true" />
        </button>
        <button
          className="tool-icon"
          type="button"
          onClick={redoStickers}
          disabled={future.length === 0}
          aria-label={t('redo')}
          title={t('redo')}
        >
          <Redo2 size={18} aria-hidden="true" />
        </button>
        <button
          className="tool-icon"
          type="button"
          onClick={() => selectedId && duplicateSticker(selectedId)}
          disabled={!selectedId}
          aria-label="Duplicate sticker"
          title="Duplicate"
        >
          <Copy size={18} aria-hidden="true" />
        </button>
        <button
          className="tool-icon danger"
          type="button"
          onClick={() => selectedId && removeStickers([selectedId])}
          disabled={!selectedId}
          aria-label={t('delete')}
          title={t('delete')}
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="toolbar-actions">
        <button
          className="tool-icon"
          type="button"
          onClick={() => selectedId && moveStickerLayer(selectedId, 'forward')}
          disabled={!selectedId}
          aria-label={t('bringForward')}
          title={t('bringForward')}
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
        <button
          className="tool-icon"
          type="button"
          onClick={() => selectedId && moveStickerLayer(selectedId, 'backward')}
          disabled={!selectedId}
          aria-label={t('sendBackward')}
          title={t('sendBackward')}
        >
          <ArrowDown size={18} aria-hidden="true" />
        </button>
        <button
          className="tool-icon"
          type="button"
          onClick={() =>
            selected &&
            selectedId &&
            commitBeforeUpdate(() => updateSticker(selectedId, { flipX: !selected.flipX }))
          }
          disabled={!selectedId}
          aria-label={t('flipHorizontal')}
          title={t('flipHorizontal')}
        >
          <FlipHorizontal2 size={18} aria-hidden="true" />
        </button>
        <button
          className="tool-icon"
          type="button"
          onClick={() =>
            selected &&
            selectedId &&
            commitBeforeUpdate(() => updateSticker(selectedId, { flipY: !selected.flipY }))
          }
          disabled={!selectedId}
          aria-label={t('flipVertical')}
          title={t('flipVertical')}
        >
          <FlipVertical2 size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="range-controls">
        <label>
          <span>Size</span>
          <input
            type="range"
            min="0.06"
            max="0.9"
            step="0.01"
            value={selected?.scale ?? 0.24}
            disabled={!selectedId}
            onPointerDown={snapshotStickers}
            onChange={(event) =>
              selectedId && updateSticker(selectedId, { scale: Number(event.target.value) })
            }
          />
        </label>
        <label>
          <span>Rotate</span>
          <input
            type="range"
            min="0"
            max="359"
            step="1"
            value={Math.round(selected?.rotation ?? 0)}
            disabled={!selectedId}
            onPointerDown={snapshotStickers}
            onChange={(event) =>
              selectedId && updateSticker(selectedId, { rotation: Number(event.target.value) })
            }
          />
        </label>
      </div>
    </section>
  );
}
