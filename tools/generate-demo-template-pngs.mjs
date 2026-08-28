import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const TARGET_WIDTH = 1440;
const PADDING = Math.round(TARGET_WIDTH * 0.045);
const INNER_WIDTH = TARGET_WIDTH - PADDING * 2;
const OUTPUT_DIR = resolve(process.cwd(), 'packs/templates/demo/templates');

const LAYOUTS = [
  { id: 'grid', height: 1131, slots: twoByTwo(4 / 3, 0.055) },
  { id: 'square', height: 1440, slots: twoByTwo(1, 0.055) },
  { id: 'bento', height: 1440, slots: bentoSlots() },
  { id: 'portrait-grid', height: 1853, slots: twoByTwo(3 / 4, 0.055) },
  { id: 'vertical', height: 4237, slots: oneByFour(4 / 3, 0.045) },
  { id: 'classic', height: 7294, slots: oneByFour(3 / 4, 0.045) },
  { id: 'horizontal', height: 508, slots: fourByOne(3 / 4, 0.045) },
  { id: 'wide', height: 289, slots: fourByOne(16 / 9, 0.045) },
];

function normalizedSlots(slots) {
  return slots.map((slot) => ({
    x: Math.round(PADDING + slot.x * INNER_WIDTH),
    y: Math.round(PADDING + slot.y * INNER_WIDTH),
    width: Math.round(slot.width * INNER_WIDTH),
    height: Math.round(slot.height * INNER_WIDTH),
  }));
}

function layoutHeight(slots) {
  return Math.max(...slots.map((slot) => slot.y + slot.height)) + PADDING;
}

function twoByTwo(aspect, gap) {
  const width = (1 - gap) / 2;
  const height = width / aspect;
  return normalizedSlots([
    { x: 0, y: 0, width, height },
    { x: width + gap, y: 0, width, height },
    { x: 0, y: height + gap, width, height },
    { x: width + gap, y: height + gap, width, height },
  ]);
}

function oneByFour(aspect, gap) {
  const width = 1;
  const height = width / aspect;
  return normalizedSlots([
    { x: 0, y: 0, width, height },
    { x: 0, y: height + gap, width, height },
    { x: 0, y: (height + gap) * 2, width, height },
    { x: 0, y: (height + gap) * 3, width, height },
  ]);
}

function fourByOne(aspect, gap) {
  const width = (1 - gap * 3) / 4;
  const height = width / aspect;
  return normalizedSlots([
    { x: 0, y: 0, width, height },
    { x: width + gap, y: 0, width, height },
    { x: (width + gap) * 2, y: 0, width, height },
    { x: (width + gap) * 3, y: 0, width, height },
  ]);
}

function bentoSlots() {
  const gap = 0.025;
  const leftWidth = 0.58;
  const rightWidth = 1 - gap - leftWidth;
  const rightHeight = (1 - gap * 2) / 3;
  return normalizedSlots([
    { x: 0, y: 0, width: leftWidth, height: 1 },
    { x: leftWidth + gap, y: 0, width: rightWidth, height: rightHeight },
    { x: leftWidth + gap, y: rightHeight + gap, width: rightWidth, height: rightHeight },
    { x: leftWidth + gap, y: (rightHeight + gap) * 2, width: rightWidth, height: rightHeight },
  ]);
}

const RENDER_SCRIPT = `
function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function drawHeart(context, x, y, size, color, alpha = 0.85) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.globalAlpha = alpha;
  context.beginPath();
  context.moveTo(0, size * 0.28);
  context.bezierCurveTo(-size, -size * 0.25, -size * 0.45, -size * 0.8, 0, -size * 0.22);
  context.bezierCurveTo(size * 0.45, -size * 0.8, size, -size * 0.25, 0, size * 0.28);
  context.closePath();
  context.fill();
  context.restore();
}

function drawStar(context, x, y, size, color, alpha = 0.8) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.globalAlpha = alpha;
  context.beginPath();
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? size : size * 0.42;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.fill();
  context.restore();
}

function drawTape(context, x, y, width, height, rotation, color) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.globalAlpha = 0.68;
  context.fillStyle = color;
  context.fillRect(-width / 2, -height / 2, width, height);
  context.globalAlpha = 0.85;
  context.strokeStyle = 'rgba(117, 84, 104, 0.25)';
  context.lineWidth = 2;
  context.strokeRect(-width / 2, -height / 2, width, height);
  context.restore();
}

function drawFilmHoles(context, layout, color) {
  const vertical = layout.id === 'vertical' || layout.id === 'classic';
  const horizontal = layout.id === 'horizontal' || layout.id === 'wide';
  if (!vertical && !horizontal) return;

  context.save();
  context.fillStyle = color;
  context.globalAlpha = 0.9;
  const holeWidth = 18;
  const holeHeight = 30;
  const step = 72;
  if (vertical) {
    for (let y = 78; y < layout.height - 78; y += step) {
      roundedRect(context, 31, y, holeWidth, holeHeight, 5);
      context.fill();
      roundedRect(context, layout.width - 49, y, holeWidth, holeHeight, 5);
      context.fill();
    }
  } else {
    for (let x = 78; x < layout.width - 78; x += step) {
      roundedRect(context, x, 31, holeWidth, holeHeight, 5);
      context.fill();
      roundedRect(context, x, layout.height - 61, holeWidth, holeHeight, 5);
      context.fill();
    }
  }
  context.restore();
}

function drawDateMark(context, layout, color) {
  const width = 112;
  const height = 28;
  const x = layout.width - width - 22;
  const y = layout.height - height - 22;
  context.save();
  context.globalAlpha = 0.72;
  context.fillStyle = color;
  roundedRect(context, x, y, width, height, 14);
  context.fill();
  context.strokeStyle = 'rgba(117, 84, 104, 0.45)';
  context.lineWidth = 2;
  roundedRect(context, x + 8, y + 7, width - 16, height - 14, 8);
  context.stroke();
  context.restore();
}

window.renderDemoTemplate = function(context, layout) {
  context.clearRect(0, 0, layout.width, layout.height);
  const ink = '#765468';
  const rose = '#f2b8c8';
  const cream = '#fff0d9';
  const sky = '#d2eaf4';
  const mint = '#d7efd9';
  const lavender = '#e4d7f0';

  context.lineJoin = 'round';
  context.lineCap = 'round';

  roundedRect(context, 24, 24, layout.width - 48, layout.height - 48, 28);
  context.strokeStyle = ink;
  context.lineWidth = 18;
  context.stroke();

  for (const rect of layout.slots) {
    roundedRect(context, rect.x - 22, rect.y - 22, rect.width + 44, rect.height + 44, 20);
    context.strokeStyle = rose;
    context.lineWidth = 9;
    context.stroke();
  }

  drawFilmHoles(context, layout, ink);

  if (layout.id === 'grid') {
    drawHeart(context, 48, 48, 18, rose);
    drawHeart(context, layout.width - 48, 48, 18, sky);
    drawHeart(context, 48, layout.height - 48, 18, mint);
    drawHeart(context, layout.width - 48, layout.height - 48, 18, lavender);
  } else if (layout.id === 'square') {
    drawTape(context, 44, 48, 34, 22, -0.65, cream);
    drawTape(context, layout.width - 44, 48, 34, 22, 0.65, sky);
    drawTape(context, 44, layout.height - 48, 34, 22, 0.65, mint);
    drawTape(context, layout.width - 44, layout.height - 48, 34, 22, -0.65, lavender);
  } else if (layout.id === 'bento') {
    drawTape(context, 44, 46, 34, 24, -0.55, cream);
    drawTape(context, layout.width - 44, 46, 34, 24, 0.55, sky);
    drawTape(context, 44, layout.height - 46, 34, 24, 0.55, mint);
  } else if (layout.id === 'portrait-grid') {
    drawStar(context, 45, 45, 16, rose);
    drawStar(context, layout.width - 45, 45, 16, sky);
    drawStar(context, 45, layout.height - 45, 16, mint);
    drawDateMark(context, layout, lavender);
  } else if (layout.id === 'vertical' || layout.id === 'classic') {
    drawStar(context, 48, 48, 20, rose);
    drawStar(context, layout.width - 48, 48, 20, sky);
    drawStar(context, 48, layout.height - 48, 20, mint);
    drawStar(context, layout.width - 48, layout.height - 48, 20, lavender);
  } else if (layout.id === 'horizontal') {
    drawStar(context, 45, layout.height - 45, 14, rose);
    drawStar(context, layout.width - 45, layout.height - 45, 14, sky);
  } else if (layout.id === 'wide') {
    drawDateMark(context, layout, cream);
    drawTape(context, 46, layout.height - 45, 34, 22, 0.35, mint);
  }
};

window.validateDemoTemplate = function(layout, canvas) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const margins = [
    { x: 30, y: 30 },
    { x: layout.width - 30, y: 30 },
    { x: 30, y: layout.height - 30 },
    { x: layout.width - 30, y: layout.height - 30 },
  ];
  const slotAlphas = layout.slots.map((rect) => {
    const pixels = context.getImageData(rect.x, rect.y, rect.width, rect.height).data;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] !== 0) return false;
    }
    return true;
  });
  const content = context.getImageData(0, 0, layout.width, layout.height).data;
  let minX = layout.width;
  let minY = layout.height;
  let maxX = -1;
  let maxY = -1;
  for (let index = 3; index < content.length; index += 4) {
    if (content[index] === 0) continue;
    const pixel = (index - 3) / 4;
    const x = pixel % layout.width;
    const y = Math.floor(pixel / layout.width);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const contentBounds = { minX, minY, maxX, maxY };
  const borderAlphas = margins.map((point) => {
    const pixel = context.getImageData(point.x, point.y, 1, 1).data;
    return pixel[3] > 0;
  });
  return {
    width: canvas.width,
    height: canvas.height,
    slotAlphas,
    borderAlphas,
    contentBounds,
  };
};
`;

mkdirSync(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.addScriptTag({ content: RENDER_SCRIPT });
  for (const layout of LAYOUTS) {
    const normalizedLayout = {
      ...layout,
      width: TARGET_WIDTH,
      height: layout.height,
    };
    const result = await page.evaluate((current) => {
      const canvas = document.createElement('canvas');
      canvas.width = current.width;
      canvas.height = current.height;
      window.renderDemoTemplate(canvas.getContext('2d'), current);
      return {
        dataUrl: canvas.toDataURL('image/png'),
        checks: window.validateDemoTemplate(current, canvas),
      };
    }, normalizedLayout);
    const buffer = Buffer.from(result.dataUrl.split(',')[1], 'base64');
    const outputPath = resolve(OUTPUT_DIR, `template-${layout.id}-demo.png`);
    writeFileSync(outputPath, buffer);
    console.log(
      `${outputPath}: ${result.checks.width}×${result.checks.height}, transparency=${result.checks.slotAlphas.every(Boolean)}, border=${result.checks.borderAlphas.some(Boolean)}`,
    );
    const bounds = result.checks.contentBounds;
    const insideCanvas =
      bounds.minX > 0 &&
      bounds.minY > 0 &&
      bounds.maxX < result.checks.width - 1 &&
      bounds.maxY < result.checks.height - 1;
    if (
      !result.checks.slotAlphas.every(Boolean) ||
      !result.checks.borderAlphas.some(Boolean) ||
      !insideCanvas
    ) {
      throw new Error(`Template validation failed for ${layout.id}`);
    }
  }
} finally {
  await browser.close();
}
