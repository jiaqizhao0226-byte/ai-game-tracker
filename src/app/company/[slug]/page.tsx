/* eslint-disable @typescript-eslint/no-explicit-any */
import data from '@/data.json';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import GameImage from '@/components/GameImage';
import TrackedLink from '@/components/TrackedLink';
import { allCompanies, companyRegistry } from '@/lib/company';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() {
  return allCompanies().map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = companyRegistry().get(params.slug);
  if (!c) return { title: '未找到该公司 | AI+游戏玩法常态化监控' };
  const description = `本库收录 ${c.name} 的 ${c.gameIds.length} 款 AI 游戏产品。`;
  return {
    title: `${c.name} | AI 游戏产品情报`,
    description,
    openGraph: {
      type: 'profile',
      title: c.name,
      description,
      url: `${SITE_URL}/company/${c.slug}`,
      images: [{ url: `${SITE_URL}/og-default.png` }],
    },
  };
}

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const company = companyRegistry().get(params.slug);
  if (!company) {
    return <div className="max-w-[1200px] mx-auto px-4 py-16 text-neutral-500">未找到该公司。</div>;
  }

  const games = company.gameIds
    .map(id => (data.games as any[]).find(g => g.id === id))
    .filter(Boolean)
    .sort((a: any, b: any) => b.id - a.id);

  // 汇总口径：只统计有值的字段，避免用「未知」撑出一个假的分布
  const tally = (pick: (g: any) => string) => {
    const m = new Map<string, number>();
    for (const g of games) {
      const v = pick(g);
      if (!v || v === '未知') continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  };
  const byCat = tally(g => g.gameplay_main);
  const byStatus = tally(g => g.status);
  const latest = games.map((g: any) => g.updated_at).filter(Boolean).sort().pop();

  // 「网易」下辖网易雷火、网易元气…——这些工作室级别的写法值得展示，
  // 否则合并之后读者会以为库里没区分过。只有一种写法时不必重复。
  const showVariants = company.variants.length > 1;

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-12 py-3 flex items-center gap-2 text-xs font-mono text-neutral-500">
          <ChevronLeft className="w-3 h-3" />
          <Link href="/" className="hover:text-neutral-900 transition-colors">看板</Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900">{company.name}</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-12 py-6 sm:py-8">
        <header className="mb-8 border-b-2 border-neutral-800 pb-5">
          <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 mb-2">公司 / 工作室</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-3">{company.name}</h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-neutral-500">
            <span>
              收录 <strong className="text-neutral-900 text-sm">{games.length}</strong> 款
            </span>
            {byCat.length > 0 && (
              <span>玩法：{byCat.map(([k, n]) => `${k}×${n}`).join(' · ')}</span>
            )}
            {byStatus.length > 0 && (
              <span>状态：{byStatus.map(([k, n]) => `${k}×${n}`).join(' · ')}</span>
            )}
            {latest && <span>最近更新：{String(latest).split(' ')[0]}</span>}
          </div>

          {showVariants && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400 shrink-0">库中出现的署名：</span>
              {company.variants.map(v => (
                <span key={v} className="text-[10px] font-mono px-2 py-1 bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {v}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game: any) => (
            <TrackedLink
              key={game.id}
              href={`/game/${game.id}`}
              from={`/company/${company.slug}`}
              fromLabel={company.name}
              className="bg-white border border-neutral-200 hover:border-neutral-900 transition-colors flex flex-col group"
            >
              <GameImage
                src={game.image_url}
                name={game.product_name}
                imgWrapperClassName="w-full h-28 bg-neutral-100 border-b border-neutral-100 shrink-0 relative"
                placeholderClassName="w-full h-28 bg-gradient-to-br from-neutral-800 to-neutral-600 border-b border-neutral-100 shrink-0 relative flex items-center justify-center"
                textClassName="text-white font-bold text-base tracking-tight px-4 text-center line-clamp-2"
              />
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="font-bold text-neutral-900 tracking-tight leading-snug group-hover:text-indigo-700 transition-colors">
                    {game.product_name}
                  </h2>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 border shrink-0 whitespace-nowrap ${
                    game.status === '已停运'
                      ? 'border-neutral-300 border-dashed text-neutral-400 line-through decoration-neutral-300'
                      : 'border-neutral-300 text-neutral-600'
                  }`}>{game.status}</span>
                </div>
                {/* 合并到母公司之后，这条署名是读者区分「哪个工作室做的」的唯一线索 */}
                {showVariants && (
                  <p className="text-[10px] font-mono text-neutral-400 mb-2">{game.company_name}</p>
                )}
                <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3 flex-1">{game.description}</p>
                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>{game.gameplay_main}</span>
                  <span>#{String(game.id).padStart(4, '0')}</span>
                </div>
              </div>
            </TrackedLink>
          ))}
        </div>
      </div>
    </main>
  );
}
