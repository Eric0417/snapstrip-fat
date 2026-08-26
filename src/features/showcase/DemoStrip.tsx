import { assetUrl } from '../../lib/assetUrl';

const TILES = [
  { tone: 'pastel-rose', sticker: 'packs/core-kawaii/stickers/rabbit/rose/front.png' },
  { tone: 'pastel-sky', sticker: 'packs/core-kawaii/stickers/cloud/sky/front.png' },
  { tone: 'pastel-mint', sticker: 'packs/core-kawaii/stickers/flower/mint/front.png' },
  { tone: 'pastel-cream', sticker: 'packs/core-kawaii/stickers/star/butter/front.png' },
] as const;

export function DemoStrip() {
  return (
    <div className="demo-strip" aria-label="SnapStrip demo strip">
      {TILES.map((tile, index) => (
        <div className={`demo-tile ${tile.tone}`} key={tile.sticker}>
          <img src={assetUrl(tile.sticker)} alt="" loading={index < 2 ? 'eager' : 'lazy'} />
        </div>
      ))}
      <span className="demo-caption">snapstrip · 4-cuts</span>
    </div>
  );
}
