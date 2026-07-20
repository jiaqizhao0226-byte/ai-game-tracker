'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Lightbulb, LayoutGrid } from 'lucide-react';
import LogoMark from './LogoMark';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            href="/"
            onClick={(e) => {
              try { sessionStorage.removeItem('dashboardFilters'); sessionStorage.removeItem('dashboardScroll'); } catch {}
              if (window.location.pathname === '/' || window.location.pathname === '/ai-game-tracker' || window.location.pathname === '/ai-game-tracker/') {
                e.preventDefault();
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            title="点击返回并重置筛选"
          >
            <LogoMark className="w-8 h-8 shrink-0" />
            <div>
              <h1 className="font-bold text-sm tracking-tight text-neutral-900 leading-tight">AI+游戏玩法</h1>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">常态化监控</p>
            </div>
          </Link>
          
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/overview"
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 ${pathname === '/overview' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              概览
            </Link>
            <Link
              href="/"
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 ${pathname === '/' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
            >
              <Database className="w-4 h-4" />
              产品情报看板
            </Link>
            <Link
              href="/insights"
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 ${pathname === '/insights' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
            >
              <Lightbulb className="w-4 h-4" />
              趋势洞察
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
