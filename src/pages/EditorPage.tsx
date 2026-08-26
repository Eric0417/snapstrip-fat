import { Download, LoaderCircle, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../app/session';
import { STICKERS, type StickerAsset } from '../data/stickers';
import { EditorStage } from '../features/editor/EditorStage';
import { EditorToolbar } from '../features/editor/EditorToolbar';
import { exportStripPng } from '../features/editor/editorExport';
import { PhotoAdjustPanel } from '../features/editor/PhotoAdjustPanel';
import { viewportSpawnPosition } from '../features/editor/spawn';
import { StickerPickerPanel } from '../features/editor/StickerPickerPanel';
import { useLanguage } from '../i18n/LanguageContext';

export function EditorPage() {
  const { t } = useLanguage();
  const layoutId = useSession((state) => state.layoutId);
  const shots = useSession((state) => state.shots);
  const photoTransforms = useSession((state) => state.photoTransforms);
  const stickers = useSession((state) => state.stickers);
  const addSticker = useSession((state) => state.addSticker);
  const removeStickers = useSession((state) => state.removeStickers);
  const updateSticker = useSession((state) => state.updateSticker);
  const undoStickers = useSession((state) => state.undoStickers);
  const redoStickers = useSession((state) => state.redoStickers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const editorStageRef = useRef<HTMLDivElement>(null);

  const stickerAssets = useMemo(() => {
    const map = new Map<string, StickerAsset>();
    for (const sticker of STICKERS) map.set(sticker.id, sticker);
    return map;
  }, []);

  useEffect(() => {
    if (selectedId && !stickers.some((sticker) => sticker.id === selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, stickers]);

  const handleAdd = useCallback(
    (asset: StickerAsset) => {
      setSelectedPhotoIndex(null);
      const stage = editorStageRef.current;
      const position = stage
        ? viewportSpawnPosition(
            stage.getBoundingClientRect(),
            window.innerWidth,
            window.innerHeight,
          )
        : undefined;
      setSelectedId(addSticker(asset.id, position));
    },
    [addSticker],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoStickers();
        else undoStickers();
        return;
      }
      if (!selectedId) return;

      const current = stickers.find((sticker) => sticker.id === selectedId);
      if (!current) return;
      const step = event.shiftKey ? 0.01 : 0.005;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeStickers([selectedId]);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        updateSticker(selectedId, { x: Math.max(0, current.x - step) });
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        updateSticker(selectedId, { x: Math.min(1, current.x + step) });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        updateSticker(selectedId, { y: Math.max(0, current.y - step) });
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        updateSticker(selectedId, { y: Math.min(1, current.y + step) });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [redoStickers, removeStickers, selectedId, stickers, undoStickers, updateSticker]);

  if (shots.length !== 4) {
    return (
      <main className="content-page">
        <section className="page-intro">
          <h1>{t('editorTitle')}</h1>
          <p className="empty-state">{t('noShots')}</p>
        </section>
        <Link className="pill-button pill-button-primary" to="/layout">
          <Sparkles size={18} aria-hidden="true" />
          {t('photoBooth')}
        </Link>
      </main>
    );
  }

  return (
    <main className="editor-page">
      <section className="editor-page-heading">
        <div>
          <h1>{t('editorTitle')}</h1>
          <p>{t('editorHint')}</p>
        </div>
        <button
          className="pill-button pill-button-primary export-button"
          type="button"
          onClick={() => {
            setExporting(true);
            setExportError(null);
            void exportStripPng({
              layoutId,
              shots,
              stickers,
              stickerAssets,
              photoTransforms,
            })
              .catch((error: unknown) => {
                setExportError(error instanceof Error ? error.message : 'Export failed');
              })
              .finally(() => setExporting(false));
          }}
          disabled={exporting}
        >
          {exporting ? (
            <LoaderCircle className="spin" size={18} aria-hidden="true" />
          ) : (
            <Download size={18} aria-hidden="true" />
          )}
          {t('export')}
        </button>
      </section>

      {exportError ? (
        <p className="capture-error" role="alert">
          {exportError}
        </p>
      ) : null}

      <div className="editor-workspace">
        <section className="editor-stage-panel" aria-label="Photo strip editor">
          <EditorStage
            selectedId={selectedId}
            onSelect={setSelectedId}
            stageRef={editorStageRef}
            selectedPhotoIndex={selectedPhotoIndex}
            onSelectPhoto={setSelectedPhotoIndex}
          />
        </section>
        <aside className="editor-sidebar">
          <PhotoAdjustPanel
            selectedPhotoIndex={selectedPhotoIndex}
            onSelectPhoto={setSelectedPhotoIndex}
          />
          <EditorToolbar selectedId={selectedId} />
          <StickerPickerPanel onAdd={handleAdd} />
        </aside>
      </div>
    </main>
  );
}
