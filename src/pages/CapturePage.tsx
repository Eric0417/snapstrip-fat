import { Camera, RefreshCw, SwitchCamera, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLayout } from '../app/layouts';
import { useSession } from '../app/session';
import type { PhotoShot } from '../app/types';
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
      void navigate('/editor');
    } catch (cause) {
      setPhase('error');
      setUploadError(cause instanceof Error ? cause.message : 'Capture failed');
    }
  }, [captureShot, facingMode, layout.captureAspectRatio, navigate, setShots, start]);

  const resetSession = useCallback(() => {
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
        void navigate('/editor');
      } catch {
        setUploadError(t('uploadReadError'));
        setPhase('error');
      }
    },
    [layout.captureAspectRatio, navigate, setShots, t],
  );

  useEffect(() => () => {
    cancelledRef.current = true;
    stop();
  }, [stop]);

  const busy =
    phase === 'starting' || phase === 'counting' || phase === 'capturing' || phase === 'processing-upload';
  const showVideo = cameraStatus === 'ready' && (busy || phase === 'idle' || phase === 'done');

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
              {shots[index] ? <img src={shots[index].dataUrl} alt={`Shot ${index + 1}`} /> : index + 1}
            </div>
          ))}
        </div>
      </section>

      <section className="capture-controls">
        {phase === 'idle' || phase === 'done' ? (
          <button className="pill-button pill-button-primary" type="button" onClick={() => void beginSession()}>
            <Camera size={18} aria-hidden="true" />
            {t('startSession')}
          </button>
        ) : phase === 'error' ? (
          <button className="pill-button" type="button" onClick={resetSession}>
            <RefreshCw size={18} aria-hidden="true" />
            {t('retake')}
          </button>
        ) : null}

        {showVideo ? (
          <button className="pill-button" type="button" onClick={switchCamera} disabled={busy}>
            <SwitchCamera size={18} aria-hidden="true" />
            {facingMode === 'user' ? 'Back' : 'Front'}
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
