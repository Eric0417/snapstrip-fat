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

const styleStickerSets = {
  sweet: [
    ['hello-kitty', [1, 3, 6, 9, 12, 16]],
    ['cinnamoroll', [1, 3, 5, 7, 9, 16]],
    ['my-melody', [1, 4, 9, 12, 14, 16]],
    ['pompompurin', [1, 2, 3, 4, 6, 8]],
    ['little-twin-stars', [1, 2, 4, 6, 8, 10]],
  ],
  diary: [
    ['kirby', [1, 3, 4, 6, 9, 12]],
    ['sumikko-gurashi', [1, 2, 3, 4, 8, 14]],
    ['pusheen', [1, 2, 4, 6, 10, 12]],
    ['miffy', [1, 3, 5, 9, 11, 16]],
    ['rilakkuma', [1, 3, 4, 7, 9, 14]],
  ],
  film: [
    ['hello-kitty', [1, 3, 6, 9, 12, 16]],
    ['cinnamoroll', [1, 3, 5, 7, 9, 16]],
    ['kirby', [1, 3, 4, 6, 9, 12]],
    ['snoopy', [1, 2, 3, 4, 8, 11]],
    ['mickey-mouse', [1, 2, 3, 5, 9, 12]],
  ],
  plaid: [
    ['mickey-mouse', [1, 2, 3, 5, 9, 12]],
    ['miffy', [1, 3, 5, 9, 11, 16]],
    ['little-twin-stars', [1, 2, 4, 6, 8, 10]],
    ['rilakkuma', [1, 3, 4, 7, 9, 14]],
    ['sumikko-gurashi', [1, 2, 3, 4, 8, 14]],
  ],
  mono: [
    ['kuromi', [1, 3, 6, 8, 10, 14]],
    ['snoopy', [1, 2, 3, 4, 8, 11]],
    ['pusheen', [1, 2, 4, 6, 10, 12]],
    ['mickey-mouse', [1, 2, 3, 5, 9, 12]],
    ['my-melody', [1, 4, 9, 12, 14, 16]],
  ],
};

const layoutPositions = {
  grid: [
    { x: 0.1, y: 0.08, scale: 0.46, rotation: -8, flipX: false },
    { x: 0.9, y: 0.1, scale: 0.32, rotation: 8, flipX: true },
    { x: 0.88, y: 0.89, scale: 0.3, rotation: -6, flipX: true },
    { x: 0.13, y: 0.87, scale: 0.32, rotation: 7, flipX: false },
    { x: 0.5, y: 0.055, scale: 0.18, rotation: -4, flipX: false },
  ],
  square: [
    { x: 0.1, y: 0.07, scale: 0.46, rotation: -7, flipX: false },
    { x: 0.9, y: 0.09, scale: 0.32, rotation: 7, flipX: true },
    { x: 0.88, y: 0.9, scale: 0.3, rotation: -6, flipX: true },
    { x: 0.13, y: 0.88, scale: 0.32, rotation: 7, flipX: false },
    { x: 0.5, y: 0.05, scale: 0.18, rotation: -3, flipX: false },
  ],
  bento: [
    { x: 0.07, y: 0.07, scale: 0.44, rotation: -7, flipX: false },
    { x: 0.91, y: 0.08, scale: 0.3, rotation: 7, flipX: true },
    { x: 0.93, y: 0.34, scale: 0.24, rotation: -5, flipX: true },
    { x: 0.93, y: 0.67, scale: 0.24, rotation: 5, flipX: true },
    { x: 0.11, y: 0.92, scale: 0.28, rotation: 7, flipX: false },
  ],
  'portrait-grid': [
    { x: 0.1, y: 0.07, scale: 0.46, rotation: -8, flipX: false },
    { x: 0.9, y: 0.09, scale: 0.32, rotation: 8, flipX: true },
    { x: 0.88, y: 0.91, scale: 0.3, rotation: -6, flipX: true },
    { x: 0.13, y: 0.91, scale: 0.32, rotation: 7, flipX: false },
    { x: 0.5, y: 0.045, scale: 0.18, rotation: -4, flipX: false },
  ],
  vertical: [
    { x: 0.08, y: 0.065, scale: 0.4, rotation: -5, flipX: false },
    { x: 0.94, y: 0.08, scale: 0.32, rotation: 7, flipX: true },
    { x: 0.07, y: 0.26, scale: 0.28, rotation: -4, flipX: false },
    { x: 0.95, y: 0.73, scale: 0.29, rotation: 6, flipX: true },
    { x: 0.07, y: 0.93, scale: 0.32, rotation: -5, flipX: false },
  ],
  classic: [
    { x: 0.08, y: 0.055, scale: 0.36, rotation: -5, flipX: false },
    { x: 0.94, y: 0.145, scale: 0.3, rotation: 7, flipX: true },
    { x: 0.07, y: 0.37, scale: 0.28, rotation: -4, flipX: false },
    { x: 0.95, y: 0.64, scale: 0.29, rotation: 6, flipX: true },
    { x: 0.07, y: 0.91, scale: 0.33, rotation: -5, flipX: false },
  ],
  horizontal: [
    { x: 0.08, y: 0.1, scale: 0.33, rotation: -7, flipX: false },
    { x: 0.28, y: 0.9, scale: 0.27, rotation: 6, flipX: true },
    { x: 0.5, y: 0.1, scale: 0.27, rotation: -5, flipX: false },
    { x: 0.72, y: 0.9, scale: 0.27, rotation: 6, flipX: true },
    { x: 0.9, y: 0.1, scale: 0.33, rotation: -6, flipX: false },
  ],
  wide: [
    { x: 0.07, y: 0.08, scale: 0.22, rotation: -7, flipX: false },
    { x: 0.28, y: 0.91, scale: 0.2, rotation: 6, flipX: true },
    { x: 0.5, y: 0.08, scale: 0.2, rotation: -5, flipX: false },
    { x: 0.72, y: 0.91, scale: 0.2, rotation: 6, flipX: true },
    { x: 0.9, y: 0.08, scale: 0.22, rotation: -6, flipX: false },
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
  if (motif === 'cloud') {
    return `${open}<path d="M ${x} ${y + size * 0.75} Q ${x} ${y + size * 0.25} ${x + size * 0.42} ${y + size * 0.28} Q ${x + size * 0.45} ${y} ${x + size * 0.78} ${y + size * 0.14} Q ${x + size} ${y + size * 0.38} ${x + size} ${y + size * 0.75} Z" />${`</g>`}`;
  }
  if (motif === 'paw') {
    return `${open}<ellipse cx="${round(x + size / 2)}" cy="${round(y + size * 0.6)}" rx="${round(size * 0.34)}" ry="${round(size * 0.25)}" /><circle cx="${round(x + size * 0.2)}" cy="${round(y + size * 0.24)}" r="${round(size * 0.11)}" /><circle cx="${round(x + size * 0.42)}" cy="${round(y + size * 0.14)}" r="${round(size * 0.13)}" /><circle cx="${round(x + size * 0.65)}" cy="${round(y + size * 0.14)}" r="${round(size * 0.13)}" /><circle cx="${round(x + size * 0.84)}" cy="${round(y + size * 0.24)}" r="${round(size * 0.11)}" />${`</g>`}`;
  }
  if (motif === 'squiggle') {
    return `${open}<path d="M ${x} ${y + size * 0.55} Q ${x + size * 0.2} ${y} ${x + size * 0.4} ${y + size * 0.55} T ${x + size * 0.8} ${y + size * 0.55} T ${x + size} ${y + size * 0.55}" fill="none" stroke="${fill}" stroke-width="${Math.max(3, size * 0.12)}" stroke-linecap="round" />${`</g>`}`;
  }
  return `${open}<circle cx="${round(x + size / 2)}" cy="${round(y + size / 2)}" r="${round(size * 0.42)}" />${`</g>`}`;
}

function patternDefs(style, width, height) {
  const { soft, accent, ink } = style.palette;
  const unit = Math.max(38, Math.round(Math.min(width, height) * 0.035));

  if (style.pattern === 'stripes') {
    return `<defs><pattern id="pattern" width="${unit * 2}" height="${unit * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
      <rect width="${unit * 2}" height="${unit * 2}" fill="${soft}" opacity="0.2"/>
      <rect width="${unit}" height="${unit * 2}" fill="#ffffff" opacity="0.26"/>
      ${motifPath(style.motif, unit * 0.26, unit * 0.18, unit * 0.46, accent, 0.2)}
    </pattern></defs>`;
  }

  if (style.pattern === 'grid') {
    return `<defs><pattern id="pattern" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">
      <rect width="${unit}" height="${unit}" fill="none"/>
      <path d="M ${unit} 0 L 0 0 L 0 ${unit}" fill="none" stroke="${ink}" stroke-width="2" opacity="0.13"/>
    </pattern></defs>`;
  }

  if (style.pattern === 'film') {
    return `<defs><pattern id="pattern" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">
      <rect width="${unit}" height="${unit}" fill="${soft}" opacity="0.16"/>
      <rect x="${round(unit * 0.3)}" y="${round(unit * 0.3)}" width="${round(unit * 0.16)}" height="${round(unit * 0.42)}" rx="4" fill="${accent}" opacity="0.24"/>
    </pattern></defs>`;
  }

  if (style.pattern === 'plaid') {
    return `<defs><pattern id="pattern" width="${unit * 2}" height="${unit * 2}" patternUnits="userSpaceOnUse">
      <rect width="${unit * 2}" height="${unit * 2}" fill="${soft}" opacity="0.18"/>
      <path d="M ${unit} 0 L ${unit} ${unit * 2} M 0 ${unit} L ${unit * 2} ${unit}" stroke="${accent}" stroke-width="5" opacity="0.18"/>
      <rect x="0" y="0" width="${unit}" height="${unit}" fill="${accent}" opacity="0.08"/>
    </pattern></defs>`;
  }

  return `<defs><pattern id="pattern" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">
    <rect width="${unit}" height="${unit}" fill="none"/>
    <circle cx="${round(unit * 0.5)}" cy="${round(unit * 0.5)}" r="${round(unit * 0.09)}" fill="${soft}" opacity="0.28"/>
  </pattern></defs>`;
}

function backgroundSvg(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { base } = style.palette;
  const accent = style.palette.accent;
  const motifSize = Math.max(62, Math.round(Math.min(width, height) * 0.16));
  const decorations = [
    motifPath(style.motif, width * 0.07, height * 0.07, motifSize, accent, 0.1),
    motifPath(style.motif, width * 0.78, height * 0.1, motifSize * 0.72, accent, 0.08),
    motifPath(style.motif, width * 0.78, height * 0.7, motifSize * 0.78, accent, 0.08),
    motifPath(style.motif, width * 0.09, height * 0.74, motifSize * 0.72, accent, 0.08),
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${patternDefs(style, width, height)}
  <rect width="${width}" height="${height}" fill="${base}"/>
  <rect width="${width}" height="${height}" fill="url(#pattern)"/>
  ${decorations}
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
    id: 'bento',
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
  const unit = Math.max(18, Math.round(Math.min(width, height) * 0.02));
  const decorations = [];

  if (style.id === 'sweet') {
    for (let x = unit * 1.2; x < width - unit; x += unit * 1.25) {
      decorations.push(`<circle cx="${round(x)}" cy="${round(unit * 0.72)}" r="${round(unit * 0.34)}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.72"/>`);
      decorations.push(`<circle cx="${round(x)}" cy="${round(height - unit * 0.72)}" r="${round(unit * 0.34)}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.72"/>`);
    }
    decorations.push(`<path d="M ${width * 0.5 - 54} ${unit * 0.84} Q ${width * 0.5 - 32} ${unit * 0.5} ${width * 0.5 - 12} ${unit * 0.84} Q ${width * 0.5 + 8} ${unit * 0.5} ${width * 0.5 + 31} ${unit * 0.84}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity="0.85"/>`);
  } else if (style.id === 'diary') {
    decorations.push(`<rect x="${round(unit * 0.65)}" y="${round(unit * 0.5)}" width="${round(unit * 3.8)}" height="${round(unit * 1.1)}" rx="6" fill="${soft}" opacity="0.7" transform="rotate(-4 ${round(unit * 2.5)} ${round(unit)})"/>`);
    decorations.push(`<rect x="${round(width - unit * 4.35)}" y="${round(height - unit * 1.7)}" width="${round(unit * 3.8)}" height="${round(unit * 1.1)}" rx="6" fill="${soft}" opacity="0.7" transform="rotate(4 ${round(width - unit * 2.4)} ${round(height - unit)})"/>`);
    for (let index = 0; index < 4; index += 1) {
      decorations.push(motifPath('flower', width * 0.08 + index * 28, height * 0.055 + index * 9, 20, accent, 0.18));
    }
  } else if (style.id === 'film') {
    const perforationCount = Math.max(8, Math.round(width / (unit * 1.25)));
    const spacing = (width - unit * 2) / perforationCount;
    for (let index = 0; index < perforationCount; index += 1) {
      const x = unit + spacing * index + spacing / 2;
      decorations.push(`<rect x="${round(x - unit * 0.16)}" y="${round(unit * 0.18)}" width="${round(unit * 0.32)}" height="${round(unit * 0.45)}" rx="4" fill="${accent}" opacity="0.72"/>`);
      decorations.push(`<rect x="${round(x - unit * 0.16)}" y="${round(height - unit * 0.62)}" width="${round(unit * 0.32)}" height="${round(unit * 0.45)}" rx="4" fill="${accent}" opacity="0.72"/>`);
    }
    decorations.push(`<text x="${round(width * 0.5)}" y="${round(unit * 1.7)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${unit * 0.6}" font-weight="800" fill="${accent}" opacity="0.72">REC · ${style.label}</text>`);
  } else if (style.id === 'plaid') {
    decorations.push(`<rect x="${round(unit)}" y="${round(unit)}" width="${round(unit * 3.3)}" height="${round(unit * 1.2)}" rx="6" fill="${accent}" opacity="0.7" transform="rotate(-6 ${round(unit * 2.45)} ${round(unit * 1.6)})"/>`);
    decorations.push(`<rect x="${round(width - unit * 4.25)}" y="${round(height - unit * 2.15)}" width="${round(unit * 3.3)}" height="${round(unit * 1.2)}" rx="6" fill="${accent}" opacity="0.7" transform="rotate(6 ${round(width - unit * 2.6)} ${round(height - unit * 1.5)})"/>`);
    decorations.push(motifPath('flower', width * 0.08, height * 0.87, unit * 1.7, accent, 0.28));
    decorations.push(motifPath('flower', width * 0.8, height * 0.07, unit * 1.7, accent, 0.28));
  } else {
    for (let index = 0; index < 7; index += 1) {
      const x = width * (index / 6 + 0.06);
      decorations.push(motifPath('star', x, height * 0.055, unit * 0.8, ink, 0.22));
      decorations.push(motifPath('heart', x, height * 0.9, unit * 0.8, ink, 0.16));
    }
    decorations.push(`<path d="M ${width * 0.12} ${height * 0.12} q ${unit * 0.8} ${unit * 0.4} ${unit * 1.6} 0" fill="none" stroke="${ink}" stroke-width="${Math.max(2, unit * 0.12)}" stroke-linecap="round" opacity="0.22"/>`);
  }

  return decorations.join('');
}

function frameSvg(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { accent, ink, paper } = style.palette;
  const rects = slotRectsForSvg(layoutId);
  const outer = `<rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="28" fill="none" stroke="${paper}" stroke-width="14" opacity="0.96"/>
  <rect x="31" y="31" width="${width - 62}" height="${height - 62}" rx="21" fill="none" stroke="${accent}" stroke-width="3" opacity="0.55"/>`;
  const slotStrokes = rects
    .map((rect, index) => {
      const stroke = style.id === 'mono' ? ink : '#ffffff';
      return `<rect x="${round(rect.x + 5)}" y="${round(rect.y + 5)}" width="${round(rect.width - 10)}" height="${round(rect.height - 10)}" rx="18" fill="none" stroke="${stroke}" stroke-width="${index % 2 === 0 ? 9 : 6}" opacity="0.88"/>`;
    })
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

function decoration(style, layoutId, index) {
  const [collection, poses] = styleStickerSets[style.id][index];
  const position = layoutPositions[layoutId][index];
  return {
    itemId: stickerId(collection, poses[index]),
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
    order: 0,
    frame: `packs/templates/fan-ip/templates/frame-${layoutId}.svg`,
    decorations: [],
    license: 'original',
  });

  for (const style of styles) {
    const templateId = `style-${style.id}-${layoutId}`;
    manifest.push({
      id: templateId,
      layoutId,
      name: style.names,
      kind: 'style',
      collection: style.id,
      styleId: style.id,
      order: style.order,
      background: `packs/templates/fan-ip/templates/${templateId}-background.svg`,
      frame: `packs/templates/fan-ip/templates/${templateId}-frame.svg`,
      accentColor: style.palette.accent,
      collections: styleStickerSets[style.id].map(([collection]) => collection),
      decorations: layoutPositions[layoutId].map((_, index) =>
        decoration(style, layoutId, index),
      ),
      license: 'private-personal-use',
    });
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
    const templateId = `style-${style.id}-${layoutId}`;
    writeFileSync(
      resolve(outputDir, `${templateId}-background.svg`),
      backgroundSvg(style, layoutId),
    );
    writeFileSync(
      resolve(outputDir, `${templateId}-frame.svg`),
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
        'zh-Hant': '人生四格風格相框',
        en: 'Life four-cut style frames',
      },
      license: 'private-personal-use',
    },
    null,
    2,
  )}\n`,
);
