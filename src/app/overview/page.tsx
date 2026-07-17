import data from '../../data.json';
import changelog from '../../changelog.json';
import ChangelogBox from './ChangelogBox';

const MAIN_ORDER = ['AI陪伴', 'AI叙事对话', 'AI玩法机制', 'AI Agent(智能体)', 'AI生成UGC', '传统品类+AI'];
const NATIVE_MAINS = MAIN_ORDER.slice(0, 5);
// AI Native 走靛蓝色阶、AI in Game 用青色区分，与看板既有配色一致
const COLORS: Record<string, string> = {
  'AI陪伴': '#4f46e5',
  'AI叙事对话': '#6366f1',
  'AI玩法机制': '#818cf8',
  'AI Agent(智能体)': '#a5b4fc',
  'AI生成UGC': '#c7d2fe',
  '传统品类+AI': '#0d9488',
};

export default function OverviewPage() {
  const { games } = data;

  // 统计口径实时从 data.json 计算，避免写死数字与数据脱节
  const slices = MAIN_ORDER.map(m => ({ name: m, count: games.filter(g => g.gameplay_main === m).length }))
    .filter(s => s.count > 0);
  const total = slices.reduce((a, s) => a + s.count, 0);
  const nativeCount = games.filter(g => NATIVE_MAINS.includes(g.gameplay_main)).length;
  const inGameCount = games.filter(g => g.gameplay_main === '传统品类+AI').length;
  const lastUpdated = changelog[0]?.date ?? '';

  // 环形图：用 stroke-dasharray 在圆环上依次铺开每个扇区
  const R = 68, SW = 30, C = 2 * Math.PI * R;
  let acc = 0;
  const arcs = slices.map(s => {
    const len = (s.count / total) * C;
    const arc = { ...s, len, offset: -acc };
    acc += len;
    return arc;
  });

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1400px]">
      <header className="mb-8 border-b-2 border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-sans text-neutral-900 tracking-tight">概览</h1>
          <p className="text-neutral-500 mt-2 text-xs uppercase tracking-widest font-mono">收录统计与版本更新记录</p>
        </div>
        <div className="text-right text-xs font-mono text-neutral-500">
          <div>最后更新: <span className="text-neutral-900 font-bold">{lastUpdated}</span></div>
        </div>
      </header>

      {/* 左：收录产品数 / 右：玩法大类占比 */}
      <section className="bg-white border border-neutral-200 shadow-sm mb-12 grid grid-cols-1 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-neutral-100">
          <div className="text-[10px] uppercase tracking-widest font-mono text-neutral-400">收录产品</div>
          <div className="text-6xl font-bold text-neutral-900 mt-2 tabular-nums leading-none">{games.length}</div>
          <div className="mt-5 space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-600">
              <span className="w-2.5 h-2.5 bg-indigo-600 inline-block shrink-0" />
              AI Native <span className="text-neutral-900 font-bold ml-auto tabular-nums">{nativeCount}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <span className="w-2.5 h-2.5 bg-teal-600 inline-block shrink-0" />
              AI in Game <span className="text-neutral-900 font-bold ml-auto tabular-nums">{inGameCount}</span>
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col sm:flex-row items-center gap-8">
          <svg viewBox="0 0 180 180" className="w-[180px] h-[180px] shrink-0" role="img" aria-label={`玩法大类占比：${slices.map(s => `${s.name} ${s.count}`).join('，')}`}>
            {arcs.map(a => (
              <circle
                key={a.name}
                cx="90" cy="90" r={R}
                fill="none"
                stroke={COLORS[a.name]}
                strokeWidth={SW}
                strokeDasharray={`${a.len} ${C - a.len}`}
                strokeDashoffset={a.offset}
                transform="rotate(-90 90 90)"
              />
            ))}
            <text x="90" y="85" textAnchor="middle" className="fill-neutral-900" style={{ fontSize: 22, fontWeight: 700 }}>{total}</text>
            <text x="90" y="102" textAnchor="middle" className="fill-neutral-400" style={{ fontSize: 9, letterSpacing: 1 }}>PRODUCTS</text>
          </svg>

          <ul className="flex-1 w-full space-y-2">
            {slices.map(s => (
              <li key={s.name} className="flex items-center gap-2.5 text-xs font-mono">
                <span className="w-2.5 h-2.5 shrink-0" style={{ background: COLORS[s.name] }} />
                <span className="text-neutral-600 truncate">{s.name}</span>
                <span className="ml-auto text-neutral-900 font-bold tabular-nums">{s.count}</span>
                <span className="text-neutral-400 tabular-nums w-11 text-right">{((s.count / total) * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-neutral-800 mb-6 font-mono border-l-4 border-indigo-600 pl-3 uppercase tracking-wider">
          版本更新记录
        </h2>
        <ChangelogBox entries={changelog} />
      </section>
    </main>
  );
}
