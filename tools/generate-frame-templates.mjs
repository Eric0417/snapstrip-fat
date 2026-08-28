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

function styleDefinition(id, family, names, palette, motif, pattern, label) {
  return { id, family, names, palette, motif, pattern, label };
}

const layoutStyles = {
  grid: [
    styleDefinition(
      'grid-pastel',
      'sweet',
      { 'zh-Hant': '粉彩方框', en: 'Pastel grid' },
      { base: '#fff8f5', soft: '#f4d6df', accent: '#d46d92', ink: '#8b4b67', paper: '#fffdfc' },
      'heart',
      'stripes',
      'A LITTLE DAY',
    ),
    styleDefinition(
      'grid-diary',
      'diary',
      { 'zh-Hant': '手帳方格', en: 'Journal grid' },
      { base: '#fffef9', soft: '#f1dcae', accent: '#c8793f', ink: '#4c5258', paper: '#fffdf8' },
      'flower',
      'grid',
      'MY LITTLE GRID',
    ),
    styleDefinition(
      'grid-mono',
      'mono',
      { 'zh-Hant': '黑白方塊', en: 'Monochrome grid' },
      { base: '#161619', soft: '#efeff2', accent: '#f5f5f8', ink: '#f5f5f8', paper: '#f5f5f8' },
      'star',
      'dots',
      'HAPPY TODAY',
    ),
  ],
  square: [
    styleDefinition(
      'square-sky',
      'sweet',
      { 'zh-Hant': '天空方格', en: 'Sky square' },
      { base: '#f8fcff', soft: '#cceaf6', accent: '#4c9fb4', ink: '#416a78', paper: '#ffffff' },
      'heart',
      'cloud',
      'BLUE SKY DAY',
    ),
    styleDefinition(
      'square-plaid',
      'plaid',
      { 'zh-Hant': '復古格紋', en: 'Vintage plaid' },
      { base: '#f9f3e9', soft: '#dce8f2', accent: '#bd4560', ink: '#6b4650', paper: '#fffdf9' },
      'flower',
      'plaid',
      'OUR LITTLE DAY',
    ),
    styleDefinition(
      'square-doodle',
      'diary',
      { 'zh-Hant': '手繪方塊', en: 'Doodle square' },
      { base: '#f8fff9', soft: '#cde7d1', accent: '#6d9b75', ink: '#4b6252', paper: '#fffefb' },
      'flower',
      'grid',
      'DRAW A LITTLE',
    ),
  ],
  bento: [
    styleDefinition(
      'bento-story',
      'sweet',
      { 'zh-Hant': '故事拼貼', en: 'Story collage' },
      { base: '#fff8f1', soft: '#f6d9c5', accent: '#d8885d', ink: '#77574b', paper: '#fffdfa' },
      'heart',
      'stripes',
      'OUR STORY',
    ),
    styleDefinition(
      'bento-cream',
      'plaid',
      { 'zh-Hant': '奶油拼貼', en: 'Cream collage' },
      { base: '#fff9eb', soft: '#f4d9a6', accent: '#b77956', ink: '#76554a', paper: '#fffdf7' },
      'flower',
      'plaid',
      'A SWEET PICNIC',
    ),
    styleDefinition(
      'bento-mono',
      'mono',
      { 'zh-Hant': '黑白拼貼', en: 'Monochrome collage' },
      { base: '#1c1c20', soft: '#ececef', accent: '#f7f7f8', ink: '#f7f7f8', paper: '#f7f7f8' },
      'star',
      'dots',
      'TODAY TOGETHER',
    ),
  ],
  'portrait-grid': [
    styleDefinition(
      'portrait-vintage',
      'diary',
      { 'zh-Hant': '直式手帳', en: 'Portrait journal' },
      { base: '#fffdf7', soft: '#d9e4d3', accent: '#7c9a81', ink: '#4d5e51', paper: '#fffef9' },
      'flower',
      'grid',
      'A LITTLE PAGE',
    ),
    styleDefinition(
      'portrait-pastel',
      'sweet',
      { 'zh-Hant': '粉彩直格', en: 'Pastel portrait' },
      { base: '#fff8fb', soft: '#f4d7e8', accent: '#c46a9d', ink: '#765066', paper: '#fffdfb' },
      'heart',
      'dots',
      'SWEET PORTRAIT',
    ),
    styleDefinition(
      'portrait-mono',
      'mono',
      { 'zh-Hant': '黑白直格', en: 'Monochrome portrait' },
      { base: '#17171a', soft: '#e7e7eb', accent: '#f6f6f7', ink: '#f6f6f7', paper: '#f6f6f7' },
      'star',
      'dots',
      'MEMORIES IN BLACK',
    ),
  ],
  vertical: [
    styleDefinition(
      'vertical-film',
      'film',
      { 'zh-Hant': '直式膠卷', en: 'Vertical film' },
      { base: '#f2efe9', soft: '#d1cbc0', accent: '#252429', ink: '#2b2a2e', paper: '#f8f5ef' },
      'film',
      'film',
      'PHOTO MEMORIES',
    ),
    styleDefinition(
      'vertical-diary',
      'diary',
      { 'zh-Hant': '手繪長條', en: 'Hand-drawn strip' },
      { base: '#fffef9', soft: '#e6d6ad', accent: '#c48b49', ink: '#4d5359', paper: '#fffdf8' },
      'flower',
      'grid',
      'MY LITTLE STRIP',
    ),
    styleDefinition(
      'vertical-sweet',
      'sweet',
      { 'zh-Hant': '粉彩長條', en: 'Pastel strip' },
      { base: '#fff9f5', soft: '#f2d7df', accent: '#d17896', ink: '#865069', paper: '#fffdfc' },
      'heart',
      'stripes',
      'A VERY GOOD DAY',
    ),
  ],
  classic: [
    styleDefinition(
      'classic-film',
      'film',
      { 'zh-Hant': '經典膠卷', en: 'Classic film' },
      { base: '#f4f1eb', soft: '#d8d1c5', accent: '#2e2d31', ink: '#2e2d31', paper: '#faf7f1' },
      'film',
      'film',
      'PHOTO ROLL',
    ),
    styleDefinition(
      'classic-plaid',
      'plaid',
      { 'zh-Hant': '復古長條', en: 'Vintage strip' },
      { base: '#fff8ee', soft: '#e3d0c7', accent: '#a84c61', ink: '#6d4b52', paper: '#fffdf9' },
      'flower',
      'plaid',
      'AN OLD LITTLE DAY',
    ),
    styleDefinition(
      'classic-mono',
      'mono',
      { 'zh-Hant': '黑白長條', en: 'Monochrome strip' },
      { base: '#1b1b1e', soft: '#e6e6e9', accent: '#f5f5f6', ink: '#f5f5f6', paper: '#f5f5f6' },
      'star',
      'dots',
      'BLACK AND WHITE',
    ),
  ],
  horizontal: [
    styleDefinition(
      'horizontal-film',
      'film',
      { 'zh-Hant': '橫式膠卷', en: 'Horizontal film' },
      { base: '#eeeae4', soft: '#c6c0b7', accent: '#242328', ink: '#242328', paper: '#f7f4ee' },
      'film',
      'film',
      'PHOTO MEMORIES',
    ),
    styleDefinition(
      'horizontal-sky',
      'sweet',
      { 'zh-Hant': '天空橫幅', en: 'Sky banner' },
      { base: '#f4fbff', soft: '#d3eaf4', accent: '#65a6b8', ink: '#416a76', paper: '#ffffff' },
      'heart',
      'cloud',
      'BLUE SKY BANNER',
    ),
    styleDefinition(
      'horizontal-doodle',
      'diary',
      { 'zh-Hant': '手繪橫幅', en: 'Doodle banner' },
      { base: '#fffdf8', soft: '#e3d5ae', accent: '#bd8a4b', ink: '#55544c', paper: '#fffef9' },
      'flower',
      'grid',
      'DRAW TODAY',
    ),
  ],
  wide: [
    styleDefinition(
      'wide-film',
      'film',
      { 'zh-Hant': '寬幅膠卷', en: 'Widescreen film' },
      { base: '#e9e6df', soft: '#c8c3bb', accent: '#242329', ink: '#28272c', paper: '#f5f2ed' },
      'film',
      'film',
      'WIDE FILM',
    ),
    styleDefinition(
      'wide-ticket',
      'plaid',
      { 'zh-Hant': '票券寬幅', en: 'Ticket wide' },
      { base: '#fff9ec', soft: '#f3d7a1', accent: '#c77839', ink: '#78583d', paper: '#fffdf7' },
      'flower',
      'plaid',
      'TICKET TO TODAY',
    ),
    styleDefinition(
      'wide-mono',
      'mono',
      { 'zh-Hant': '黑白寬幅', en: 'Monochrome wide' },
      { base: '#18181b', soft: '#e5e5e8', accent: '#f2f2f4', ink: '#f2f2f4', paper: '#f2f2f4' },
      'star',
      'dots',
      'WIDE MEMORIES',
    ),
  ],
};

const longLayoutIds = new Set(['vertical', 'classic', 'horizontal', 'wide']);

for (const [layoutId, styles] of Object.entries(layoutStyles)) {
  for (const style of styles) {
    if (style.family === 'film' && !longLayoutIds.has(layoutId)) {
      throw new Error(`Film template is only valid for long layouts: ${layoutId}/${style.id}`);
    }
  }
}

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

const layoutPoses = {
  grid: [1, 5, 9],
  square: [2, 6, 10],
  bento: [1, 4, 9],
  'portrait-grid': [3, 7, 12],
  vertical: [1, 6, 12],
  classic: [2, 8, 12],
  horizontal: [3, 9, 13],
  wide: [1, 8, 13],
};

const stylePositionOffsets = {
  sweet: { x: -0.018, y: -0.022, scale: 1.08, rotation: -3 },
  diary: { x: 0.014, y: -0.018, scale: 0.95, rotation: 4 },
  film: { x: -0.01, y: 0.018, scale: 0.98, rotation: 3 },
  plaid: { x: -0.022, y: 0.014, scale: 1.04, rotation: -2 },
  mono: { x: 0.016, y: 0.022, scale: 0.9, rotation: 2 },
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

  if (style.pattern === 'cloud') {
    return `<defs><pattern id="pattern" width="${unit * 2}" height="${unit * 1.6}" patternUnits="userSpaceOnUse">
      <g fill="${soft}" opacity="0.16"><circle cx="${unit * 0.45}" cy="${unit * 0.66}" r="${unit * 0.36}"/><circle cx="${unit * 0.82}" cy="${unit * 0.5}" r="${unit * 0.3}"/><circle cx="${unit * 1.2}" cy="${unit * 0.66}" r="${unit * 0.36}"/><rect x="${unit * 0.45}" y="${unit * 0.62}" width="${unit * 0.75}" height="${unit * 0.28}" rx="${unit * 0.14}"/></g>
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

function filmRailSvg(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { accent, paper } = style.palette;
  const holes = [];

  if (layoutId === 'vertical' || layoutId === 'classic') {
    const railWidth = 48;
    for (let y = 82; y < height - 78; y += 102) {
      holes.push(`<rect x="36" y="${round(y)}" width="22" height="13" rx="4" fill="${paper}" opacity="0.56"/>`);
      holes.push(`<rect x="${round(width - 58)}" y="${round(y)}" width="22" height="13" rx="4" fill="${paper}" opacity="0.56"/>`);
    }
    const layoutMark = layoutId === 'classic'
      ? `<rect x="74" y="20" width="${round(width - 148)}" height="10" rx="5" fill="${paper}" opacity="0.62"/><rect x="74" y="${round(height - 30)}" width="${round(width - 148)}" height="10" rx="5" fill="${paper}" opacity="0.62"/>`
      : `<rect x="76" y="22" width="${round(width - 152)}" height="6" rx="3" fill="${paper}" opacity="0.42"/>`;
    return `<g>
      <rect x="20" y="20" width="${railWidth}" height="${height - 40}" rx="16" fill="${accent}" opacity="0.9"/>
      <rect x="${round(width - 68)}" y="20" width="${railWidth}" height="${height - 40}" rx="16" fill="${accent}" opacity="0.9"/>
      ${holes.join('')}
      <rect x="56" y="54" width="8" height="14" fill="#b84943" opacity="0.78"/>
      <rect x="${round(width - 64)}" y="54" width="8" height="14" fill="#b84943" opacity="0.78"/>
      ${layoutMark}
    </g>`;
  }

  const railHeight = 44;
  for (let x = 84; x < width - 78; x += 104) {
    holes.push(`<rect x="${round(x)}" y="30" width="13" height="22" rx="4" fill="${paper}" opacity="0.56"/>`);
    holes.push(`<rect x="${round(x)}" y="${round(height - 52)}" width="13" height="22" rx="4" fill="${paper}" opacity="0.56"/>`);
  }
  const endMarks = layoutId === 'wide'
    ? `<circle cx="54" cy="42" r="6" fill="${paper}" opacity="0.62"/><circle cx="${round(width - 54)}" cy="42" r="6" fill="${paper}" opacity="0.62"/><circle cx="54" cy="${round(height - 42)}" r="6" fill="${paper}" opacity="0.62"/><circle cx="${round(width - 54)}" cy="${round(height - 42)}" r="6" fill="${paper}" opacity="0.62"/>`
    : `<rect x="48" y="20" width="10" height="${railHeight}" rx="5" fill="${paper}" opacity="0.42"/><rect x="${round(width - 58)}" y="20" width="10" height="${railHeight}" rx="5" fill="${paper}" opacity="0.42"/>`;
  return `<g>
    <rect x="20" y="20" width="${width - 40}" height="${railHeight}" rx="14" fill="${accent}" opacity="0.9"/>
    <rect x="20" y="${round(height - railHeight - 20)}" width="${width - 40}" height="${railHeight}" rx="14" fill="${accent}" opacity="0.9"/>
    ${holes.join('')}
    <rect x="52" y="48" width="14" height="8" fill="#b84943" opacity="0.78"/>
    <rect x="52" y="${round(height - 56)}" width="14" height="8" fill="#b84943" opacity="0.78"/>
    ${endMarks}
  </g>`;
}

function layoutFrameAccents(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const unit = Math.max(12, Math.round(Math.min(width, height) * 0.02));
  const { accent, soft, ink } = style.palette;

  if (style.family === 'film') return filmRailSvg(style, layoutId);

  const accents = [];
  if (layoutId === 'grid') {
    accents.push(`<path d="M 36 36 L 70 70 M ${round(width - 36)} 36 L ${round(width - 70)} 70 M 36 ${round(height - 36)} L 70 ${round(height - 70)} M ${round(width - 36)} ${round(height - 36)} L ${round(width - 70)} ${round(height - 70)}" fill="none" stroke="${accent}" stroke-width="3" opacity="0.35"/>`);
    accents.push(`<circle cx="38" cy="${round(height * 0.5)}" r="5" fill="${accent}" opacity="0.5"/><circle cx="${round(width - 38)}" cy="${round(height * 0.5)}" r="5" fill="${accent}" opacity="0.5"/>`);
  } else if (layoutId === 'square') {
    accents.push(`<path d="M 38 38 L 78 38 L 38 78 Z M ${round(width - 78)} ${round(height - 38)} L ${round(width - 38)} ${round(height - 38)} L ${round(width - 38)} ${round(height - 78)} Z" fill="${soft}" opacity="0.55"/>`);
    accents.push(`<circle cx="${round(width * 0.5)}" cy="38" r="7" fill="${accent}" opacity="0.48"/><circle cx="${round(width * 0.5)}" cy="${round(height - 38)}" r="7" fill="${accent}" opacity="0.48"/>`);
  } else if (layoutId === 'bento') {
    accents.push(`<path d="M ${round(width * 0.59)} 34 L ${round(width * 0.59)} ${round(height - 34)}" fill="none" stroke="${accent}" stroke-width="4" stroke-dasharray="8 10" opacity="0.35"/>`);
    accents.push(`<path d="M ${round(width * 0.67)} 70 L ${round(width * 0.83)} 70 M ${round(width * 0.67)} ${round(height * 0.38)} L ${round(width * 0.83)} ${round(height * 0.38)}" fill="none" stroke="${accent}" stroke-width="3" opacity="0.35"/>`);
  } else if (layoutId === 'portrait-grid') {
    accents.push(`<path d="M 38 34 L 38 ${round(height - 34)} M ${round(width - 38)} 34 L ${round(width - 38)} ${round(height - 34)}" fill="none" stroke="${accent}" stroke-width="3" opacity="0.42"/>`);
    accents.push(`<rect x="${round(width * 0.46)}" y="27" width="${round(width * 0.08)}" height="15" rx="4" fill="${soft}" opacity="0.75"/>`);
  } else if (layoutId === 'vertical' || layoutId === 'classic') {
    accents.push(`<path d="M 40 38 L ${round(width - 40)} 38 M 40 ${round(height - 38)} L ${round(width - 40)} ${round(height - 38)}" fill="none" stroke="${accent}" stroke-width="4" opacity="0.38"/>`);
    accents.push(`<path d="M ${round(width * 0.5)} 62 L ${round(width * 0.5)} ${round(height - 62)}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.16"/>`);
  } else if (layoutId === 'horizontal' || layoutId === 'wide') {
    accents.push(`<path d="M 42 28 L 42 ${round(height - 28)} M ${round(width - 42)} 28 L ${round(width - 42)} ${round(height - 28)}" fill="none" stroke="${accent}" stroke-width="4" opacity="0.38"/>`);
    accents.push(`<path d="M ${round(width * 0.5)} 22 L ${round(width * 0.5)} ${round(height - 22)}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.16"/>`);
  }

  return accents.join('');
}

function frameOuter(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { accent, ink, paper } = style.palette;
  if (style.family === 'film') return '';
  const stroke = style.family === 'mono' ? ink : paper;
  const radius = layoutId === 'square' ? 32 : layoutId === 'bento' ? 20 : 26;
  return `<rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="${radius}" fill="none" stroke="${stroke}" stroke-width="16" opacity="0.98"/>
  <rect x="31" y="31" width="${width - 62}" height="${height - 62}" rx="${Math.max(16, radius - 5)}" fill="none" stroke="${accent}" stroke-width="3" opacity="0.48"/>`;
}

function frameDecorations(style, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { accent, soft, ink } = style.palette;
  const unit = Math.max(12, Math.round(Math.min(width, height) * 0.02));
  const motifSize = Math.max(18, unit * 1.25);
  const decorations = [];
  const wide = layoutId === 'horizontal' || layoutId === 'wide';
  const long = layoutId === 'vertical' || layoutId === 'classic';
  const labelY = wide ? 36 : long ? 104 : 36;

  if (style.family === 'sweet') {
    const xs = wide ? [width * 0.08, width * 0.5, width * 0.92] : [width * 0.08, width * 0.18, width * 0.82, width * 0.92];
    for (const x of xs) {
      decorations.push(motifPath('heart', x, Math.max(14, unit * 0.35), motifSize, accent, 0.36));
      decorations.push(motifPath('heart', x, height - Math.max(30, unit * 1.25), motifSize, accent, 0.3));
    }
  } else if (style.family === 'diary') {
    decorations.push(`<rect x="${round(unit * 0.55)}" y="${round(unit * 0.3)}" width="${round(unit * 3.6)}" height="${round(unit)}" rx="5" fill="${soft}" opacity="0.72" transform="rotate(-5 ${round(unit * 2.2)} ${round(unit * 0.8)})"/>`);
    decorations.push(`<rect x="${round(width - unit * 4.2)}" y="${round(height - unit * 1.35)}" width="${round(unit * 3.6)}" height="${round(unit)}" rx="5" fill="${soft}" opacity="0.72" transform="rotate(5 ${round(width - unit * 2.4)} ${round(height - unit * 0.8)})"/>`);
    decorations.push(`<path d="M ${round(width * 0.56)} ${round(height * 0.055)} q ${round(unit * 0.8)} ${round(unit * 0.25)} ${round(unit * 1.6)} 0 M ${round(width * 0.56)} ${round(height * 0.1)} q ${round(unit * 0.8)} ${round(unit * 0.25)} ${round(unit * 1.6)} 0" fill="none" stroke="${ink}" stroke-width="${Math.max(2, unit * 0.09)}" stroke-linecap="round" opacity="0.28"/>`);
  } else if (style.family === 'film') {
    decorations.push(`<text x="${round(width * 0.5)}" y="${round(labelY + 24)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${round(Math.max(18, unit * 0.58))}" font-weight="800" fill="${accent}" opacity="0.68">${style.label}</text>`);
    decorations.push(`<circle cx="${round(width * 0.5)}" cy="${round(labelY + 46)}" r="4" fill="#b84943" opacity="0.82"/>`);
  } else if (style.family === 'plaid') {
    decorations.push(`<rect x="${round(unit * 0.55)}" y="${round(unit * 0.45)}" width="${round(unit * 3.2)}" height="${round(unit * 0.95)}" rx="4" fill="${accent}" opacity="0.55" transform="rotate(-6 ${round(unit * 2.1)} ${round(unit)})"/>`);
    decorations.push(`<rect x="${round(width - unit * 3.85)}" y="${round(height - unit * 1.55)}" width="${round(unit * 3.2)}" height="${round(unit * 0.95)}" rx="4" fill="${accent}" opacity="0.55" transform="rotate(6 ${round(width - unit * 2.2)} ${round(height - unit * 1.1)})"/>`);
    decorations.push(motifPath('flower', width * 0.08, height * 0.88, motifSize, accent, 0.32));
    decorations.push(motifPath('flower', width * 0.82, height * 0.05, motifSize, accent, 0.32));
  } else {
    const xs = wide ? [width * 0.08, width * 0.5, width * 0.92] : [width * 0.08, width * 0.5, width * 0.92];
    for (const x of xs) {
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
  const rects = slotRectsForSvg(layoutId);
  const { accent, ink, paper } = style.palette;
  const stroke = style.family === 'mono' ? ink : paper;
  const slotStrokes = rects
    .map((rect, index) => `<rect x="${round(rect.x + 5)}" y="${round(rect.y + 5)}" width="${round(rect.width - 10)}" height="${round(rect.height - 10)}" rx="20" fill="none" stroke="${stroke}" stroke-width="${index % 2 === 0 ? 10 : 7}" opacity="0.94"/>`)
    .join('');
  const outerFrame = frameOuter(style, layoutId);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
${outerFrame ? `  ${outerFrame}\n` : ''}  ${slotStrokes}
  ${layoutFrameAccents(style, layoutId)}
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

function decoration(ip, layoutId, style, index) {
  const position = layoutPositions[layoutId][index];
  const offset = stylePositionOffsets[style.family] ?? { x: 0, y: 0, scale: 1, rotation: 0 };
  return {
    itemId: stickerId(ip.id, layoutPoses[layoutId][index]),
    x: Math.max(0.03, Math.min(0.97, position.x + offset.x)),
    y: Math.max(0.03, Math.min(0.97, position.y + offset.y)),
    scale: Math.max(0.12, Math.min(0.72, position.scale * offset.scale)),
    rotation: position.rotation + offset.rotation,
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

  layoutStyles[layoutId].forEach((style, styleIndex) => {
    const templateBaseId = `style-${style.id}`;
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
        styleFamily: style.family,
        monochrome: style.family === 'mono',
        styleName: style.names,
        order: styleIndex + 1,
        background: `packs/templates/fan-ip/templates/${templateBaseId}-background.svg`,
        frame: `packs/templates/fan-ip/templates/${templateBaseId}-frame.svg`,
        accentColor: style.palette.accent,
        collections: [ip.id],
        collectionName: ip.names,
        decorations: layoutPositions[layoutId].map((_, index) =>
          decoration(ip, layoutId, style, index),
        ),
        license: 'private-personal-use',
      });
    }
  });
}

for (const layoutId of layoutIds) {
  writeFileSync(
    resolve(outputDir, `frame-${layoutId}.svg`),
    blankFrameSvg(layoutId),
  );
}

for (const layoutId of layoutIds) {
  for (const style of layoutStyles[layoutId]) {
    const templateBaseId = `style-${style.id}`;
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
