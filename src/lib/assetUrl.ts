const ASSET_CACHE_VERSION = 'deploy-2026-08-26';

export function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
  return `${base}/${path.replace(/^\//, '')}?v=${ASSET_CACHE_VERSION}`;
}
