/**
 * 静态资源路径统一出口。
 *
 * 背景：next.config.mjs 里 basePath 只在生产生效（GitHub Pages 部署在 /ai-game-tracker 子路径下），
 * 而 <img src> 是原生标签、Next 不会自动补 basePath。历史上前缀被写死进了 data.json 的
 * image_url，导致 dev（basePath 为空）下所有本地图 404、并引发 GameImage 的 hydration 警告。
 *
 * 现在数据里只存与部署无关的路径（/images/xxx.jpg），前缀在这里按环境补齐。
 * 为兼容历史数据，仍会剥掉写死的 /ai-game-tracker 前缀，避免生产环境重复拼接。
 */
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/ai-game-tracker' : '';

export function assetUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src; // 外链原样返回
  const clean = src.replace(/^\/?ai-game-tracker/, '');
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${BASE_PATH}${path}`;
}
