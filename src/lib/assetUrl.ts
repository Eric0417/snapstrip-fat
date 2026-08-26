export function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
  return `${base}/${path.replace(/^\//, '')}`;
}
