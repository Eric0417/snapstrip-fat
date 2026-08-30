import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Copy,
  FlipHorizontal2,
  FlipVertical2,
  Redo2,
  RotateCcw,
  RotateCw,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useSession } from '../../app/session';
import type { StickerPlacement } from '../../app/types';
import { useLanguage } from '../../i18n/LanguageContext';

interface EditorToolbarProps {
  selectedId: string | null;
  showMobileControls?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeRotation(rotation: number) {
  return (rotation + 360) % 360;
}

export function EditorToolbar({ selectedId, showMobileControls = false }: EditorToolbarProps) {
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

  function updateSelected(patch: Partial<StickerPlacement>) {
    if (!selected || !selectedId) return;
    snapshotStickers();
    updateSticker(selectedId, patch);
  }

  function nudgeSelected(deltaX: number, deltaY: number) {
    if (!selected || !selectedId) return;
    updateSelected({
      x: clamp(selected.x + deltaX, 0, 1),
      y: clamp(selected.y + deltaY, 0, 1),
    });
  }

  return (
    <section className="editor-toolbar" aria-label={t('editorStickers')}>
      {showMobileControls && selected ? (
        <div
          className="selected-sticker-controls"
          role="group"
          aria-label={t('selectedStickerControls')}
        >
          <span className="toolbar-section-label">{t('selectedStickerControls')}</span>
          <div className="toolbar-actions selected-sticker-actions">
            <button
              className="tool-icon"
              type="button"
              onClick={() => nudgeSelected(0, -0.015)}
              aria-label={t('moveUp')}
              title={t('moveUp')}
            >
              <ArrowUp size={18} aria-hidden="true" />
            </button>
            <button
              className="tool-icon"
              type="button"
              onClick={() => nudgeSelected(-0.015, 0)}
              aria-label={t('moveLeft')}
              title={t('moveLeft')}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              className="tool-icon"
              type="button"
              onClick={() => nudgeSelected(0.015, 0)}
              aria-label={t('moveRight')}
              title={t('moveRight')}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button
              className="tool-icon"
              type="button"
              onClick={() => nudgeSelected(0, 0.015)}
              aria-label={t('moveDown')}
              title={t('moveDown')}
            >
              <ArrowDown size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="toolbar-actions selected-sticker-actions">
            <button
              className="tool-icon"
              type="button"
              onClick={() =>
                updateSelected({
                  rotation: normalizeRotation(selected.rotation - 5),
                })
              }
              aria-label={t('rotateLeft')}
              title={t('rotateLeft')}
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
            <button
              className="tool-icon"
              type="button"
              onClick={() =>
                updateSelected({
                  rotation: normalizeRotation(selected.rotation + 5),
                })
              }
              aria-label={t('rotateRight')}
              title={t('rotateRight')}
            >
              <RotateCw size={18} aria-hidden="true" />
            </button>
            <button
              className="tool-icon"
              type="button"
              onClick={() =>
                updateSelected({
                  scale: clamp(selected.scale / 1.1, 0.06, 0.9),
                })
              }
              aria-label={t('zoomOut')}
              title={t('zoomOut')}
            >
              <ZoomOut size={18} aria-hidden="true" />
            </button>
            <button
              className="tool-icon"
              type="button"
              onClick={() =>
                updateSelected({
                  scale: clamp(selected.scale * 1.1, 0.06, 0.9),
                })
              }
              aria-label={t('zoomIn')}
              title={t('zoomIn')}
            >
              <ZoomIn size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

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
          aria-label={t('duplicateSticker')}
          title={t('duplicateSticker')}
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

    </section>
  );
}
