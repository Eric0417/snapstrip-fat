export interface ViewportRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function viewportSpawnPosition(
  rect: ViewportRect,
  viewportWidth: number,
  viewportHeight: number,
  visibleBottom = viewportHeight,
) {
  if (rect.width <= 0 || rect.height <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
    return { x: 0.5, y: 0.5 };
  }

  const visibleLeft = Math.max(rect.left, 0);
  const visibleRight = Math.min(rect.right, viewportWidth);
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottomValue = Math.min(rect.bottom, viewportHeight, visibleBottom);

  if (visibleRight <= visibleLeft || visibleBottomValue <= visibleTop) {
    return { x: 0.5, y: 0.5 };
  }

  return {
    x: clamp(((visibleLeft + visibleRight) / 2 - rect.left) / rect.width, 0.02, 0.98),
    y: clamp(((visibleTop + visibleBottomValue) / 2 - rect.top) / rect.height, 0.02, 0.98),
  };
}
