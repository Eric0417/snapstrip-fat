import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useSession } from '../../app/session';
import type { StickerPlacement } from '../../app/types';
import { STICKERS, stickerName, type StickerAsset } from '../../data/stickers';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl } from '../../lib/assetUrl';
import { paintStripBaseToCanvas, slotRects, stripSize } from '../../lib/strip';

type GestureMode = 'move' | 'scale' | 'rotate' | 'pinch';

interface GestureState {
  mode: GestureMode;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  startScale: number;
  startRotation: number;
  startDistance: number;
  startAngle: number;
  centerX: number;
  centerY: number;
  pinchStartDistance: number;
  pinchStartAngle: number;
  pinchStartMidX: number;
  pinchStartMidY: number;
  pinchOriginX: number;
  pinchOriginY: number;
  pinchStartScale: number;
  pinchStartRotation: number;
  lastAngle: number;
  lastX: number;
  lastY: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rotateHandlePosition(
  placement: StickerPlacement,
  stageWidth: number,
  stageHeight: number,
) {
  return {
    centerX: placement.x * stageWidth,
    centerY: placement.y * stageHeight,
  };
}

interface EditorStageProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  stageRef: RefObject<HTMLDivElement | null>;
  selectedPhotoIndex: number | null;
  onSelectPhoto: (index: number | null) => void;
}

export function EditorStage({
  selectedId,
  onSelect,
  stageRef,
  selectedPhotoIndex,
  onSelectPhoto,
}: EditorStageProps) {
  const { locale } = useLanguage();
  const layoutId = useSession((state) => state.layoutId);
  const shots = useSession((state) => state.shots);
  const photoTransforms = useSession((state) => state.photoTransforms);
  const stickers = useSession((state) => state.stickers);
  const updateSticker = useSession((state) => state.updateSticker);
  const snapshotStickers = useSession((state) => state.snapshotStickers);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<GestureState | null>(null);
  const pendingGestureRef = useRef<React.PointerEvent<HTMLDivElement> | null>(null);
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const animationFrameRef = useRef<number | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = stageRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(1, Math.round(entry.contentRect.width));
      const size = stripSize(layoutId, 1440);
      setStageSize({ width, height: Math.round(width * (size.height / size.width)) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [layoutId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = stripSize(layoutId, 1440);
    canvas.width = size.width;
    canvas.height = size.height;
  }, [layoutId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    void paintStripBaseToCanvas(canvas, layoutId, shots, photoTransforms).catch(() => undefined);
  }, [layoutId, photoTransforms, shots]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const assetMap = useMemo(() => {
    const map = new Map<string, StickerAsset>();
    for (const sticker of STICKERS) map.set(sticker.id, sticker);
    return map;
  }, []);

  const stripSizeData = stripSize(layoutId, 1440);
  const previewInnerWidth =
    stageSize.width * (stripSizeData.innerWidth / stripSizeData.width);

  function beginGesture(
    event: React.PointerEvent,
    placement: StickerPlacement,
    mode: GestureMode,
  ) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(placement.id);
    onSelectPhoto(null);
    snapshotStickers();
    const center = rotateHandlePosition(placement, stageSize.width, stageSize.height);
    const distance = Math.hypot(event.clientX - center.centerX, event.clientY - center.centerY);
    const angle = Math.atan2(event.clientY - center.centerY, event.clientX - center.centerX);
    gestureRef.current = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: placement.x,
      originY: placement.y,
      startScale: placement.scale,
      startRotation: placement.rotation,
      startDistance: Math.max(1, distance),
      startAngle: angle,
      centerX: center.centerX,
      centerY: center.centerY,
      pinchStartDistance: distance,
      pinchStartAngle: angle,
      pinchStartMidX: center.centerX,
      pinchStartMidY: center.centerY,
      pinchOriginX: placement.x,
      pinchOriginY: placement.y,
      pinchStartScale: placement.scale,
      pinchStartRotation: placement.rotation,
      lastAngle: angle,
      lastX: event.clientX,
      lastY: event.clientY,
    };
  }

  function beginStickerGesture(
    event: React.PointerEvent<HTMLButtonElement>,
    placement: StickerPlacement,
  ) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(placement.id);
    onSelectPhoto(null);
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointersRef.current.size === 1) {
      snapshotStickers();
      const center = rotateHandlePosition(placement, stageSize.width, stageSize.height);
      const distance = Math.hypot(event.clientX - center.centerX, event.clientY - center.centerY);
      const angle = Math.atan2(event.clientY - center.centerY, event.clientX - center.centerX);
      gestureRef.current = {
        mode: 'move',
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: placement.x,
        originY: placement.y,
        startScale: placement.scale,
        startRotation: placement.rotation,
        startDistance: Math.max(1, distance),
        startAngle: angle,
        centerX: center.centerX,
        centerY: center.centerY,
        pinchStartDistance: distance,
        pinchStartAngle: angle,
        pinchStartMidX: center.centerX,
        pinchStartMidY: center.centerY,
        pinchOriginX: placement.x,
        pinchOriginY: placement.y,
        pinchStartScale: placement.scale,
        pinchStartRotation: placement.rotation,
        lastAngle: angle,
        lastX: event.clientX,
        lastY: event.clientY,
      };
      return;
    }

    const points = [...activePointersRef.current.values()];
    if (points.length === 2) {
      const [first, second] = points;
      const midX = (first.x + second.x) / 2;
      const midY = (first.y + second.y) / 2;
      gestureRef.current = {
        mode: 'pinch',
        pointerId: -1,
        startX: first.x,
        startY: first.y,
        originX: placement.x,
        originY: placement.y,
        startScale: placement.scale,
        startRotation: placement.rotation,
        startDistance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
        startAngle: Math.atan2(second.y - first.y, second.x - first.x),
        centerX: placement.x * stageSize.width,
        centerY: placement.y * stageSize.height,
        pinchStartDistance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
        pinchStartAngle: Math.atan2(second.y - first.y, second.x - first.x),
        pinchStartMidX: midX,
        pinchStartMidY: midY,
        pinchOriginX: placement.x,
        pinchOriginY: placement.y,
        pinchStartScale: placement.scale,
        pinchStartRotation: placement.rotation,
        lastAngle: Math.atan2(second.y - first.y, second.x - first.x),
        lastX: first.x,
        lastY: first.y,
      };
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || stageSize.width === 0) {
      return;
    }
    if (gesture.mode === 'pinch') {
      if (activePointersRef.current.has(event.pointerId)) {
        activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }
    } else if (gesture.pointerId !== event.pointerId) {
      return;
    }
    pendingGestureRef.current = event;
    if (animationFrameRef.current === null) {
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        flushGesture();
      });
    }
  }

  function flushGesture() {
    const gesture = gestureRef.current;
    const event = pendingGestureRef.current;
    const sticker = useSession.getState().stickers.find((item) => item.id === selectedId);
    if (!gesture || !sticker || !event || stageSize.width === 0) return;

    if (gesture.mode === 'pinch') {
      const points = [...activePointersRef.current.values()];
      if (points.length < 2) return;
      const [first, second] = points;
      const midX = (first.x + second.x) / 2;
      const midY = (first.y + second.y) / 2;
      const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
      const angle = Math.atan2(second.y - first.y, second.x - first.x);
      updateSticker(sticker.id, {
        x: clamp(
          gesture.pinchOriginX + (midX - gesture.pinchStartMidX) / stageSize.width,
          0,
          1,
        ),
        y: clamp(
          gesture.pinchOriginY + (midY - gesture.pinchStartMidY) / stageSize.height,
          0,
          1,
        ),
        scale: clamp(
          gesture.pinchStartScale * (distance / gesture.pinchStartDistance),
          0.06,
          0.9,
        ),
        rotation:
          (gesture.pinchStartRotation +
            ((angle - gesture.pinchStartAngle) * 180) / Math.PI +
            360) %
          360,
      });
      return;
    }

    if (gesture.mode === 'move') {
      updateSticker(sticker.id, {
        x: clamp(gesture.originX + (event.clientX - gesture.startX) / stageSize.width, 0, 1),
        y: clamp(gesture.originY + (event.clientY - gesture.startY) / stageSize.height, 0, 1),
      });
      return;
    }

    const centerX = gesture.centerX;
    const centerY = gesture.centerY;

    if (gesture.mode === 'scale') {
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      updateSticker(sticker.id, {
        scale: clamp(gesture.startScale * (distance / gesture.startDistance), 0.06, 0.9),
      });
      return;
    }

    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);

    updateSticker(sticker.id, {
      rotation:
        (gesture.startRotation +
          ((angle - gesture.startAngle) * 180) / Math.PI +
          360) %
        360,
    });
  }

  function endGesture(event: React.PointerEvent<HTMLDivElement>) {
    activePointersRef.current.delete(event.pointerId);
    const gesture = gestureRef.current;
    if (!gesture || (gesture.mode !== 'pinch' && gesture.pointerId !== event.pointerId)) return;

    if (gesture.mode === 'pinch') {
      flushGesture();
      pendingGestureRef.current = null;
      const remaining = [...activePointersRef.current.entries()];
      if (remaining.length === 1) {
        const [pointerId, point] = remaining[0];
        const sticker = useSession.getState().stickers.find((item) => item.id === selectedId);
        if (sticker) {
          gestureRef.current = {
            mode: 'move',
            pointerId,
            startX: point.x,
            startY: point.y,
            originX: sticker.x,
            originY: sticker.y,
            startScale: sticker.scale,
            startRotation: sticker.rotation,
            startDistance: 1,
            startAngle: 0,
            centerX: sticker.x * stageSize.width,
            centerY: sticker.y * stageSize.height,
            pinchStartDistance: 1,
            pinchStartAngle: 0,
            pinchStartMidX: point.x,
            pinchStartMidY: point.y,
            pinchOriginX: sticker.x,
            pinchOriginY: sticker.y,
            pinchStartScale: sticker.scale,
            pinchStartRotation: sticker.rotation,
            lastAngle: 0,
            lastX: point.x,
            lastY: point.y,
          };
        }
      } else if (remaining.length === 0) {
        gestureRef.current = null;
        activePointersRef.current.clear();
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return;
    }

    flushGesture();
    gestureRef.current = null;
    pendingGestureRef.current = null;
    activePointersRef.current.clear();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const ordered = [...stickers].sort((a, b) => a.z - b.z);

  return (
    <div
      ref={stageRef}
      className="editor-stage"
      style={{ aspectRatio: `${stripSizeData.width} / ${stripSizeData.height}` }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onSelect(null);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
    >
      <canvas
        ref={canvasRef}
        className="strip-canvas"
        aria-label="Photo strip preview"
      />

      {stageSize.width > 0
        ? slotRects(layoutId, stripSizeData).map((rect, index) => {
            const selected = index === selectedPhotoIndex;
            return (
              <button
                className={`photo-slot-hitbox${selected ? ' is-selected' : ''}`}
                type="button"
                key={index}
                style={{
                  left: (rect.x / stripSizeData.width) * stageSize.width,
                  top: (rect.y / stripSizeData.height) * stageSize.height,
                  width: (rect.width / stripSizeData.width) * stageSize.width,
                  height: (rect.height / stripSizeData.height) * stageSize.height,
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onSelect(null);
                  onSelectPhoto(index);
                }}
                aria-label={`Photo ${index + 1}`}
              />
            );
          })
        : null}

      {stageSize.width > 0
        ? ordered.map((placement) => {
            const asset = assetMap.get(placement.itemId);
            if (!asset) return null;
            const width = clamp(placement.scale * previewInnerWidth, 24, previewInnerWidth);
            const selected = placement.id === selectedId;

            return (
              <div
                className={`sticker-selection${selected ? ' is-selected' : ''}`}
                key={placement.id}
                style={{
                  left: 0,
                  top: 0,
                  width,
                  height: width,
                  transform: `translate(${placement.x * stageSize.width}px, ${placement.y * stageSize.height}px) translate(-50%, -50%)`,
                  zIndex: placement.z + 10,
                }}
              >
                <div
                  className="sticker-transform"
                  style={{
                    transform: `rotate(${placement.rotation}deg) scaleX(${placement.flipX ? -1 : 1}) scaleY(${placement.flipY ? -1 : 1})`,
                  }}
                >
                  <button
                    className="sticker-layer"
                    type="button"
                    onPointerDown={(event) => beginStickerGesture(event, placement)}
                    aria-label={stickerName(asset, locale)}
                  >
                    <img
                      src={assetUrl(asset.src)}
                      alt={stickerName(asset, locale)}
                      draggable={false}
                    />
                  </button>

                  {selected ? (
                    <>
                      <button
                        className="sticker-handle rotate-handle"
                        type="button"
                        onPointerDown={(event) => beginGesture(event, placement, 'rotate')}
                        aria-label="Rotate sticker"
                        title="Rotate"
                      />
                      <button
                        className="sticker-handle scale-handle"
                        type="button"
                        onPointerDown={(event) => beginGesture(event, placement, 'scale')}
                        aria-label="Resize sticker"
                        title="Resize"
                      />
                    </>
                  ) : null}
                </div>
              </div>
            );
          })
        : null}
    </div>
  );
}
