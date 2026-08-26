import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const outputDir = join(root, 'packs/core-effects/stickers');
mkdirSync(outputDir, { recursive: true });

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feOffset dy="12" in="blur" result="offset" />
      <feFlood flood-color="#5D4650" flood-opacity="0.12" />
      <feComposite in2="offset" operator="in" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <g stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft)">
    ${inner}
  </g>
</svg>`;
}

const effects = [
  {
    id: 'cat-ears',
    name: { 'zh-Hant': '貓耳', 'zh-Hans': '猫耳', en: 'Cat ears', ja: '猫耳' },
    tags: ['cat', 'ear', 'cute'],
    inner: `
      <path d="M180 610 C175 355 335 215 450 300 C498 325 512 330 512 355 C512 330 526 325 574 300 C689 215 849 355 844 610 C800 500 704 455 650 465 L512 505 L374 465 C320 455 224 500 180 610 Z" fill="#FFC7D9"/>
      <path d="M288 465 C270 390 315 312 390 295 C340 352 330 420 350 478 Z" fill="#E8D5F2" opacity="0.9"/>
      <path d="M736 465 C754 390 709 312 634 295 C684 352 694 420 674 478 Z" fill="#E8D5F2" opacity="0.9"/>`,
  },
  {
    id: 'bunny-ears',
    name: { 'zh-Hant': '兔耳', 'zh-Hans': '兔耳', en: 'Bunny ears', ja: 'うさぎの耳' },
    tags: ['rabbit', 'ear', 'cute'],
    inner: `
      <path d="M330 620 C250 430 225 185 345 165 C440 150 470 300 500 405 C530 300 570 150 680 165 C800 185 775 430 695 620 Z" fill="#FFD1DC"/>
      <path d="M350 560 C315 460 305 330 340 255 C375 320 390 440 390 570 Z" fill="#FFF4C7"/>
      <path d="M675 560 C710 460 720 330 685 255 C650 320 635 440 635 570 Z" fill="#FFF4C7"/>`,
  },
  {
    id: 'bear-ears',
    name: { 'zh-Hant': '熊耳', 'zh-Hans': '熊耳', en: 'Bear ears', ja: 'くま耳' },
    tags: ['bear', 'ear', 'cute'],
    inner: `
      <path d="M140 650 C70 400 120 185 270 165 C420 145 505 275 512 335 C519 275 604 145 754 165 C904 185 954 400 884 650 Z" fill="#E4A66A"/>
      <circle cx="285" cy="235" r="70" fill="#FFF4C7"/>
      <circle cx="739" cy="235" r="70" fill="#FFF4C7"/>`,
  },
  {
    id: 'fox-ears',
    name: { 'zh-Hant': '狐狸耳', 'zh-Hans': '狐狸耳', en: 'Fox ears', ja: '狐耳' },
    tags: ['fox', 'ear', 'cute'],
    inner: `
      <path d="M185 645 C135 410 205 205 330 205 C410 205 470 295 512 370 C554 295 614 205 694 205 C819 205 889 410 839 645 Z" fill="#F2A65A"/>
      <path d="M230 310 C215 260 235 215 280 210 C260 255 265 305 285 340 Z" fill="#FFF8F0"/>
      <path d="M794 310 C809 260 789 215 744 210 C764 255 759 305 739 340 Z" fill="#FFF8F0"/>`,
  },
  {
    id: 'flower-crown',
    name: { 'zh-Hant': '花環', 'zh-Hans': '花环', en: 'Flower crown', ja: '花冠' },
    tags: ['flower', 'crown', 'cute'],
    inner: `
      <path d="M150 610 Q250 445 512 455 Q774 445 874 610 Q780 550 512 555 Q244 550 150 610 Z" fill="#D4F0C0"/>
      <circle cx="245" cy="520" r="66" fill="#FFC7D9"/><circle cx="245" cy="520" r="28" fill="#FFF4C7"/>
      <circle cx="430" cy="485" r="66" fill="#C7E9F1"/><circle cx="430" cy="485" r="28" fill="#FFD1DC"/>
      <circle cx="615" cy="480" r="66" fill="#FFF4C7"/><circle cx="615" cy="480" r="28" fill="#E8D5F2"/>
      <circle cx="795" cy="515" r="66" fill="#E8D5F2"/><circle cx="795" cy="515" r="28" fill="#FFC7D9"/>`,
  },
  {
    id: 'crown',
    name: { 'zh-Hant': '皇冠', 'zh-Hans': '皇冠', en: 'Crown', ja: '王冠' },
    tags: ['crown', 'royal', 'cute'],
    inner: `
      <path d="M215 690 L250 370 L410 505 L512 285 L614 505 L774 370 L809 690 Z" fill="#FFE0B2"/>
      <path d="M215 690 L809 690 L830 810 L194 810 Z" fill="#F3C76B"/>
      <circle cx="512" cy="275" r="55" fill="#FFC7D9"/>
      <circle cx="250" cy="355" r="38" fill="#C7E9F1"/>
      <circle cx="774" cy="355" r="38" fill="#C7E9F1"/>`,
  },
  {
    id: 'halo',
    name: { 'zh-Hant': '天使光環', 'zh-Hans': '天使光环', en: 'Halo', ja: '天使の輪' },
    tags: ['angel', 'halo', 'cute'],
    inner: `
      <ellipse cx="512" cy="245" rx="220" ry="58" fill="none" stroke="#FFE0B2" stroke-width="46"/>
      <path d="M360 410 L400 570 L512 640 L624 570 L664 410 Z" fill="#E8D5F2" opacity="0.35"/>`,
  },
  {
    id: 'angel-wings',
    name: { 'zh-Hant': '小翅膀', 'zh-Hans': '小翅膀', en: 'Angel wings', ja: '小さな翼' },
    tags: ['angel', 'wing', 'cute'],
    inner: `
      <path d="M130 640 C25 480 65 330 190 300 C165 370 175 440 240 500 L220 690 Z" fill="#FFF8F0"/>
      <path d="M894 640 C999 480 959 330 834 300 C859 370 849 440 784 500 L804 690 Z" fill="#FFF8F0"/>
      <path d="M155 455 C135 390 170 330 235 315 C205 365 200 415 222 465 Z" fill="#E8D5F2"/>
      <path d="M869 455 C889 390 854 330 789 315 C819 365 824 415 802 465 Z" fill="#E8D5F2"/>`,
  },
  {
    id: 'devil-horns',
    name: { 'zh-Hant': '惡魔角', 'zh-Hans': '恶魔角', en: 'Devil horns', ja: '悪魔の角' },
    tags: ['devil', 'horn', 'cute'],
    inner: `
      <path d="M150 640 C95 480 140 300 300 265 C275 370 270 480 320 565 Z" fill="#CE4056"/>
      <path d="M874 640 C929 480 884 300 724 265 C749 370 754 480 704 565 Z" fill="#CE4056"/>
      <path d="M150 640 C250 600 300 585 330 570 L340 665 Z" fill="#8F2E46"/>
      <path d="M874 640 C774 600 724 585 694 570 L684 665 Z" fill="#8F2E46"/>`,
  },
  {
    id: 'witch-hat',
    name: { 'zh-Hant': '巫師帽', 'zh-Hans': '巫师帽', en: 'Witch hat', ja: '魔女の帽子' },
    tags: ['witch', 'hat', 'cute'],
    inner: `
      <path d="M265 585 L470 175 L754 585 Z" fill="#6A4B73"/>
      <ellipse cx="512" cy="595" rx="305" ry="75" fill="#6A4B73"/>
      <path d="M470 175 L512 240 L552 190 Z" fill="#FFE0B2"/>
      <path d="M330 590 L270 640 L370 640 Z" fill="#FFC7D9"/>`,
  },
  {
    id: 'party-hat',
    name: { 'zh-Hant': '派對帽', 'zh-Hans': '派对帽', en: 'Party hat', ja: 'パーティーハット' },
    tags: ['party', 'hat', 'cute'],
    inner: `
      <path d="M285 605 L470 185 L740 605 Z" fill="#C7E9F1"/>
      <path d="M470 185 L520 285 L470 385 L420 285 Z" fill="#FFC7D9"/>
      <ellipse cx="512" cy="620" rx="260" ry="65" fill="#FFF4C7"/>
      <circle cx="470" cy="175" r="58" fill="#FFC7D9"/>
      <path d="M340 605 Q512 690 684 605" fill="none"/>`,
  },
  {
    id: 'tiara',
    name: { 'zh-Hant': '公主頭冠', 'zh-Hans': '公主头冠', en: 'Tiara', ja: 'ティアラ' },
    tags: ['princess', 'tiara', 'cute'],
    inner: `
      <path d="M195 620 Q270 430 512 470 Q754 430 829 620 Z" fill="#FFD1DC"/>
      <circle cx="512" cy="385" r="52" fill="#C7E9F1"/>
      <path d="M360 520 L330 350 L410 420 Z" fill="#FFF4C7"/>
      <path d="M664 520 L694 350 L614 420 Z" fill="#FFF4C7"/>
      <path d="M195 620 Q512 690 829 620" fill="none"/>`,
  },
  {
    id: 'heart-glasses',
    name: { 'zh-Hant': '愛心眼鏡', 'zh-Hans': '爱心眼镜', en: 'Heart glasses', ja: 'ハート眼鏡' },
    tags: ['glasses', 'heart', 'cute'],
    inner: `
      <path d="M165 575 Q125 420 250 375 Q300 355 310 425 L350 480 Q365 400 390 480 L430 425 Q440 355 490 375 Q615 420 575 575 Q500 665 370 665 Q40 665 165 575 Z" fill="#CE4056" opacity="0.92"/>
      <path d="M512 555 L745 510 L900 420" fill="none" stroke-width="34"/>
      <path d="M120 585 L-10 470 M600 585 L730 470" fill="none" stroke-width="34" opacity="0.75"/>`,
  },
  {
    id: 'round-glasses',
    name: { 'zh-Hant': '圓框眼鏡', 'zh-Hans': '圆框眼镜', en: 'Round glasses', ja: '丸眼鏡' },
    tags: ['glasses', 'cute'],
    inner: `
      <circle cx="320" cy="565" r="190" fill="#C7E9F1" opacity="0.38" stroke-width="34"/>
      <circle cx="704" cy="565" r="190" fill="#C7E9F1" opacity="0.38" stroke-width="34"/>
      <path d="M510 565 L704 530 L920 450" fill="none" stroke-width="34"/>
      <path d="M120 565 L-10 455 M904 565 L1010 455" fill="none" stroke-width="34" opacity="0.75"/>`,
  },
  {
    id: 'star-glasses',
    name: { 'zh-Hant': '星星眼鏡', 'zh-Hans': '星星眼镜', en: 'Star glasses', ja: '星眼鏡' },
    tags: ['glasses', 'star', 'cute'],
    inner: `
      <path d="M320 350 L390 520 L560 550 L390 585 L320 755 L250 585 L80 550 L250 520 Z" fill="#FFE0B2"/>
      <path d="M704 350 L774 520 L944 550 L774 585 L704 755 L634 585 L464 550 L634 520 Z" fill="#C7E9F1"/>
      <path d="M560 550 L660 530 L780 475" fill="none" stroke-width="34"/>
      <path d="M80 550 L-10 450 M944 550 L1034 450" fill="none" stroke-width="34" opacity="0.75"/>`,
  },
  {
    id: 'mustache',
    name: { 'zh-Hant': '鬍子', 'zh-Hans': '胡子', en: 'Mustache', ja: '口ひげ' },
    tags: ['mustache', 'funny', 'cute'],
    inner: `
      <path d="M130 600 C190 500 320 545 400 615 C460 545 620 505 720 585 C800 655 735 750 640 745 C550 740 480 700 420 700 C350 700 260 745 190 745 C100 745 65 665 130 600 Z" fill="#2B242A"/>
      <path d="M300 640 C330 610 390 620 425 655" fill="none"/>`,
  },
  {
    id: 'blush',
    name: { 'zh-Hant': '腮紅', 'zh-Hans': '腮红', en: 'Blush', ja: 'チーク' },
    tags: ['blush', 'cute'],
    inner: `
      <ellipse cx="255" cy="640" rx="110" ry="62" fill="#FF9BB3" opacity="0.62" stroke="none"/>
      <ellipse cx="769" cy="640" rx="110" ry="62" fill="#FF9BB3" opacity="0.62" stroke="none"/>
      <path d="M175 610 L205 585 M190 665 L225 680 M205 585 L220 570" fill="none" stroke-width="18" stroke-linecap="round"/>
      <path d="M689 610 L719 585 M704 665 L739 680 M719 585 L734 570" fill="none" stroke-width="18" stroke-linecap="round"/>`,
  },
  {
    id: 'sparkle-aura',
    name: { 'zh-Hant': '閃亮光暈', 'zh-Hans': '闪亮光晕', en: 'Sparkle aura', ja: 'キラキラ' },
    tags: ['sparkle', 'aura', 'cute'],
    inner: `
      <path d="M512 130 L558 300 L730 345 L558 390 L512 560 L466 390 L294 345 L466 300 Z" fill="#FFF4C7"/>
      <path d="M170 230 L196 320 L286 346 L196 372 L170 462 L144 372 L54 346 L144 320 Z" fill="#E8D5F2"/>
      <path d="M854 230 L880 320 L970 346 L880 372 L854 462 L828 372 L738 346 L828 320 Z" fill="#C7E9F1"/>
      <circle cx="512" cy="345" r="205" fill="none" stroke="#FFE0B2" stroke-width="22" stroke-dasharray="20 34"/>`,
  },
  {
    id: 'fairy-dust',
    name: { 'zh-Hant': '仙子星塵', 'zh-Hans': '仙子星尘', en: 'Fairy dust', ja: '妖精の星屑' },
    tags: ['fairy', 'sparkle', 'cute'],
    inner: `
      <path d="M170 380 L210 250 L320 210 L210 170 L170 40 L130 170 L20 210 L130 250 Z" fill="#C7E9F1"/>
      <path d="M760 580 L790 480 L890 450 L790 420 L760 320 L730 420 L630 450 L730 480 Z" fill="#FFC7D9"/>
      <circle cx="300" cy="650" r="55" fill="#FFF4C7"/>
      <circle cx="780" cy="250" r="42" fill="#E8D5F2"/>
      <path d="M512 470 Q600 360 700 400 M512 470 Q600 580 700 540 M512 470 Q600 470 700 470" fill="none" stroke-width="18"/>`,
  },
  {
    id: 'birthday-hat',
    name: { 'zh-Hant': '生日帽', 'zh-Hans': '生日帽', en: 'Birthday hat', ja: 'バースデーハット' },
    tags: ['birthday', 'hat', 'cute'],
    inner: `
      <path d="M265 600 L450 180 L755 600 Z" fill="#E8D5F2"/>
      <ellipse cx="512" cy="620" rx="275" ry="70" fill="#FFC7D9"/>
      <path d="M450 180 L510 270 L570 180 L510 95 Z" fill="#FFF4C7"/>
      <path d="M360 600 L415 500 L460 600 M565 600 L610 500 L665 600" fill="none"/>`,
  },
];

const manifest = effects.map((effect) => {
  const source = `${effect.id}.svg`;
  const content = svg(effect.inner);
  writeFileSync(join(outputDir, source), content);
  const sha256 = createHash('sha256').update(content).digest('hex');

  return {
    id: effect.id,
    version: 1,
    name: effect.name,
    category: 'effect',
    src: `packs/core-effects/stickers/${source}`,
    thumb: `packs/core-effects/stickers/${source}`,
    size: { w: 1024, h: 1024 },
    displaySize: { w: 256, h: 256 },
    tags: effect.tags,
    design: {
      element: effect.id,
      colorway: 'pastel',
      pose: 'front',
      outline: '#FFFFFF',
      outlineWidth: 3,
    },
    source: 'snapstrip:A-line-original',
    license: 'original',
    sha256,
  };
});

writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  join(dirname(outputDir), 'pack.json'),
  `${JSON.stringify({ id: 'core-effects', kind: 'sticker', displayName: { 'zh-Hant': '特效', en: 'Effects' } }, null, 2)}\n`,
);

console.log(`Generated ${manifest.length} original effects.`);
