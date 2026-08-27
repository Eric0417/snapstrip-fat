import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const targetWidth = 1440;
const outputDir = resolve(process.cwd(), 'packs/templates/fan-ip/templates');

const layoutHeights = {
  grid: 1131,
  square: 1440,
  bento: 1440,
  'portrait-grid': 1853,
  vertical: 4237,
  classic: 7294,
  horizontal: 508,
  wide: 289,
};

const layoutIds = Object.keys(layoutHeights);

const ipCollections = [
  {
    id: 'hello-kitty',
    order: 1,
    names: { 'zh-Hant': 'Hello Kitty', en: 'Hello Kitty' },
    poses: [1, 5, 9],
  },
  {
    id: 'cinnamoroll',
    order: 2,
    names: { 'zh-Hant': '玉桂狗', en: 'Cinnamoroll' },
    poses: [1, 4, 7],
  },
  {
    id: 'my-melody',
    order: 3,
    names: { 'zh-Hant': '美樂蒂', en: 'My Melody' },
    poses: [1, 4, 9],
  },
  {
    id: 'kuromi',
    order: 4,
    names: { 'zh-Hant': '酷洛米', en: 'Kuromi' },
    poses: [1, 5, 9],
  },
  {
    id: 'pompompurin',
    order: 5,
    names: { 'zh-Hant': '布丁狗', en: 'Pompompurin' },
    poses: [1, 3, 7],
  },
  {
    id: 'little-twin-stars',
    order: 6,
    names: { 'zh-Hant': '雙星仙子', en: 'Little Twin Stars' },
    poses: [1, 3, 6],
  },
  {
    id: 'miffy',
    order: 7,
    names: { 'zh-Hant': '米飛兔', en: 'Miffy' },
    poses: [1, 5, 10],
  },
  {
    id: 'rilakkuma',
    order: 8,
    names: { 'zh-Hant': '拉拉熊', en: 'Rilakkuma' },
    poses: [1, 3, 4],
  },
  {
    id: 'sumikko-gurashi',
    order: 9,
    names: { 'zh-Hant': '角落生物', en: 'Sumikko Gurashi' },
    poses: [1, 4, 10],
  },
  {
    id: 'pusheen',
    order: 10,
    names: { 'zh-Hant': '胖吉貓', en: 'Pusheen' },
    poses: [1, 5, 7],
  },
  {
    id: 'kirby',
    order: 11,
    names: { 'zh-Hant': '星之卡比', en: 'Kirby' },
    poses: [1, 3, 7],
  },
  {
    id: 'snoopy',
    order: 12,
    names: { 'zh-Hant': '史努比', en: 'Snoopy' },
    poses: [1, 5, 9],
  },
  {
    id: 'mickey-mouse',
    order: 13,
    names: { 'zh-Hant': '米奇與米妮', en: 'Mickey and Minnie' },
    poses: [1, 3, 6],
  },
];

const styles = [
  {
    id: 'sweet',
    order: 1,
    names: { 'zh-Hant': '甜點蕾絲', en: 'Sweet ribbon' },
    palette: {
      base: '#fff8f4',
      soft: '#f5d9e5',
      accent: '#d76b91',
      ink: '#8b4b67',
      paper: '#fffdfb',
    },
    motif: 'heart',
    pattern: 'stripes',
    label: 'SWEET MEMORY',
  },
  {
    id: 'diary',
    order: 2,
    names: { 'zh-Hant': '手繪日記', en: 'Hand-drawn diary' },
    palette: {
      base: '#fffef8',
      soft: '#f2dfbb',
      accent: '#df8c3f',
      ink: '#4b5057',
      paper: '#fffdf8',
    },
    motif: 'flower',
    pattern: 'grid',
    label: 'MY LITTLE DIARY',
  },
  {
    id: 'film',
    order: 3,
    names: { 'zh-Hant': '膠卷回憶', en: 'Film memories' },
    palette: {
      base: '#f5f2eb',
      soft: '#d8d2c6',
      accent: '#2e292c',
      ink: '#302a2d',
      paper: '#fbf9f5',
    },
    motif: 'film',
    pattern: 'film',
    label: 'PHOTO MEMORIES',
  },
  {
    id: 'plaid',
    order: 4,
    names: { 'zh-Hant': '復古格紋', en: 'Vintage plaid' },
    palette: {
      base: '#f8f2e7',
      soft: '#dbe8f2',
      accent: '#bf415c',
      ink: '#6b4548',
      paper: '#fffdf9',
    },
    motif: 'flower',
    pattern: 'plaid',
    label: 'OUR LITTLE DAY',
  },
  {
    id: 'mono',
    order: 5,
    names: { 'zh-Hant': '黑白韓系', en: 'Korean monochrome' },
    palette: {
      base: '#1a1a1f',
      soft: '#e7e7ed',
      accent: '#f4f4f7',
      ink: '#f4f4f7',
      paper: '#f4f4f7',
    },
    motif: 'star',
    pattern: 'dots',
    label: 'HAPPY TODAY',
  },
];

const layoutPositions = {
  grid: [
    { x: 0.13, y: 0.075, scale: 0.52, rotation: -8, flipX: false },
    { x: 0.88, y: 0.08, scale: 0.34, rotation: 8, flipX: true },
    { x: 0.88, y: 0.91, scale: 0.36, rotation: -6, flipX: true },
  ],
  square: [
    { x: 0.13, y: 0.075, scale: 0.52, rotation: -7, flipX: false },
    { x: 0.88, y: 0.08, scale: 0.34, rotation: 7, flipX: true },
    { x: 0.88, y: 0.91, scale: 0.36, rotation: -6, flipX: true },
  ],
  bento: [
    { x: 0.12, y: 0.07, scale: 0.5, rotation: -7, flipX: false },
    { x: 0.88, y: 0.08, scale: 0.31, rotation: 7, flipX: true },
    { x: 0.88, y: 0.91, scale: 0.33, rotation: -6, flipX: true },
  ],
  'portrait-grid': [
    { x: 0.13, y: 0.075, scale: 0.5, rotation: -8, flipX: false },
    { x: 0.88, y: 0.075, scale: 0.34, rotation: 8, flipX: true },
    { x: 0.5, y: 0.92, scale: 0.34, rotation: 7, flipX: false },
  ],
  vertical: [
    { x: 0.12, y: 0.065, scale: 0.42, rotation: -5, flipX: false },
    { x: 0.89, y: 0.075, scale: 0.3, rotation: 7, flipX: true },
    { x: 0.12, y: 0.93, scale: 0.38, rotation: -5, flipX: false },
  ],
  classic: [
    { x: 0.12, y: 0.05, scale: 0.34, rotation: -5, flipX: false },
    { x: 0.89, y: 0.12, scale: 0.28, rotation: 7, flipX: true },
    { x: 0.5, y: 0.94, scale: 0.32, rotation: -4, flipX: false },
  ],
  horizontal: [
    { x: 0.1, y: 0.09, scale: 0.32, rotation: -7, flipX: false },
    { x: 0.9, y: 0.1, scale: 0.25, rotation: 7, flipX: true },
    { x: 0.5, y: 0.89, scale: 0.28, rotation: 5, flipX: false },
  ],
  wide: [
    { x: 0.08, y: 0.055, scale: 0.24, rotation: -7, flipX: false },
    { x: 0.92, y: 0.065, scale: 0.2, rotation: 7, flipX: true },
    { x: 0.5, y: 0.92, scale: 0.22, rotation: 5, flipX: false },
  ],
};

function round(value) {
  return Math.round(value * 100) / 100;
}

function motifPath(motif, x, y, size, fill, opacity = 1) {
  const open = `<g fill="${fill}" opacity="${opacity}">`;
  if (motif === 'heart') {
    return `${open}<path d="M ${x + size / 2} ${y + size * 0.8} C ${x} ${y + size * 0.48}, ${x} ${y + size * 0.15}, ${x + size * 0.24} ${y + size * 0.15} C ${x + size * 0.4} ${y + size * 0.15}, ${x + size * 0.52} ${y + size * 0.33}, ${x + size * 0.52} ${y + size * 0.47} C ${x + size * 0.52} ${y + size * 0.62}, ${x + size * 0.44} ${y + size * 0.72}, ${x + size * 0.5} ${y + size * 0.8} Z" />${`</g>`}`;
  }
  if (motif === 'star') {
    const points = [
      [x + size / 2, y],
      [x + size * 0.62, y + size * 0.38],
      [x + size, y + size * 0.5],
      [x + size * 0.62, y + size * 0.62],
      [x + size / 2, y + size],
      [x + size * 0.38, y + size * 0.62],
      [x, y + size * 0.5],
      [x + size * 0.38, y + size * 0.38],
    ]
      .map(([px, py]) => `${round(px)},${round(py)}`)
      .join(' ');
    return `${open}<polygon points="${points}" />${`</g>`}`;
  }
  if (motif === 'flower') {
    const petals = [0, 72, 144, 216, 288]
      .map(
        (angle) =>
          `<ellipse cx="${round(x + size / 2)}" cy="${round(y + size * 0.24)}" rx="${round(size * 0.19)}" ry="${round(size * 0.32)}" transform="rotate(${angle} ${round(x + size / 2)} ${round(y + size / 2)})" />`,
      )
      .join('');
    return `${open}${petals}<circle cx="${round(x + size / 2)}" cy="${round(y + size / 2)}" r="${round(size * 0.13)}" fill="#ffffff" opacity="0.9" />${`</g>`}`;
  }
  return `${open}<circle cx="${round(x + size / 2)}" cy="${round(y + size / 2)}" r="${round(size * 0.42)}" />${`</g>`}`;
}

function patternDefs(style, width, height) {
  const { soft, accent, ink } = style.palette;
  const unit = Math.max(42, Math.round(width * 0.03));

  if (style.pattern === 'stripes') {
    return `<defs><pattern id="pattern" width="${unit * 2}" height="${unit * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
      <rect width="${unit * 2}" height="${unit * 2}" fill="${soft}" opacity="0.12"/>
      <rect width="${unit}" height="${unit * 2}" fill="#ffffff" opacity="0.16"/>
    </pattern></defs>`;
  }

  if (style.pattern === 'grid') {
    return `<defs><pattern id="pattern" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">
      <path d="M ${unit} 0 L 0 0 L 0 ${unit}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.08"/>
    </pattern></defs>`;
  }

  if (style.pattern === 'film') {
    return `<defs><pattern id="pattern" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">
      <rect width="${unit}" height="${unit}" fill="${soft}" opacity="0.12"/>
      <rect x="${round(unit * 0.3)}" y="${round(unit * 0.3)}" width="${round(unit * 0.16)}" height="${round(unit * 0.42)}" rx="4" fill="${accent}" opacity="0.12"/>
    </pattern></defs>`;
  }

  if (style.pattern === 'plaid') {
    return `<defs><pattern id="pattern" width="${unit * 2}" height="${unit * 2}" patternUnits="userSpaceOnUse">
      <rect width="${unit * 2}" height="${unit * 2}" fill="${soft}" opacity="0.12"/>
      <path d="M ${unit} 0 L ${unit} ${unit * 2} M 0 ${unit} L ${unit * 2} ${unit}" stroke="${accent}" stroke-width="5" opacity="0.12"/>
      <rect x="0" y="0" width="${unit}" height="${unit}" fill="${accent}" opacity="0.06"/>
    </pattern></defs>`;
  }

  return `<defs><pattern id="pattern" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">
    <circle cx="${round(unit * 0.5)}" cy="${round(unit * 0.5)}" r="${round(unit * 0.09)}" fill="${soft}" opacity="0.2"/>
  </pattern></defs>`;
}

function backgroundSvg(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { base } = style.palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${patternDefs(style, width, height)}
  <rect width="${width}" height="${height}" fill="${base}"/>
  <rect width="${width}" height="${height}" fill="url(#pattern)"/>
  <rect width="${width}" height="${height}" fill="#ffffff" opacity="0.18"/>
</svg>`;
}

function gridLayout(id, columns, rows, slotAspectRatio, gapRatio) {
  const gapX = columns - 1;
  const gapY = rows - 1;
  const slotWidth = (1 - gapX * gapRatio) / columns;
  const slotHeight = slotWidth / slotAspectRatio;
  const slots = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      slots.push({
        x: column * (slotWidth + gapRatio),
        y: row * (slotHeight + gapRatio),
        width: slotWidth,
        height: slotHeight,
      });
    }
  }
  return { id, slots };
}

function bentoLayout() {
  const gap = 0.025;
  const leftWidth = 0.58;
  const rightWidth = 1 - gap - leftWidth;
  const rightHeight = (1 - gap * 2) / 3;
  return {
    slots: [
      { x: 0, y: 0, width: leftWidth, height: 1 },
      { x: leftWidth + gap, y: 0, width: rightWidth, height: rightHeight },
      { x: leftWidth + gap, y: rightHeight + gap, width: rightWidth, height: rightHeight },
      {
        x: leftWidth + gap,
        y: (rightHeight + gap) * 2,
        width: rightWidth,
        height: rightHeight,
      },
    ],
  };
}

const layoutDefinitions = {
  grid: gridLayout('grid', 2, 2, 4 / 3, 0.055),
  square: gridLayout('square', 2, 2, 1, 0.055),
  bento: bentoLayout(),
  'portrait-grid': gridLayout('portrait-grid', 2, 2, 3 / 4, 0.055),
  vertical: gridLayout('vertical', 1, 4, 4 / 3, 0.045),
  classic: gridLayout('classic', 1, 4, 3 / 4, 0.045),
  horizontal: gridLayout('horizontal', 4, 1, 3 / 4, 0.045),
  wide: gridLayout('wide', 4, 1, 16 / 9, 0.045),
};

function slotRectsForSvg(layoutId) {
  const padding = 65;
  const scale = targetWidth - padding * 2;
  return layoutDefinitions[layoutId].slots.map((slot) => ({
    x: padding + slot.x * scale,
    y: padding + slot.y * scale,
    width: slot.width * scale,
    height: slot.height * scale,
  }));
}

function frameDecorations(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { accent, soft, ink } = style.palette;
  const unit = Math.max(12, Math.round(Math.min(width, height) * 0.02));
  const motifSize = Math.max(18, unit * 1.25);
  const decorations = [];

  if (style.id === 'sweet') {
    for (const x of [width * 0.08, width * 0.18, width * 0.82, width * 0.92]) {
      decorations.push(motifPath('heart', x, Math.max(14, unit * 0.35), motifSize, accent, 0.36));
      decorations.push(motifPath('heart', x, height - Math.max(30, unit * 1.25), motifSize, accent, 0.3));
    }
  } else if (style.id === 'diary') {
    decorations.push(`<rect x="${round(unit * 0.6)}" y="${round(unit * 0.18)}" width="${round(unit * 3.6)}" height="${round(unit)}" rx="5" fill="${soft}" opacity="0.72" transform="rotate(-5 ${round(unit * 2.2)} ${round(unit * 0.7)})"/>`);
    decorations.push(`<rect x="${round(width - unit * 4.2)}" y="${round(height - unit * 1.25)}" width="${round(unit * 3.6)}" height="${round(unit)}" rx="5" fill="${soft}" opacity="0.72" transform="rotate(5 ${round(width - unit * 2.4)} ${round(height - unit * 0.7)})"/>`);
    decorations.push(`<path d="M ${round(width * 0.56)} ${round(height * 0.055)} q ${round(unit * 0.8)} ${round(unit * 0.25)} ${round(unit * 1.6)} 0 M ${round(width * 0.56)} ${round(height * 0.1)} q ${round(unit * 0.8)} ${round(unit * 0.25)} ${round(unit * 1.6)} 0" fill="none" stroke="${ink}" stroke-width="${Math.max(2, unit * 0.09)}" stroke-linecap="round" opacity="0.28"/>`);
  } else if (style.id === 'film') {
    const perforationCount = Math.max(8, Math.round(width / (unit * 1.35)));
    const spacing = (width - unit * 2) / perforationCount;
    for (let index = 0; index < perforationCount; index += 1) {
      const x = unit + spacing * index + spacing / 2;
      decorations.push(`<rect x="${round(x - unit * 0.2)}" y="${round(unit * 0.16)}" width="${round(unit * 0.4)}" height="${round(unit * 0.55)}" rx="4" fill="${accent}" opacity="0.62"/>`);
      decorations.push(`<rect x="${round(x - unit * 0.2)}" y="${round(height - unit * 0.8)}" width="${round(unit * 0.4)}" height="${round(unit * 0.55)}" rx="4" fill="${accent}" opacity="0.62"/>`);
    }
    for (let y = unit * 3; y < height - unit * 2; y += unit * 2.4) {
      decorations.push(`<rect x="${round(unit * 0.28)}" y="${round(y)}" width="${round(unit * 0.38)}" height="${round(unit * 0.48)}" rx="4" fill="${accent}" opacity="0.35"/>`);
      decorations.push(`<rect x="${round(width - unit * 0.72)}" y="${round(y)}" width="${round(unit * 0.38)}" height="${round(unit * 0.48)}" rx="4" fill="${accent}" opacity="0.35"/>`);
    }
    decorations.push(`<text x="${round(width * 0.5)}" y="${round(unit * 2.1)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${round(unit * 0.58)}" font-weight="800" fill="${accent}" opacity="0.55">${style.label}</text>`);
  } else if (style.id === 'plaid') {
    decorations.push(`<rect x="${round(unit * 0.55)}" y="${round(unit * 0.45)}" width="${round(unit * 3.2)}" height="${round(unit * 0.95)}" rx="4" fill="${accent}" opacity="0.55" transform="rotate(-6 ${round(unit * 2.1)} ${round(unit)})"/>`);
    decorations.push(`<rect x="${round(width - unit * 3.85)}" y="${round(height - unit * 1.55)}" width="${round(unit * 3.2)}" height="${round(unit * 0.95)}" rx="4" fill="${accent}" opacity="0.55" transform="rotate(6 ${round(width - unit * 2.2)} ${round(height - unit * 1.1)})"/>`);
    decorations.push(motifPath('flower', width * 0.08, height * 0.88, motifSize, accent, 0.32));
    decorations.push(motifPath('flower', width * 0.82, height * 0.05, motifSize, accent, 0.32));
  } else {
    for (const x of [width * 0.08, width * 0.5, width * 0.92]) {
      decorations.push(motifPath('star', x, Math.max(13, unit * 0.2), motifSize, ink, 0.34));
      decorations.push(motifPath('star', x, height - Math.max(30, unit * 0.9), motifSize * 0.78, ink, 0.28));
    }
    decorations.push(`<path d="M ${round(width * 0.12)} ${round(height * 0.12)} q ${round(unit * 0.8)} ${round(unit * 0.4)} ${round(unit * 1.6)} 0" fill="none" stroke="${ink}" stroke-width="${Math.max(2, unit * 0.08)}" stroke-linecap="round" opacity="0.28"/>`);
  }

  return decorations.join('');
}

function frameSvg(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { accent, ink, paper } = style.palette;
  const rects = slotRectsForSvg(layoutId);
  const stroke = style.id === 'mono' ? ink : paper;
  const outer = `<rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="26" fill="none" stroke="${stroke}" stroke-width="16" opacity="0.98"/>
  <rect x="31" y="31" width="${width - 62}" height="${height - 62}" rx="20" fill="none" stroke="${accent}" stroke-width="3" opacity="0.48"/>`;
  const slotStrokes = rects
    .map((rect, index) => `<rect x="${round(rect.x + 5)}" y="${round(rect.y + 5)}" width="${round(rect.width - 10)}" height="${round(rect.height - 10)}" rx="20" fill="none" stroke="${stroke}" stroke-width="${index % 2 === 0 ? 10 : 7}" opacity="0.94"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${outer}
  ${slotStrokes}
  ${frameDecorations(style, layoutId)}
</svg>`;
}

function blankFrameSvg(layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const rects = slotRectsForSvg(layoutId);
  const rectsSvg = rects
    .map((rect) => `<rect x="${round(rect.x + 6)}" y="${round(rect.y + 6)}" width="${round(rect.width - 12)}" height="${round(rect.height - 12)}" rx="22" fill="none" stroke="#ffffff" stroke-width="9"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="30" fill="none" stroke="#ffffff" stroke-width="15"/>
  ${rectsSvg}
</svg>`;
}

function stickerId(collection, suffix) {
  return `${collection}-sticker-${String(suffix).padStart(2, '0')}`;
}

function decoration(ip, layoutId, index) {
  const position = layoutPositions[layoutId][index];
  return {
    itemId: stickerId(ip.id, ip.poses[index % ip.poses.length]),
    x: position.x,
    y: position.y,
    scale: position.scale,
    rotation: position.rotation,
    flipX: position.flipX,
    flipY: false,
    opacity: 1,
  };
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const manifest = [];

for (const layoutId of layoutIds) {
  manifest.push({
    id: `blank-${layoutId}`,
    layoutId,
    name: { 'zh-Hant': '空白自訂', en: 'Blank custom' },
    kind: 'blank',
    collection: 'blank',
    collectionOrder: 0,
    order: 0,
    frame: `packs/templates/fan-ip/templates/frame-${layoutId}.svg`,
    decorations: [],
    license: 'original',
  });

  for (const style of styles) {
    const templateBaseId = `style-${style.id}-${layoutId}`;
    for (const ip of ipCollections) {
      const templateId = `${templateBaseId}-${ip.id}`;
      manifest.push({
        id: templateId,
        layoutId,
        name: {
          'zh-Hant': `${style.names['zh-Hant']} · ${ip.names['zh-Hant']}`,
          en: `${style.names.en} · ${ip.names.en}`,
        },
        kind: 'style',
        collection: ip.id,
        collectionOrder: ip.order,
        styleId: style.id,
        styleName: style.names,
        order: style.order,
        background: `packs/templates/fan-ip/templates/${templateBaseId}-background.svg`,
        frame: `packs/templates/fan-ip/templates/${templateBaseId}-frame.svg`,
        accentColor: style.palette.accent,
        collections: [ip.id],
        collectionName: ip.names,
        decorations: layoutPositions[layoutId].map((_, index) =>
          decoration(ip, layoutId, index),
        ),
        license: 'private-personal-use',
      });
    }
  }
}

for (const layoutId of layoutIds) {
  writeFileSync(
    resolve(outputDir, `frame-${layoutId}.svg`),
    blankFrameSvg(layoutId),
  );
}

for (const style of styles) {
  for (const layoutId of layoutIds) {
    const templateBaseId = `style-${style.id}-${layoutId}`;
    writeFileSync(
      resolve(outputDir, `${templateBaseId}-background.svg`),
      backgroundSvg(style, layoutId),
    );
    writeFileSync(
      resolve(outputDir, `${templateBaseId}-frame.svg`),
      frameSvg(style, layoutId),
    );
  }
}

writeFileSync(
  resolve(outputDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

writeFileSync(
  resolve(dirname(outputDir), 'pack.json'),
  `${JSON.stringify(
    {
      id: 'fan-ip-frames',
      kind: 'frame-template',
      displayName: {
        'zh-Hant': 'IP 主題風格相框',
        en: 'IP themed style frames',
      },
      license: 'private-personal-use',
    },
    null,
    2,
  )}\n`,
);
