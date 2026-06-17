import DashboardClient from './DashboardClient';
import data from '../data.json';

export default function Home() {
  const { games, events } = data;

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1400px]">
      <header className="mb-8 border-b-2 border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-sans text-neutral-900 tracking-tight flex items-center gap-2">
            Intelligence Board
          </h1>
          <p className="text-neutral-500 mt-2 text-xs uppercase tracking-widest font-mono">产品数据库 / 光子策略分析组</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-neutral-400">LAST UPDATED: {new Date().toISOString().split('T')[0]}</p>
          <p className="text-xs font-mono text-neutral-400">TOTAL ENTRIES: {games.length}</p>
        </div>
      </header>
      
      <DashboardClient initialGames={games as any} initialEvents={events as any} />
    </main>
  );
}
