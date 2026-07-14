/* eslint-disable @typescript-eslint/no-explicit-any */
import data from '../../data.json';

export default function AnalyticsPage() {
  const { games }: { games: any[] } = data;

  // 统计函数
  const countBy = (key: string): [string, number][] => {
    const result: Record<string, number> = {};
    games.forEach((g: any) => {
      const val = g[key] || '未知';
      result[val] = (result[val] || 0) + 1;
    });
    return Object.entries(result).sort((a, b) => b[1] - a[1]);
  };

  const mainTypes = countBy('gameplay_main');
  const statuses = countBy('status');
  const regions = countBy('region');
  const platforms = countBy('platform');
  const fundings = countBy('funding_round');
  const sizes = countBy('company_size');

  // 玩法子类
  const subTypes: Record<string, number> = {};
  games.forEach((g: any) => {
    if (g.gameplay_sub) {
      subTypes[g.gameplay_sub] = (subTypes[g.gameplay_sub] || 0) + 1;
    }
  });
  const subList = Object.entries(subTypes).sort((a, b) => b[1] - a[1]);

  // 玩法主题
  const themes: Record<string, number> = {};
  games.forEach((g: any) => {
    if (g.gameplay_theme) {
      themes[g.gameplay_theme] = (themes[g.gameplay_theme] || 0) + 1;
    }
  });
  const themeList = Object.entries(themes).sort((a, b) => b[1] - a[1]);

  // Bar chart component
  const BarChart = ({ title, data, color = 'bg-neutral-800' }: { title: string; data: [string, number][]; color?: string }) => {
    const max = Math.max(...data.map(d => d[1]));
    return (
      <div className="bg-white border border-neutral-200 p-6">
        <h3 className="text-sm font-bold text-neutral-900 mb-4 font-mono uppercase tracking-wider">{title}</h3>
        <div className="space-y-2">
          {data.map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-32 text-xs text-neutral-600 text-right shrink-0 truncate">{label}</div>
              <div className="flex-1 bg-neutral-100 h-6 relative overflow-hidden">
                <div className={`h-full ${color} flex items-center justify-end px-2`} style={{ width: `${(value / max) * 100}%` }}>
                  <span className="text-xs text-white font-bold">{value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1400px]">
      <header className="mb-8 border-b-2 border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-sans text-neutral-900 tracking-tight">
            量化分析
          </h1>
          <p className="text-neutral-500 mt-2 text-xs uppercase tracking-widest font-mono">案例数据统计与映射 / 光子策略分析组</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-neutral-400">收录总数： {games.length}</p>
        </div>
      </header>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-3xl font-bold text-neutral-900">{games.length}</p>
          <p className="text-xs text-neutral-500 mt-1">总案例数</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-3xl font-bold text-neutral-900">{mainTypes.length}</p>
          <p className="text-xs text-neutral-500 mt-1">玩法大类</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-3xl font-bold text-neutral-900">{subList.length}</p>
          <p className="text-xs text-neutral-500 mt-1">玩法子类</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-3xl font-bold text-neutral-900">{themeList.length}</p>
          <p className="text-xs text-neutral-500 mt-1">玩法主题</p>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart title="玩法大类分布" data={mainTypes} color="bg-neutral-800" />
        <BarChart title="玩法子类分布" data={subList} color="bg-indigo-700" />
        <BarChart title="玩法主题分布" data={themeList.length > 0 ? themeList : [['暂无', 0]]} color="bg-emerald-600" />
        <BarChart title="产品状态分布" data={statuses} color="bg-amber-600" />
        <BarChart title="区域分布" data={regions} color="bg-blue-600" />
        <BarChart title="平台分布" data={platforms} color="bg-purple-600" />
        <BarChart title="融资轮次分布" data={fundings} color="bg-rose-600" />
        <BarChart title="团队规模分布" data={sizes} color="bg-teal-600" />
      </div>
    </main>
  );
}
