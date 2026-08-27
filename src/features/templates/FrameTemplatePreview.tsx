import { useEffect, useMemo, useRef } from 'react';
import type {
  FrameTemplate,
  PhotoShot,
  PhotoTransform,
} from '../../app/types';
import { STICKERS, type StickerAsset } from '../../data/stickers';
import { frameTemplateName } from '../../data/templates';
import { renderStrip, stripSize } from '../../lib/strip';
import { useLanguage } from '../../i18n/LanguageContext';

interface FrameTemplatePreviewProps {
  template: FrameTemplate;
  shots: readonly PhotoShot[];
  photoTransforms: readonly PhotoTransform[];
  templateColor?: string | null;
  className?: string;
}

export function FrameTemplatePreview({
  template,
  shots,
  photoTransforms,
  templateColor,
  className,
}: FrameTemplatePreviewProps) {
  const { locale } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stickerAssets = useMemo(() => {
    const map = new Map<string, StickerAsset>();
    for (const sticker of STICKERS) map.set(sticker.id, sticker);
    return map;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let active = true;
    const size = stripSize(template.layoutId, 640);
    canvas.width = size.width;
    canvas.height = size.height;

    void renderStrip({
      layoutId: template.layoutId,
      shots,
      stickerData: [],
      photoTransforms,
      template,
      templateStickerAssets: stickerAssets,
      templateColor,
      targetWidth: 640,
    })
      .then((rendered) => {
        if (!active) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(rendered, 0, 0);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [photoTransforms, shots, stickerAssets, template, templateColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={frameTemplateName(template, locale)}
    />
  );
}
