/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardClient from './DashboardClient';
import data from '../data.json';

export default function Home() {
  const { games, events } = data;

  // 按收录时间排序：featured优先，其余按id升序（id越小收录越早）
  const sortedGames = [...games].sort((a: any, b: any) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.id - b.id;
  });

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1400px]">
      <header className="mb-8 border-b-2 border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-sans text-neutral-900 tracking-tight flex items-center gap-2">
            AI游戏产品情报看板
          </h1>
          <p className="text-neutral-500 mt-2 text-xs uppercase tracking-widest font-mono">AI游戏产品数据库 / 光子策略分析组</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-neutral-400">最后更新： {new Date().toISOString().split('T')[0]}</p>
          <p className="text-xs font-mono text-neutral-400">收录总数： {sortedGames.length}</p>
        </div>
      </header>
      
      <DashboardClient initialGames={sortedGames as any} initialEvents={events as any} />
    </main>
  );
}
