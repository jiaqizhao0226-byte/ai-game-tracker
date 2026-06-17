import { getDb, GameRecord, GameEvent } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default function Home() {
  const db = getDb();
  
  const games = db.prepare('SELECT * FROM games ORDER BY id DESC').all() as GameRecord[];
  const events = db.prepare('SELECT * FROM game_events ORDER BY event_date DESC, id DESC').all() as GameEvent[];

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
      
      <DashboardClient initialGames={games} initialEvents={events} />
    </main>
  );
}
