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
import { drawStripBaseToCanvas, stripSize } from '../../lib/strip';

type GestureMode = 'move' | 'scale' | 'rotate';

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
}

export function EditorStage({ selectedId, onSelect, stageRef }: EditorStageProps) {
  const { locale } = useLanguage();
  const layoutId = useSession((state) => state.layoutId);
  const shots = useSession((state) => state.shots);
  const stickers = useSession((state) => state.stickers);
  const updateSticker = useSession((state) => state.updateSticker);
  const snapshotStickers = useSession((state) => state.snapshotStickers);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<GestureState | null>(null);
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
    void drawStripBaseToCanvas(canvas, layoutId, shots).catch(() => undefined);
  }, [layoutId, shots]);

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
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    const sticker = stickers.find((item) => item.id === selectedId);
    if (!gesture || !sticker || gesture.pointerId !== event.pointerId || stageSize.width === 0) {
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
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);

    if (gesture.mode === 'scale') {
      updateSticker(sticker.id, {
        scale: clamp(gesture.startScale * (distance / gesture.startDistance), 0.06, 0.9),
      });
      return;
    }

    updateSticker(sticker.id, {
      rotation:
        (gesture.startRotation +
          ((angle - gesture.startAngle) * 180) / Math.PI +
          360) %
        360,
    });
  }

  function endGesture(event: React.PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointerId === event.pointerId) {
      gestureRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
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
                  left: placement.x * stageSize.width,
                  top: placement.y * stageSize.height,
                  width,
                  height: width,
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
                    onPointerDown={(event) => beginGesture(event, placement, 'move')}
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
