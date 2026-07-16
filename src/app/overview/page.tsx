import data from '../../data.json';
import changelog from '../../changelog.json';

const MAIN_ORDER = ['AI陪伴', 'AI叙事对话', 'AI玩法机制', 'AI Agent(智能体)', 'AI生成UGC', '传统品类+AI'];
const NATIVE_MAINS = MAIN_ORDER.slice(0, 5);

export default function OverviewPage() {
  const { games, events, insights } = data;

  // 统计口径全部实时从 data.json 计算，避免写死数字与数据脱节
  const byMain = MAIN_ORDER.map(m => ({ name: m, count: games.filter(g => g.gameplay_main === m).length }))
    .filter(x => x.count > 0);
  const nativeCount = games.filter(g => NATIVE_MAINS.includes(g.gameplay_main)).length;
  const inGameCount = games.filter(g => g.gameplay_main === '传统品类+AI').length;
  const batches = Array.from(new Set(games.map(g => g.batch).filter(Boolean)));
  const regions = ['国内', '海外'].map(r => ({ name: r, count: games.filter(g => g.region === r).length }));
  const lastUpdated = changelog[0]?.date ?? '';
  const maxMain = Math.max(...byMain.map(x => x.count), 1);

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1400px]">
      <header className="mb-8 border-b-2 border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-sans text-neutral-900 tracking-tight">概览</h1>
          <p className="text-neutral-500 mt-2 text-xs uppercase tracking-widest font-mono">收录统计与版本更新记录 / 光子策略分析组</p>
        </div>
        <div className="text-right text-xs font-mono text-neutral-500">
          <div>最后更新: <span className="text-neutral-900 font-bold">{lastUpdated}</span></div>
        </div>
      </header>

      {/* 核心统计 */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: '收录产品', value: games.length, sub: `AI Native ${nativeCount} · AI in Game ${inGameCount}` },
          { label: '动态事件', value: events.length, sub: '产品动态 / 融资 / 相关文章' },
          { label: '趋势洞察', value: insights.length, sub: '专题报告与判断' },
          { label: '收录批次', value: batches.length, sub: batches.join(' · ') },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 shadow-sm p-5">
            <div className="text-[10px] uppercase tracking-widest font-mono text-neutral-400">{s.label}</div>
            <div className="text-3xl font-bold text-neutral-900 mt-1 tabular-nums">{s.value}</div>
            <div className="text-[10px] text-neutral-500 mt-2 font-mono leading-relaxed line-clamp-2">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* 玩法大类分布 */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-neutral-800 mb-4 font-mono border-l-4 border-indigo-600 pl-3 uppercase tracking-wider">
          玩法大类分布
        </h2>
        <div className="bg-white border border-neutral-200 shadow-sm p-6 space-y-3">
          {byMain.map(m => (
            <div key={m.name} className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-600 w-40 shrink-0 truncate" title={m.name}>{m.name}</span>
              <div className="flex-1 bg-neutral-100 h-4 relative">
                <div
                  className={`h-4 ${m.name === '传统品类+AI' ? 'bg-teal-600' : 'bg-indigo-600'}`}
                  style={{ width: `${(m.count / maxMain) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-neutral-900 font-bold w-8 text-right tabular-nums">{m.count}</span>
            </div>
          ))}
          <div className="pt-3 mt-1 border-t border-neutral-100 flex gap-5 text-[10px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-600 inline-block" />AI Native</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-teal-600 inline-block" />AI in Game</span>
            <span className="ml-auto">区域: 国内 {regions[0].count} · 海外 {regions[1].count}</span>
          </div>
        </div>
      </section>

      {/* 更新时间线 */}
      <section>
        <h2 className="text-sm font-bold text-neutral-800 mb-6 font-mono border-l-4 border-indigo-600 pl-3 uppercase tracking-wider">
          版本更新记录
        </h2>
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200" aria-hidden="true" />
          <div className="space-y-8">
            {changelog.map((e, i) => (
              <div key={e.date} className="relative pl-8">
                <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${i === 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-neutral-300'}`} />
                <div className="flex flex-wrap items-baseline gap-3 mb-3">
                  <span className="font-mono text-sm font-bold text-neutral-900">{e.date}</span>
                  <span className="text-sm font-bold text-neutral-700">{e.title}</span>
                  {i === 0 && (
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5">最新</span>
                  )}
                  <span className="text-[10px] font-mono text-neutral-400 ml-auto">
                    收录 {e.count}
                    {e.delta && e.delta !== '0' && <span className="ml-1 text-neutral-500">({e.delta})</span>}
                  </span>
                </div>

                {e.data.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 mb-1.5">数据</div>
                    <ul className="space-y-1">
                      {e.data.map((d, j) => (
                        <li key={j} className="text-xs text-neutral-600 leading-relaxed flex gap-2">
                          <span className="text-neutral-300 shrink-0">·</span><span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {e.feature.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 mb-1.5">功能</div>
                    <ul className="space-y-1">
                      {e.feature.map((f, j) => (
                        <li key={j} className="text-xs text-neutral-600 leading-relaxed flex gap-2">
                          <span className="text-neutral-300 shrink-0">·</span><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
