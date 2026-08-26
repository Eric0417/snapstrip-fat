import { useCallback, useEffect, useRef, useState } from 'react';
import { coverCropRect } from '../../lib/crop';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'error'
  | 'stopped';

interface PendingStart {
  resolve: () => void;
  reject: (cause: unknown) => void;
}

function waitForVideoReady(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new DOMException('Camera video timed out', 'TimeoutError'));
    }, 6000);

    function onReady() {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        cleanup();
        resolve();
      }
    }

    function cleanup() {
      window.clearTimeout(timeout);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
    }

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      cleanup();
      resolve();
      return;
    }
    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
  });
}

export function useCameraSession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingStartRef = useRef<PendingStart | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (pendingStartRef.current) {
      pendingStartRef.current.reject(new DOMException('Camera stopped', 'AbortError'));
      pendingStartRef.current = null;
    }
    setStatus('stopped');
  }, []);

  useEffect(() => {
    if (status !== 'ready') return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    let cancelled = false;
    void video
      .play()
      .then(() => waitForVideoReady(video))
      .then(() => {
        if (cancelled) return;
        pendingStartRef.current?.resolve();
        pendingStartRef.current = null;
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.name : 'Camera error');
        setStatus('error');
        pendingStartRef.current?.reject(cause);
        pendingStartRef.current = null;
        stop();
      });

    return () => {
      cancelled = true;
    };
  }, [status, stop]);

  const start = useCallback(
    async (mode: 'user' | 'environment' = facingMode) => {
      stop();
      setError(null);
      setStatus('requesting');

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new DOMException('MediaDevices API is unavailable', 'NotSupportedError');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: mode,
            width: { ideal: 1440 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
        });
        streamRef.current = stream;
        setFacingMode(mode);

        await new Promise<void>((resolve, reject) => {
          pendingStartRef.current = { resolve, reject };
          setStatus('ready');
        });
      } catch (cause) {
        stop();
        setError(cause instanceof Error ? cause.name : 'Camera error');
        setStatus('error');
        throw cause;
      }
    },
    [facingMode, stop],
  );

  const switchCamera = useCallback(() => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    void start(nextMode);
  }, [facingMode, start]);

  const captureShot = useCallback(
    (aspectRatio: number, mirror: boolean) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Camera is not ready');
      }

      const targetLongSide = 1440;
      const landscape = aspectRatio >= 1;
      const width = landscape ? targetLongSide : Math.round(targetLongSide * aspectRatio);
      const height = landscape ? Math.round(targetLongSide / aspectRatio) : targetLongSide;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas 2D context is unavailable');

      const crop = coverCropRect(video.videoWidth, video.videoHeight, aspectRatio);
      context.save();
      if (mirror) {
        context.translate(width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
      context.restore();
      return {
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        width,
        height,
      };
    },
    [],
  );

  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    status,
    error,
    facingMode,
    start,
    stop,
    switchCamera,
    captureShot,
  };
}
