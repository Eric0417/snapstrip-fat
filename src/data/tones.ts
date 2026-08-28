import type { ToneId } from '../app/types';

export const TONE_PRESETS: readonly ToneId[] = [
  'original',
  'pastel',
  'warm',
  'cool',
  'cream',
  'mono',
];

export const DEFAULT_TONE_INTENSITY = 0.8;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function toneCss(toneId: ToneId, intensity: number): string {
  const amount = clamp(intensity, 0, 1);

  switch (toneId) {
    case 'original':
      return 'none';
    case 'pastel':
      return `saturate(${1 - amount * 0.28}) brightness(${1 + amount * 0.07}) contrast(${1 - amount * 0.04})`;
    case 'warm':
      return `sepia(${amount * 0.28}) saturate(${1 + amount * 0.12}) brightness(${1 + amount * 0.03})`;
    case 'cool':
      return `hue-rotate(${amount * 12}deg) saturate(${1 + amount * 0.08}) brightness(${1 + amount * 0.02})`;
    case 'cream':
      return `sepia(${amount * 0.18}) saturate(${1 - amount * 0.12}) brightness(${1 + amount * 0.07}) contrast(${1 - amount * 0.07})`;
    case 'mono':
      return `grayscale(${amount}) contrast(${1 + amount * 0.08})`;
  }
}
