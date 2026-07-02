/* eslint-disable @typescript-eslint/no-explicit-any */
import data from '../../../data.json';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, Calendar, Building2, DollarSign, Gamepad2, Link2 } from 'lucide-react';
import EventsTabs from './EventsTabs';

export function generateStaticParams() {
  return data.games.map((game) => ({
    id: game.id.toString(),
  }));
}

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const gameId = parseInt(params.id);
  const game = data.games.find((g) => g.id === gameId);
  const gameEvents = data.events.filter((e) => e.game_id === gameId);

  if (!game) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1400px]">
        <p className="text-neutral-500">未找到该产品。</p>
        <Link href="/" className="text-indigo-600 hover:underline mt-4 inline-block">返回看板</Link>
      </main>
    );
  }

  const productEvents = gameEvents.filter((e) => e.event_type === '产品动态');
  const fundingEvents = gameEvents.filter((e) => e.event_type === '融资动态');
  const articleEvents = gameEvents.filter((e) => e.event_type === '相关文章');

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-3 flex items-center gap-2 text-xs font-mono text-neutral-500">
          <Link href="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> 看板
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-700">{game.product_name}</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-8">
        {/* Hero section: image + title + key tags */}
        <div className="mb-8 flex flex-col md:flex-row gap-6">
          {game.image_url ? (
            <div className="w-full md:w-[400px] h-48 md:h-52 bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.image_url} alt={game.product_name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full md:w-[400px] h-48 md:h-52 bg-gradient-to-br from-neutral-800 to-neutral-600 shrink-0 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xl tracking-tight px-4 text-center">{game.product_name}</span>
            </div>
          )}
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-[10px] uppercase font-mono px-2 py-1 bg-neutral-900 text-white">{game.gameplay_main}</span>
              {game.gameplay_sub && (
                <span className="text-[10px] uppercase font-mono px-2 py-1 bg-neutral-200 text-neutral-700">{game.gameplay_sub}</span>
              )}
              <span className="text-[10px] uppercase font-mono px-2 py-1 border border-neutral-300 text-neutral-600 bg-white">{game.status}</span>
              {game.platform && game.platform !== '未知' && (
                <span className="text-[10px] uppercase font-mono px-2 py-1 border border-neutral-300 text-neutral-600 bg-white">{game.platform}</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">{game.product_name}</h1>
            <p className="text-sm text-neutral-500 mb-3">{game.company_name}</p>
            <p className="text-sm text-neutral-600 leading-relaxed">{game.description}</p>
          </div>
        </div>

        {/* Info cards row */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center gap-1.5 mb-2 text-neutral-400">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold">团队规模</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">{game.company_size || '未知'}</p>
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center gap-1.5 mb-2 text-neutral-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold">融资</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">{game.funding_round || '未知'}</p>
            {game.funding_amount && <p className="text-xs text-neutral-500 mt-0.5">{game.funding_amount}</p>}
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center gap-1.5 mb-2 text-neutral-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold">上线时间</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">{game.launch_date || '未知'}</p>
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <div className="flex items-center gap-1.5 mb-2 text-neutral-400">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold">区域</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">{game.region || '未知'}</p>
          </div>
        </div>

        {/* Two column: left long text, right sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: product intro + team background */}
          <div className="flex-1 min-w-0">
            {game.product_intro && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-3 font-mono border-b-2 border-neutral-800 pb-2">
                  产品介绍
                </h3>
                <div className="text-sm text-neutral-700 whitespace-pre-wrap leading-7">{game.product_intro}</div>
              </div>
            )}

            {game.team_background && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-3 font-mono border-b-2 border-neutral-800 pb-2">
                  团队背景
                </h3>
                <div className="text-sm text-neutral-700 whitespace-pre-wrap leading-7">{game.team_background}</div>
              </div>
            )}

            {!game.product_intro && !game.team_background && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-3 font-mono border-b-2 border-neutral-800 pb-2">
                  核心简介
                </h3>
                <div className="text-sm text-neutral-700 whitespace-pre-wrap leading-7">{game.description}</div>
              </div>
            )}

            {/* Tags */}
            {game.tags && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-3 font-mono border-b-2 border-neutral-800 pb-2">
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.tags.split(',').filter((t: string) => t.trim()).map((tag: string, i: number) => (
                    <span key={i} className="text-xs font-mono px-2.5 py-1 bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar: attributes only */}
          <div className="lg:w-[340px] shrink-0">
            <div className="bg-white border border-neutral-200 p-5">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-4 font-mono border-b border-neutral-100 pb-2">
                核心属性
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-neutral-500 text-xs whitespace-nowrap">公司</span>
                  <span className="text-neutral-900 text-right">{game.company_name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-neutral-500 text-xs whitespace-nowrap">玩法分类</span>
                  <span className="text-neutral-900 text-right">{game.gameplay_main}{game.gameplay_sub ? ` / ${game.gameplay_sub}` : ''}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-neutral-500 text-xs whitespace-nowrap">当前状态</span>
                  <span className="text-neutral-900 text-right">{game.status}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-neutral-500 text-xs whitespace-nowrap">平台</span>
                  <span className="text-neutral-900 text-right">{game.platform || '未知'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-neutral-500 text-xs whitespace-nowrap">团队规模</span>
                  <span className="text-neutral-900 text-right">{game.company_size || '未知'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-neutral-500 text-xs whitespace-nowrap">融资轮次</span>
                  <span className="text-neutral-900 text-right">{game.funding_round || '未知'}</span>
                </div>
                {(game.funding_amount || game.funding_detail) && (
                  <div className="flex justify-between gap-2">
                    <span className="text-neutral-500 text-xs whitespace-nowrap">融资金额</span>
                    <span className="text-neutral-900 text-right">{game.funding_amount || '-'}</span>
                  </div>
                )}
                {game.funding_detail && (
                  <div className="pt-2 border-t border-neutral-100">
                    <span className="text-neutral-500 text-xs block mb-1">融资详情</span>
                    <span className="text-neutral-700 text-xs leading-relaxed block">{game.funding_detail}</span>
                  </div>
                )}
                {game.url && (
                  <div className="pt-2 border-t border-neutral-100">
                    <a href={game.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs flex items-center gap-1 break-all">
                      <Link2 className="w-3 h-3 shrink-0" /> {game.url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Events with tabs */}
        <div className="mt-8">
          <EventsTabs productEvents={productEvents} fundingEvents={fundingEvents} articleEvents={articleEvents} />
        </div>

        {/* Back button */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回看板
          </Link>
        </div>
      </div>
    </main>
  );
}
