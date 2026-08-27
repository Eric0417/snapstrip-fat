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

const ipPacks = [
  {
    id: 'hello-kitty',
    names: { 'zh-Hant': 'Hello Kitty', en: 'Hello Kitty' },
    palette: { base: '#fff3f6', soft: '#ffd7e3', accent: '#d84478' },
    motif: 'heart',
    edgeStyle: 'scallop',
  },
  {
    id: 'cinnamoroll',
    names: { 'zh-Hant': '玉桂狗', en: 'Cinnamoroll' },
    palette: { base: '#f5fcff', soft: '#d7efff', accent: '#5faee0' },
    motif: 'cloud',
    edgeStyle: 'wave',
  },
  {
    id: 'my-melody',
    names: { 'zh-Hant': '美樂蒂', en: 'My Melody' },
    palette: { base: '#fff4f8', soft: '#ffd9e7', accent: '#df4e8b' },
    motif: 'bow',
    edgeStyle: 'lace',
  },
  {
    id: 'kuromi',
    names: { 'zh-Hant': '酷洛米', en: 'Kuromi' },
    palette: { base: '#f6f2ff', soft: '#dfd0ff', accent: '#6543a5' },
    motif: 'star',
    edgeStyle: 'checker',
  },
  {
    id: 'pompompurin',
    names: { 'zh-Hant': '布丁狗', en: 'Pompompurin' },
    palette: { base: '#fff8e3', soft: '#f6dc8a', accent: '#b57932' },
    motif: 'dot',
    edgeStyle: 'ribbon',
  },
  {
    id: 'little-twin-stars',
    names: { 'zh-Hant': '雙星仙子', en: 'Little Twin Stars' },
    palette: { base: '#f4f8ff', soft: '#dbe6ff', accent: '#5d75c8' },
    motif: 'sparkle',
    edgeStyle: 'wave',
  },
  {
    id: 'miffy',
    names: { 'zh-Hant': '米飛兔', en: 'Miffy' },
    palette: { base: '#fff9ef', soft: '#f7dfb1', accent: '#b87832' },
    motif: 'circle',
    edgeStyle: 'stripe',
  },
  {
    id: 'rilakkuma',
    names: { 'zh-Hant': '拉拉熊', en: 'Rilakkuma' },
    palette: { base: '#fcf5e9', soft: '#efdcbd', accent: '#a06d4e' },
    motif: 'paw',
    edgeStyle: 'stripe',
  },
  {
    id: 'sumikko-gurashi',
    names: { 'zh-Hant': '角落生物', en: 'Sumikko Gurashi' },
    palette: { base: '#f5fbf5', soft: '#d7ebd9', accent: '#5d8c68' },
    motif: 'leaf',
    edgeStyle: 'checker',
  },
  {
    id: 'pusheen',
    names: { 'zh-Hant': '胖吉貓', en: 'Pusheen' },
    palette: { base: '#faf7f7', soft: '#eadfdf', accent: '#8e7275' },
    motif: 'paw',
    edgeStyle: 'dashed',
  },
  {
    id: 'kirby',
    names: { 'zh-Hant': '星之卡比', en: 'Kirby' },
    palette: { base: '#fff1f8', soft: '#ffd2e8', accent: '#e1599d' },
    motif: 'star',
    edgeStyle: 'film',
  },
  {
    id: 'snoopy',
    names: { 'zh-Hant': '史努比', en: 'Snoopy' },
    palette: { base: '#f3faff', soft: '#d5e9f8', accent: '#2d6f9c' },
    motif: 'wave',
    edgeStyle: 'film',
  },
  {
    id: 'mickey-mouse',
    names: { 'zh-Hant': '米奇與米妮', en: 'Mickey & Minnie' },
    palette: { base: '#fff6f0', soft: '#f2d4c7', accent: '#b43b31' },
    motif: 'circle',
    edgeStyle: 'ribbon',
  },
];

const compositions = {
  grid: [
    ['sticker-01', 0.17, 0.11, 0.38, -7, false],
    ['sticker-05', 0.84, 0.89, 0.2, 7, true],
    ['sticker-09', 0.9, 0.15, 0.12, -4, false],
  ],
  square: [
    ['sticker-01', 0.16, 0.10, 0.38, -7, false],
    ['sticker-05', 0.85, 0.90, 0.2, 7, true],
    ['sticker-09', 0.9, 0.14, 0.12, -4, false],
  ],
  bento: [
    ['sticker-01', 0.18, 0.09, 0.37, -6, false],
    ['sticker-05', 0.86, 0.91, 0.2, 6, true],
    ['sticker-09', 0.83, 0.18, 0.12, -4, false],
  ],
  'portrait-grid': [
    ['sticker-01', 0.16, 0.08, 0.38, -7, false],
    ['sticker-05', 0.85, 0.92, 0.2, 7, true],
    ['sticker-09', 0.9, 0.12, 0.12, -4, false],
  ],
  vertical: [
    ['sticker-01', 0.13, 0.065, 0.22, -5, false],
    ['sticker-05', 0.87, 0.49, 0.16, 6, true],
    ['sticker-09', 0.13, 0.93, 0.2, -4, false],
  ],
  classic: [
    ['sticker-01', 0.13, 0.07, 0.16, -5, false],
    ['sticker-05', 0.87, 0.49, 0.13, 6, true],
    ['sticker-09', 0.13, 0.93, 0.15, -4, false],
  ],
  horizontal: [
    ['sticker-01', 0.13, 0.16, 0.22, -6, false],
    ['sticker-05', 0.87, 0.16, 0.19, 6, true],
    ['sticker-09', 0.5, 0.82, 0.11, -3, false],
  ],
  wide: [
    ['sticker-01', 0.11, 0.17, 0.12, -6, false],
    ['sticker-05', 0.89, 0.17, 0.11, 6, true],
    ['sticker-09', 0.5, 0.82, 0.08, -3, false],
  ],
};

function motifShape(motif, fill, x, y, size, opacity = 1) {
  const open = `<g fill="${fill}" opacity="${opacity}">`;
  const close = '</g>';

  if (motif === 'heart') {
    return `${open}<path d="M ${x + size / 2} ${y + size * 0.82} C ${x} ${y + size * 0.5}, ${x} ${y + size * 0.18}, ${x + size * 0.26} ${y + size * 0.18} C ${x + size * 0.42} ${y + size * 0.18}, ${x + size * 0.52} ${y + size * 0.35}, ${x + size * 0.52} ${y + size * 0.48} C ${x + size * 0.52} ${y + size * 0.62}, ${x + size * 0.46} ${y + size * 0.72}, ${x + size * 0.5} ${y + size * 0.82} Z" />${close}`;
  }
  if (motif === 'cloud') {
    return `${open}<path d="M ${x} ${y + size * 0.68} A ${size * 0.22} ${size * 0.22} 0 0 1 ${x + size * 0.18} ${y + size * 0.38} A ${size * 0.28} ${size * 0.28} 0 0 1 ${x + size * 0.54} ${y + size * 0.24} A ${size * 0.26} ${size * 0.26} 0 0 1 ${x + size} ${y + size * 0.48} A ${size * 0.23} ${size * 0.23} 0 0 1 ${x + size * 0.88} ${y + size * 0.68} Z" />${close}`;
  }
  if (motif === 'star') {
    const points = [
      [x + size * 0.5, y],
      [x + size * 0.62, y + size * 0.36],
      [x + size, y + size * 0.38],
      [x + size * 0.68, y + size * 0.62],
      [x + size * 0.78, y + size],
      [x + size * 0.5, y + size * 0.76],
      [x + size * 0.22, y + size],
      [x + size * 0.32, y + size * 0.62],
      [x, y + size * 0.38],
      [x + size * 0.38, y + size * 0.36],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(' ');
    return `${open}<polygon points="${points}" />${close}`;
  }
  if (motif === 'sparkle') {
    return `${open}<path d="M ${x + size / 2} ${y} C ${x + size * 0.56} ${y + size * 0.28}, ${x + size * 0.74} ${y + size * 0.42}, ${x + size} ${y + size * 0.5} C ${x + size * 0.74} ${y + size * 0.58}, ${x + size * 0.56} ${y + size * 0.72}, ${x + size / 2} ${y + size} C ${x + size * 0.44} ${y + size * 0.72}, ${x + size * 0.26} ${y + size * 0.58}, ${x} ${y + size * 0.5} C ${x + size * 0.26} ${y + size * 0.42}, ${x + size * 0.44} ${y + size * 0.28}, ${x + size / 2} ${y} Z" />${close}`;
  }
  if (motif === 'bow') {
    return `${open}<path d="M ${x} ${y + size * 0.25} L ${x + size / 2} ${y + size * 0.5} L ${x + size} ${y + size * 0.25} L ${x + size * 0.7} ${y + size} L ${x + size * 0.3} ${y + size} Z" /><circle cx="${x + size / 2}" cy="${y + size * 0.43}" r="${size * 0.12}" />${close}`;
  }
  if (motif === 'paw') {
    return `${open}<ellipse cx="${x + size / 2}" cy="${y + size * 0.62}" rx="${size * 0.38}" ry="${size * 0.28}" /><circle cx="${x + size * 0.18}" cy="${y + size * 0.24}" r="${size * 0.1}" /><circle cx="${x + size * 0.38}" cy="${y + size * 0.13}" r="${size * 0.12}" /><circle cx="${x + size * 0.62}" cy="${y + size * 0.13}" r="${size * 0.12}" /><circle cx="${x + size * 0.82}" cy="${y + size * 0.24}" r="${size * 0.1}" />${close}`;
  }
  if (motif === 'leaf') {
    return `${open}<path d="M ${x + size / 2} ${y} C ${x + size} ${y + size * 0.18}, ${x + size} ${y + size * 0.72}, ${x + size / 2} ${y + size} C ${x} ${y + size * 0.72}, ${x} ${y + size * 0.18}, ${x + size / 2} ${y} Z" /><path d="M ${x + size / 2} ${y + size * 0.1} L ${x + size / 2} ${y + size * 0.9}" stroke="#fff" stroke-width="${Math.max(1, size * 0.04)}" fill="none" opacity=".7" />${close}`;
  }
  if (motif === 'wave') {
    return `${open}<path d="M ${x} ${y + size * 0.55} Q ${x + size * 0.25} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.55} T ${x + size} ${y + size * 0.55} V ${y + size} H ${x} Z" />${close}`;
  }
  return `${open}<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size * 0.42}" />${close}`;
}

function edgePattern(style, accent, width, height, inset) {
  const unit = Math.max(24, Math.round(Math.min(width, height) * 0.022));
  const pieces = [];

  for (let x = inset + unit; x < width - inset - unit; x += unit) {
    if (style === 'scallop') {
      pieces.push(`<circle cx="${x}" cy="${inset}" r="${unit * 0.5}" fill="none" stroke="${accent}" stroke-width="7"/>`);
    } else if (style === 'wave') {
      pieces.push(`<path d="M ${x} ${inset + 14} q ${unit / 4} -18 ${unit / 2} 0 t ${unit / 2} 0" fill="none" stroke="${accent}" stroke-width="5"/>`);
    } else if (style === 'lace') {
      pieces.push(`<circle cx="${x}" cy="${inset}" r="${unit * 0.26}" fill="${accent}" opacity=".6"/>`);
    } else if (style === 'checker') {
      pieces.push(`<rect x="${x}" y="${inset - unit / 2}" width="${unit / 2}" height="${unit / 2}" fill="${accent}" opacity=".55" transform="rotate(45 ${x + unit / 4} ${inset})"/>`);
    } else if (style === 'film') {
      pieces.push(`<rect x="${x}" y="${inset - 14}" width="${unit * 0.34}" height="14" rx="3" fill="${accent}" opacity=".65"/>`);
    } else if (style === 'dashed') {
      pieces.push(`<rect x="${x}" y="${inset - 5}" width="${unit * 0.55}" height="10" rx="5" fill="${accent}" opacity=".7"/>`);
    } else {
      pieces.push(`<rect x="${x}" y="${inset - 6}" width="${unit * 0.38}" height="12" rx="2" fill="${accent}" opacity=".58" transform="rotate(-10 ${x + unit * 0.19} ${inset})"/>`);
    }
  }

  return pieces.join('');
}

function backgroundSvg(ip, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { base, soft, accent } = ip.palette;
  const patternSize = Math.max(110, Math.round(Math.min(width, height) / 9));
  const largeMotif = motifShape(
    ip.motif,
    accent,
    width * 0.08,
    height * 0.08,
    Math.min(width, height) * 0.18,
    0.09,
  );
  const secondMotif = motifShape(
    ip.motif,
    accent,
    width * 0.72,
    height * 0.72,
    Math.min(width, height) * 0.13,
    0.08,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="1" stop-color="${soft}" stop-opacity="0.42"/>
    </linearGradient>
    <pattern id="motif-pattern" width="${patternSize}" height="${patternSize}" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
      <rect width="${patternSize}" height="${patternSize}" fill="${soft}" opacity="0.24"/>
      ${motifShape(ip.motif, accent, patternSize * 0.26, patternSize * 0.2, patternSize * 0.44, 0.32)}
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="${base}"/>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#motif-pattern)" opacity="0.72"/>
  <rect x="${Math.round(width * 0.05)}" y="${Math.round(height * 0.035)}" width="${Math.round(width * 0.9)}" height="${Math.round(height * 0.93)}" rx="58" fill="#ffffff" opacity="0.12"/>
  ${largeMotif}
  ${secondMotif}
  ${motifShape(ip.motif, accent, width * 0.78, height * 0.08, Math.min(width, height) * 0.1, 0.1)}
  ${motifShape(ip.motif, accent, width * 0.08, height * 0.76, Math.min(width, height) * 0.1, 0.1)}
</svg>`;
}

function frameSvg(ip, layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const { accent } = ip.palette;
  const inset = Math.max(28, Math.round(Math.min(width, height) * 0.032));
  const motifSize = Math.min(width, height) * 0.075;
  const cornerMotifs = [
    [inset + 8, inset + 8, 0],
    [width - inset - motifSize - 8, inset + 8, 90],
    [inset + 8, height - inset - motifSize - 8, -90],
    [width - inset - motifSize - 8, height - inset - motifSize - 8, 180],
  ]
    .map(
      ([x, y, rotation]) =>
        `<g transform="rotate(${rotation} ${x + motifSize / 2} ${y + motifSize / 2})">${motifShape(ip.motif, accent, x, y, motifSize, 0.55)}</g>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect x="${inset}" y="${inset}" width="${width - inset * 2}" height="${height - inset * 2}" rx="58" fill="none" stroke="#ffffff" stroke-width="30"/>
  <rect x="${inset + 25}" y="${inset + 25}" width="${width - (inset + 25) * 2}" height="${height - (inset + 25) * 2}" rx="38" fill="none" stroke="${accent}" stroke-width="4" opacity="0.48"/>
  ${edgePattern(ip.edgeStyle, accent, width, height, inset)}
  ${cornerMotifs}
  <circle cx="${width / 2}" cy="${inset}" r="8" fill="${accent}" opacity="0.55"/>
  <circle cx="${width / 2}" cy="${height - inset}" r="8" fill="${accent}" opacity="0.55"/>
  <circle cx="${inset}" cy="${height / 2}" r="8" fill="${accent}" opacity="0.55"/>
  <circle cx="${width - inset}" cy="${height / 2}" r="8" fill="${accent}" opacity="0.55"/>
</svg>`;
}

function blankFrameSvg(layoutId) {
  const width = targetWidth;
  const height = layoutHeights[layoutId];
  const inset = Math.max(26, Math.round(Math.min(width, height) * 0.032));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect x="${inset}" y="${inset}" width="${width - inset * 2}" height="${height - inset * 2}" rx="48" fill="none" stroke="#ffffff" stroke-width="24"/>
  <rect x="${inset + 22}" y="${inset + 22}" width="${width - (inset + 22) * 2}" height="${height - (inset + 22) * 2}" rx="30" fill="none" stroke="#2b242a" stroke-width="2" opacity="0.3"/>
</svg>`;
}

function decoration(ipId, layoutId, entry) {
  const [suffix, x, y, scale, rotation, flipX] = entry;
  return {
    itemId: `${ipId}-${suffix}`,
    x,
    y,
    scale,
    rotation,
    flipX,
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
    frame: `packs/templates/fan-ip/templates/frame-${layoutId}.svg`,
    decorations: [],
    license: 'original',
  });

  for (const ip of ipPacks) {
    const templateId = `ip-${ip.id}-${layoutId}`;
    manifest.push({
      id: templateId,
      layoutId,
      name: {
        'zh-Hant': `${ip.names['zh-Hant']} 聯名`,
        en: `${ip.names.en} collab`,
      },
      kind: 'ip',
      collection: ip.id,
      background: `packs/templates/fan-ip/templates/${templateId}-background.svg`,
      frame: `packs/templates/fan-ip/templates/${templateId}-frame.svg`,
      accentColor: ip.palette.accent,
      decorations: compositions[layoutId].map((entry) =>
        decoration(ip.id, layoutId, entry),
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

for (const ip of ipPacks) {
  for (const layoutId of layoutIds) {
    const templateId = `ip-${ip.id}-${layoutId}`;
    writeFileSync(
      resolve(outputDir, `${templateId}-background.svg`),
      backgroundSvg(ip, layoutId),
    );
    writeFileSync(
      resolve(outputDir, `${templateId}-frame.svg`),
      frameSvg(ip, layoutId),
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
        'zh-Hant': 'IP 聯名相框',
        en: 'IP collab frames',
      },
      license: 'private-personal-use',
    },
    null,
    2,
  )}\n`,
);
