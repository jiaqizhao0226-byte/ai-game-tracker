/* eslint-disable @typescript-eslint/no-explicit-any */
import data from '../../../data.json';
import Link from 'next/link';
import { ArrowLeft, TerminalSquare, ExternalLink, ChevronLeft } from 'lucide-react';

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
    <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1400px]">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-mono text-neutral-500">
        <Link href="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" /> 返回看板
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-700">{game.product_name}</span>
      </div>

      {/* Header */}
      <div className="mb-6 border-b-2 border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-sans text-neutral-900 tracking-tight flex items-center gap-3">
            <TerminalSquare className="w-6 h-6" />
            {game.product_name}
          </h1>
          <p className="text-neutral-500 mt-2 text-xs uppercase tracking-widest font-mono">
            {'数据档案 // 编号 ' + game.id.toString().padStart(4, '0') + ' // ' + game.company_name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-neutral-400">更新: {game.updated_at ? game.updated_at.split(' ')[0] : '未知'}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Core attributes */}
        <div className="md:w-[45%] shrink-0">
          {/* Cover image */}
          {game.image_url && (
            <div className="w-full h-48 bg-neutral-100 border border-neutral-200 mb-6 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.image_url} alt={game.product_name} className="w-full h-full object-cover" />
            </div>
          )}

          <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4 font-mono border-b border-neutral-100 pb-2">
            核心属性
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">产品名称</label>
              <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.product_name}</div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">公司 / 团队</label>
              <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.company_name}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">团队规模</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.company_size || '未知'}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">融资轮次</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.funding_round || '未知'}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">平台</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.platform || '未知'}</div>
              </div>
            </div>

            {(game.funding_amount || game.funding_detail) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">融资金额</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.funding_amount || '-'}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">融资详情</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.funding_detail || '-'}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">玩法类型</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.gameplay_main}{game.gameplay_sub && game.gameplay_sub !== "通用" ? ` (${game.gameplay_sub})` : ""}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">当前状态</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.status}</div>
              </div>
            </div>

            {game.launch_date && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">上线 / 预计时间</label>
                <div className="px-3 py-2 text-sm bg-amber-50 border border-amber-100 text-amber-800">{game.launch_date}</div>
              </div>
            )}

            {!game.team_background && !game.product_intro && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">核心简介</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800 whitespace-pre-wrap leading-relaxed">{game.description}</div>
              </div>
            )}

            {game.team_background && (
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide text-indigo-700">团队背景</label>
                <div className="px-3 py-3 text-sm bg-indigo-50/30 border border-indigo-100 text-neutral-800 whitespace-pre-wrap leading-relaxed rounded-sm">{game.team_background}</div>
              </div>
            )}

            {game.product_intro && (
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide text-emerald-700">详细产品介绍</label>
                <div className="px-3 py-3 text-sm bg-emerald-50/30 border border-emerald-100 text-neutral-800 whitespace-pre-wrap leading-relaxed rounded-sm">{game.product_intro}</div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">相关链接</label>
              <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800 break-all">
                {game.url ? (
                  <a href={game.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">{game.url} <ExternalLink className="w-3 h-3 inline" /></a>
                ) : '-'}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">自定义标签</label>
              <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">
                {game.tags || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Events timeline */}
        <div className="flex-1 flex flex-col gap-6">
          {[
            { type: '产品动态', events: productEvents, color: 'indigo' },
            { type: '融资动态', events: fundingEvents, color: 'emerald' },
            { type: '相关文章', events: articleEvents, color: 'amber' },
          ].map(section => (
            <div key={section.type}>
              <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-4 font-mono border-b-2 pb-2 ${
                section.color === 'indigo' ? 'border-indigo-400 text-indigo-700' :
                section.color === 'emerald' ? 'border-emerald-400 text-emerald-700' :
                'border-amber-400 text-amber-700'
              }`}>
                {section.type} ({section.events.length})
              </h3>
              {section.events.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-xs font-mono">暂无{section.type}记录。</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {section.events.map(evt => (
                    <div key={evt.id} className="bg-white border border-neutral-200 p-4 shadow-sm hover:border-neutral-900 hover:shadow-md transition-all flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 ${
                          section.color === 'indigo' ? 'bg-indigo-100 text-indigo-800' :
                          section.color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {evt.event_type}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5">{evt.event_date}</span>
                      </div>
                      {evt.url ? (
                        <a href={evt.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline leading-relaxed flex items-center gap-1 font-semibold">
                          {evt.content} <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      ) : (
                        <p className="text-xs text-neutral-700 leading-relaxed">{evt.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Back button */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回看板
        </Link>
      </div>
    </main>
  );
}
