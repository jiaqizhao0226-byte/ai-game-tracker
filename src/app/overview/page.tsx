import data from '../../data.json';
import changelog from '../../changelog.json';
import ChangelogBox from './ChangelogBox';
import RollingNumber from '../../components/RollingNumber';

const MAIN_ORDER = ['AI陪伴', 'AI叙事对话', 'AI玩法机制', 'AI Agent(智能体)', 'AI生成UGC', '传统品类+AI', 'AI for Game'];
const NATIVE_MAINS = MAIN_ORDER.slice(0, 5);
const TOOL_MAIN = 'AI for Game';
// AI Native 走靛蓝色阶、AI in Game 用青色、AI for Game(研发侧)用琥珀色区分
const COLORS: Record<string, string> = {
  'AI陪伴': '#4f46e5',
  'AI叙事对话': '#6366f1',
  'AI玩法机制': '#818cf8',
  'AI Agent(智能体)': '#a5b4fc',
  'AI生成UGC': '#c7d2fe',
  '传统品类+AI': '#0d9488',
  'AI for Game': '#d97706',
};

export default function OverviewPage() {
  const { games } = data;

  // 统计口径实时从 data.json 计算，避免写死数字与数据脱节
  const slices = MAIN_ORDER.map(m => ({ name: m, count: games.filter(g => g.gameplay_main === m).length }))
    .filter(s => s.count > 0);
  const total = slices.reduce((a, s) => a + s.count, 0);
  const nativeCount = games.filter(g => NATIVE_MAINS.includes(g.gameplay_main)).length;
  const inGameCount = games.filter(g => g.gameplay_main === '传统品类+AI').length;
  const toolCount = games.filter(g => g.gameplay_main === TOOL_MAIN).length;
  const lastUpdated = changelog[0]?.date ?? '';

  // 环形图：用 stroke-dasharray 在圆环上依次铺开每个扇区。
  // 长度一律以 pathLength=100 归一化——浏览器把 <circle> 转成贝塞尔路径后的实际长度
  // 比 2πR 短约 0.7px，若按 2πR 算 dash，最后一段会超出末端绕回起点，
  // 在 12 点方向叠出一个台阶状缺口。
  const R = 68, SW = 30, LEN = 100;
  // 绘制动画：每段的 delay 取它前面所有段的累计占比、duration 取自身占比，
  // 接力起来就是一支笔匀速画完一圈。缓动必须 linear——若每段各自 ease，
  // 会在每个扇区边界重新加减速，一圈下来是顿挫的而不是匀速的。
  const DRAW_MS = 1100;
  let acc = 0;
  const arcs = slices.map(s => {
    const len = (s.count / total) * LEN;
    const arc = { ...s, len, offset: -acc, delay: (acc / LEN) * DRAW_MS, dur: (len / LEN) * DRAW_MS };
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
          <RollingNumber value={games.length} className="text-6xl font-bold text-neutral-900 mt-2 leading-none" />
          <div className="mt-5 space-y-1.5 text-xs font-mono">
            {[
              { label: 'AI Native', n: nativeCount, bg: '#4f46e5' },
              { label: 'AI in Game', n: inGameCount, bg: '#0d9488' },
              { label: 'AI for Game', n: toolCount, bg: COLORS['AI for Game'] },
            ].map((t, i) => (
              <div key={t.label} className="anim-rise flex items-center gap-2 text-neutral-600"
                style={{ ['--d' as string]: `${360 + i * 80}ms` } as React.CSSProperties}>
                <span className="w-2.5 h-2.5 inline-block shrink-0" style={{ background: t.bg }} />
                {t.label} <span className="text-neutral-900 font-bold ml-auto tabular-nums">{t.n}</span>
              </div>
            ))}
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
                pathLength={LEN}
                strokeDasharray={`${a.len} ${LEN - a.len}`}
                strokeDashoffset={a.offset}
                transform="rotate(-90 90 90)"
                style={{ animation: `draw-arc ${a.dur}ms linear ${a.delay}ms both` }}
              />
            ))}
            {/* 中心文字等笔画到大半圈再浮现，避免与绘制过程争夺视线 */}
            <text x="90" y="85" textAnchor="middle" className="fill-neutral-900"
              style={{ fontSize: 22, fontWeight: 700, animation: `fade-in var(--dur-slow) var(--ease-entrance) ${DRAW_MS * 0.55}ms both` }}>{total}</text>
            <text x="90" y="102" textAnchor="middle" className="fill-neutral-400"
              style={{ fontSize: 9, letterSpacing: 1, animation: `fade-in var(--dur-slow) var(--ease-entrance) ${DRAW_MS * 0.7}ms both` }}>PRODUCTS</text>
          </svg>

          <ul className="flex-1 w-full space-y-2">
            {slices.map((s, i) => (
              <li key={s.name} className="anim-rise flex items-center gap-2.5 text-xs font-mono"
                style={{ ['--d' as string]: `${DRAW_MS * 0.25 + i * 70}ms` } as React.CSSProperties}>
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
