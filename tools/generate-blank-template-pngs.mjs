import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const TARGET_WIDTH = 1440;
const OUTPUT_DIR = resolve(process.cwd(), 'docs/memory/blank_for_design');

const TEMPLATES = [
  {
    layoutId: 'grid',
    height: 1131,
    slots: [
      { x: 65, y: 65, width: 619, height: 464 },
      { x: 756, y: 65, width: 619, height: 464 },
      { x: 65, y: 601, width: 619, height: 464 },
      { x: 756, y: 601, width: 619, height: 464 },
    ],
  },
  {
    layoutId: 'square',
    height: 1440,
    slots: [
      { x: 65, y: 65, width: 619, height: 619 },
      { x: 756, y: 65, width: 619, height: 619 },
      { x: 65, y: 756, width: 619, height: 619 },
      { x: 756, y: 756, width: 619, height: 619 },
    ],
  },
  {
    layoutId: 'bento',
    height: 1440,
    slots: [
      { x: 65, y: 65, width: 760, height: 1310 },
      { x: 858, y: 65, width: 517, height: 415 },
      { x: 858, y: 513, width: 517, height: 415 },
      { x: 858, y: 960, width: 517, height: 415 },
    ],
  },
  {
    layoutId: 'portrait-grid',
    height: 1853,
    slots: [
      { x: 65, y: 65, width: 619, height: 825 },
      { x: 756, y: 65, width: 619, height: 825 },
      { x: 65, y: 962, width: 619, height: 825 },
      { x: 756, y: 962, width: 619, height: 825 },
    ],
  },
  {
    layoutId: 'vertical',
    height: 4237,
    slots: [
      { x: 65, y: 65, width: 1310, height: 983 },
      { x: 65, y: 1106, width: 1310, height: 983 },
      { x: 65, y: 2148, width: 1310, height: 983 },
      { x: 65, y: 3189, width: 1310, height: 983 },
    ],
  },
  {
    layoutId: 'classic',
    height: 7294,
    slots: [
      { x: 65, y: 65, width: 1310, height: 1747 },
      { x: 65, y: 1871, width: 1310, height: 1747 },
      { x: 65, y: 3676, width: 1310, height: 1747 },
      { x: 65, y: 5482, width: 1310, height: 1747 },
    ],
  },
  {
    layoutId: 'horizontal',
    height: 508,
    slots: [
      { x: 65, y: 65, width: 283, height: 378 },
      { x: 407, y: 65, width: 283, height: 378 },
      { x: 749, y: 65, width: 283, height: 378 },
      { x: 1092, y: 65, width: 283, height: 378 },
    ],
  },
  {
    layoutId: 'wide',
    height: 289,
    slots: [
      { x: 65, y: 65, width: 283, height: 159 },
      { x: 407, y: 65, width: 283, height: 159 },
      { x: 749, y: 65, width: 283, height: 159 },
      { x: 1092, y: 65, width: 283, height: 159 },
    ],
  },
];

mkdirSync(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const template of TEMPLATES) {
    const blank = await page.evaluate((size) => {
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext('2d');
      if (!context) return null;
      context.clearRect(0, 0, size.width, size.height);
      return {
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      };
    }, { width: TARGET_WIDTH, height: template.height });
    if (!blank) throw new Error(`Could not create blank template: ${template.layoutId}`);

    const blankPath = resolve(OUTPUT_DIR, `template-${template.layoutId}-blank.png`);
    writeFileSync(blankPath, Buffer.from(blank.dataUrl.split(',')[1], 'base64'));
    console.log(`${blankPath}: ${blank.width}×${blank.height} RGBA transparent`);

    const guide = await page.evaluate(({ width, height, slots }) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return null;
      context.clearRect(0, 0, width, height);

      function roundedRect(context, x, y, rectWidth, rectHeight, radius) {
        const r = Math.min(radius, rectWidth / 2, rectHeight / 2);
        context.beginPath();
        context.moveTo(x + r, y);
        context.lineTo(x + rectWidth - r, y);
        context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + r);
        context.lineTo(x + rectWidth, y + rectHeight - r);
        context.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - r, y + rectHeight);
        context.lineTo(x + r, y + rectHeight);
        context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - r);
        context.lineTo(x, y + r);
        context.quadraticCurveTo(x, y, x + r, y);
        context.closePath();
      }

      context.save();
      context.setLineDash([12, 8]);
      context.strokeStyle = 'rgba(91, 55, 72, 0.82)';
      context.lineWidth = 5;
      roundedRect(context, 24, 24, width - 48, height - 48, 26);
      context.stroke();

      context.setLineDash([18, 10]);
      context.strokeStyle = 'rgba(220, 74, 123, 0.95)';
      context.lineWidth = 4;
      slots.forEach((slot, index) => {
        context.strokeRect(slot.x, slot.y, slot.width, slot.height);
        context.setLineDash([]);
        context.fillStyle = 'rgba(91, 55, 72, 0.88)';
        context.font = 'bold 26px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(String(index + 1), slot.x + slot.width / 2, slot.y + slot.height / 2);
        context.setLineDash([18, 10]);
      });

      context.setLineDash([]);
      context.fillStyle = 'rgba(91, 55, 72, 0.9)';
      context.font = 'bold 20px sans-serif';
      context.textAlign = 'left';
      context.textBaseline = 'top';
      context.fillText(`DESIGN GUIDE · ${width} × ${height}`, 48, 42);
      context.restore();

      return {
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      };
    }, { width: TARGET_WIDTH, height: template.height, slots: template.slots });
    if (!guide) throw new Error(`Could not create design guide: ${template.layoutId}`);

    const guidePath = resolve(OUTPUT_DIR, `template-${template.layoutId}-guide.png`);
    writeFileSync(guidePath, Buffer.from(guide.dataUrl.split(',')[1], 'base64'));
    console.log(`${guidePath}: ${guide.width}×${guide.height} RGBA design guide`);
  }
} finally {
  await browser.close();
}
