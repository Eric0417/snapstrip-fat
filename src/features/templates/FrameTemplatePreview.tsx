import { useEffect, useRef } from 'react';
import type {
  FrameTemplate,
  LayoutId,
  PhotoShot,
  PhotoTransform,
} from '../../app/types';
import { frameTemplateName } from '../../data/templates';
import { renderStrip, stripSize } from '../../lib/strip';
import { useLanguage } from '../../i18n/LanguageContext';

interface FrameTemplatePreviewProps {
  layoutId: LayoutId;
  template?: FrameTemplate;
  shots: readonly PhotoShot[];
  photoTransforms: readonly PhotoTransform[];
  className?: string;
}

export function FrameTemplatePreview({
  layoutId,
  template,
  shots,
  photoTransforms,
  className,
}: FrameTemplatePreviewProps) {
  const { locale } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let active = true;
    const size = stripSize(layoutId, 640);
    canvas.width = size.width;
    canvas.height = size.height;

    void renderStrip({
      layoutId,
      shots,
      stickerData: [],
      photoTransforms,
      template,
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
  }, [layoutId, photoTransforms, shots, template]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={template ? frameTemplateName(template, locale) : 'No frame'}
    />
  );
}
