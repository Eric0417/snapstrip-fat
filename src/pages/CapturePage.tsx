import { Camera, RefreshCw, Square, SwitchCamera, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLayout } from '../app/layouts';
import { useSession } from '../app/session';
import type { PhotoShot } from '../app/types';
import { getFrameTemplatesForLayout } from '../data/templates';
import { filesToShots } from '../features/capture/upload';
import { useCameraSession } from '../features/capture/useCameraSession';
import { useLanguage } from '../i18n/LanguageContext';

const COUNTDOWN_SECONDS = 3;

type CapturePhase =
  | 'idle'
  | 'starting'
  | 'counting'
  | 'capturing'
  | 'processing-upload'
  | 'error'
  | 'done';

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export function CapturePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const layoutId = useSession((state) => state.layoutId);
  const setShots = useSession((state) => state.setShots);
  const layout = getLayout(layoutId);
  const hasFrameTemplates = getFrameTemplatesForLayout(layoutId).length > 0;
  const {
    videoRef,
    status: cameraStatus,
    error: cameraError,
    facingMode,
    start,
    stop,
    switchCamera,
    captureShot,
  } = useCameraSession();
  const [phase, setPhase] = useState<CapturePhase>('idle');
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [shots, setLocalShots] = useState<PhotoShot[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  const beginSession = useCallback(async () => {
    cancelledRef.current = false;
    setLocalShots([]);
    setUploadError(null);
    setPhase('starting');

    try {
      await start(facingMode);
      const captured: PhotoShot[] = [];

      for (let index = 0; index < 4; index += 1) {
        for (let second = COUNTDOWN_SECONDS; second > 0; second -= 1) {
          if (cancelledRef.current) return;
          setCount(second);
          setPhase('counting');
          await wait(1000);
        }

        if (cancelledRef.current) return;
        setPhase('capturing');
        await wait(180);
        const shot = captureShot(layout.captureAspectRatio, facingMode === 'user');
        captured.push({
          ...shot,
          id: `shot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          source: 'camera',
        });
        setLocalShots([...captured]);
        await wait(420);
      }

      setShots(captured);
      setPhase('done');
      await wait(500);
      void navigate(hasFrameTemplates ? '/frame' : '/editor');
    } catch (cause) {
      if (cancelledRef.current) return;
      setPhase('error');
      setUploadError(cause instanceof Error ? cause.message : 'Capture failed');
    }
  }, [
    captureShot,
    facingMode,
    hasFrameTemplates,
    layout.captureAspectRatio,
    navigate,
    setShots,
    start,
  ]);

  const cancelSession = useCallback(() => {
    cancelledRef.current = true;
    stop();
    setLocalShots([]);
    setCount(COUNTDOWN_SECONDS);
    setUploadError(null);
    setPhase('idle');
  }, [stop]);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      cancelledRef.current = false;
      setPhase('processing-upload');
      setUploadError(null);

      try {
        const uploaded = await filesToShots(files, layout.captureAspectRatio);
        if (uploaded.length !== 4) {
          setUploadError(t('uploadCountError'));
          setPhase('error');
          return;
        }
        setLocalShots(uploaded);
        setShots(uploaded);
        setPhase('done');
        void navigate(hasFrameTemplates ? '/frame' : '/editor');
      } catch {
        setUploadError(t('uploadReadError'));
        setPhase('error');
      }
    },
    [hasFrameTemplates, layout.captureAspectRatio, navigate, setShots, t],
  );

  useEffect(() => () => {
    cancelledRef.current = true;
    stop();
  }, [stop]);

  const busy =
    phase === 'starting' || phase === 'counting' || phase === 'capturing' || phase === 'processing-upload';
  const showVideo = cameraStatus === 'ready' && (busy || phase === 'idle' || phase === 'done');
  const progressText =
    phase === 'starting'
      ? t('captureStarting')
      : phase === 'counting' || phase === 'capturing'
        ? t('captureProgress', {
            current: Math.min(4, shots.length + 1),
            total: 4,
          })
        : null;

  return (
    <main className="capture-page">
      <section className="page-intro">
        <h1>{t('captureTitle')}</h1>
        <p>{t('captureHint')}</p>
      </section>

      <section className="capture-layout" aria-label="Camera preview">
        <div className="camera-frame" data-aspect={layout.captureAspectRatio >= 1 ? 'landscape' : 'portrait'}>
          {showVideo ? (
            <video
              ref={videoRef}
              className={`camera-feed${facingMode === 'user' ? ' is-mirrored' : ''}`}
              playsInline
              muted
              autoPlay
              aria-label="Live camera preview"
            />
          ) : (
            <div className="camera-placeholder">
              <Camera size={34} aria-hidden="true" />
              <span>{phase === 'starting' ? t('startSession') : t('captureHint')}</span>
            </div>
          )}

          {phase === 'counting' ? (
            <div className="countdown" role="timer" aria-live="assertive">
              {count}
            </div>
          ) : null}
          {phase === 'capturing' ? <div className="capture-flash" aria-hidden="true" /> : null}
        </div>

        <div className="shot-track" aria-label="Captured photos">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className={`shot-thumb${shots[index] ? ' is-filled' : ''}`} key={index}>
              {shots[index] ? (
                <img src={shots[index].dataUrl} alt={t('photoLabel', { number: index + 1 })} />
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>
        {progressText ? (
          <p className="capture-progress" role="status" aria-live="polite">
            {progressText}
          </p>
        ) : null}
      </section>

      <section className="capture-controls">
        {phase === 'idle' || phase === 'done' ? (
          <button className="pill-button pill-button-primary" type="button" onClick={() => void beginSession()}>
            <Camera size={18} aria-hidden="true" />
            {t('startSession')}
          </button>
        ) : phase === 'error' ? (
          <button className="pill-button" type="button" onClick={cancelSession}>
            <RefreshCw size={18} aria-hidden="true" />
            {t('retake')}
          </button>
        ) : null}
        {busy && phase !== 'processing-upload' ? (
          <button className="pill-button pill-button-danger" type="button" onClick={cancelSession}>
            <Square size={16} aria-hidden="true" />
            {t('stopSession')}
          </button>
        ) : null}

        {showVideo ? (
          <button className="pill-button" type="button" onClick={switchCamera} disabled={busy}>
            <SwitchCamera size={18} aria-hidden="true" />
            {facingMode === 'user' ? t('switchFrontCamera') : t('switchBackCamera')}
          </button>
        ) : null}

        <button
          className="pill-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
        >
          <Upload size={18} aria-hidden="true" />
          {t('uploadPhotos')}
        </button>
        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            void handleUpload(event.target.files);
            event.target.value = '';
          }}
        />
      </section>

      {phase === 'error' || cameraError || uploadError ? (
        <p className="capture-error" role="alert">
          {uploadError ?? t('permissionError')}
        </p>
      ) : null}
    </main>
  );
}
