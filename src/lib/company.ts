/**
 * 公司归一层。
 *
 * 库里同一家公司有多种写法——光网易就有「网易雷火」「网易·Everstone Studio」
 * 「网易（网易元气）」「青干工作室(网易雷火)」「24工作室 / 网易伏羲」「网易」六种。
 * 直接按 company_name 分组会分裂成一堆只有一款产品的空壳页，工作室主页就没意义了。
 *
 * 故做两层：
 * - **归属**：按母公司归一（网易/腾讯/字节…），决定哪些产品进同一个主页
 * - **展示**：company_name 原样保留为工作室级别的细节，在主页里逐款标出来
 *
 * 「未披露 / 未知」是占位符不是公司，不生成主页。
 */
import data from '@/data.json';

export type Company = {
  slug: string;
  /** 主页标题用的规范名 */
  name: string;
  /** 该公司名下出现过的所有原始写法（工作室级别） */
  variants: string[];
  gameIds: number[];
};

/** 母公司归一规则。命中即归入该组，顺序敏感（先匹配到的赢）。 */
const GROUPS: Array<{ slug: string; name: string; test: RegExp }> = [
  { slug: 'netease', name: '网易', test: /网易|Everstone/i },
  { slug: 'tencent', name: '腾讯', test: /腾讯|光子工作室/ },
  { slug: 'bytedance', name: '字节跳动', test: /字节跳动|朝夕光年|Nuverse/i },
  { slug: 'mihoyo', name: '米哈游 (miHoYo)', test: /米哈游|miHoYo|HoYoverse/i },
  { slug: 'minimax', name: 'MiniMax (稀宇科技)', test: /MiniMax|稀宇/i },
  { slug: 'alibaba', name: '阿里巴巴', test: /阿里巴巴|阿里(?!.*领投)/ },
];

/** 不是公司、不成页的占位值 */
const PLACEHOLDER = new Set(['未披露', '未知', '未公开', '']);

const slugify = (s: string) => {
  const ascii = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (ascii.length >= 2) return ascii;
  // 纯中文名没有可用的 ASCII，用稳定哈希兜底：同名必同 slug，且跨构建不变
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return `c${h.toString(36)}`;
};

let cache: Map<string, Company> | null = null;

/** slug → Company。首次调用时从 data.json 建好并缓存。 */
export function companyRegistry(): Map<string, Company> {
  if (cache) return cache;

  // 先把原始写法归到组，组内保持库中出现顺序
  const byKey = new Map<string, { name: string; slug: string | null; variants: string[]; gameIds: number[] }>();

  for (const g of data.games as Array<{ id: number; company_name: string }>) {
    const raw = (g.company_name || '').trim();
    if (PLACEHOLDER.has(raw)) continue;

    const grp = GROUPS.find(x => x.test.test(raw));
    const key = grp ? grp.slug : `raw:${raw}`;
    let rec = byKey.get(key);
    if (!rec) {
      rec = { name: grp ? grp.name : raw, slug: grp ? grp.slug : null, variants: [], gameIds: [] };
      byKey.set(key, rec);
    }
    if (!rec.variants.includes(raw)) rec.variants.push(raw);
    rec.gameIds.push(g.id);
  }

  // slug 去重：未指定 slug 的按规范名生成，撞车时按名称排序稳定加后缀
  const out = new Map<string, Company>();
  const taken = new Set<string>(Array.from(byKey.values()).map(r => r.slug).filter(Boolean) as string[]);
  const pending = Array.from(byKey.values())
    .filter(r => !r.slug)
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  for (const r of pending) {
    const base = slugify(r.name);
    let s = base;
    for (let n = 2; taken.has(s); n++) s = `${base}-${n}`;
    taken.add(s);
    r.slug = s;
  }

  Array.from(byKey.values()).forEach(r => out.set(r.slug!, { slug: r.slug!, name: r.name, variants: r.variants, gameIds: r.gameIds }));

  cache = out;
  return out;
}

let indexCache: Map<string, Company> | null = null;

/** 原始 company_name → Company 的直查表（看板要对上百张卡逐一反查，别走线性扫描）。 */
export function companyIndex(): Map<string, Company> {
  if (indexCache) return indexCache;
  const m = new Map<string, Company>();
  Array.from(companyRegistry().values()).forEach(c => {
    c.variants.forEach(v => m.set(v, c));
  });
  indexCache = m;
  return m;
}

/** 用某条产品的 company_name 反查它的公司主页；占位值返回 null。 */
export function companyOf(rawName: string): Company | null {
  const raw = (rawName || '').trim();
  if (PLACEHOLDER.has(raw)) return null;
  return companyIndex().get(raw) ?? null;
}

/** 只有一款产品的公司也给页面——从产品页点进去仍是有意义的落点。 */
export function allCompanies(): Company[] {
  return Array.from(companyRegistry().values()).sort((a, b) => b.gameIds.length - a.gameIds.length);
}
